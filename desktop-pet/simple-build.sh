#!/bin/bash

echo "简化打包脚本..."
echo "清理旧文件..."
rm -rf dist/

echo "检查依赖..."
npm install

echo "创建打包目录..."
mkdir -p dist/win-unpacked

echo "复制必需文件..."
# 复制主程序文件
cp main.js dist/win-unpacked/
cp database.js dist/win-unpacked/
cp simple_db.js dist/win-unpacked/
cp simple_db_async.js dist/win-unpacked/
cp app.js dist/win-unpacked/
cp simple_main.js dist/win-unpacked/
cp preload.js dist/win-unpacked/

# 复制HTML文件
cp index.html dist/win-unpacked/
cp guide.html dist/win-unpacked/
cp scanner.html dist/win-unpacked/
cp settings.html dist/win-unpacked/

# 复制src目录
cp -r src dist/win-unpacked/

# 复制assets目录
cp -r assets dist/win-unpacked/

# 复制配置文件
cp package.json dist/win-unpacked/
cp README.md dist/win-unpacked/
cp WINDOWS_INSTALL.md dist/win-unpacked/

# 复制templates目录
cp -r templates dist/win-unpacked/

# 复制database目录
cp -r database dist/win-unpacked/

# 创建.env文件
echo "DATABASE_PATH=./desktop-pet.db" > dist/win-unpacked/.env
echo "LLM_API_KEY=" >> dist/win-unpacked/.env
echo "LLM_API_URL=http://localhost:8000/v1" >> dist/win-unpacked/.env

echo "创建node_modules链接..."
ln -sf ../node_modules dist/win-unpacked/node_modules

echo "打包完成！"
echo "手动打包目录：dist/win-unpacked/"
echo "需要配合electron运行时使用"