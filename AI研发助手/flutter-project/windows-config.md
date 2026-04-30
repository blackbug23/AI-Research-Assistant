# Windows 端配置指南

## main.cpp 配置

### windows/runner/main.cpp
```cpp
#include <bitsdojo_window.h>
#include <flutter/dart_project.h>
#include <flutter/flutter_view_controller.h>
#include <bitsdojo_window.h>
#include <windows.h>

auto bdw = bitsdojo_window();

int main(int argc, char** argv) {
  // 初始化bitsdojo_window
  bitsdojo_window_setup();
  
  HINSTANCE instance = GetModuleHandle(nullptr);
  
  // 创建窗口类
  WNDCLASS window_class = {};
  window_class.hInstance = instance;
  window_class.lpszClassName = L"DesktopPetWindow";
  window_class.style = CS_HREDRAW | CS_VREDRAW;
  window_class.lpfnWndProc = DefWindowProc;
  
  RegisterClass(&window_class);
  
  // 创建无边框窗口
  HWND window = CreateWindowEx(
    WS_EX_TOOLWINDOW | WS_EX_LAYERED | WS_EX_TRANSPARENT,
    window_class.lpszClassName,
    L"AI Desktop Pet",
    WS_POPUP,
    0,
    0,
    300,
    300,
    nullptr,
    nullptr,
    instance,
    nullptr
  );
  
  // 设置窗口透明属性
  SetLayeredWindowAttributes(window, 0, 255, LWA_ALPHA);
  
  // 设置窗口穿透点击
  SetWindowLong(window, GWL_STYLE, WS_EX_TRANSPARENT);
  
  // 设置窗口置顶
  SetWindowPos(window, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
  
  // Flutter初始化
  auto dart_project = flutter::DartProject(L"data");
  flutter::FlutterViewController flutter_view(window, dart_project);
  flutter_view.Run();
  
  // 显示窗口
  ShowWindow(window, SW_SHOW);
  
  // 消息循环
  MSG message;
  while (GetMessage(&message, nullptr, 0, 0)) {
    TranslateMessage(&message);
    DispatchMessage(&message);
  }
  
  return 0;
}
```

## CMakeLists.txt 配置

### windows/CMakeLists.txt
```cmake
cmake_minimum_required(VERSION 3.15)
project(ai_desktop_pet LANGUAGES CXX)

# Flutter配置
include(flutter/cmake/fetch_flutter.cmake)

# bitsdojo_window配置
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/bitsdojo_window)

# 设置目标
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# 链接bitsdojo_window
target_link_libraries(${PROJECT_NAME} bitsdojo_window)
```

## 系统托盘配置

### SystemTrayService.cpp
```cpp
#include "system_tray.h"

class SystemTrayService {
public:
  void createSystemTray() {
    // 创建托盘菜单
    tray_menu = CreatePopupMenu();
    
    // 添加菜单项
    AppendMenu(tray_menu, MF_STRING, 1, L"退出");
    
    // 创建托盘图标
    NOTIFYICONDATA tray_data;
    tray_data.cbSize = sizeof(NOTIFYICONDATA);
    tray_data.hWnd = window_handle;
    tray_data.uID = 100;
    tray_data.uFlags = NIF_MESSAGE | NIF_ICON | NIF_TIP;
    tray_data.uCallbackMessage = WM_TRAY_NOTIFICATION;
    tray_data.hIcon = LoadIcon(instance, IDI_APPLICATION);
    tray_data.szTip = L"AI Desktop Pet";
    
    Shell_NotifyIcon(NIM_ADD, &tray_data);
  }
  
  void handleTrayMessage(UINT message) {
    if (message == WM_TRAY_NOTIFICATION) {
      // 托盘图标点击事件
      ShowMenu();
    }
  }
};
```

## 开机自启配置

### AutoStartRegistry.cpp
```cpp
#include <windows.h>
#include <string>

class AutoStartManager {
public:
  bool enableAutoStart() {
    HKEY hKey;
    LONG result = RegOpenKeyEx(HKEY_CURRENT_USER, 
      "Software\\Microsoft\\Windows\\CurrentVersion\\Run",
      0, KEY_WRITE, &hKey);
    
    if (result == ERROR_SUCCESS) {
      std::wstring appPath = GetApplicationPath();
      result = RegSetValueEx(hKey, "AI Desktop Pet", 0,
        REG_SZ, (LPBYTE)appPath.c_str(), 
        (appPath.length() + 1) * sizeof(wchar_t));
      
      RegCloseKey(hKey);
      return (result == ERROR_SUCCESS);
    }
    
    return false;
  }
  
  bool disableAutoStart() {
    HKEY hKey;
    LONG result = RegOpenKeyEx(HKEY_CURRENT_USER,
      "Software\\Microsoft\\Windows\\CurrentVersion\\Run",
      0, KEY_WRITE, &hKey);
    
    if (result == ERROR_SUCCESS) {
      result = RegDeleteValue(hKey, "AI Desktop Pet");
      RegCloseKey(hKey);
      return (result == ERROR_SUCCESS);
    }
    
    return false;
  }
};
```

## 窗口管理器集成

### WindowManager.cpp
```cpp
#include <flutter_window_manager.h>

class WindowManager {
public:
  void configureWindow(HWND window) {
    // 设置窗口属性
    FlutterWindowManager::setFrameless(window);
    FlutterWindowManager::setTransparent(window);
    FlutterWindowManager::setClickThrough(window);
    FlutterWindowManager::setAlwaysOnTop(window);
    
    // 设置窗口透明度
    FlutterWindowManager::setOpacity(window, 0.9);
    
    // 设置窗口大小限制
    FlutterWindowManager::setMinimumSize(window, 200, 200);
    FlutterWindowManager::setMaximumSize(window, 400, 400);
  }
  
  void enableDragAndDrop(HWND window) {
    // 启用拖拽功能
    SetWindowLong(window, GWL_EXSTYLE, 
      WS_EX_LAYERED | WS_EX_TRANSPARENT);
    
    // 注册拖拽事件
    RegisterDragEvent(window);
  }
};
```

## Flutter依赖配置

### pubspec.yaml中的Windows配置
```yaml
bitsdojo_window:
  git:
    url: https://github.com/bitsdojo/bitsdojo_window.git
    ref: main
  
window_manager:
  git:
    url: https://github.com/leanflutter/window_manager.git
    ref: main
  
system_tray:
  git:
    url: https://github.com/leanflutter/system_tray.git
    ref: main
```

## 编译配置

### 编译命令
```bash
# 安装依赖
flutter pub get

# 编译Windows版本
flutter build windows

# 运行Windows版本
flutter run -d windows
```

### 发布配置
```yaml
# windows/build.yaml
build:
  windows:
    target: windows
    arguments:
      - --windows-build-mode=release
      - --windows-build-type=application