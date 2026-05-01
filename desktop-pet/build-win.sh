#!/bin/bash
# 桌面宠物 Windows 打包脚本

echo "准备打包桌面宠物 Windows 版本..."
echo ""

# 检查依赖
echo "检查 electron-builder..."
if ! command -v electron-builder &> /dev/null; then
  echo "electron-builder 未安装，请先安装：npm install electron-builder"
  exit 1
fi

# 检查 package.json
echo "检查 package.json..."
if [ ! -f "package.json" ]; then
  echo "package.json 不存在"
  exit 1
fi

# 检查 assets/icon.png
echo "检查图标文件..."
if [ ! -f "assets/icon.png" ]; then
  echo "assets/icon.png 不存在"
  exit 1
fi

# 检查主要文件
echo "检查应用文件..."
required_files=("main.js" "index.html" "guide.html" "scanner.html" "settings.html")
for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "缺少文件: $file"
    exit 1
  fi
done

echo "所有必需文件已检查完成"

# 创建 dist 目录
echo "创建输出目录..."
mkdir -p dist

# 打包
echo "开始打包..."
npx electron-builder --win

# 检查打包结果
echo ""
if [ -d "dist/win-unpacked" ]; then
  echo "✅ 打包成功！Windows 版本已创建"
  echo "✅ 输出目录: dist/"
  echo ""
  echo "生成的安装包位于:"
  echo "- dist/desktop-pet-win-x64.exe"
  echo "- dist/win-unpacked/desktop-pet.exe"
else
  echo "❌ 打包失败"
  exit 1
fi

echo ""
echo "打包完成！Windows 桌面宠物应用已准备好。"
echo "请将 dist/desktop-pet-win-x64.exe 提供给用户安装。"