# 桌面宠物安装说明

## 修复的问题
本项目已完全解决以下问题：
1. **数据库引用错误**：不再引用 `database_sql.js`，统一使用 `database.js`
2. **语法错误**：修复了 `s.count:` → `count:` 语法错误
3. **API兼容性**：src/database.js 与主 database.js API一致
4. **打包配置**：包含所有必需文件和资源

## 快速使用指南

### Windows用户：
1. **直接运行**（需要Node.js和Electron）
```bash
npm install
npm start
```

2. **便携版**（已打包）
```
.\launch.bat
```

### 主要文件：
- `main.js` - 主程序
- `database.js` - SQL.js数据库模块
- `app.js` - Electron主窗口
- `preload.js` - IPC通信

### 数据库功能：
- QR码扫描入库
- 库存管理
- 实验记录生成(ELN)
- SQL.js WebAssembly实现，无需编译

## 已验证的功能
✅ 数据库模块正确引用 (`./database.js`)
✅ 无语法错误 (`s.count:` 已修复)
✅ SQL.js依赖已安装
✅ 所有API接口一致
✅ 打包包含所有必需文件

## 打包信息
生成的便携版包含：
- 所有JavaScript源码文件
- HTML界面文件
- 配置文件（.env）
- 启动脚本（launch.bat / launch.sh）
- 模板和资源文件

## 下一步
如果还需要exe文件打包，可以运行：
```bash
npm run windows-build
```

但便携版已足够使用，解决了所有数据库引用和语法问题。