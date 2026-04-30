// 模板引擎模块
// 用于生成和润色实验记录

const fs = require('fs');
const path = require('path');
const LLMService = require('./llm_service.js');

class TemplateEngine {
  constructor() {
    this.templatePath = path.join(__dirname, '../templates/eln_template.json');
    this.loadTemplate();
    this.llmService = new LLMService();
  }

  /**
   * 加载模板
   */
  loadTemplate() {
    try {
      const templateContent = fs.readFileSync(this.templatePath, 'utf8');
      this.template = JSON.parse(templateContent);
    } catch (error) {
      console.error('模板加载失败:', error);
      this.template = null;
    }
  }

  /**
   * 填充ELN模板并调用LLM润色
   * @param {object} experimentData - 实验数据
   * @returns {Promise<object>} - 完整的实验记录
   */
  async fillTemplateAndPolish(experimentData) {
    try {
      // 验证模板
      if (!this.template) {
        throw new Error('ELN模板未加载');
      }

      // 填充固定字段
      const filledRecord = {
        header: {
          experiment_title: experimentData.title || '',
          experiment_code: this.generateExperimentCode(),
          date: new Date().toISOString().split('T')[0],
          operator: experimentData.operator || '系统操作员',
          location: experimentData.location || '实验室'
        },
        content: {
          objective: experimentData.objective || '',
          principle: experimentData.principle || '',
          materials: this.formatMaterials(experimentData.materials_json || []),
          procedures: '',
          results: '',
          conclusion: ''
        },
        footer: {
          materials_list: this.generateMaterialsList(experimentData.materials_json || []),
          safety_notes: '请遵守实验室安全规程',
          references: '参考文献'
        }
      };

      // LLM润色实验步骤
      if (experimentData.raw_procedures) {
        const polishedProcedures = await this.llmService.polishExperimentSteps(experimentData.raw_procedures);
        filledRecord.content.procedures = polishedProcedures;
      }

      // LLM润色实验结果
      if (experimentData.raw_results) {
        const polishedResults = await this.llmService.polishExperimentResults(experimentData.raw_results);
        filledRecord.content.results = polishedResults;
      }

      // LLM生成实验结论
      if (filledRecord.content.objective && filledRecord.content.results) {
        const conclusionPrompt = `基于以下实验目的和结果生成实验结论：
        
        实验目的：${filledRecord.content.objective}
        实验结果：${filledRecord.content.results}
        
        要求：
        1. 仅基于输入信息，不添加虚构数据
        2. 温度设置为0.3
        3. 结论简洁、准确
        
        实验结论：`;
        
        const conclusion = await this.llmService.generateCompletion(conclusionPrompt);
        filledRecord.content.conclusion = conclusion;
      }

      return {
        success: true,
        eln_record: filledRecord,
        metadata: {
          template_version: '1.0',
          generation_date: new Date().toISOString(),
          materials_count: experimentData.materials_json?.length || 0,
          llm_calls: 3 // 步骤、结果、结论各一次
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        eln_record: null
      };
    }
  }

  /**
   * 生成实验编号
   * @returns {string} - 实验编号
   */
  generateExperimentCode() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const random = Math.floor(Math.random() * 1000);
    
    return `ELN${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}-${random.toString().padStart(3, '0')}`;
  }

  /**
   * 格式化实验材料
   * @param {array} materialsJson - 材料JSON数组
   * @returns {string} - 格式化后的材料文本
   */
  formatMaterials(materialsJson) {
    if (!materialsJson || materialsJson.length === 0) {
      return '暂无实验材料';
    }

    const materialsText = materialsJson.map(material => {
      return `${material.name || material.reagent_name}: ${material.quantity} ${material.unit}`;
    }).join('\n');

    return `实验材料清单：\n${materialsText}`;
  }

  /**
   * 生成物料清单
   * @param {array} materialsJson - 材料JSON数组
   * @returns {string} - 物料清单文本
   */
  generateMaterialsList(materialsJson) {
    if (!materialsJson || materialsJson.length === 0) {
      return '暂无物料清单';
    }

    const materialsList = materialsJson.map(material => {
      return {
        reagent_name: material.name || material.reagent_name,
        reagent_master_id: material.reagent_master_id,
        quantity: material.quantity,
        unit: material.unit,
        lot_number: material.lot_number || '',
        expiration_date: material.expiration_date || ''
      };
    });

    const jsonString = JSON.stringify(materialsList, null, 2);
    return jsonString;
  }

  /**
   * 验证实验数据完整性
   * @param {object} experimentData - 实验数据
   * @returns {object} - 验证结果
   */
  validateExperimentData(experimentData) {
    const errors = [];

    // 必需字段检查
    if (!experimentData.title) {
      errors.push('实验名称不能为空');
    }

    if (!experimentData.objective) {
      errors.push('实验目的不能为空');
    }

    if (!experimentData.materials_json || experimentData.materials_json.length === 0) {
      errors.push('实验材料不能为空');
    }

    if (!experimentData.raw_procedures) {
      errors.push('实验步骤不能为空');
    }

    if (!experimentData.raw_results) {
      errors.push('实验结果不能为空');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 生成PDF格式的ELN记录
   * @param {object} elnRecord - ELN记录
   * @returns {string} - PDF格式文本
   */
  generatePDFText(elnRecord) {
    const pdfText = `
===============================================================================
                     实验记录 - ${elnRecord.header.experiment_code}
===============================================================================

实验名称：${elnRecord.header.experiment_title}
实验编号：${elnRecord.header.experiment_code}
实验日期：${elnRecord.header.date}
实验人员：${elnRecord.header.operator}
实验地点：${elnRecord.header.location}

===============================================================================
实验目的：
${elnRecord.content.objective}

===============================================================================
实验原理：
${elnRecord.content.principle}

===============================================================================
实验材料：
${elnRecord.content.materials}

===============================================================================
实验步骤：
${elnRecord.content.procedures}

===============================================================================
实验结果：
${elnRecord.content.results}

===============================================================================
实验结论：
${elnRecord.content.conclusion}

===============================================================================
物料清单：
${elnRecord.footer.materials_list}

===============================================================================
安全注意事项：
${elnRecord.footer.safety_notes}

===============================================================================
参考文献：
${elnRecord.footer.references}

===============================================================================
生成时间：${elnRecord.metadata.generation_date}
材料数量：${elnRecord.metadata.materials_count}
===============================================================================
`;

    return pdfText;
  }
}

module.exports = TemplateEngine;