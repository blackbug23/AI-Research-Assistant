// 网页版数据库API模拟
// 为网页版提供兼容的数据库操作函数

// 模拟数据库数据
let goodsInData = [];
let inventoryData = [];

// 初始化数据库
function initDatabase() {
    console.log('网页版：初始化数据库');
    return { success: true, message: '数据库初始化成功' };
}

// 模拟QR码扫描
function simulateQRScan() {
    const qrcodes = [
        '商品名称：PCR试剂 数量：5 价格：99.99 供应商：供应商A',
        '商品名称：缓冲液 数量：10 价格：45.50 供应商：供应商B',
        '商品名称：细胞培养基 数量：15 价格：199.99 供应商：供应商C',
        '商品名称：抗生素 数量：5 价格：299.99 供应商：供应商D'
    ];
    const randomQR = qrcodes[Math.floor(Math.random() * qrcodes.length)];
    return { qrcode_data: randomQR };
}

// 插入QR码数据
function insertFromQRCode(qrData) {
    console.log('网页版：插入QR码数据', qrData);
    
    const match = qrData.match(/商品名称：([^ ]+) 数量：([^ ]+) 价格：([^ ]+) 供应商：([^ ]+)/);
    
    if (match) {
        const goods = {
            id: goodsInData.length + 1,
            goods_name: match[1],
            quantity: parseInt(match[2]),
            price: parseFloat(match[3]),
            supplier: match[4],
            purchaser: '系统用户',
            arrival_date: new Date().toISOString(),
            storage_location: '',
            qrcode_data: qrData
        };
        
        goodsInData.push(goods);
        
        // 更新库存数据
        const inventoryItem = {
            id: inventoryData.length + 1,
            goods_id: goods.id,
            goods_name: goods.goods_name,
            current_quantity: goods.quantity,
            min_quantity: 0,
            max_quantity: 1000,
            location: '',
            last_update: new Date().toISOString()
        };
        
        inventoryData.push(inventoryItem);
        
        return {
            success: true,
            goods_name: goods.goods_name,
            quantity: goods.quantity
        };
    } else {
        return {
            success: false,
            error: 'QR码解析失败'
        };
    }
}

// 获取空位置记录
function getEmptyLocationRecords() {
    console.log('网页版：获取空位置记录');
    
    const emptyRecords = goodsInData.filter(goods => !goods.storage_location);
    
    return {
        success: true,
        count: emptyRecords.length,
        data: emptyRecords
    };
}

// 更新存储位置
function updateStorageLocation(goodsId, location) {
    console.log('网页版：更新存储位置', goodsId, location);
    
    const goods = goodsInData.find(g => g.id === parseInt(goodsId));
    if (goods) {
        goods.storage_location = location;
        
        const inventoryItem = inventoryData.find(i => i.goods_id === parseInt(goodsId));
        if (inventoryItem) {
            inventoryItem.location = location;
        }
        
        return { success: true, message: '位置更新成功' };
    } else {
        return { success: false, error: '找不到该商品' };
    }
}

// 查询入库数据
function queryGoodsInData() {
    console.log('网页版：查询入库数据');
    return {
        success: true,
        data: goodsInData
    };
}

// 查询库存数据
function queryInventoryData() {
    console.log('网页版：查询库存数据');
    return {
        success: true,
        data: inventoryData
    };
}

// 启动提醒定时器
function startReminderTimer() {
    console.log('网页版：启动提醒定时器');
    
    // 每1分钟检查一次（网页版缩短时间便于测试）
    setTimeout(() => {
        const records = getEmptyLocationRecords();
        if (records.success && records.count > 0) {
            console.log(`网页版：发现 ${records.count} 个商品未录入位置`);
            
            if (window.api && window.api.triggerPetAnimation) {
                window.api.triggerPetAnimation(records.data);
            }
        }
    }, 60000); // 1分钟
    
    return { success: true };
}

// 触发宠物动画
function triggerPetAnimation(goodsList) {
    console.log('网页版：触发宠物动画', goodsList);
    return { success: true, message: '动画触发成功' };
}

