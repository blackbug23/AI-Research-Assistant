# Windows 版 OpenClaw AI 助手安装指南

## 1. 桌面宠物应用安装

### 方法一：使用 Node.js 运行

#### 步骤：
1. **安装 Node.js**
   - 下载地址：https://nodejs.org/
   - 选择 Windows 版本（64-bit）
   - 安装完成后重启电脑

2. **下载项目**
   - 从 GitHub 下载：https://github.com/blackbug23/AI-Research-Assistant
   - 或者克隆仓库：
     ```bash
     git clone https://github.com/blackbug23/AI-Research-Assistant.git
     ```

3. **安装依赖**
   ```bash
   cd desktop-pet
   npm install
   ```

4. **启动应用**
   ```bash
   npm start
   ```

### 方法二：使用 PowerShell 脚本

Windows PowerShell 脚本：
```powershell
# 打开 PowerShell，切换到 desktop-pet 目录
.\windows-install.ps1
```

#### 脚本功能：
- 自动检查 Node.js
- 自动安装依赖
- 可选创建 Windows 安装包
- 自动启动应用

### 方法三：使用批处理文件

Windows 批处理脚本：
```cmd
# 双击 windows-start.bat
```

#### 功能：
- 简单检查 Node.js
- 启动应用

## 2. 创建 Windows 安装包

如果你想分发给其他人使用，可以创建 Windows 安装包：

1. **确保 electron-builder 已安装**
   ```bash
   npm install electron-builder --save-dev
   ```

2. **打包 Windows 应用**
   ```bash
   npm run build:win
   ```

3. **生成的文件**
   - `dist/desktop-pet-win-x64.exe` - Windows 安装程序
   - 安装包可以独立运行，无需 Node.js

## 3. Windows 特有功能

### 托盘图标
- 桌宠在任务栏显示托盘图标
- 点击托盘图标可以恢复隐藏的桌宠

### 开机自启动
1. 右键点击桌面快捷方式
2. 复制到启动文件夹：
   ```
   C:\Users\<用户名>\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
   ```

### Windows 通知
- 桌宠支持 Windows 通知系统
- 重要事件会显示通知

## 4. 技术支持

### 常见问题

#### Node.js 安装失败
- 检查 Windows PowerShell 权限
- 可能需要管理员权限运行

#### npm install 失败
- 清除缓存：`npm cache clean --force`
- 重新安装：`npm install`

#### 应用无法启动
- 检查 Electron 版本：`npm list electron`
- 可能需要重新安装：`npm rebuild`

#### 数据库错误
- SQLite 数据库问题：`npm rebuild better-sqlite3`

## 5. 系统要求

- **操作系统**: Windows 10/11（64位）
- **内存**: 至少 2GB RAM
- **存储**: 至少 100MB 可用空间
- **网络**: 不需要持续网络连接

## 6. GitHub 仓库使用

### 仓库内容
- 所有 OpenClaw 工作空间文件
- 桌面宠物应用代码
- Windows 安装脚本
- 完整的开发环境

### 自动同步
当你对工作空间做修改后，可以推送到 GitHub：
```bash
git add .
git commit -m "更新说明"
git push
```

## 7. 下一步

如果你需要创建完整的 Windows 安装包，请运行：
```bash
npm run windows-build
```

这会调用打包脚本，生成 Windows 安装包。

如果需要技术支持，请在 GitHub Issues 页面报告问题。