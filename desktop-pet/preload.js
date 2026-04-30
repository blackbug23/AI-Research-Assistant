const Database = require('better-sqlite3');

let db;

function initDatabase() {
    try {
        const dbPath = require('path').join(__dirname, 'database.db');
        db = new Database(dbPath);
        
        // 创建goods_in表
        db.prepare(`CREATE TABLE IF NOT EXISTS goods_in (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            goods_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price DECIMAL(10,2),
            arrival_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            supplier TEXT,
            notes TEXT
        )`).run();
        
        // 创建inventory表
        db.prepare(`CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            goods_id INTEGER NOT NULL,
            goods_name TEXT NOT NULL,
            current_quantity INTEGER NOT NULL DEFAULT 0,
            min_quantity INTEGER NOT NULL DEFAULT 0,
            max_quantity INTEGER NOT NULL DEFAULT 1000,
            location TEXT,
            last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`).run();
        
        console.log('数据库初始化完成');
        return { success: true, message: '数据库初始化成功' };
    } catch (error) {
        console.error('数据库初始化失败:', error);
        return { success: false, message: `数据库初始化失败: ${error.message}` };
    }
}

function insertGoodsData() {
    try {
        const stmt = db.prepare(`INSERT INTO goods_in (goods_name, quantity, price, supplier, notes) 
                               VALUES (?, ?, ?, ?, ?)`);
        
        const data = [
            ['笔记本电脑', 5, 2999.99, '供应商A', '新品入库'],
            ['鼠标', 100, 49.99, '供应商B', '常规进货'],
            ['键盘', 50, 129.99, '供应商C', '更新库存'],
            ['显示器', 20, 999.99, '供应商D', '大屏显示器']
        ];
        
        for (const item of data) {
            stmt.run(item[0], item[1], item[2], item[3], item[4]);
        }
        
        // 同时更新库存表
        const inventoryStmt = db.prepare(`INSERT INTO inventory (goods_id, goods_name, current_quantity, min_quantity, max_quantity, location) 
                                        VALUES (?, ?, ?, ?, ?, ?)`);
        
        const inventoryData = [
            [1, '笔记本电脑', 5, 2, 10, '仓库A'],
            [2, '鼠标', 100, 50, 200, '仓库B'],
            [3, '键盘', 50, 20, 100, '仓库C'],
            [4, '显示器', 20, 5, 30, '仓库D']
        ];
        
        for (const item of inventoryData) {
            inventoryStmt.run(item[0], item[1], item[2], item[3], item[4], item[5]);
        }
        
        return { success: true, count: 4 };
    } catch (error) {
        console.error('插入数据失败:', error);
        return { success: false, message: `插入数据失败: ${error.message}` };
    }
}

function queryInventoryData() {
    try {
        const rows = db.prepare(`SELECT * FROM inventory ORDER BY id DESC LIMIT 20`).all();
        return { success: true, data: rows };
    } catch (error) {
        console.error('查询库存数据失败:', error);
        return { success: false, message: `查询失败: ${error.message}` };
    }
}

function queryGoodsInData() {
    try {
        const rows = db.prepare(`SELECT * FROM goods_in ORDER BY arrival_date DESC LIMIT 20`).all();
        return { success: true, data: rows };
    } catch (error) {
        console.error('查询入库数据失败:', error);
        return { success: false, message: `查询失败: ${error.message}` };
    }
}

function clearDatabase() {
    try {
        db.prepare(`DELETE FROM goods_in`).run();
        db.prepare(`DELETE FROM inventory`).run();
        return { success: true, message: '数据库已清空' };
    } catch (error) {
        console.error('清空数据库失败:', error);
        return { success: false, message: `清空失败: ${error.message}` };
    }
}

module.exports = {
    initDatabase,
    insertGoodsData,
    queryInventoryData,
    queryGoodsInData,
    clearDatabase
};