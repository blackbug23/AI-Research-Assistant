// ELN生成与库存扣减端到端模块

const TemplateEngine = require('./template_engine.js');
const StockDeductionEngine = require('./stock_deduction.js');
const FactChecker = require('./fact_checker.js');
const DraftELNService = require('./draft_eln_service.js');
const LLMService = require('./llm_service.js');

class ELNGenerationSystem {
  constructor() {
    this.templateEngine = new TemplateEngine();
    this.stockDeductionEngine = new StockDeductionEngine(StockDeductionEngine.generateMockStockData());
    this.factChecker = new FactChecker();
    this.draftELNService = new DraftELNService();
    this.llmService = new LLMService();
    this.startTime = null;
  }

  /**
   * 端到端ELN生成与库存扣减
   * @param {object} draftData - 实验草稿数据
   * @returns {object} - 生成结果
   */
  async generateELNAndDeductStock(draftData) {
    console.log('开始ELN生成与库存扣减流程');
    this.startTime = Date.now();

    const result = {
      success: false,
      steps: [],
      errors: []
    };

    // 步骤1：从草稿获取数据
    result.steps.push('从 draft_eln 取数据');
    if (!draftData.id) {
      result.errors.push('缺少草稿ID');
      return result;
    }

    const draft = this.draftELNService.getDraftById(draftData.id);
    if (!draft) {
      result.errors.push('草稿不存在');
      return result;
    }

    // 步骤2：调用模板引擎生成ELN文本
    result.steps.push('调用模板引擎生成ELN文本');
    const templateResult = await this.templateEngine.fillTemplateAndPolish({
      title: draft.title,
      objective: draft.objective,
      principle: draft.principle,
      materials_json: draft.materials_json,
      raw_procedures: draft.raw_procedures,
      raw_results: draft.raw_results
    });

    if (!templateResult.success) {
      result.errors.push(`模板引擎失败: ${templateResult.error}`);
      return result;
    }

    result.eln_record = templateResult.eln_record;

    // 步骤3：事实核对
    result.steps.push('事实核对');
    const llmOutputText = templateResult.eln_record.content.procedures + templateResult.eln_record.content.results;
    const consistencyResult = this.factChecker.checkMaterialConsistency(llmOutputText, draft.materials_json);

    if (!consistencyResult.consistent) {
      result.steps.push('发现不一致，生成高亮提示');
      result.consistency_result = consistencyResult;
      result.highlighted_text = this.factChecker.highlightInconsistencies(llmOutputText, consistencyResult.inconsistencies);
      result.report = this.factChecker.generateReport(consistencyResult);
      
      // 如果存在严重不一致，返回错误
      const seriousErrors = consistencyResult.inconsistencies.filter(inconsistency => 
        inconsistency.ratio > 10 || inconsistency.reason.includes('LLM输出中遗漏')
      );
      
      if (seriousErrors.length > 0) {
        result.errors.push(`严重不一致：${seriousErrors.map(e => e.reagent_name).join(', ')}`);
        return result;
      }
    } else {
      result.steps.push('事实核对通过');
    }

    // 步骤4：用户确认（这里模拟确认）
    result.steps.push('用户确认');
    const userConfirmed = true; // 模拟用户确认

    if (!userConfirmed) {
      result.errors.push('用户未确认');
      return result;
    }

    // 步骤5：调用库存扣减
    result.steps.push('调用库存扣减引擎');
    const deductionItems = draft.materials_json.map(material => ({
      reagent_master_id: material.reagent_master_id || 0,
      reagent_name: material.name,
      quantity: material.quantity,
      unit: material.unit
    }));

    // 先检查库存充足性
    const availabilityCheck = this.stockDeductionEngine.checkStockAvailability(deductionItems);
    
    if (!availabilityCheck.allAvailable) {
      result.errors.push('库存不足，无法扣减');
      result.availability_check = availabilityCheck;
      return result;
    }

    // 执行库存扣减
    const deductionResult = this.stockDeductionEngine.deductStock(deductionItems, draft.id);

    if (!deductionResult.success) {
      result.errors.push(`库存扣减失败：${deductionResult.message}`);
      result.deduction_result = deductionResult;
      return result;
    }

    result.steps.push('库存扣减成功');
    result.deduction_result = deductionResult;

    // 步骤6：生成PDF
    result.steps.push('生成PDF');
    const pdfText = this.templateEngine.generatePDFText(templateResult.eln_record);
    const pdfFileName = `${templateResult.eln_record.header.experiment_code}.pdf`;
    const pdfPath = `./eln_pdfs/${pdfFileName}`;
    
    try {
      // 模拟生成PDF文件
      // fs.writeFileSync(pdfPath, pdfText);
      result.pdf_path = pdfPath;
      result.pdf_content = pdfText;
    } catch (error) {
      result.errors.push(`PDF生成失败：${error.message}`);
      return result;
    }

    // 步骤7：存入 eln_records
    result.steps.push('存入eln_records');
    const elnRecord = {
      experiment_code: templateResult.eln_record.header.experiment_code,
      experiment_title: templateResult.eln_record.header.experiment_title,
      objective: templateResult.eln_record.content.objective,
      principle: templateResult.eln_record.content.principle,
      procedures: templateResult.eln_record.content.procedures,
      results: templateResult.eln_record.content.results,
      conclusion: templateResult.eln_record.content.conclusion,
      materials_json: JSON.stringify(draft.materials_json),
      materials_snapshot: JSON.stringify(availabilityCheck.availabilityResult),
      json_content: JSON.stringify(templateResult.eln_record),
      pdf_path: pdfPath,
      stock_deductions: JSON.stringify(deductionResult.deduction_logs),
      status: 'completed',
      created_at: new Date().toISOString()
    };

    // 模拟存入数据库
    // this.saveELNRecord(elnRecord);
    result.eln_record_id = draft.id;
    result.eln_record_data = elnRecord;

    // 步骤8：删除草稿
    result.steps.push('删除草稿');
    const deleteResult = this.draftELNService.deleteDraft(draft.id);
    
    if (!deleteResult.success) {
      result.errors.push(`草稿删除失败：${deleteResult.error}`);
    }

    // 步骤9：成功动画和统计
    result.steps.push('成功动画和统计');
    const successAnimation = this.generateSuccessAnimation();

    // 最终结果
    result.success = true;
    result.message = 'ELN生成与库存扣减成功';
    result.statistics = {
      materials_count: draft.materials_json.length,
      inconsistencies_count: consistencyResult.inconsistencies.length,
      unknown_reagents_count: consistencyResult.unknownReagents.length,
      deduction_items_count: deductionResult.deduction_logs.length,
      llm_calls_count: templateResult.metadata.llm_calls,
      steps_count: result.steps.length
    };
    result.success_animation = this.generateSuccessAnimation(result);

    return result;
  }

