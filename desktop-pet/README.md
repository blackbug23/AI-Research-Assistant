# 桌面宠物应用

一个简单的桌面宠物应用，具有以下功能：

## 功能特点

1. **桌宠动画**：
   - 待机动画（上下浮动）
   - 点击反应动画
   - 气泡提示

2. **拖拽功能**：
   - 可以拖拽桌宠在桌面上移动
   - 拖拽时显示提示气泡

3. **数据库功能**：
   - 双击桌宠腹部打开数据库查看器
   - SQLite本地数据库（better-sqlite3）
   - 两个表：goods_in（入库记录）和inventory（库存）

4. **数据库操作**：
   - 插入示例数据
   - 查询库存数据
   - 清空数据库

## 技术栈

- **Electron**：桌面应用框架
- **React**：前端UI
- **better-sqlite3**：本地SQLite数据库
- **HTML/CSS/JavaScript**：界面实现

## 数据库设计

### goods_in表（入库记录）
- id：主键
- goods_name：商品名称
- quantity：数量
- price：价格
- arrival_date：入库时间
- supplier：供应商
- notes：备注

### inventory表（库存）
- id：主键
- goods_id：商品ID
- goods_name：商品名称
- current_quantity：当前数量
- min_quantity：最小库存
- max_quantity：最大库存
- location：存放位置
- last_update：最后更新时间

## 如何使用

### Windows 版本

1. **安装依赖**（需要 Node.js）：
   ```bash
   npm install
   ```

2. **启动应用**：
   ```bash
   npm start
   ```

3. **使用应用**：
   - 桌宠会出现在桌面右上角
   - 可以拖拽桌宠移动
   - 双击桌宠腹部打开数据库查看器
   - 在查看器中可以操作数据库

4. **打包 Windows 应用**：
   ```bash
   npm run build:win
   ```
   
### Windows 直接安装

1. **下载预编译版本**：
   - 从 GitHub Releases 下载 `desktop-pet-win-x64.exe`
   - 双击安装程序运行

2. **Windows 特有功能**：
   - 任务栏托盘图标
   - 开机自启动（可选）
   - Windows 通知支持

### 详细 Windows 安装指南

请查看 [WINDOWS_INSTALL.md](./WINDOWS_INSTALL.md)

## 项目结构

```
desktop-pet/
├── main.js              # Electron主进程
├── preload.js           # 数据库操作模块
├── index.html           # HTML界面
├── package.json         # 项目配置
├── assets/
│   └── icon.png         # 托盘图标
└── README.md            # 说明文档
```

## 团队协作角色

### 1. 全栈开发 (Electron/Flutter)
- 负责桌面应用框架搭建
- UI界面实现
- 多平台适配

### 2. 后端/同步算法工程师 (WebSocket, CRDT, SQLite调优)
- 设计数据库schema
- SQLite性能优化
- 未来扩展数据同步方案

### 3. AI工程师 (LLM部署、NER、合规模型)
- 设计AI交互逻辑
- 自然语言处理功能
- 合规检查模型

### 4. 产品/项目经理 (测试、实验室流程顾问)
- 制定项目计划
- 验收标准制定
- 测试方案设计
- 流程规范化