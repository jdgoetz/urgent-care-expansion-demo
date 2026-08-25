import { describe, expect, it } from "vitest";

import { validateDemoPockets } from "@/ingestion/demo/ingest";

describe("demo ingestion validation", () => {
  it("validates all curated public markets without external calls", () => {
    const rows = validateDemoPockets();
    expect(rows).toHaveLength(9);
    expect(rows.every((row) => row.sourceStatus.includes("public"))).toBe(true);
  });
});