  /**
   * 生成成功动画
   * @returns {string} - 动画描述
   */
  generateSuccessAnimation(result) {
    const elapsedTime = Date.now() - this.startTime;
    const materialsCount = result.statistics?.materials_count || 0;
    const deductionLogsCount = result.statistics?.deduction_items_count || 0;
    const proceduresLength = result.eln_record?.content?.procedures?.length || 0;

    return `
🎉 ELN生成成功！🎉

动画效果：
1. 桌宠跳跃庆祝
2. 气泡显示"实验记录生成成功！"
3. 库存扣减完成提示
4. PDF生成动画

统计信息：
- 实验步骤：${proceduresLength} 步骤
- 试剂用量：${materialsCount} 种试剂
- 库存扣减：${deductionLogsCount} 项扣减
- 用时：${elapsedTime} 毫秒
`;
  }

  /**
   * 模拟ELN生成流程
   * @returns {object} - 模拟流程结果
   */
  simulateCompleteFlow() {
    console.log('模拟ELN生成流程');

    // 创建草稿
    const draftData = {
      title: 'DNA提取实验',
      objective: '从细胞中提取DNA并进行纯化',
      principle: '利用DNA在盐溶液中的溶解特性进行分离',
      materials_json: [
        {
          reagent_master_id: 1001,
          name: '氯化钠',
          quantity: 5,
          unit: 'g'
        },
        {
          reagent_master_id: 1002,
          name: '乙醇',
          quantity: 10,
          unit: 'ml'
        },
        {
          reagent_master_id: 1003,
          name: '硫酸',
          quantity: 2,
          unit: 'ml'
        }
      ],
      raw_procedures: '步骤1：准备细胞样品；步骤2：加入氯化钠溶液；步骤3：加入乙醇沉淀DNA；步骤4：离心收集DNA',
      raw_results: '提取到1.5g DNA样品，纯度95%',
      status: 'draft'
    };

    const createResult = this.draftELNService.createDraft(draftData);
    
    if (!createResult.success) {
      return {
        success: false,
        errors: createResult.errors,
        message: '草稿创建失败'
      };
    }

    // 执行端到端流程
    const flowResult = this.generateELNAndDeductStock({
      id: createResult.draft.id,
      ...draftData
    });

    return flowResult;
  }

  /**
   * 获取进度报告
   * @param {object} flowResult - 流程结果
   * @returns {object} - 进度报告
   */
  getProgressReport(flowResult) {
    const stepsCompleted = flowResult.steps.filter(step => step.includes('成功') || step.includes('通过') || step.includes('完成')).length;
    const totalSteps = flowResult.steps.length;
    const progress = Math.floor((stepsCompleted / totalSteps) * 100);

    return {
      progress_percentage: progress,
      steps_completed: stepsCompleted,
      total_steps: totalSteps,
      current_step: flowResult.steps[stepsCompleted] || '已完成',
      errors: flowResult.errors,
      success: flowResult.success,
      statistics: flowResult.statistics
    };
  }
}

module.exports = ELNGenerationSystem;