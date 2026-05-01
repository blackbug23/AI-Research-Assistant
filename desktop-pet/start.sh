#!/bin/bash
# 桌面宠物启动脚本

echo "启动桌面宠物应用..."

# 检查依赖
if ! command -v electron &> /dev/null; then
    echo "警告: Electron未安装，尝试安装..."
    npm install
fi

# 检查.env配置文件
if [ ! -f .env ]; then
    echo "创建.env配置文件..."
    cp .env.example .env
fi

# 检查数据库目录
if [ ! -d database ]; then
    echo "创建数据库目录..."
    mkdir database
fi

# 检查输出目录
if [ ! -d output ]; then
    echo "创建输出目录..."
    mkdir output
fi

# 启动应用
echo "启动桌面宠物..."
npm start