import { describe, expect, it } from "vitest";

import {
  DEMO_EXPANSION_MODEL_ID,
  DEMO_EXPANSION_V1_MODEL_ID,
  DEMO_EXPANSION_V1_WEIGHTS,
  DEMO_EXPANSION_WEIGHTS,
  demoApproachability,
  saturationSignal,
  scoreEntryFeasibility,
  scoreExpansion,
  scoreNearTermPriority,
} from "@/lib/scoring/demo";
import type { DemoMetric } from "@/lib/types";

describe("public demo scoring", () => {
  it("uses an explicitly demo-only model and transparent weights", () => {
    expect(DEMO_EXPANSION_V1_MODEL_ID).toBe("demo_expansion_score_v1");
    expect(DEMO_EXPANSION_MODEL_ID).toBe("demo_expansion_score_v2");
    expect(Object.keys(DEMO_EXPANSION_WEIGHTS)).toHaveLength(8);
    expect(Object.values(DEMO_EXPANSION_WEIGHTS).reduce((sum, weight) => sum + weight, 0)).toBeCloseTo(1);
    expect(Object.values(DEMO_EXPANSION_WEIGHTS)).not.toEqual(Object.values(DEMO_EXPANSION_V1_WEIGHTS));
  });

  it("reports partial coverage without treating missing components as zero", () => {
    const metrics: DemoMetric[] = [
      { key: "population", normalizedScore: 80, weight: 0.15 },
      { key: "population_growth", normalizedScore: 60, weight: 0.2 },
      { key: "competitors_per_10000_population", normalizedScore: 40, weight: 0.2 },
      { key: "competitor_strength", normalizedScore: 20, weight: 0.1 },
    ].map((item) => ({ ...item, key: item.key as DemoMetric["key"], label: item.key, rawValue: 1, unit: "demo", contribution: item.normalizedScore * item.weight, source: "test", observationKind: "illustrative_demo_value" as const, explanation: "test" }));
    const result = scoreExpansion(metrics);
    expect(result.status).toBe("partial");
    expect(result.completenessPct).toBe(50);
    expect(result.score).toBeCloseTo((80 * 0.15 + 60 * 0.2 + 40 * 0.2 + 20 * 0.1) / 0.65, 1);
  });

  it.each([
    [85, "++"],
    [65, "+"],
    [50, "○"],
    [30, "-"],
    [10, "--"],
  ])("maps normalized saturation %s to %s", (score, signal) => {
    expect(saturationSignal(score)).toBe(signal);
  });

  it("uses obvious illustrative approachability effects", () => {
    expect(demoApproachability(["independent_operator", "single_site", "limited_hours"])).toBe(65);
    expect(demoApproachability(["institutional_operator", "recent_acquisition"])).toBe(5);
  });

  it("is strongest-path oriented with a small breadth bonus", () => {
    expect(scoreEntryFeasibility([90, 0, 0])).toBe(90);
    expect(scoreEntryFeasibility([90, 70, 60])).toBe(100);
    expect(scoreEntryFeasibility([])).toBe(0);
  });

  it("combines attractiveness and entry feasibility geometrically", () => {
    expect(scoreNearTermPriority(81, 64)).toBe(72);
    expect(scoreNearTermPriority(90, 0)).toBe(0);
  });
});

