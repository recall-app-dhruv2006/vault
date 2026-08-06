import { describe, it, expect } from "vitest";
import { computeFinalScore, computeRecencyScore, SEARCH_WEIGHTS } from "@/lib/search/scoring";

describe("computeFinalScore", () => {
  it("weights sum to 1", () => {
    const total = Object.values(SEARCH_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1);
  });

  it("a perfect match on every signal scores 1", () => {
    const score = computeFinalScore({ semantic: 1, keyword: 1, metadata: 1, recency: 1, interaction: 1 });
    expect(score).toBeCloseTo(1);
  });

  it("semantic similarity dominates the score", () => {
    const semanticOnly = computeFinalScore({ semantic: 1, keyword: 0, metadata: 0, recency: 0, interaction: 0 });
    const keywordOnly = computeFinalScore({ semantic: 0, keyword: 1, metadata: 0, recency: 0, interaction: 0 });
    expect(semanticOnly).toBeGreaterThan(keywordOnly);
  });

  it("clamps out-of-range inputs", () => {
    const score = computeFinalScore({ semantic: 5, keyword: -2, metadata: 0, recency: 0, interaction: 0 });
    expect(score).toBeLessThanOrEqual(SEARCH_WEIGHTS.semantic);
  });
});

describe("computeRecencyScore", () => {
  it("scores a brand-new item near 1", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    expect(computeRecencyScore(now, now)).toBeCloseTo(1);
  });

  it("decays for older items and floors at 0", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const old = new Date("2025-01-01T00:00:00Z");
    expect(computeRecencyScore(old, now)).toBe(0);
  });
});
