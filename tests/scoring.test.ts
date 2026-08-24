import { describe, expect, it } from "vitest";

import {
  DEMO_EXPANSION_MODEL_ID,
  DEMO_EXPANSION_WEIGHTS,
  demoApproachability,
  saturationSignal,
  scoreEntryFeasibility,
  scoreNearTermPriority,
} from "@/lib/scoring/demo";

describe("public demo scoring", () => {
  it("uses an explicitly demo-only model and transparent weights", () => {
    expect(DEMO_EXPANSION_MODEL_ID).toBe("demo_expansion_score_v1");
    expect(Object.values(DEMO_EXPANSION_WEIGHTS).reduce((sum, weight) => sum + weight, 0)).toBeCloseTo(1);
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

