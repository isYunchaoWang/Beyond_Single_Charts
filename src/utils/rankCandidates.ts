/**
 * Apply weighted scoring to candidate charts and return them sorted DESC.
 * */

export interface Candidate {
  chart: string;
  genes: {
    Mark: string;
    Coord: string;
    Stat: string;
    Encode: Record<string, string>;
    Order: string;
  };
  ruleId: string;
  baseScore: number;
  explanation: string;
  /** optional dynamic metrics */
  popularity?: number;
  novelty?: number;
  userPref?: number;
  totalScore?: number;
}

export interface WeightsConfig {
  rule_score: number;
  readability: number;
  popularity: number;
  novelty: number;
  user_preference: number;
}

export interface RankingConfig {
  weights: WeightsConfig;
  readability_matrix: Record<string, number>;
  novelty_boost: number;
  thresholds: {
    min_total_score: number;
  };
  tie_breaker_priority: Array<"readability" | "novelty" | "popularity">;
}

/**
 * Compute readability from Mark + Coord pair using provided matrix.
 */
function getReadabilityKey(candidate: Candidate): string {
  return `${candidate.genes.Mark}_${candidate.genes.Coord}`;
}

export function rankCandidates(
  candidates: Candidate[],
  config: RankingConfig
): Candidate[] {
  const { weights, readability_matrix, thresholds, tie_breaker_priority } = config;

  // compute totalScore for each candidate
  candidates.forEach((c) => {
    const readability = readability_matrix[getReadabilityKey(c)] ?? 0.5;
    const popularity = c.popularity ?? 0;
    const novelty = c.novelty ?? 0;
    const userPref = c.userPref ?? 0;

    c.totalScore =
      c.baseScore * weights.rule_score +
      readability * weights.readability +
      popularity * weights.popularity +
      novelty * weights.novelty +
      userPref * weights.user_preference;
  });

  // filter below threshold
  let ranked = candidates.filter(
    (c) => (c.totalScore ?? 0) >= thresholds.min_total_score
  );

  // sort by totalScore desc, then tie‑breakers
  ranked.sort((a, b) => {
    if ((b.totalScore ?? 0) !== (a.totalScore ?? 0)) {
      return (b.totalScore ?? 0) - (a.totalScore ?? 0);
    }
    for (const dim of tie_breaker_priority) {
      const diff = ((b as any)[dim] ?? 0) - ((a as any)[dim] ?? 0);
      if (diff !== 0) return diff;
    }
    return 0;
  });

  return ranked;
}
