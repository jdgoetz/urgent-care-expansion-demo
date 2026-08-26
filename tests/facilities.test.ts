import { describe, expect, it } from "vitest";

import { extractedFacilityName, resolveDemoPhysicalFacilities } from "@/lib/facilities/demo-resolution";

describe("public-demo physical facility identity", () => {
  it("extracts a named clinic from synthetic practitioner profiles", () => {
    expect(extractedFacilityName("Jane Example, NP - Demo Health Walk-In")).toBe("Demo Health Walk-In");
    expect(extractedFacilityName("John Example, PA-C | Demo Health Walk-In")).toBe("Demo Health Walk-In");
  });

  it("resolves synthetic practitioners to one canonical clinic", () => {
    const facilities = resolveDemoPhysicalFacilities([
      { id: "clinic", name: "Demo Health Walk-In", address: "100 Public Way", canonicalClinic: true },
      { id: "jane", name: "Jane Example, NP - Demo Health Walk-In", address: "100 Public Way" },
      { id: "john", name: "John Example, PA-C - Demo Health Walk-In", address: "100 Public Way" },
    ]);
    expect(facilities).toHaveLength(1);
    expect(facilities[0]).toMatchObject({ canonicalProfileId: "clinic", canonicalName: "Demo Health Walk-In", resolutionMethod: "canonical_clinic" });
    expect(facilities[0].aliasProfileIds).toEqual(["jane", "john"]);
  });

  it("does not merge unrelated clinics merely because they share an address", () => {
    const facilities = resolveDemoPhysicalFacilities([
      { id: "a", name: "Demo Health Walk-In", address: "100 Public Way", canonicalClinic: true },
      { id: "b", name: "Community Immediate Care", address: "100 Public Way", canonicalClinic: true },
    ]);
    expect(facilities).toHaveLength(2);
  });
});
