// 实验记录草稿服务模块 - 真实SQLite实现
// 用于管理 draft_eln 表和实验记录采集

const db = require('../database.js');
const QRScanner = require('./scanner.js');

class DraftELNService {
  constructor() {
    this.qrScanner = new QRScanner();
    this._ready = null;
  }

  async _ensureDb() {
    if (!this._ready) {
      this._ready = db.getInstance();
    }
    return this._ready;
  }

  /**
   * 创建实验记录草稿
   * @param {object} draftData - 草稿数据
   * @returns {object} - 创建结果
   */
  async createDraft(draftData) {
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

    return db.createDraftTransaction(draftData);
  }

  /**
   * 更新实验记录草稿
   * @param {number} draftId - 草稿ID
   * @param {object} updateData - 更新数据
   * @returns {object} - 更新结果
   */
  async updateDraft(draftId, updateData) {
    return db.updateDraftTransaction(draftId, updateData);
  }

  /**
   * 获取草稿列表
   * @param {string} status - 草稿状态
   * @returns {array} - 草稿列表
   */
  async getDrafts(status = 'all') {
    try {
      const instance = await this._ensureDb();
      const query = status === 'all'
        ? 'SELECT * FROM draft_eln'
        : `SELECT * FROM draft_eln WHERE status = '${status}'`;
      const result = instance.db.exec(query);
      const drafts = result[0] ? result[0].values.map(row => {
        const columns = result[0].columns;
        const record = {};
        for (let i = 0; i < columns.length; i++) {
          record[columns[i]] = row[i];
        }
        return record;
      }) : [];
      return drafts.map(draft => {
        return {
          ...draft,
          materials_json: typeof draft.materials_json === 'string'
            ? JSON.parse(draft.materials_json)
            : draft.materials_json
        };
      });
    } catch (error) {
      console.error('获取草稿列表失败:', error);
      return [];
    }
  }

  /**
   * 获取单个草稿
   * @param {number} draftId - 草稿ID
   * @returns {object} - 草稿数据
   */
  async getDraftById(draftId) {
    return db.getDraftTransaction(draftId);
  }

  /**
   * 删除草稿
   * @param {number} draftId - 草稿ID
   * @returns {object} - 删除结果
   */
  async deleteDraft(draftId) {
    return db.deleteDraftTransaction(draftId);
  }

  /**
   * 完成草稿（状态变为已完成）
   * @param {number} draftId - 草稿ID
   * @returns {object} - 完成结果
   */
  async completeDraft(draftId) {
    try {
      const instance = await this._ensureDb();
      instance.db.run(
        `UPDATE draft_eln SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [draftId]
      );

      const draft = await this.getDraftById(draftId);
      return {
        success: true,
        draft
      };
    } catch (error) {
      console.error('完成草稿失败:', error);
      return {
        success: false,
        error: '更新草稿状态失败'
      };
    }
  }

  /**
   * 实验记录采集流程
   * @param {object} stepData - 步骤数据
   * @returns {object} - 采集结果
   */
  simulateStepCollection(stepData) {
    console.log('实验记录采集流程:', stepData);
    
    // 语音输入采集（预留接口）
    if (stepData.voice_input) {
      console.log('语音输入:', stepData.voice_input);
      // 后续集成语音API
    }

    // QR码扫描采集试剂
    if (stepData.qr_scanned) {
      const scanResult = this.qrScanner.scanQR(stepData.qr_scanned);
      console.log('QR码扫描结果:', scanResult);
      return scanResult;
    }

    // 库存选择试剂
    if (stepData.stock_selected) {
      const stockResult = this.qrScanner.selectReagentFromStock(
        stepData.stock_selected.reagent_master_id,
        stepData.stock_selected.quantity,
        stepData.stock_selected.unit
      );
      console.log('库存选择结果:', stockResult);
      return stockResult;
    }

    // 图片采集（预留接口）
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