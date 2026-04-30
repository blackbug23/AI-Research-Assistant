# AI研发助手 - 桌面宠物项目

## 项目架构

### 角色分工
1. **全栈开发** - Flutter跨平台开发，Windows/Android双端支持
2. **后端/同步算法工程师** - WebSocket通信、CRDT同步算法、SQLite数据库优化
3. **AI工程师** - LLM部署、NER实体识别、合规性模型
4. **产品/项目经理** - 项目管理、测试、实验室流程设计

### 技术栈
- **跨平台框架**: Flutter (Windows + Android)
- **状态管理**: Riverpod
- **数据库**: Drift (SQLite)
- **网络**: Dio, WebSocket
- **动画**: Lottie, Flutter Animate
- **桌面集成**: bitsdojo_window, window_manager, system_tray

## 第一步：创建Flutter项目

### 安装Flutter环境
```bash
# Windows
flutter create ai-desktop-pet --platforms=windows,android

# Linux
flutter create ai-desktop-pet --platforms=windows,android
```

### 项目依赖
```yaml
dependencies:
  flutter:
    sdk: flutter
  
  riverpod: ^2.4.3
  
  drift: ^3.4.0
  drift_dev: ^3.4.0
  
  dio: ^5.3.3
  web_socket_channel: ^2.3.0
  
  lottie: ^2.7.0
  flutter_animate: ^4.2.0
  
  bitsdojo_window: ^0.1.1
  window_manager: ^0.3.2
  system_tray: ^1.1.0
  
  flutter_window_manager: ^0.2.2
```

## 项目结构

```
AI研发助手/
├── ai-desktop-pet/                 # Flutter主项目
│   ├── windows/                    # Windows平台代码
│   │   ├── runner/main.cpp        # 无边框、置顶窗口配置
│   │   └── CMakeLists.txt
│   ├── android/                    # Android平台代码
│   ├── lib/
│   │   ├── main.dart              # 主入口
│   │   ├── models/                # 数据模型
│   │   ├── services/              # 业务服务
│   │   ├── widgets/               # 组件
│   │   └── state/                 # 状态管理
│   ├── pubspec.yaml               # 依赖配置
│   └── README.md
├── backend/                        # 后端服务
│   ├── websocket_server/          # WebSocket服务器
│   ├── sync_logic/                # CRDT同步算法
│   └── database/                  # SQLite优化
├── ai-engine/                     # AI引擎
│   ├── llm_deployment/            # LLM部署
│   ├── ner_extraction/           # NER实体识别
│   └── compliance_model/          # 合规模型
├── testing/                       # 测试和流程
│   ├── test_suite/                # 测试套件
│   ├── lab_procedure/             # 实验室流程
│   └── quality_assurance/         # 质量保证
└── docs/                          # 文档
```

## Windows端特殊配置

### 无边框窗口
```cpp
// windows/runner/main.cpp
// 使用bitsdojo_window设置无边框、透明窗口
```

### 系统托盘
```cpp
// 实现系统托盘、开机自启
```

### 穿透点击
```cpp
// 使用window_manager实现窗口透明穿透点击
```

## Android端特殊配置

### 悬浮窗权限
```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
```

### 后台服务
```kotlin
// 后台服务保持WebSocket连接
```

## 可交付物

1. Windows端：可拖动的透明小猫桌宠
2. Android端：主屏幕简洁小部件
3. 两端点击都有交互反馈
4. 完整项目脚手架

## 开发计划

- 第1天：Flutter项目创建和环境配置
- 第2天：Windows端透明窗口和拖拽实现
- 第3天：Android端悬浮窗和后台服务
- 第4天：数据库和状态管理集成
- 第5天：动画和交互实现
- 第6天：测试和调试
- 第7天：部署和打包