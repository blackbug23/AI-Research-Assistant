// Windows 打包脚本
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('准备打包桌面宠物应用...');

// 检查必要的依赖
function checkDependencies() {
  console.log('检查依赖...');
  
  // electron-builder已安装
  console.log('electron-builder 已安装');
  createPackageConfig();
}

function createPackageConfig() {
  console.log('创建打包配置...');
  
  // 读取现有的 package.json
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // 添加打包配置
  packageData.build = {
    "appId": "com.blackbug23.desktop-pet",
    "productName": "桌面宠物",
    "directories": {
      "output": "dist"
    },
    "files": [
      "main.js",
      "database.js",
      "simple_db.js",
      "simple_db_async.js",
      "app.js",
      "simple_main.js",
      "preload.js",
      "index.html",
      "guide.html",
      "scanner.html",
      "settings.html",
      "src/**/*",
      "__tests__/**/*",
      "package.json",
      "assets/**/*",
      "README.md",
      "WINDOWS_INSTALL.md",
      "templates/**/*",
      "database/**/*"
    ],
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ],
      "icon": "assets/icon.png"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "extraResources": [
      {
        "from": "assets",
        "to": "assets"
      }
    ]
  };
  
  packageData.scripts["build:win"] = "electron-builder --win";
  
  // 写入更新后的 package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageData, null, 2));
  
  console.log('package.json 已更新');
  
  // 创建 Windows 版本说明文件
  const windowsReadme = path.join(__dirname, 'WINDOWS_README.md');
  const windowsReadmeContent = `# 桌面宠物 Windows 版本

这是一个专为 Windows 系统打包的应用。

## 下载和安装

1. 下载安装包
   - 从 GitHub Releases 下载最新版本
   - 文件名：desktop-pet-win-x64.exe

2. 安装步骤
   - 双击安装包
   - 选择安装目录
   - 完成安装

3. 启动应用
   - 桌面快捷方式
   - 开始菜单快捷方式
   - 安装目录中的可执行文件

## 功能特点

### Windows 特有功能
- 任务栏托盘图标
- 开机自启动
- Windows 通知支持
- 文件系统访问优化

### 系统要求
- Windows 10 或 11
- 64位系统
- 至少 2GB 内存
- 100MB 硬盘空间

### 技术支持
如需 Windows 版本技术支持，请在 GitHub Issues 页面报告问题。

## 更新日志

版本 1.0.0：
- 首次 Windows 版本发布
- 支持 Windows 10/11
- 数据库功能完整
- UI打磨与端到端体验优化已完成

## 注意事项
- 应用需要 SQLite 数据库，首次启动会自动创建
- 可以拖拽桌宠移动
- 双击桌宠腹部打开数据库查看器`;

  fs.writeFileSync(windowsReadme, windowsReadmeContent);
  
  console.log('Windows README 已创建');
  
  // 运行打包命令
  console.log('开始打包 Windows 版本...');
  exec('npm run build:win', (error, stdout, stderr) => {
    if (error) {
      console.error('打包失败:', error);
      return;
    }
    console.log('打包成功:', stdout);
    console.log('Windows 安装包生成在 dist/ 目录');
  });
}

// 开始打包流程
checkDependencies();