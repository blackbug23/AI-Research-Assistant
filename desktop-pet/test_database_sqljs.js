const initSqlJs = require('sql.js');
const fs = require('fs');

console.log('测试sql.js数据库功能...');

async function testDatabase() {
    try {
        const SQL = await initSqlJs();
        const db = new SQL.Database();
        
        console.log('数据库连接成功');
        
        // 测试goods_in表
        db.run(`CREATE TABLE IF NOT EXISTS goods_in (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            goods_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price DECIMAL(10,2),
            arrival_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            supplier TEXT,
            notes TEXT
        )`);
        
        console.log('goods_in表创建成功');
        
        // 测试插入数据
        const goodsData = [
            ['笔记本电脑', 5, 2999.99, '供应商A', '新品入库'],
            ['鼠标', 100, 49.99, '供应商B', '常规进货'],
            ['键盘', 50, 129.99, '供应商C', '更新库存']
        ];
        
        for (const item of goodsData) {
            db.run(`INSERT INTO goods_in (goods_name, quantity, price, supplier, notes) 
                   VALUES (?, ?, ?, ?, ?)`, item);
        }
        
        console.log('插入goods_in数据成功');
        
        // 测试查询数据
        const goodsResult = db.exec(`SELECT * FROM goods_in`);
        console.log('goods_in数据：');
        if (goodsResult[0]) {
            goodsResult[0].values.forEach(row => {
                console.log(row);
            });
        }
        
        // 测试inventory表
        db.run(`CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            goods_id INTEGER NOT NULL,
            goods_name TEXT NOT NULL,
            current_quantity INTEGER NOT NULL DEFAULT 0,
            min_quantity INTEGER NOT NULL DEFAULT 0,
            max_quantity INTEGER NOT NULL DEFAULT 1000,
            location TEXT,
            last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        
        console.log('inventory表创建成功');
        
        // 测试插入库存数据
        const inventoryData = [
            [1, '笔记本电脑', 5, 2, 10, '仓库A'],
            [2, '鼠标', 100, 50, 200, '仓库B'],
            [3, '键盘', 50, 20, 100, '仓库C']
        ];
        
        for (const item of inventoryData) {
            db.run(`INSERT INTO inventory (goods_id, goods_name, current_quantity, min_quantity, max_quantity, location) 
                  VALUES (?, ?, ?, ?, ?, ?)`, item);
        }
        
        console.log('插入inventory数据成功');
        
        // 测试查询库存数据
        const inventoryResult = db.exec(`SELECT * FROM inventory`);
        console('inventory数据：');
        if (inventoryResult[0]) {
            inventoryResult[0].values.forEach(row => {
                console.log(row);
            });
        }
        
        // 保存数据库到文件
        const data = db.export();
        fs.writeFileSync('test.db', Buffer.from(data));
        console.log('数据库保存到文件成功');
        
        db.close();
        console.log('数据库测试完成');
        
    } catch (error) {
        console.error('数据库测试失败:', error);
    }
}

testDatabase();