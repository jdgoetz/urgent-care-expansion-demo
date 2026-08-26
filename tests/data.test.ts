import { describe, expect, it } from "vitest";

import { buildDemoPockets, DEMO_POCKETS } from "@/data/public/curated-markets";

describe("curated real-market public portfolio", () => {
  it("contains the documented public scope", () => {
    expect(DEMO_POCKETS).toHaveLength(9);
    expect(new Set(DEMO_POCKETS.map((pocket) => pocket.stateId)).size).toBe(2);
    expect(new Set(DEMO_POCKETS.map((pocket) => pocket.metroId)).size).toBe(7);
    expect(new Set(DEMO_POCKETS.map((pocket) => pocket.id)).size).toBe(9);
  });

  it("is deterministic and includes valid closed polygons", () => {
    expect(buildDemoPockets()).toEqual(DEMO_POCKETS);
    for (const pocket of DEMO_POCKETS) {
      expect(["Polygon", "MultiPolygon"]).toContain(pocket.geometry.type);
      expect(pocket.displayRadiusMiles).toBe(5);
      expect(pocket.metrics).toHaveLength(8);
      expect(pocket.competitors.length).toBeGreaterThanOrEqual(2);
      expect(pocket.opportunities.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("uses real state and ZIP geography identifiers", () => {
    for (const pocket of DEMO_POCKETS) {
      expect(["pa", "il"]).toContain(pocket.stateId);
      expect(pocket.zipCode).toMatch(/^\d{5}$/);
      expect(pocket.regionName).toBe("Curated Public Demo Markets");
    }
  });

  it("distinguishes real, derived, and illustrative fields", () => {
    const metricKinds = new Set(DEMO_POCKETS.flatMap((pocket) => pocket.metrics.map((metric) => metric.observationKind)));
    expect(metricKinds).toContain("real_public_observation");
    expect(metricKinds).toContain("derived_public_observation");
    expect(DEMO_POCKETS.some((pocket) => pocket.opportunities.some((item) => item.source === "Illustrative demo scenario"))).toBe(true);
  });

  it("includes the verified public listing and sanitized off-market case study", () => {
    const hoffman = DEMO_POCKETS.find((pocket) => pocket.zipCode === "60169");
    const royersford = DEMO_POCKETS.find((pocket) => pocket.zipCode === "19468");
    expect(hoffman?.opportunities.some((item) => item.activePublicListing && item.sourceUrl?.startsWith("https://"))).toBe(true);
    expect(royersford?.opportunities.some((item) => item.title === "Illustrative Independent Operator")).toBe(true);
    expect(royersford?.opportunities.some((item) => item.kind === "occupational_medicine_target" && item.observationKind === "illustrative_demo_value")).toBe(true);
    expect(royersford?.competitors.some((item) => item.name.includes("Occupational"))).toBe(false);
  });

  it("uses canonical physical strict facilities for saturation", () => {
    for (const pocket of DEMO_POCKETS) {
      expect(pocket.competitors.every((competitor) => competitor.strictUrgentCare)).toBe(true);
      expect(new Set(pocket.competitors.map((competitor) => competitor.physicalFacilityId)).size).toBe(pocket.competitors.length);
      const metric = pocket.metrics.find((item) => item.key === "competitors_per_10000_population");
      const population = pocket.metrics.find((item) => item.key === "population")?.rawValue ?? 1;
      expect(metric?.rawValue).toBeCloseTo((pocket.competitors.length / population) * 10_000, 1);
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
