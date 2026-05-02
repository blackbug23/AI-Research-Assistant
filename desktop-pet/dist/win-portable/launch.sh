#!/bin/bash
echo "桌面宠物启动..."
echo "如果首次启动失败，请先安装Node.js和Electron"

if [ ! -d "node_modules" ]; then
  echo "安装依赖..."
  npm install
fi

echo "启动应用..."
npm start
