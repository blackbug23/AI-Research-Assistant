const Database = require('better-sqlite3');

console.log('测试数据库功能...');

try {
    const dbPath = './database.db';
    const db = new Database(dbPath);
    
    console.log('数据库连接成功');
    
    // 测试goods_in表
    const goodsInTable = db.prepare(`CREATE TABLE IF NOT EXISTS goods_in (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goods_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2),
        arrival_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        supplier TEXT,
        notes TEXT
    )`);
    goodsInTable.run();
    
    console.log('goods_in表创建成功');
    
    // 测试插入数据
    const insertGoods = db.prepare(`INSERT INTO goods_in (goods_name, quantity, price, supplier, notes) 
                                   VALUES (?, ?, ?, ?, ?)`);
    
    const goodsData = [
        ['笔记本电脑', 5, 2999.99, '供应商A', '新品入库'],
        ['鼠标', 100, 49.99, '供应商B', '常规进货'],
        ['键盘', 50, 129.99, '供应商C', '更新库存']
    ];
    
    for (const item of goodsData) {
        insertGoods.run(item[0], item[1], item[2], item[3], item[4]);
    }
    
    console.log('插入goods_in数据成功');
    
    // 测试查询数据
    const queryGoods = db.prepare(`SELECT * FROM goods_in`);
    const goodsRows = queryGoods.all();
    console.log('goods_in数据：');
    console.log(goodsRows);
    
    // 测试inventory表
    const inventoryTable = db.prepare(`CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goods_id INTEGER NOT NULL,
        goods_name TEXT NOT NULL,
        current_quantity INTEGER NOT NULL DEFAULT 0,
        min_quantity INTEGER NOT NULL DEFAULT 0,
        max_quantity INTEGER NOT NULL DEFAULT 1000,
        location TEXT,
        last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    inventoryTable.run();
    
    console.log('inventory表创建成功');
    
    // 测试插入库存数据
    const insertInventory = db.prepare(`INSERT INTO inventory (goods_id, goods_name, current_quantity, min_quantity, max_quantity, location) 
                                      VALUES (?, ?, ?, ?, ?, ?)`);
    
    const inventoryData = [
        [1, '笔记本电脑', 5, 2, 10, '仓库A'],
        [2, '鼠标', 100, 50, 200, '仓库B'],
        [3, '键盘', 50, 20, 100, '仓库C']
    ];
    
    for (const item of inventoryData) {
        insertInventory.run(item[0], item[1], item[2], item[3], item[4], item[5]);
    }
    
    console.log('插入inventory数据成功');
    
    // 测试查询库存数据
    const queryInventory = db.prepare(`SELECT * FROM inventory`);
    const inventoryRows = queryInventory.all();
    console.log('inventory数据：');
    console.log(inventoryRows);
    
    db.close();
    console.log('数据库测试完成');
    
} catch (error) {
    console.error('数据库测试失败:', error);
}