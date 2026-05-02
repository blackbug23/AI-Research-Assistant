// 增强版实验记录生成
const database = require('./database.js');
const templateEngine = require('./template_engine.js');
const stockDeduction = require('./stock_deduction.js');

/**
 * 生成实验记录PDF并更新库存
 * @param {Object} experimentData 实验数据
 * @returns {Object} 生成结果
 */
function generateExperimentRecord(experimentData) {
    console.log('生成实验记录:', experimentData);
    
    // 验证实验数据
    if (!experimentData.name || !experimentData.code) {
        return {
            success: false,
            error: '实验名称和编号不能为空'
        };
    }
    
    // 创建ELN记录数据
    const elnData = {
        experiment_info: {
            name: experimentData.name,
            code: experimentData.code,
            owner: experimentData.owner || '未知负责人',
            date: experimentData.date || new Date().toISOString().split('T')[0]
        },
        operation_steps: {
            template: experimentData.sop_template || '',
            details: experimentData.operations || ''
        },
        reagents_list: experimentData.goods.map(goods => ({
            name: goods.name,
            quantity: goods.quantity,
            supplier: goods.supplier || '未知供应商'
        })),
        results: {
            description: experimentData.result || '',
            attachment: experimentData.attachment || ''
        }
    };
    
    // 生成PDF
    try {
        const pdfResult = templateEngine.generatePDF(elnData);
        
        if (!pdfResult.success) {
            return {
                success: false,
                error: pdfResult.error || 'PDF生成失败'
            };
        }
        
        // 更新库存（扣减试剂用量）
        const deductionResults = [];
        for (const goods of experimentData.goods) {
            const deductionResult = stockDeduction.deductStock(goods.name, goods.quantity);
            deductionResults.push(deductionResult);
        }
        
        // 保存实验记录到数据库
        const dbResult = saveExperimentToDatabase(elnData, pdfResult.pdfPath);
        
        return {
            success: true,
            pdfPath: pdfResult.pdfPath,
            message: `实验记录生成成功，PDF文件: ${pdfResult.pdfPath}`,
            deductionResults: deductionResults,
            databaseResult: dbResult
        };
    } catch (error) {
        console.error('生成实验记录时发生错误:', error);
        return {
            success: false,
            error: error.message || '实验记录生成失败'
        };
    }
}

/**
 * 保存实验记录到数据库
 * @param {Object} elnData ELN数据
 * @param {String} pdfPath PDF文件路径
 * @returns {Object} 数据库操作结果
 */
function saveExperimentToDatabase(elnData, pdfPath) {
    try {
        // 这里应该创建一个新的数据库表来保存实验记录
        // 暂时返回模拟结果
        return {
            success: true,
            message: '实验记录已保存到数据库',
            experiment_id: Date.now(),
            pdf_path: pdfPath
        };
    } catch (error) {
        console.error('保存实验记录到数据库失败:', error);
        return {
            success: false,
            error: '数据库保存失败'
        };
    }
}

/**
 * 实验数据验证
 * @param {Object} data 实验数据
 * @returns {Object} 验证结果
 */
function validateExperimentData(data) {
    const errors = [];
    
    // 实验信息验证
    if (!data.name || data.name.trim() === '') {
        errors.push('实验名称不能为空');
    }
    
    if (!data.code || data.code.trim() === '') {
        errors.push('实验编号不能为空');
    }
    
    if (!data.owner || data.owner.trim() === '') {
        errors.push('负责人不能为空');
    }
    
    if (!data.date || data.date.trim() === '') {
        errors.push('实验日期不能为空');
    }
    
    // 操作步骤验证
    if (!data.operations || data.operations.trim() === '') {
        errors.push('操作步骤描述不能为空');
    }
    
    // 试剂选择验证
    if (!data.goods || data.goods.length === 0) {
        errors.push('必须选择至少一种试剂');
    } else {
        data.goods.forEach(goods => {
            if (!goods.name || goods.name.trim() === '') {
                errors.push('试剂名称不能为空');
            }
            if (!goods.quantity || goods.quantity <= 0) {
                errors.push(`试剂 "${goods.name}" 的数量必须大于0`);
            }
        });
    }
    
    // 实验结果验证
    if (!data.result || data.result.trim() === '') {
        errors.push('实验结果不能为空');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 获取常用试剂模板
 * @returns {Array} 常用试剂列表
 */
function getCommonReagents() {
    return [
        {
            name: 'PCR试剂',
            quantity: 1,
            supplier: '供应商A',
            description: 'PCR反应试剂盒'
        },
        {
            name: '缓冲液',
            quantity: 50,
            supplier: '供应商B',
            description: '标准缓冲液'
        },
        {
            name: '细胞培养基',
            quantity: 100,
            supplier: '供应商C',
            description: 'DMEM培养基'
        },
        {
            name: '抗生素',
            quantity: 10,
            supplier: '供应商D',
            description: '青霉素'
        },
        {
            name: '无水乙醇',
            quantity: 500,
            supplier: '供应商E',
            description: '纯度99.9%'
        },
        {
            name: '离心管',
            quantity: 50,
            supplier: '供应商F',
            description: '5ml离心管'
        }
    ];
}

/**
 * 创建自定义试剂模板
 * @param {Object} reagentData 试剂数据
 * @returns {Object} 创建结果
 */
function createCustomTemplate(reagentData) {
    // 保存到本地模板文件
    try {
        const fs = require('fs');
        const templatesPath = './templates/custom_reagents.json';
        
        let templates = [];
        if (fs.existsSync(templatesPath)) {
            templates = JSON.parse(fs.readFileSync(templatesPath, 'utf-8'));
        }
        
        templates.push(reagentData);
        fs.writeFileSync(templatesPath, JSON.stringify(templates, null, 2));
        
        return {
            success: true,
            message: '自定义模板保存成功'
        };
    } catch (error) {
        return {
            success: false,
            error: '模板保存失败'
        };
    }
}

module.exports = {
    generateExperimentRecord,
    validateExperimentData,
    getCommonReagents,
    createCustomTemplate
};