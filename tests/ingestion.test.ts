import { describe, expect, it } from "vitest";

import { validateDemoPockets } from "@/ingestion/demo/ingest";

describe("demo ingestion validation", () => {
  it("validates all deterministic pockets without external calls", () => {
    const rows = validateDemoPockets();
    expect(rows).toHaveLength(18);
    expect(rows.every((row) => row.sourceStatus.includes("Synthetic"))).toBe(true);
  });
});

