#!/bin/bash
# 简单的Windows打包脚本

echo "📦 桌面宠物 Windows 打包脚本"
echo ""

# 创建Windows应用目录
echo "1. 创建Windows应用目录..."
mkdir -p win-build

# 复制必要文件
echo "2. 复制必要文件..."
cp main.js win-build/
cp package.json win-build/
cp index.html win-build/
cp guide.html win-build/
cp scanner.html win-build/
cp settings.html win-build/

# 复制目录
echo "3. 复制目录..."
cp -r assets win-build/
cp -r src win-build/
cp -r templates win-build/
cp -r database win-build/
cp -r __tests__ win-build/

# 复制配置文件
echo "4. 复制配置文件..."
cp .env.example win-build/.env
cp README.md win-build/
cp WINDOWS_INSTALL.md win-build/

# 创建启动脚本
echo "5. 创建启动脚本..."
echo "#!/bin/bash
cd /d \"%~dp0\"
node main.js
" > win-build/start.bat

echo "@echo off
cd /d \"%~dp0\"
node main.js
" > win-build/start.bat

# 创建安装说明
echo "6. 创建安装说明..."
cat << 'EOF' > win-build/INSTALL.txt
Windows 桌面宠物安装说明

========================================
步骤1：安装 Node.js
========================================
请先安装 Node.js（最新版本）
下载地址：https://nodejs.org/

========================================
步骤2：运行应用
========================================
1. 将 win-build 文件夹解压到任意位置
2. 进入文件夹
3. 双击运行 start.bat
4. 桌宠将出现在桌面右下角

========================================
功能说明
========================================
- 右键桌宠：弹出快捷菜单
- 托盘菜单：显示/隐藏、扫码、设置等
- 拖拽移动：鼠标拖拽桌宠到任意位置

========================================
常见问题
========================================
1. 桌宠不出现：检查 Node.js 是否安装
2. 扫码失败：手动输入QR码信息
3. PDF生成：需要PDF阅读器

========================================
技术支持
========================================
请查看 README.md 和 WINDOWS_INSTALL.md
EOF

# 创建压缩包
echo "7. 创建压缩包..."
zip -r desktop-pet-win.zip win-build/

echo ""
echo "✅ 打包完成！"
echo "✅ Windows版本已创建：desktop-pet-win.zip"
echo "✅ 包含以下文件："
echo "   - main.js (主程序)"
echo "   - index.html (桌宠界面)"
echo "   - guide.html (实验记录向导)"
echo "   - scanner.html (扫码入库界面)"
echo "   - settings.html (设置面板)"
echo "   - assets/ (图标和样式)"
echo "   - src/ (源代码)"
echo "   - start.bat (启动脚本)"
echo "   - INSTALL.txt (安装说明)"
echo ""
echo "📝 使用说明："
echo "1. 解压 desktop-pet-win.zip"
echo "2. 安装 Node.js"
echo "3. 运行 start.bat"
echo "4. 桌宠出现在桌面右下角"