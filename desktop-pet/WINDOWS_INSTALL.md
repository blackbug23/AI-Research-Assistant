# Windows 安装指南

## 安装选项

### 方法1：直接运行（需要 Node.js）

1. **安装 Node.js**
   - 下载 Node.js：https://nodejs.org/
   - 安装 Node.js v18+ 版本

2. **下载项目**
   - 从 GitHub 下载或克隆项目
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

### 方法2：预编译版本（无需 Node.js）

下载预编译的 Windows 安装包：
1. 访问 GitHub Releases 页面下载 `desktop-pet-win-x64.exe`
2. 双击安装程序运行
3. 桌宠会自动出现在桌面右上角

## Windows 特有配置

### 启动快捷方式
在 Windows 上创建桌面快捷方式：
1. 右键点击桌面
2. 选择 "新建" → "快捷方式"
3. 输入命令：`node desktop-pet\app.js`
4. 命名为 "桌面宠物"

### 开机自启动
1. 将快捷方式放入：
   - `C:\Users\<用户名>\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup`
2. 桌宠会在开机时自动启动

## 常见问题

### 1. Node.js 无法安装
- 确保 Windows PowerShell 权限
- 以管理员身份运行安装程序

### 2. npm install 失败
```bash
# 清除 npm 缓存
npm cache clean --force

# 重新安装
npm install
```

### 3. 应用无法启动
检查 Electron 版本：
```bash
npm list electron
```

### 4. 数据库错误
如果 SQLite 数据库无法访问：
```bash
npm rebuild better-sqlite3
```

## Windows 打包脚本

运行以下命令创建 Windows 可执行文件：
```bash
npm run build:win
```

这会生成：
- `dist/desktop-pet-win-x64.exe`（Windows 安装包）

## 技术支持

如需 Windows 技术支持：
1. 查看 GitHub Issues
2. 提交 Windows 特定问题
3. 参考 Electron Windows 文档

## 兼容性

- Windows 10/11
- Node.js v18+
- Electron v27+
- SQLite 3.40+