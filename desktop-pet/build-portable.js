// 便携式打包脚本 - 不使用electron-builder
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('便携式打包 - 创建可直接运行的目录结构');

// 创建打包目录
const distDir = path.join(__dirname, 'dist');
const winDir = path.join(distDir, 'win-portable');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}
if (!fs.existsSync(winDir)) {
  fs.mkdirSync(winDir, { recursive: true });
}

// 必需文件列表
const requiredFiles = [
  'main.js',
  'database.js',
  'simple_db.js',
  'simple_db_async.js',
  'app.js',
  'simple_main.js',
  'preload.js',
  'index.html',
  'guide.html',
  'scanner.html',
  'settings.html',
  'package.json',
  'README.md',
  'WINDOWS_INSTALL.md',
  '.env',
  '.env.example'
];

// 复制必需文件
console.log('复制必需文件...');
requiredFiles.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(winDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✓ ${file}`);
  } else {
    console.log(`✗ ${file} (不存在)`);
  }
});

// 复制目录
const requiredDirectories = [
  'src',
  'assets',
  'templates',
  'database'
];

requiredDirectories.forEach(dir => {
  const srcPath = path.join(__dirname, dir);
  const destPath = path.join(winDir, dir);
  
  if (fs.existsSync(srcPath)) {
    if (fs.statSync(srcPath).isDirectory()) {
      // 复制整个目录
      fs.mkdirSync(destPath, { recursive: true });
      const files = fs.readdirSync(srcPath);
      files.forEach(file => {
        const srcFilePath = path.join(srcPath, file);
        const destFilePath = path.join(destPath, file);
        if (fs.statSync(srcFilePath).isDirectory()) {
          // 如果是子目录，递归复制
          fs.mkdirSync(destFilePath, { recursive: true });
          const subFiles = fs.readdirSync(srcFilePath);
          subFiles.forEach(subFile => {
            fs.copyFileSync(path.join(srcFilePath, subFile), path.join(destFilePath, subFile));
          });
        } else {
          fs.copyFileSync(srcFilePath, destFilePath);
        }
      });
      console.log(`✓ ${dir} (${files.length}个文件)`);
    }
  } else {
    console.log(`✗ ${dir} (不存在)`);
  }
});

// 创建启动脚本
const launchScript = `
@echo off
echo 桌面宠物启动...
echo 如果首次启动失败，请先安装Node.js和Electron

if not exist "node_modules" (
  echo 安装依赖...
  npm install
)

echo 启动应用...
npm start
`;

fs.writeFileSync(path.join(winDir, 'launch.bat'), launchScript);
fs.writeFileSync(path.join(winDir, 'launch.sh'), 
`#!/bin/bash
echo "桌面宠物启动..."
echo "如果首次启动失败，请先安装Node.js和Electron"

if [ ! -d "node_modules" ]; then
  echo "安装依赖..."
  npm install
fi

echo "启动应用..."
npm start
`);

// 创建README
const portableReadme = `
# 桌面宠物便携版

这是一个便携式的桌面宠物应用，无需打包成exe即可运行。

## 使用方法

### Windows用户：
1. 安装Node.js (https://nodejs.org)
2. 安装Electron: \`npm install electron\`
3. 运行: \`npm start\`

### Linux/Mac用户：
1. 安装Node.js
2. 安装Electron: \`npm install electron\`
3. 运行: \`npm start\`

## 配置
- 数据库文件: desktop-pet.db (自动创建)
- QR扫描功能: 已集成
- 语音输入: 已集成
- ELN生成: 已集成

## 常见问题
如果遇到"database_sql.js"错误，请确保所有文件都在目录中：
- database.js
- main.js
- app.js
`;

fs.writeFileSync(path.join(winDir, 'README_PORTABLE.md'), portableReadme);

console.log('打包完成！');
console.log(`目录：${winDir}`);
console.log('用户需要自行安装Node.js和Electron运行此应用');