import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const detail = readFileSync("components/market/PocketDetailClient.tsx", "utf8");

describe("public-demo market detail", () => {
  it("uses the four decision tabs without redundant audit tabs", () => {
    expect(detail).toContain('const TABS = ["Overview", "Competitors", "Opportunities", "Notes"]');
    expect(detail).not.toContain('"Metrics", "Opportunities"');
    expect(detail).not.toContain("Sources / Methodology");
  });

  it("renders the executive score table and separated opportunity paths", () => {
    expect(detail).toContain("Raw Value");
    expect(detail).toContain("Normalized Score");
    expect(detail).toContain("Explanation");
    expect(detail).toContain("Occupational Medicine Targets");
    expect(detail).toContain("Site Traffic");
    expect(detail).not.toContain("Pending ingestion");
  });
});