// 显示提醒对话框
function showReminderDialog(message) {
    console.log('网页版：显示提醒对话框', message);
    alert(message);
    return { success: true };
}

// 生成实验记录
function generateELN(data) {
    console.log('网页版：生成实验记录', data);
    
    // 模拟PDF生成
    const pdfPath = './output/实验记录_' + new Date().getTime() + '.pdf';
    
    return {
        success: true,
        pdfPath: pdfPath,
        message: '实验记录PDF生成成功'
    };
}

// 打开PDF预览
function openPDFPreview(pdfPath) {
    console.log('网页版：打开PDF预览', pdfPath);
    alert('网页版PDF预览：' + pdfPath);
    return { success: true };
}

// 获取ELN模板
function getELNTemplate() {
    console.log('网页版：获取ELN模板');
    return {
        sections: [
            { name: '实验信息', fields: ['实验名称', '实验编号', '负责人', '日期'] },
            { name: '操作步骤', fields: ['操作描述'] },
            { name: '试剂清单', fields: ['试剂名称', '数量', '供应商'] },
            { name: '实验结果', fields: ['结果描述'] }
        ]
    };
}

// 保存设置
function saveSettings(settings) {
    console.log('网页版：保存设置', settings);
    
    // 模拟写入.env文件
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    return { success: true };
}

// 加载设置
function loadSettings() {
    console.log('网页版：加载设置');
    
    const storedSettings = localStorage.getItem('appSettings');
    if (storedSettings) {
        return JSON.parse(storedSettings);
    } else {
        // 默认设置
        return {
            LLM_URL: 'http://localhost:8000',
            INVENTORY_THRESHOLD: '10',
            PET_ANIMATION_SPEED: 'normal',
            REMINDER_INTERVAL: '15',
            PDF_OUTPUT_PATH: './output',
            DATABASE_PATH: './database.db'
        };
    }
}

// 网页版API对象
window.api = {
    initDatabase,
    insertFromQRCode,
    getEmptyLocationRecords,
    updateStorageLocation,
    simulateQRScan,
    queryGoodsInData,
    queryInventoryData,
    startReminderTimer,
    triggerPetAnimation,
    showReminderDialog,
    generateELN,
    openPDFPreview,
    getELNTemplate,
    saveSettings,
    loadSettings
};

// 检查是否是Electron环境
window.isElectron = typeof window.electron !== 'undefined';

// 如果不是Electron环境，使用网页版API
if (!window.isElectron) {
    console.log('网页版环境，使用模拟API');
    
    // 重写window.electron
    window.electron = {
        ipcRenderer: {
            sendSync: (channel, ...args) => {
                console.log('网页版：调用IPC', channel, args);
                
                // 映射到网页版API
                switch(channel) {
                    case 'init-database':
                        return window.api.initDatabase();
                    case 'insert-from-qrcode':
                        return window.api.insertFromQRCode(args[0]);
                    case 'get-empty-location-records':
                        return window.api.getEmptyLocationRecords();
                    case 'update-storage-location':
                        return window.api.updateStorageLocation(args[0], args[1]);
                    case 'simulate-qrscan':
                        return window.api.simulateQRScan();
                    case 'query-goods-in':
                        return window.api.queryGoodsInData();
                    case 'query-inventory':
                        return window.api.queryInventoryData();
                    case 'start-reminder-timer':
                        return window.api.startReminderTimer();
                    case 'trigger-pet-animation':
                        return window.api.triggerPetAnimation(args[0]);
                    case 'show-reminder-dialog':
                        return window.api.showReminderDialog(args[0]);
                    case 'generate-eln':
                        return window.api.generateELN(args[0]);
                    case 'open-pdf-preview':
                        return window.api.openPDFPreview(args[0]);
                    case 'get-eln-template':
                        return window.api.getELNTemplate();
                    case 'save-settings':
                        return window.api.saveSettings(args[0]);
                    case 'load-settings':
                        return window.api.loadSettings();
                    case 'open-output-folder':
                        alert('网页版不支持打开文件夹功能');
                        return { success: true };
                    default:
                        return { success: false, error: '网页版不支持此功能' };
                }
            }
        }
    };
}