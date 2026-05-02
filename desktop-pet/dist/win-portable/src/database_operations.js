// 数据库操作统一函数
// 所有入库方式共享同一个入库函数

const db = require('./database.js');

/**
 * 添加商品到数据库（统一入库函数）
 * @param {Object} goodsData 商品数据
 * @returns {Object} 入库结果
 */
function addGoodsToDatabase(goodsData) {
    console.log('入库商品数据:', goodsData);
    
    // 校验必填字段
    if (!goodsData.goods_name || !goodsData.quantity) {
        return {
            success: false,
            error: '商品名称和数量为必填项'
        };
    }
    
    if (goodsData.quantity <= 0) {
        return {
            success: false,
            error: '数量必须大于0'
        };
    }
    
    try {
        // 解析入库数据
        const goodsInData = {
            goods_name: goodsData.goods_name,
            quantity: goodsData.quantity,
            price: goodsData.price || null,
            supplier: goodsData.supplier || '',
            notes: goodsData.notes || '',
            qrcode_data: goodsData.qrcode_data || JSON.stringify(goodsData),
            storage_location: goodsData.storage_location || '',
            purchaser: goodsData.purchaser || '系统用户'
        };
        
        // 写入 goods_in 表
        const result = db.insertFromQRCode(goodsInData.qrcode_data);
        
        if (result.success) {
            console.log(`入库成功: ${goodsData.goods_name}, 数量: ${goodsData.quantity}`);
            
            // 触发位置提醒定时器（如果有空位置）
            setTimeout(() => {
                const emptyRecords = db.getEmptyLocationRecords();
                if (emptyRecords.success && emptyRecords.count > 0) {
                    console.log(`发现 ${emptyRecords.count} 个商品未录入位置`);
                    // 触发宠物提醒
                    if (typeof window !== 'undefined' && window.api && window.api.triggerPetAnimation) {
                        window.api.triggerPetAnimation(emptyRecords.data);
                    }
                }
            }, 900000); // 15分钟
            
            return {
                success: true,
                goods_name: goodsData.goods_name,
                quantity: goodsData.quantity,
                message: '入库成功'
            };
        } else {
            return {
                success: false,
                error: result.error || '入库失败'
            };
        }
    } catch (error) {
        console.error('入库时发生错误:', error);
        return {
            success: false,
            error: error.message || '入库异常'
        };
    }
}

/**
 * 多途径商品入库统一入口
 * @param {Object} goodsData 商品数据（来自不同录入方式）
 * @returns {Object} 入库结果
 */
function multiInputGoods(goodsData) {
    // 验证数据格式
    if (!goodsData.input_type) {
        return {
            success: false,
            error: '缺少输入类型'
        };
    }
    
    console.log(`通过 ${goodsData.input_type} 方式入库`);
    
    // 根据输入类型进行必要的数据转换
    switch (goodsData.input_type) {
        case 'qr_scan':
            // QR码扫描
            return addGoodsToDatabase(goodsData);
            
        case 'manual_form':
            // 手动填表
            return addGoodsToDatabase(goodsData);
            
        case 'paste_link':
            // 粘贴链接/货号
            return addGoodsToDatabase(goodsData);
            
        case 'ocr_photo':
            // 拍照OCR
            return addGoodsToDatabase(goodsData);
            
        case 'common_template':
            // 常用模板
            return addGoodsToDatabase(goodsData);
            
        case 'excel_import':
            // Excel导入（批量）
            if (goodsData.goods_list && Array.isArray(goodsData.goods_list)) {
                const results = [];
                for (const goods of goodsData.goods_list) {
                    const result = addGoodsToDatabase(goods);
                    results.push(result);
                }
                
                const successfulCount = results.filter(r => r.success).length;
                return {
                    success: true,
                    message: `批量导入成功 ${successfulCount} 条商品`
                };
            } else {
                return {
                    success: false,
                    error: 'Excel导入数据格式错误'
                };
            }
            
        default:
            return {
                success: false,
                error: `未知输入类型: ${goodsData.input_type}`
            };
    }
}

/**
 * 校验商品数据
 * @param {Object} goodsData 商品数据
 * @returns {Object} 校验结果
 */
function validateGoodsData(goodsData) {
    const errors = [];
    
    // 必填字段校验
    if (!goodsData.goods_name || goodsData.goods_name.trim() === '') {
        errors.push('商品名称不能为空');
    }
    
    if (!goodsData.quantity || goodsData.quantity <= 0) {
        errors.push('数量必须大于0');
    }
    
    if (goodsData.quantity && !Number.isInteger(goodsData.quantity)) {
        errors.push('数量必须是整数');
    }
    
    // 可选字段校验
    if (goodsData.price && goodsData.price < 0) {
        errors.push('价格不能为负数');
    }
    
    if (goodsData.storage_location && goodsData.storage_location.trim() === '') {
        errors.push('存放位置不能为空字符串');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 批量入库确认页面数据格式
 * @param {Array} goodsList 商品列表
 * @returns {Object} 格式化后的预览数据
 */
function formatBatchPreview(goodsList) {
    const totalQuantity = goodsList.reduce((sum, goods) => sum + goods.quantity, 0);
    const totalPrice = goodsList.reduce((sum, goods) => sum + (goods.price || 0), 0);
    
    return {
        goods_count: goodsList.length,
        total_quantity: totalQuantity,
        total_price: totalPrice,
        goods_list: goodsList.map(goods => ({
            name: goods.goods_name,
            quantity: goods.quantity,
            price: goods.price || '未填写',
            supplier: goods.supplier || '未填写',
            location: goods.storage_location || '待确认'
        })),
        validation_results: goodsList.map(goods => validateGoodsData(goods))
    };
}

module.exports = {
    addGoodsToDatabase,
    multiInputGoods,
    validateGoodsData,
    formatBatchPreview
};