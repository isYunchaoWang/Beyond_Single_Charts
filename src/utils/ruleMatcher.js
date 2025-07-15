// 简单深度匹配，支持对象属性部分匹配
export function matchGenes(targetGenes, ruleGenes) {
  if (!ruleGenes) return true;
  return Object.entries(ruleGenes).every(([k, v]) => {
    if (typeof v === 'object' && v !== null) {
      return matchGenes(targetGenes?.[k], v);
    }
    return targetGenes?.[k] === v;
  });
}

// 匹配规则
export function findMatchingRule(rules, srcGenes, tgtGenes) {
  for (const rule of rules) {
    const { if: ifClause } = rule;
    if (
      matchGenes(srcGenes, ifClause?.src) &&
      matchGenes(tgtGenes, ifClause?.tgt)
    ) {
      return rule;
    }
    // 支持 src/tgt 顺序互换
    if (
      matchGenes(tgtGenes, ifClause?.src) &&
      matchGenes(srcGenes, ifClause?.tgt)
    ) {
      return rule;
    }
  }
  return null;
} 