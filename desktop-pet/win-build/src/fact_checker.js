// 事实核对模块
// 检查LLM输出中的试剂名和用量与原始物料的一致性

class FactChecker {
  constructor() {
    this.tolerance = 0.1; // ±10%容忍度
  }

  /**
   * 核对LLM输出与原始物料的一致性
   * @param {string} llmOutput - LLM生成的文本
   * @param {array} originalMaterials - 原始物料清单
   * @returns {object} - 核对结果
   */
  checkMaterialConsistency(llmOutput, originalMaterials) {
    const inconsistencies = [];
    const unknownReagents = [];

    // 从LLM输出中提取试剂名称
    const extractedReagents = this.extractReagentsFromText(llmOutput);
    
    // 比对试剂名称
    for (const extractedReagent of extractedReagents) {
      const matchingOriginal = originalMaterials.find(material =>
        this.matchReagentNames(material.name, extractedReagent.name)
      );

      if (!matchingOriginal) {
        unknownReagents.push({
          reagent_name: extractedReagent.name,
          quantity: extractedReagent.quantity,
          unit: extractedReagent.unit,
          reason: '原始物料清单中未找到此试剂'
        });
      } else {
        // 核对用量
        const tolerance = Math.abs(matchingOriginal.quantity * this.tolerance);
        const difference = Math.abs(extractedReagent.quantity - matchingOriginal.quantity);

        if (difference > tolerance) {
          inconsistencies.push({
            reagent_name: extractedReagent.name,
            original_quantity: matchingOriginal.quantity,
            original_unit: matchingOriginal.unit,
            llm_quantity: extractedReagent.quantity,
            llm_unit: extractedReagent.unit,
            difference: difference,
            tolerance: tolerance,
            ratio: (difference / matchingOriginal.quantity) * 100,
            reason: `用量偏差超过容忍度${this.tolerance * 100}%（原始${matchingOriginal.quantity}${matchingOriginal.unit}, LLM输出${extractedReagent.quantity}${extractedReagent.unit})`
          });
        }
      }
    }

    // 检查原始物料是否在LLM输出中被遗漏
    for (const originalMaterial of originalMaterials) {
      const matchingExtracted = extractedReagents.find(reagent =>
        this.matchReagentNames(originalMaterial.name, reagent.name)
      );

      if (!matchingExtracted) {
        inconsistencies.push({
          reagent_name: originalMaterial.name,
          quantity: originalMaterial.quantity,
          unit: originalMaterial.unit,
          reason: 'LLM输出中遗漏此试剂'
        });
      }
    }

    return {
      consistent: inconsistencies.length === 0 && unknownReagents.length === 0,
      inconsistencies,
      unknownReagents,
      extractedReagents,
      originalMaterials
    };
  }

