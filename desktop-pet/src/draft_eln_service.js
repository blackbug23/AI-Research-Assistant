// 实验记录草稿服务模块
// 用于管理 draft_eln 表和实验记录采集

const fs = require('fs');
const path = require('path');

class DraftELNService {
  constructor() {
    this.draftsFilePath = path.join(__dirname, '../database/draft_eln_data.json');
    this.loadDrafts();
  }

  /**
   * 加载草稿数据
   */
  loadDrafts() {
    try {
      if (fs.existsSync(this.draftsFilePath)) {
        const draftsData = fs.readFileSync(this.draftsFilePath, 'utf8');
        this.drafts = JSON.parse(draftsData);
      } else {
        this.drafts = [];
        this.saveDrafts();
      }
    } catch (error) {
      console.error('加载草稿数据失败:', error);
      this.drafts = [];
    }
  }

  /**
   * 保存草稿数据
   */
  saveDrafts() {
    try {
      fs.writeFileSync(this.draftsFilePath, JSON.stringify(this.drafts));
    } catch (error) {
      console.error('保存草稿数据失败:', error);
    }
  }

  /**
   * 创建实验记录草稿
   * @param {object} draftData - 草稿数据
   * @returns {object} - 创建结果
   */
  createDraft(draftData) {
    const validationErrors = [];

    // 必需字段验证
    if (!draftData.title) {
      validationErrors.push('实验名称不能为空');
    }

    if (!draftData.objective) {
      validationErrors.push('实验目的不能为空');
    }

    if (!draftData.materials_json || draftData.materials_json.length === 0) {
      validationErrors.push('实验材料不能为空');
    }

    if (validationErrors.length > 0) {
      return {
        success: false,
        errors: validationErrors
      };
    }

    const newDraft = {
      id: this.drafts.length > 0 ? this.drafts[this.drafts.length - 1].id + 1 : 1,
      title: draftData.title,
      objective: draftData.objective,
      principle: draftData.principle || '',
      materials_json: draftData.materials_json,
      raw_procedures: draftData.raw_procedures || '',
      raw_results: draftData.raw_results || '',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.drafts.push(newDraft);
    this.saveDrafts();

    return {
      success: true,
      draft: newDraft
    };
  }

  /**
   * 更新实验记录草稿
   * @param {number} draftId - 草稿ID
   * @param {object} updateData - 更新数据
   * @returns {object} - 更新结果
   */
  updateDraft(draftId, updateData) {
    const draft = this.drafts.find(d => d.id === draftId);

    if (!draft) {
      return {
        success: false,
        error: '草稿不存在'
      };
    }

    // 更新字段
    if (updateData.title) draft.title = updateData.title;
    if (updateData.objective) draft.objective = updateData.objective;
    if (updateData.principle) draft.principle = updateData.principle;
    if (updateData.materials_json) draft.materials_json = updateData.materials_json;
    if (updateData.raw_procedures) draft.raw_procedures = updateData.raw_procedures;
    if (updateData.raw_results) draft.raw_results = updateData.raw_results;
    draft.updated_at = new Date().toISOString();

    this.saveDrafts();

    return {
      success: true,
      draft
    };
  }

  /**
   * 获取草稿列表
   * @param {string} status - 草稿状态
   * @returns {array} - 草稿列表
   */
  getDrafts(status = 'all') {
    if (status === 'all') {
      return this.drafts;
    } else {
      return this.drafts.filter(draft => draft.status === status);
    }
  }

  /**
   * 获取单个草稿
   * @param {number} draftId - 草稿ID
   * @returns {object} - 草稿数据
   */
  getDraftById(draftId) {
    const draft = this.drafts.find(d => d.id === draftId);
    return draft;
  }

  /**
   * 删除草稿
   * @param {number} draftId - 草稿ID
   * @returns {object} - 删除结果
   */
  deleteDraft(draftId) {
    const index = this.drafts.findIndex(d => d.id === draftId);

    if (index === -1) {
      return {
        success: false,
        error: '草稿不存在'
      };
    }

    this.drafts.splice(index, 1);
    this.saveDrafts();

    return {
      success: true,
      message: '草稿删除成功'
    };
  }

  /**
   * 完成草稿（状态变为已完成）
   * @param {number} draftId - 草稿ID
   * @returns {object} - 完成结果
   */
  completeDraft(draftId) {
    const draft = this.drafts.find(d => d.id === draftId);

    if (!draft) {
      return {
        success: false,
        error: '草稿不存在'
      };
    }

    draft.status = 'completed';
    draft.updated_at = new Date().toISOString();
    this.saveDrafts();

    return {
      success: true,
      draft
    };
  }

  /**
   * 模拟实验记录采集流程
   * @param {object} stepData - 步骤数据
   * @returns {object} - 采集结果
   */
  simulateStepCollection(stepData) {
    console.log('模拟实验记录采集流程:', stepData);
    
    // 模拟语音输入采集
    if (stepData.voice_input) {
      console.log('语音输入:', stepData.voice_input);
    }

    // 模拟QR码扫描采集试剂
    if (stepData.qr_scanned) {
      console.log('QR码扫描:', stepData.qr_scanned);
    }

    // 模拟库存选择试剂
    if (stepData.stock_selected) {
      console.log('库存选择:', stepData.stock_selected);
    }

    // 模拟图片采集
    if (stepData.image_path) {
      console.log('图片采集:', stepData.image_path);
    }

    return {
      success: true,
      message: '步骤采集成功',
      collected_data: stepData
    };
  }

  /**
   * 多步骤草稿采集
   * @param {object} draftSteps - 多步骤数据
   * @returns {object} - 采集结果
   */
  multiStepCollection(draftSteps) {
    const steps = [
      '输入实验名称和目的',
      '输入实验原理',
      '采集实验步骤',
      '选择实验试剂',
      '记录实验结果',
      '生成实验记录'
    ];

    const collectedSteps = [];
    const errors = [];

    for (let i = 0; i < draftSteps.length; i++) {
      const stepResult = this.simulateStepCollection(draftSteps[i]);
      
      if (stepResult.success) {
        collectedSteps.push({
          step: steps[i],
          data: draftSteps[i],
          status: 'completed'
        });
      } else {
        errors.push({
          step: steps[i],
          error: stepResult.error
        });
      }
    }

    return {
      success: errors.length === 0,
      collected_steps: collectedSteps,
      errors,
      progress: Math.floor((collectedSteps.length / steps.length) * 100)
    };
  }
}

module.exports = DraftELNService;