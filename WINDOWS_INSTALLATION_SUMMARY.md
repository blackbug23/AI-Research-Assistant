# AI 研发助手 - Windows 版本安装摘要

## GitHub 仓库
https://github.com/blackbug23/AI-Research-Assistant

## Windows 版本安装方法

### 方法 1：一键安装（推荐）
1. 下载 GitHub 仓库
2. 进入 `desktop-pet` 目录
3. 运行 PowerShell 脚本：
   ```powershell
   windows-install.ps1
   ```

### 方法 2：传统安装
1. 安装 Node.js（v18+）
2. 进入 `desktop-pet` 目录
3. 安装依赖：
   ```bash
   npm install
   ```
4. 启动应用：
   ```bash
   npm start
   ```

### 方法 3：创建安装包
如果你想创建独立的 Windows 安装包：
```bash
npm run windows-build
```

这会生成：
- `dist/desktop-pet-win-x64.exe`
- 无需 Node.js，双击即可安装

## 安装包特点
1. **自动检测 Node.js** - 脚本会自动检查 Node.js 安装状态
2. **自动安装依赖** - 一键安装所有依赖项
3. **Windows 适配** - 优化了 Windows 系统的运行
4. **托盘支持** - Windows 任务栏托盘图标
5. **开机自启动** - 可设置为开机启动

## 系统要求
- Windows 10/11 64位
- 至少 2GB RAM
- 100MB 磁盘空间

## 使用说明
1. 桌宠会在桌面右上角出现
2. 可以拖拽桌宠移动
3. 双击桌宠腹部打开数据库查看器
4. 任务栏有托盘图标，可控制桌宠

所有 Windows 相关的脚本和指南都已同步到 GitHub 仓库！