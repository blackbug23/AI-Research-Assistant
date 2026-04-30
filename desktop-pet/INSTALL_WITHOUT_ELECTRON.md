# 无 Electron 安装指南

如果你遇到 electron 安装失败，可以使用这个简化版本。

## 方法1：网页版本（完全无需安装）

这个版本可以在任何浏览器中运行，不需要 electron 或 Node.js。

### 步骤：
1. 下载 `desktop-pet.tar.gz`
2. 解压缩到任意文件夹
3. 双击 `index.html`
4. 桌宠就会出现在网页中

## 方法2：快速安装脚本

创建一个自动化的安装脚本：

```powershell
# 保存为 install.bat，双击运行

echo "正在检查 Node.js..."
node --version
if errorlevel 1 (
    echo "请先安装 Node.js v18+"
    echo "下载地址：https://nodejs.org/"
    pause
    exit
)

echo "正在安装依赖..."
npm install

echo "正在启动应用..."
npm start
```

## 备用依赖安装方法

如果 npm install 失败，使用以下方法：

### 1. 跳过 electron 安装
```bash
npm install --no-optional
```

### 2. 使用淘宝镜像
```bash
npm config set registry https://registry.npmmirror.com/
npm install
```

### 3. 安装指定版本
```bash
npm install electron@27.0.0
```

## 强制重置方法

```bash
# 删除 node_modules
rmdir node_modules

# 清除 npm 缓存
npm cache clean --force

# 重新安装
npm install

# 如果仍然失败，跳过 electron
npm install --ignore-scripts
```

## 直接运行网页版本

最简单的替代方案：

1. 下载项目
2. 用浏览器打开 `index.html`
3. 桌宠会出现在网页中，功能完全一样

这个版本不需要任何安装，只需要浏览器。