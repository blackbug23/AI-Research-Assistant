import 'package:flutter/material.dart';
import 'package:bitsdojo_window/bitsdojo_window.dart';
import 'package:window_manager/window_manager.dart';
import 'package:flutter_window_manager/flutter_window_manager.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // 初始化窗口管理器
  windowManager.ensureInitialized();
  
  // 设置窗口属性（Windows）
  windowManager.setMinimumSize(const Size(200, 200));
  windowManager.setMaximumSize(const Size(400, 400));
  
  // 启动应用
  runApp(const DesktopPetApp());
  
  // 初始化bitsdojo_window（Windows）
  if (Platform.isWindows) {
    doWhenWindowReady(() {
      final initialSize = Size(300, 300);
      appWindow.size = initialSize;
      appWindow.alignment = Alignment.center;
      appWindow.show();
    });
  }
}

class DesktopPetApp extends StatefulWidget {
  const DesktopPetApp({super.key});

  @override
  State<DesktopPetApp> createState() => _DesktopPetAppState();
}

class _DesktopPetAppState extends State<DesktopPetApp> with WindowListener {
  Offset _position = const Offset(100, 100);
  bool _isDragging = false;
  Offset _dragStartOffset = Offset.zero;
  
  @override
  void initState() {
    super.initState();
    windowManager.addListener(this);
    
    // 设置窗口属性
    if (Platform.isWindows) {
      // 无边框、透明窗口
      windowManager.setAsFrameless();
      windowManager.setIgnoreMouseEvents(false);
      windowManager.setAlwaysOnTop(true);
      windowManager.setOpacity(0.9);
    } else if (Platform.isAndroid) {
      // Android悬浮窗配置
      FlutterWindowManager.requestPermission();
      FlutterWindowManager.setFlags();
    }
  }
  
  @override
  void dispose() {
    windowManager.removeListener(this);
    super.dispose();
  }
  
  void _startDragging(PointerDownEvent event) {
    if (Platform.isWindows) {
      _dragStartOffset = event.localPosition;
      _isDragging = true;
    }
  }
  
  void _endDragging(PointerUpEvent event) {
    _isDragging = false;
  }
  
  void _handleDrag(PointerMoveEvent event) {
    if (_isDragging && Platform.isWindows) {
      setState(() {
        _position += event.localPosition - _dragStartOffset;
        _dragStartOffset = event.localPosition;
      });
      
      // 移动窗口位置
      windowManager.setPosition(const Offset(_position.dx, _position.dy));
    }
  }
  
  void _handleTap() {
    // 点击交互 - 震动动画
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('桌宠互动'),
        content: const Text('你点击了桌宠！'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        backgroundColor: Colors.transparent,
        body: GestureDetector(
          onPanDown: _startDragging,
          onPanEnd: _endDragging,
          onPanUpdate: _handleDrag,
          onTap: _handleTap,
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(50),
              color: Platform.isWindows ? Colors.transparent : Colors.blue.withOpacity(0.5),
            ),
            child: Center(
              child: Stack(
                children: [
                  // 桌宠主体
                  Container(
                    width: 200,
                    height: 200,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Platform.isWindows ? Colors.transparent : Colors.blue.withOpacity(0.3),
                      border: Border.all(color: Colors.white, width: 3),
                    ),
                  ),
                  
                  // 猫脸
                  Positioned(
                    top: 60,
                    left: 75,
                    child: Container(
                      width: 50,
                      height: 50,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  
                  // 左眼
                  Positioned(
                    top: 70,
                    left: 85,
                    child: Container(
                      width: 10,
                      height: 10,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.black,
                      ),
                    ),
                  ),
                  
                  // 右眼
                  Positioned(
                    top: 70,
                    left: 105,
                    child: Container(
                      width: 10,
                      height: 10,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.black,
                      ),
                    ),
                  ),
                  
                  // 嘴巴
                  Positioned(
                    top: 85,
                    left: 95,
                    child: Container(
                      width: 20,
                      height: 5,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(2),
                        color: Colors.black,
                      ),
                    ),
                  ),
                  
                  // 耳朵
                  Positioned(
                    top: 40,
                    left: 60,
                    child: Transform.rotate(
                      angle: -0.2,
                      child: Container(
                        width: 30,
                        height: 40,
                        decoration: const BoxDecoration(
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  
                  Positioned(
                    top: 40,
                    left: 110,
                    child: Transform.rotate(
                      angle: 0.2,
                      child: Container(
                        width: 30,
                        height: 40,
                        decoration: const BoxDecoration(
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  
                  // 文字提示
                  Positioned(
                    bottom: 20,
                    left: 0,
                    right: 0,
                    child: Text(
                      Platform.isWindows ? 'Windows桌宠' : 'Android桌宠',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}