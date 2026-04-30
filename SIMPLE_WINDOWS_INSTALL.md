# Windows 安装指南（最简单版本）

## 方法一：直接下载完整包

### 步骤1：下载项目
从 GitHub 下载完整项目：
- https://github.com/blackbug23/AI-Research-Assistant
- 下载 ZIP 文件或克隆仓库

### 步骤2：安装依赖
打开 PowerShell 或命令提示符：
```bash
cd desktop-pet
npm install
```

**如果 npm install 失败**：
1. 确保 Node.js 已安装（版本 v18+）
2. 检查网络连接
3. 使用以下命令清除缓存：
```bash
npm cache clean --force
npm install
```

### 步骤3：启动应用
```bash
npm start
```

## 方法二：仅运行核心功能

如果 electron 安装有问题，可以直接运行网页版本：

### 创建简单的网页版
1. 创建一个新的文件夹 `web-pet`
2. 将以下文件复制进去：
   - `index.html`
   - `main.js`
   - `simple_main.js`
   - `assets/icon.png`

### 运行网页版
直接用浏览器打开 `index.html`，无需 Node.js 安装

## 常见错误及解决方案

### 1. electron 安装失败
```bash
# 解决方法
npm install --global --production windows-build-tools
npm install electron
```

### 2. Node.js 版本问题
使用 Node.js v18+ 版本

### 3. 权限问题
Windows 可能需要管理员权限：
```bash
# 以管理员身份运行 PowerShell
npm install
```

### 4. 网络问题
```bash
# 尝试使用淘宝镜像
npm config set registry https://registry.npmmirror.com/
npm install
```

## 备用方法：纯 JavaScript 版本

如果你不想安装 electron，可以直接运行纯 JavaScript 版本：

1. **下载备用版本**：
   - 从 desktop-pet 目录下载 `simple_main.js`
   - 下载 `index.html`
   - 下载 `assets/icon.png`

2. **用浏览器打开**：
   - 直接双击 `index.html`

这个版本不需要 electron，可以用任何浏览器运行。

## 联系支持

如果仍然无法安装，请在 GitHub 页面报告问题：
https://github.com/blackbug23/AI-Research-Assistant/issues