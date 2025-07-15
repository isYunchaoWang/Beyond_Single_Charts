/**
 * Generate candidate charts by applying rule-based gene recombination.
 * The function scans the rules array and returns every rule whose IF
 * conditions match the source (dragging chart) and target (dropped‑on chart).
 * 
 * */

export interface GeneSpec {
  Mark: string;
  Coord: string;
  Stat: string;
  Encode: Record<string, string>;
  Order: string;
}

export interface ChartGene {
  chart: string;
  genes: GeneSpec;
  /** Additional runtime info, e.g. data density */
  [key: string]: any;
}

export interface RuleCondition {
  [key: string]: any;
}

export interface Rule {
  id: string;
  if: {
    src?: RuleCondition;
    tgt?: RuleCondition;
    /** optional extra condition, e.g. density === "high" */
    [key: string]: any;
  };
  then: {
    chart: string;
    genes: GeneSpec;
    score: number;
    explanation: string;
  };
}

export interface Candidate {
  chart: string;
  genes: GeneSpec;
  ruleId: string;
  baseScore: number;
  explanation: string;
}

/**
 * Deep‑match a subset of properties.
 */
function matchCond(obj: Record<string, any>, cond: RuleCondition | undefined): boolean {
  if (!cond) return true;
  return Object.entries(cond).every(([k, v]) => obj?.[k] === v);
}

/**
 * Check whether a rule is applicable to given source/target context.
 */
function ruleApplies(rule: Rule, src: ChartGene, tgt: ChartGene): boolean {
  const { src: srcCond, tgt: tgtCond, ...rest } = rule.if;
  return matchCond(src.genes, srcCond) &&
         matchCond(tgt.genes, tgtCond) &&
         // other top‑level conditions (e.g. density) live on src
         Object.entries(rest).every(([k, v]) => (src as any)[k] === v);
}

/**
 * Produce candidate charts (may return empty array if no rule matches).
 */
export function recombine(
  source: ChartGene,
  target: ChartGene,
  rules: Rule[]
): Candidate[] {
  const candidates: Candidate[] = [];

  for (const rule of rules) {
    if (ruleApplies(rule, source, target)) {
      const { chart, genes, score, explanation } = rule.then;
      candidates.push({
        chart,
        genes,
        ruleId: rule.id,
        baseScore: score,
        explanation
      });
    }
  }

  return candidates;
}
