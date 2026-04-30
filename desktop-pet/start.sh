#!/bin/bash

echo "=== 桌面宠物应用启动 ==="
echo "检查依赖..."

# 检查node_modules
if [ ! -d "node_modules" ]; then
    echo "node_modules目录不存在，请先运行 npm install"
    exit 1
fi

# 检查electron是否安装
if [ ! -d "node_modules/electron" ]; then
    echo "electron未安装，请先运行 npm install electron"
    exit 1
fi

echo "依赖检查完成"
echo "启动桌面宠物应用..."

# 启动应用
npm start