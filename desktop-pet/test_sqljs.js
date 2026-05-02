// sql.js 数据库测试脚本
const initSqlJs = require('sql.js');
const fs = require('fs');

async function testSqlJS() {
  console.log('开始测试 sql.js 数据库...');
  
  try {
    // 加载 SQL.js 库
    const SQL = await initSqlJs();
    
    // 创建数据库（内存数据库）
    const db = new SQL.Database();
    
    // 创建表
    console.log('创建goods_in表...');
    db.run("CREATE TABLE IF NOT EXISTS goods_in (id INTEGER PRIMARY KEY AUTOINCREMENT, goods_name TEXT NOT NULL)");
    
    // 插入数据
    console.log('插入测试数据...');
    db.run("INSERT INTO goods_in (goods_name) VALUES ('笔记本电脑')");
    db.run("INSERT INTO goods_in (goods_name) VALUES ('鼠标')");
    db.run("INSERT INTO goods_in (goods_name) VALUES ('键盘')");
    
    // 查询数据
    console.log('查询数据...');
    const result = db.exec("SELECT * FROM goods_in");
    console.log('查询结果:', result);
    
    if (result[0]) {
      console.log('表结构:', result[0].columns);
      console.log('数据:', result[0].values);
    }
    
    // 使用 prepared statement
    console.log('使用prepared statement...');
    const stmt = db.prepare("INSERT INTO goods_in (goods_name) VALUES (:name)");
    stmt.bind({ ':name': '显示器' });
    stmt.run();
    stmt.free();
    
    // 保存数据库到文件
    console.log('保存数据库到文件...');
    const data = db.export();
    fs.writeFileSync('test.db', Buffer.from(data));
    
    // 从文件加载数据库
    console.log('从文件加载数据库...');
    const buffer = fs.readFileSync('test.db');
    const db2 = new SQL.Database(buffer);
    
    const result2 = db2.exec("SELECT * FROM goods_in");
    console.log('加载后查询结果:', result2);
    
    db.close();
    db2.close();
    
    console.log('sql.js 测试完成！');
    return { success: true };
    
  } catch (error) {
    console.error('sql.js 测试失败:', error);
    return { success: false, error: error.message };
  }
}

// 运行测试
testSqlJS().then(result => {
  if (result.success) {
    console.log('✅ sql.js 测试成功');
  } else {
    console.log('❌ sql.js 测试失败');
  }
});