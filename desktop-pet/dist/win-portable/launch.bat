
@echo off
echo 桌面宠物启动...
echo 如果首次启动失败，请先安装Node.js和Electron

if not exist "node_modules" (
  echo 安装依赖...
  npm install
)

echo 启动应用...
npm start
