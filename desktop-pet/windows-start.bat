@echo off
echo 启动桌面宠物应用...

REM 检查 Node.js 是否安装
node --version >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js 未安装，请先安装 Node.js
    echo 下载地址：https://nodejs.org/
    pause
    exit
)

REM 检查依赖是否安装
if not exist "node_modules" (
    echo 正在安装依赖...
    npm install
    if %errorlevel% neq 0 (
        echo 依赖安装失败
        pause
        exit
    )
)

REM 启动应用
echo 正在启动应用...
npm start

REM 等待应用启动
echo 应用启动成功！
echo 桌宠已出现在桌面右上角
pause