  /**
   * 从文本中提取试剂信息
   * @param {string} text - 文本
   * @returns {array} - 试剂列表
   */
  extractReagentsFromText(text) {
    const reagents = [];
    const reagentPatterns = [
      /[\d.]+克[\s]+[\w\u4e00-\u9fa5]+/gi,
      /[\d.]+毫升[\s]+[\w\u4e00-\u9fa5]+/gi,
      /[\w\u4e00-\u9fa5]+[\s]+[\d.]+克/gi,
      /[\w\u4e00-\u9fa5]+[\s]+[\d.]+毫升/gi,
      /[\w\u4e00-\u9fa5]+[\s]+[\d.]+[\s]+克/gi,
      /[\w\u4e00-\u9fa5]+[\s]+[\d.]+[\s]+毫升/gi
    ];

    for (const pattern of reagentPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          const reagentInfo = this.parseReagentText(match);
          if (reagentInfo) {
            reagents.push(reagentInfo);
          }
        }
      }
    }

    return reagents;
  }

  /**
   * 解析试剂文本
   * @param {string} reagentText - 试剂文本
   * @returns {object} - 试剂信息
   */
  parseReagentText(reagentText) {
    // 正则表达式匹配
    const quantityRegex = /[\d.]+/;
    const nameRegex = /[\w\u4e00-\u9fa5]+/g;
    const unitRegex = /(克|毫升|mg|ml|g|l)/;

    const quantityMatch = reagentText.match(quantityRegex);
    const nameMatches = reagentText.match(nameRegex);
    const unitMatch = reagentText.match(unitRegex);

    if (!quantityMatch || !nameMatches || !unitMatch) {
      return null;
    }

    // 提取名称（排除数值和单位）
    let reagentName = '';
    for (const nameMatch of nameMatches) {
      if (!quantityRegex.test(nameMatch) && !unitRegex.test(nameMatch)) {
        reagentName = nameMatch;
        break;
      }
    }

    if (!reagentName) {
      return null;
    }

    return {
      name: reagentName,
      quantity: parseFloat(quantityMatch[0]),
      unit: unitMatch[0]
    };
  }

  /**
   * 匹配试剂名称
   * @param {string} originalName - 原始试剂名称
   * @param {string} extractedName - 提取的试剂名称
   * @returns {boolean} - 是否匹配
   */
  matchReagentNames(originalName, extractedName) {
    // 简单字符串匹配
    const normalizedOriginal = originalName.toLowerCase();
    const normalizedExtracted = extractedName.toLowerCase();

    // 完全匹配
    if (normalizedOriginal === normalizedExtracted) {
      return true;
    }

    // 部分匹配
    if (normalizedOriginal.includes(normalizedExtracted) || normalizedExtracted.includes(normalizedOriginal)) {
      return true;
    }

    // 化学品简称匹配
    const reagentAbbreviations = {
      '氯化钠': 'NaCl',
      '乙醇': '酒精',
      '硫酸': 'H2SO4',
      '盐酸': 'HCl',
      '氢氧化钠': 'NaOH',
      '甲醇': 'CH3OH',
      '丙酮': '丙酮',
      '乙醚': '醚'
    };

    if (reagentAbbreviations[originalName] === extractedName || reagentAbbreviations[extractedName] === originalName) {
      return true;
    }

    return false;
  }

  /**
   * 高亮不一致内容
   * @param {string} text - 原始文本
   * @param {array} inconsistencies - 不一致项
   * @returns {string} - 高亮后的文本
   */
  highlightInconsistencies(text, inconsistencies) {
    let highlightedText = text;
    
    for (const inconsistency of inconsistencies) {
      // 查找试剂名称的位置
      const reagentNamePattern = new RegExp(inconsistency.reagent_name, 'gi');
      highlightedText = highlightedText.replace(reagentNamePattern, `<span style="color: red;">${inconsistency.reagent_name}</span>`);
      
      // 查找试剂用量
      const quantityPattern = new RegExp(`[\d.]+\\s*${inconsistency.llm_unit || inconsistency.original_unit}`, 'gi');
      highlightedText = highlightedText.replace(quantityPattern, '<span style="color: red;">$&</span>');
    }

    return highlightedText;
  }

  /**
   * 生成核对报告
   * @param {object} consistencyResult - 核对结果
   * @returns {string} - 核对报告
   */
  generateReport(consistencyResult) {
    const report = [];

    if (consistencyResult.consistent) {
      report.push('✅ LLM输出与原始物料一致');
    } else {
      report.push('⚠️ LLM输出与原始物料存在不一致');
      
      if (consistencyResult.inconsistencies.length > 0) {
        report.push('\n用量偏差：');
        for (const inconsistency of consistencyResult.inconsistencies) {
          report.push(`  试剂：${inconsistency.reagent_name}`);
          report.push(`  原始用量：${inconsistency.original_quantity}${inconsistency.original_unit}`);
          report.push(`  LLM输出用量：${inconsistency.llm_quantity}${inconsistency.llm_unit}`);
          report.push(`  偏差：${inconsistency.difference}${inconsistency.original_unit}（${inconsistency.ratio}%）`);
          report.push(`  问题：${inconsistency.reason}`);
          report.push('');
        }
      }
      
      if (consistencyResult.unknownReagents.length > 0) {
        report.push('\n未知试剂：');
        for (const unknownReagent of consistencyResult.unknownReagents) {
          report.push(`  试剂：${unknownReagent.reagent_name}`);
          report.push(`  用量：${unknownReagent.quantity}${unknownReagent.unit}`);
          report.push(`  问题：${unknownReagent.reason}`);
          report.push('');
        }
      }
    }

    report.push('\n🔍 核对统计：');
    report.push(`  原始物料数：${consistencyResult.originalMaterials.length}`);
    report.push(`  LLM提取试剂数：${consistencyResult.extractedReagents.length}`);
    report.push(`  不一致项数：${consistencyResult.inconsistencies.length}`);
    report.push(`  未知试剂数：${consistencyResult.unknownReagents.length}`);

    return report.join('\n');
  }

  /**
   * 验证数值一致性（±10%）
   * @param {number} originalValue - 原始值
   * @param {number} llmValue - LLM输出值
   * @returns {boolean} - 是否一致
   */
  validateNumericConsistency(originalValue, llmValue) {
    const tolerance = originalValue * this.tolerance;
    return Math.abs(llmValue - originalValue) <= tolerance;
  }

  /**
   * 批量核对
   * @param {array} llmOutputs - LLM输出数组
   * @param {array} originalMaterials - 原始物料清单
   * @returns {array} - 批量核对结果
   */
  batchCheck(llmOutputs, originalMaterials) {
    const batchResults = [];

    for (const llmOutput of llmOutputs) {
      const result = this.checkMaterialConsistency(llmOutput, originalMaterials);
      batchResults.push(result);
    }

    return batchResults;
  }
}

module.exports = FactChecker;