# AI Desktop Pet - Flutter 项目

## 项目说明

这是一个基于 Flutter 的桌面宠物应用，支持 Windows 和 Android 双平台。

## 功能特性

### Windows 端
- 无边框透明窗口
- 可拖拽桌宠
- 系统托盘支持
- 开机自启动
- 窗口穿透点击
- Lottie 动画效果

### Android 端
- 悬浮窗权限支持
- 桌面小部件显示
- 后台服务保持连接
- WebSocket 同步
- 点击交互反馈

## 开发环境配置

### 安装 Flutter
```bash
# Windows
flutter channel stable
flutter upgrade

# 验证安装
flutter doctor
```

### 项目创建
```bash
flutter create ai-desktop-pet --platforms=windows,android
```

### 依赖安装
```bash
flutter pub get
```

## 编译和运行

### Windows
```bash
flutter build windows
flutter run -d windows
```

### Android
```bash
flutter build apk
flutter run -d android
```

## 项目结构

```
ai-desktop-pet/
├── lib/
│   ├── main.dart          # 主应用入口
│   ├── models/           # 数据模型
│   ├── services/         # 业务服务
│   ├── widgets/          # UI组件
│   ├── state/            # 状态管理
│   └── utils/            # 工具类
├── windows/              # Windows平台配置
│   ├── runner/main.cpp  # Windows主入口
│   ├── CMakeLists.txt   # CMake配置
│   └── assets/          # Windows资源
├── android/              # Android平台配置
│   ├── app/src/main/     # Android代码
│   ├── AndroidManifest.xml
│   └── assets/           # Android资源
├── pubspec.yaml          # 项目依赖配置
└── README.md             # 项目说明
```

## 核心功能

### 1. QR码扫描
- 桌面端：JSQR
- 移动端：mobile_scanner
- 正则提取信息
- NER实体识别
- LLM优化解析

### 2. 数据库同步
- SQLite 数据库
- CRDT 同步算法
- WebSocket 通信
- 实时数据更新

### 3. 提醒机制
- 定时器监控空位置
- 桌宠动画提醒（摇动+气泡）
- 快捷按钮和语音输入
- 位置录入自动化

### 4. AI模型
- LLM部署
- NER实体识别
- 合规性模型
- 语音识别输入

## 快速开始

### Windows端配置
```dart
// 设置无边框窗口
windowManager.setAsFrameless();
windowManager.setIgnoreMouseEvents(false);
windowManager.setAlwaysOnTop(true);
windowManager.setOpacity(0.9);
```

### Android端配置
```kotlin
// AndroidManifest.xml
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
<service android:name=".BackgroundSyncService" />
```

## 配置 Flutter 环境

如果 Flutter 未安装，可以使用以下备用方案：

### 备用方案 1：使用 Web 版本
使用现有的 Electron 项目作为 Web 版本启动：
```bash
npm install
npm start
```

### 备用方案 2：创建 Flutter 模拟项目
创建一个简单的 Flutter 项目结构进行开发：

```bash
# 安装必要的工具
apt-get install -y curl git wget unzip

# 下载 Flutter SDK
curl https://storage.googleapis.com/flutter-infra/releases/stable/linux/flutter_linux_3.19.0-stable.tar.xz -o flutter.tar.xz
tar xf flutter.tar.xz
export PATH="$PATH:$HOME/flutter/bin"

# 创建项目
flutter create ai-desktop-pet --platforms=windows,android
```

## 贡献者

### 全栈开发
- Flutter框架搭建
- 跨平台适配
- UI设计和动画

### 后端/同步算法工程师
- CRDT算法设计
- SQLite优化
- WebSocket通信

### AI工程师
- LLM部署
- NER模型训练
- QR码解析

### 产品/项目经理
- 项目管理
- 测试方案设计
- 实验室流程规划