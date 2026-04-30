# Flutter 安装指南

## Windows 环境安装

### 1. 下载 Flutter SDK
下载最新版本的 Flutter SDK：
https://storage.googleapis.com/flutter-infra/releases/stable/windows/flutter_windows_3.19.0-stable.zip

### 2. 安装步骤
1. 解压缩到合适位置（如 `C:\flutter`)
2. 添加环境变量：
   - PATH 中添加 `C:\flutter\bin`
   - 添加 FLUTTER_HOME 变量

3. 验证安装：
```bash
flutter doctor
```

4. 安装开发工具：
```bash
flutter doctor --android-licenses
```

### 3. 安装 Visual Studio
下载 Visual Studio Community 版本：
https://visualstudio.microsoft.com/downloads/

需要安装以下组件：
- Windows 10 SDK
- Microsoft Visual C++ Redistributable

### 4. 创建 Flutter 项目
```bash
flutter create ai-desktop-pet --platforms=windows,android
```

## Linux 环境安装

### 1. 下载 Flutter SDK
```bash
curl https://storage.googleapis.com/flutter-infra/releases/stable/linux/flutter_linux_3.19.0-stable.tar.xz -o flutter.tar.xz
tar xf flutter.tar.xz
```

### 2. 设置环境变量
```bash
export PATH="$PATH:$HOME/flutter/bin"
```

### 3. 验证安装
```bash
flutter doctor
```

### 4. 创建 Flutter 项目
```bash
flutter create ai-desktop-pet --platforms=windows,android
```

## Android 环境配置

### 1. 安装 Android Studio
下载 Android Studio：
https://developer.android.com/studio

### 2. 配置 Android SDK
- 安装 Android SDK
- 设置 Android SDK 路径
- 配置 Android 开发环境

### 3. 配置 Android 设备
- 启用 USB Debugging
- 配置 ADB 连接

## 项目编译配置

### Windows 编译
```bash
# 安装 Windows 依赖
flutter doctor --android-licenses

# 创建项目
flutter create ai-desktop-pet --platforms=windows,android

# 编译 Windows
flutter build windows

# 运行 Windows
flutter run -d windows
```

### Android 编译
```bash
# 编译 Android
flutter build apk --release

# 安装 Android
flutter install

# 运行 Android
flutter run -d android
```

## 依赖问题解决

### 常见问题 1：bitsdojo_window 依赖
```bash
# 安装 bitsdojo_window
flutter pub add bitsdojo_window

# Windows 配置
cd windows
flutter pub get
```

### 常见问题 2：window_manager 依赖
```bash
flutter pub add window_manager
```

### 常见问题 3：系统托盘
```bash
flutter pub add system_tray
```

### 常见问题 4：Android 悬浮窗权限
在 AndroidManifest.xml 中添加：
```xml
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
```

## 环境检查清单

### 检查 Flutter 环境
```bash
flutter doctor
```

### 检查 Android 环境
```bash
flutter doctor --android-licenses
```

### 检查 Windows 环境
```bash
flutter doctor --enable-windows-desktop
```

## 快速测试项目

如果无法安装 Flutter，可以使用现有项目：
```bash
cd desktop-pet
npm install
npm start
```

这会启动 Electron 桌面宠物应用。