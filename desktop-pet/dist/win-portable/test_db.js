// 数据库测试脚本
const initSqlJs = require('sql.js');
const fs = require('fs');

async function testDatabase() {
  try {
    console.log('开始测试 sql.js 数据库...');
    
    // 初始化 SQL.js
    const SQL = await initSqlJs();
    
    // 创建数据库
    const db = new SQL.Database();
    
    // 创建测试表
    console.log('创建goods_in表...');
    db.run(`CREATE TABLE goods_in (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goods_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price DECIMAL(10,2),
      supplier TEXT,
      notes TEXT,
      arrival_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      storage_location TEXT
    )`);
    
    // 插入测试数据
    console.log('插入测试数据...');
    db.run(`INSERT INTO goods_in (goods_name, quantity, price, supplier, notes) VALUES 
      ('笔记本电脑', 5, 2999.99, '供应商A', '新品入库')`);
    db.run(`INSERT INTO goods_in (goods_name, quantity, price, supplier, notes) VALUES 
      ('鼠标', 100, 49.99, '供应商B', '常规进货')`);
    db.run(`INSERT INTO goods_in (goods_name, quantity, price, supplier, notes) VALUES 
      ('键盘', 50, 129.99, '供应商C', '更新库存')`);
    
    // 查询数据
    console.log('查询数据...');
    const result = db.exec(`SELECT * FROM goods_in`);
    
    console.log('查询结果:', JSON.stringify(result, null, 2));
    
    if (result && result.length > 0) {
      console.log('表结构:', result[0].columns);
      console.log('数据:', result[0].values);
    }
    
    // 使用 prepared statement
    console.log('使用prepared statement...');
    const stmt = db.prepare(`SELECT * FROM goods_in WHERE goods_name = ?`);
    const preparedResult = stmt.getAsObject(['笔记本电脑']);
    console.log('Prepared查询:', preparedResult);
    
    // 保存数据库
    console.log('保存数据库到文件...');
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync('test.db', buffer);
    
    // 从文件加载数据库
    console.log('从文件加载数据库...');
    const fileBuffer = fs.readFileSync('test.db');
    const db2 = new SQL.Database(fileBuffer);
    const loadedResult = db2.exec(`SELECT * FROM goods_in`);
    
    console.log('加载后查询结果:', JSON.stringify(loadedResult, null, 2));
    
    console.log('sql.js 测试完成！');
    console.log('✅ sql.js 测试成功');
    
    return { success: true };
  } catch (error) {
    console.error('sql.js 测试失败:', error);
    console.log('❌ sql.js 测试失败');
    return { success: false, error: error.message };
  }
}

// 运行测试
testDatabase();