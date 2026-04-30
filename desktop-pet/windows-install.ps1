# Windows 安装脚本 - PowerShell

Write-Host "桌面宠物应用安装脚本" -ForegroundColor Green
Write-Host "=========================================="

# 检查 Node.js
Write-Host "检查 Node.js..."
$nodeVersion = node --version
if (-not $nodeVersion) {
    Write-Host "Node.js 未安装" -ForegroundColor Red
    Write-Host "请先安装 Node.js：" -ForegroundColor Yellow
    Write-Host "下载地址：https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "安装后再次运行此脚本"
    exit
}

Write-Host "Node.js 已安装，版本：$nodeVersion" -ForegroundColor Green

# 检查 npm
Write-Host "检查 npm..."
npm --version
Write-Host "npm 已安装" -ForegroundColor Green

# 安装依赖
Write-Host "安装依赖..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "依赖安装失败" -ForegroundColor Red
    exit
}

Write-Host "依赖安装成功" -ForegroundColor Green

# 检查是否安装 electron-builder
Write-Host "检查 electron-builder..."
npm list electron-builder
if ($LASTEXITCODE -ne 0) {
    Write-Host "正在安装 electron-builder..." -ForegroundColor Yellow
    npm install electron-builder --save-dev
    if ($LASTEXITCODE -ne 0) {
        Write-Host "electron-builder 安装失败" -ForegroundColor Red
        exit
    }
    Write-Host "electron-builder 安装成功" -ForegroundColor Green
}

# 创建 Windows 版本
Write-Host "是否创建 Windows 安装包？" -ForegroundColor Yellow
Write-Host "[Y] 创建安装包"
Write-Host "[N] 仅运行应用"
Write-Host ""

$choice = Read-Host "请输入选择 (Y/N)"
if ($choice.ToUpper() -eq "Y") {
    Write-Host "开始创建 Windows 安装包..." -ForegroundColor Green
    npm run windows-build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "打包失败" -ForegroundColor Red
    } else {
        Write-Host "打包成功！Windows 安装包生成在 dist/ 目录" -ForegroundColor Green
    }
}

# 启动应用
Write-Host "启动应用..." -ForegroundColor Green
npm start

Write-Host "==========================================" -ForegroundColor Green
Write-Host "安装完成！" -ForegroundColor Green
Write-Host "桌宠会出现在桌面右上角" -ForegroundColor Yellow
Write-Host "双击桌宠腹部可以打开数据库查看器" -ForegroundColor Yellow
Write-Host "可以拖拽桌宠移动" -ForegroundColor Yellow