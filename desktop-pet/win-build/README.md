# 桌面宠物 - QR码扫描入库与实验记录系统

## 功能概述

这是一个完整的桌面宠物应用，集成了 QR 码扫描入库、实验记录生成、库存管理等功能。UI打磨与端到端体验优化已完成，包括：

1. **桌宠本体** - 透明窗口、可拖拽、动画效果、气泡提醒
2. **系统托盘** - 快捷菜单（扫描、生成记录、设置、退出）
3. **实验记录向导** - 五步流程：实验信息→操作步骤→试剂选择→结果录入→预览确认
4. **扫码入库** - 摄像头/截屏识别QR码，快速入库
5. **PDF生成** - 自动生成实验记录PDF并预览
6. **位置提醒** - 入库后15分钟内未填报位置触发提醒
7. **设置面板** - 配置LLM服务、库存阈值、宠物动画等

## 核心流程

### 完整端到端流程
1. **双击启动** → 桌宠出现在桌面右下角
2. **右键宠物** → 快捷操作菜单
3. **扫码入库** → QR码扫描窗口
4. **位置填报** → 下拉选择标准货位
5. **生成记录** → 实验记录向导
6. **PDF预览** → 自动打开PDF阅读器
7. **库存扣减** → 自动更新库存数据
8. **桌宠祝贺** → 庆祝动画 + 气泡提醒

## 运行方式

### Linux/Mac
```bash
npm start
```

### Windows
```bash
npm start
```

### 快速启动
```bash
./start.sh
```

### 打包为 Windows 应用
```bash
npm run windows-build
```

### Windows 特有功能
- **无边框透明窗口** - 桌宠窗口设计
- **系统托盘图标** - 托盘菜单管理
- **开机自启动** - 可配置开机启动
- **Windows安装包** - NSIS安装器

## 配置文件

### .env
首次启动自动从.env.example复制创建
```bash
# LLM服务
LLM_URL=http://localhost:8000

# 库存阈值
INVENTORY_THRESHOLD=10

# 宠物动画速度
PET_ANIMATION_SPEED=normal

# 位置提醒间隔（分钟）
REMINDER_INTERVAL=15

# PDF输出路径
PDF_OUTPUT_PATH=./output

# 数据库路径
DATABASE_PATH=./database.db
```

## 使用界面

### 桌宠本体
- **加载动画** - 启动时宠物跳一跳
- **拖拽移动** - 鼠标拖动宠物，位置记忆
- **右键菜单** - 显示快捷操作气泡
- **状态机** - 待机（呼吸动画）、提醒（摇晃）、忙碌（旋转）、祝贺（跳动）
- **气泡提示** - "新试剂未放好"、"库存不足"、"记录生成完毕"

### 系统托盘
- **显示/隐藏宠物** - 控制桌面宠物可见性
- **扫码入库** - 打开扫码窗口
- **生成实验记录** - 打开实验记录向导
- **设置** - 配置面板
- **查看输出文件** - 打开PDF输出目录
- **退出** - 关闭应用

### 实验记录向导
- **五步流程** - 清晰引导实验记录生成
- **试剂选择** - 扫码录入或库存列表选择
- **实时预览** - 确认前预览所有信息
- **PDF生成** - 调用真实PDF生成模块
- **库存扣减** - 自动更新库存数据

### 扫码入库
- **摄像头扫描** - 使用摄像头识别QR码
- **截屏识别** - 截屏识别桌面QR码
- **商品确认** - 自动解析QR码信息
- **位置选择** - 下拉选择标准货位
- **定时提醒** - 15分钟内未填报位置触发桌宠提醒

### 设置面板
- **LLM配置** - LLM服务地址
- **库存阈值** - 库存警告阈值
- **动画速度** - 宠物动画速度
- **提醒间隔** - 位置提醒间隔
- **PDF路径** - PDF输出路径
- **数据库路径** - SQLite数据库路径

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

## 功能截图

### 桌宠界面
- 加载动画
- 拖拽移动
- 右键快捷菜单

### 扫码入库界面
- QR码扫描
- 商品信息确认
- 位置选择

### 实验记录向导
- 五步流程
- 试剂选择
- PDF预览

### 设置面板
- 参数配置
- 保存设置

## 第五步UI打磨成果

✅ **Electron主进程与系统托盘**
- 无边框透明窗口，"置顶"和"点击穿透"属性
- 托盘菜单：显示/隐藏宠物、扫码入库、生成实验记录、设置、退出

✅ **桌宠本体：动画、拖拽与快捷气泡**
- Lottie动画支持（默认CSS动画）
- 鼠标拖拽移动，位置记忆
- 状态机：待机（呼吸动画）、提醒（摇晃+气泡）、忙碌（旋转）、祝贺（跳动）
- 气泡弹出：支持多种提醒类型

✅ **实验记录采集向导UI**
- 模态对话窗口，五步流程
- 试剂选择：扫码录入 + 库存列表选择
- 操作步骤：文本输入 + SOP模板
- 数据暂存draft_eln_service，切换步骤不丢失

✅ **扫码入库与位置提醒UI**
- 扫码窗口：摄像头/截屏识别QR码
- 商品信息确认卡片
- 15分钟未填位置提醒

✅ **PDF生成与预览**
- 调用template_engine.generatePDF()
- 自动打开系统默认PDF阅读器
- 桌宠气泡提示"记录已归档"

✅ **端到端体验串联**
- 启动 → 宠物右下角 → 托盘运行
- 右键宠物或托盘 → 向导 → PDF → 库存扣减 → 祝贺动画

✅ **体验打磨细节**
- 窗口动画流畅（CSS transition）
- 按钮hover/active反馈
- 表单实时验证
- 宠物悬停放大气泡
- 多窗口管理
- 加载画面（宠物跳一跳）

✅ **配置文件**
- .env读取宠物动画速度、提醒间隔、PDF路径
- 首次启动检查.env文件
- 设置面板写入.env