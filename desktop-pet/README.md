# 桌面宠物 QR 码扫描入库系统

## 功能概述

这是一个完整的 QR 码扫描入库桌面宠物应用，实现了商品二维码到数据库的端到端流程，包括：

1. **QR码扫描** - 模拟扫码功能
2. **入库逻辑** - 写入 goods_in 表，storage_location 置空
3. **后台定时器** - 监控空位置记录，触发桌宠动画提醒
4. **位置录入** - 快捷按钮/语音输入，更新 storage_location 字段

## 核心流程

### 收货 → 提醒 → 补录位置
1. **扫描QR码** - 扫描商品二维码
2. **入库数据** - 写入 goods_in 表（storage_location 为空）
3. **定时监控** - 每5分钟检查空位置记录
4. **桌宠提醒** - 发现空位置 → 触发动画 + 气泡提示
5. **位置录入** - 语音或手动录入存放位置
6. **更新数据库** - 更新 storage_location 字段

## 运行方式

### 安装依赖
```bash
npm install
```

### 启动应用
```bash
npm start
```

### 测试QR码扫描
```bash
node qr_test.js
```

### 测试数据库
```bash
node test_database.js
```

## 功能演示

### QR码扫描入库
应用支持模拟QR码扫描：
- 商品名称：笔记本电脑 数量：5 价格：2999.99 供应商：供应商A
- 商品名称：鼠标 数量：100 价格：49.99 供应商：供应商B
- 商品名称：键盘 数量：50 价格：129.99 供应商：供应商C
- 商品名称：显示器 数量：20 价格：999.99 供应商：供应商D

### 后台定时器
- 每5分钟自动检查 goods_in 表中的空位置记录
- 发现空位置 → 触发桌宠动画（摇动）
- 显示气泡提示："新到的XXX还没放好~"

### 位置录入
- 快捷按钮点击 → 录入位置对话框
- 模拟语音输入 → "仓库A-货架1", "仓库B-货架3"
- 更新 storage_location 字段

## 数据库结构

### goods_in 表
```sql
CREATE TABLE goods_in (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goods_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2),
  arrival_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  supplier TEXT,
  notes TEXT,
  qrcode_data TEXT,
  storage_location TEXT DEFAULT NULL,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### inventory 表
```sql
CREATE TABLE inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goods_id INTEGER NOT NULL,
  goods_name TEXT NOT NULL,
  current_quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 0,
  max_quantity INTEGER NOT NULL DEFAULT 1000,
  location TEXT,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 使用界面

### 桌宠功能
- 透明窗口，可拖拽移动
- 点击桌宠触发动画
- 系统托盘支持

### 控制面板
- QR码扫描功能
- 数据库管理功能
- 空位置检查
- 数据查询

### 提醒气泡
- 发现空位置商品时显示
- "录入位置"快捷按钮
- "忽略"按钮

## Windows 版本

### 打包为 Windows 应用
```bash
npm run windows-build
```

### Windows 特有功能
- 无边框窗口
- 系统托盘图标
- 开机自启动

## 后续扩展

### QR码扫描增强
- JSQR 库实现摄像头扫码
- QR码截图识别功能
- QR码批量扫描

### 语音输入增强
- Web Speech API 语音识别
- 本地 Whisper 模型
- 语音录入优化

### Flutter 版本
- Android mobile_scanner 扫码
- Flutter 桌面宠物版本
- Windows/Android 双端支持