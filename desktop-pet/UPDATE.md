# 数据库升级：从 better-sqlite3 到 sql.js

## 变更概述

已完成以下更新以将项目中所有 better-sqlite3 替换为 sql.js：

### 1. 依赖包更新
- `package.json`：将 `better-sqlite3: "^9.0.0"` 替换为 `sql.js: "^1.14.1"`
- `win-build/package.json`：同样替换依赖

### 2. 数据库模块更新
- **database.js**：创建了新的异步 sql.js 版本
- **database_sqljs.js**：创建了新的 sql.js 数据库模块
- **src/database.js**：更新为 sql.js 版本
- **win-build/src/database.js**：更新为 sql.js 版本
- **simple_db_async.js**：创建了异步版本的简单数据库（JSON文件）

### 3. 主程序更新
- **main.js**：
  - 使用新的异步数据库模块 `database_sqljs.js`
  - 更新所有 IPC 事件处理以支持异步调用
  - 修复了异步定时器逻辑

### 4. 测试文件更新
- **test_database.js**：更新为使用 sql.js 的异步测试版本
- **test_database_sqljs.js**：创建了 sql.js 版本的测试文件

## 技术细节

### 差异说明

#### better-sqlite3 vs sql.js
- **better-sqlite3**：原生 Node.js SQLite 绑定，使用同步 API
- **sql.js**：纯 JavaScript SQLite 库，编译自 SQLite C 代码到 JavaScript，使用异步 API

#### API 差异
1. **连接数据库**
   - better-sqlite3: `const db = new Database(dbPath);`
   - sql.js: `const SQL = await initSqlJs(); const db = new SQL.Database(buffer);`

2. **执行查询**
   - better-sqlite3: `db.prepare(sql).run(params)` 或 `db.exec(sql)`
   - sql.js: `db.run(sql, params)` 或 `db.exec(sql)`

3. **结果处理**
   - better-sqlite3: 返回行对象
   - sql.js: 返回包含 columns 和 values 数组的对象

4. **事务**
   - better-sqlite3: `db.transaction(() => { ... })`
   - sql.js: 需要手动实现（sql.js 不支持事务）

5. **异步 vs 同步**
   - better-sqlite3: 同步 API
   - sql.js: 异步 API（initSqlJs() 返回 Promise）

### 兼容性改进

1. **异步 API 包装**：为保持兼容性，创建了异步版本的数据库模块
2. **IPC 同步调用**：使用 IPC 的 `sendSync` 方法，即使底层是异步的
3. **返回格式**：保持了相同的返回对象结构
4. **错误处理**：添加了 try-catch 来捕获异步错误

## 文件列表

以下是已更新的文件：

### 主要文件
1. `/root/.openclaw/workspace/desktop-pet/database.js` - 新的 sql.js 数据库模块
2. `/root/.openclaw/workspace/desktop-pet/main.js` - 更新的主程序
3. `/root/.openclaw/workspace/desktop-pet/package.json` - 更新依赖

### Win-build 文件
4. `/root/.openclaw/workspace/desktop-pet/win-build/src/database.js` - sql.js 版本
5. `/root/.openclaw/workspace/desktop-pet/win-build/package.json` - 更新依赖
6. `/root/.openclaw/workspace/desktop-pet/win-build/main.js` - 已更新

### 其他文件
7. `/root/.openclaw/workspace/desktop-pet/test_database.js` - 更新为 sql.js 测试
8. `/root/.openclaw/workspace/desktop-pet/simple_db_async.js` - 异步 JSON 数据库（备用方案）
9. `/root/.openclaw/workspace/desktop-pet/src/database_sqljs.js` - src 目录的 sql.js 模块
10. `/root/.openclaw/workspace/desktop-pet/src/database.js` - 原 better-sqlite3 文件已删除

## 备份和兼容性

### 保留文件
- `simple_db.js`：原始的 JSON 文件数据库模块
- `simple_db_async.js`：异步版本的 JSON 数据库（可选备用）

### 重要注意事项
1. **异步 API**：sql.js 是异步的，需要等待数据库初始化
2. **内存数据库**：sql.js 默认在内存中运行，需要导出到文件保存
3. **SQL 语法**：SQLite 语法基本兼容
4. **性能**：sql.js 在 JavaScript 环境中运行，性能低于原生 better-sqlite3，但更易于部署

## 下一步操作

### 安装依赖
```bash
npm install sql.js
```

### 测试运行
```bash
node test_database_sqljs.js
npm start
```

### 可选替代方案
如果 sql.js 安装出现问题，可以使用 JSON 数据库方案：
```bash
mv database.js simple_db.js
mv simple_db_async.js database.js
```

## 问题与解决方案

### 1. 安装问题
sql.js 可能需要在 Electron 环境中额外配置。如果安装失败，使用 JSON 方案。

### 2. 异步处理
所有 IPC 事件已经转换为异步处理，但如果前端调用过快可能导致阻塞。

### 3. 部署
确保在所有部署环境中都安装了 sql.js 依赖。