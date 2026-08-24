import { describe, expect, it } from "vitest";

import { buildDemoPockets, DEMO_POCKETS } from "@/data/synthetic/demo-data";

describe("deterministic synthetic portfolio", () => {
  it("contains the documented fictional scope", () => {
    expect(DEMO_POCKETS).toHaveLength(18);
    expect(new Set(DEMO_POCKETS.map((pocket) => pocket.stateId)).size).toBe(2);
    expect(new Set(DEMO_POCKETS.map((pocket) => pocket.metroId)).size).toBe(5);
    expect(new Set(DEMO_POCKETS.map((pocket) => pocket.id)).size).toBe(18);
  });

  it("is deterministic and includes valid closed polygons", () => {
    expect(buildDemoPockets()).toEqual(DEMO_POCKETS);
    for (const pocket of DEMO_POCKETS) {
      const ring = pocket.geometry.coordinates[0];
      expect(ring[0]).toEqual(ring[ring.length - 1]);
      expect(pocket.metrics).toHaveLength(5);
      expect(pocket.competitors.length).toBeGreaterThanOrEqual(2);
      expect(pocket.opportunities.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("uses only the fictional demo geography namespace", () => {
    for (const pocket of DEMO_POCKETS) {
      expect(["nx", "sx"]).toContain(pocket.stateId);
      expect(pocket.stateName).toMatch(/ Demo$/);
      expect(pocket.id).toMatch(/^(nx|sx)_/);
    }
  });

  it("keeps every generated score in the public 0-100 range", () => {
    for (const pocket of DEMO_POCKETS) {
      expect(pocket.scores.expansion).toBeGreaterThanOrEqual(0);
      expect(pocket.scores.expansion).toBeLessThanOrEqual(100);
      expect(pocket.scores.entryFeasibility).toBeGreaterThanOrEqual(0);
      expect(pocket.scores.entryFeasibility).toBeLessThanOrEqual(100);
      expect(pocket.scores.nearTermPriority).toBeGreaterThanOrEqual(0);
      expect(pocket.scores.nearTermPriority).toBeLessThanOrEqual(100);
    }
  });
});
