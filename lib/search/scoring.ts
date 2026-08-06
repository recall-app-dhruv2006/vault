/**
 * Pure hybrid-search ranking function, isolated from data-fetching so it's
 * trivially unit-testable. See lib/search/hybrid-search.ts for how the
 * inputs are gathered.
 */
export const SEARCH_WEIGHTS = {
  semantic: 0.5,
  keyword: 0.25,
  metadata: 0.15,
  recency: 0.05,
  interaction: 0.05,
} as const;

export interface ScoreInputs {
  semantic: number; // 0-1
  keyword: number; // 0-1
  metadata: number; // 0-1
  recency: number; // 0-1
  interaction: number; // 0-1
}

export function computeFinalScore(inputs: ScoreInputs): number {
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  return (
    clamp(inputs.semantic) * SEARCH_WEIGHTS.semantic +
    clamp(inputs.keyword) * SEARCH_WEIGHTS.keyword +
    clamp(inputs.metadata) * SEARCH_WEIGHTS.metadata +
    clamp(inputs.recency) * SEARCH_WEIGHTS.recency +
    clamp(inputs.interaction) * SEARCH_WEIGHTS.interaction
  );
}

/** Recency decays linearly to 0 over `halfLifeDays` * 2 (roughly), floored at 0. */
export function computeRecencyScore(createdAt: Date, now: Date = new Date(), decayDays = 90): number {
  const ageDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, 1 - ageDays / decayDays);
}
