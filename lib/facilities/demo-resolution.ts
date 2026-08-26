export type DemoFacilityProfile = {
  id: string;
  name: string;
  address: string;
  canonicalClinic?: boolean;
};

export type DemoPhysicalFacility = {
  canonicalProfileId: string;
  canonicalName: string;
  address: string;
  aliasProfileIds: string[];
  resolutionMethod: "canonical_clinic" | "named_facility_address" | "unresolved_source_profile";
};

const CREDENTIAL = String.raw`(?:MD|M\.D\.|DO|D\.O\.|NP|FNP(?:-C)?|APRN|PA(?:-C)?|CRNP|DNP|RN|MSN)`;
const PRACTITIONER = new RegExp(String.raw`^.+?,\s*${CREDENTIAL}\s*(?:-|\||\bat\b)\s*(.+)$`, "i");

export function extractedFacilityName(name: string) {
  return name.match(PRACTITIONER)?.[1]?.trim() ?? null;
}

function normalized(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function resolveDemoPhysicalFacilities(profiles: DemoFacilityProfile[]): DemoPhysicalFacility[] {
  const canonicalByIdentity = new Map(
    profiles
      .filter((profile) => profile.canonicalClinic)
      .map((profile) => [`${normalized(profile.name)}\u0000${normalized(profile.address)}`, profile]),
  );
  const grouped = new Map<string, DemoFacilityProfile[]>();
  for (const profile of profiles) {
    const facilityName = extractedFacilityName(profile.name) ?? profile.name;
    const key = `${normalized(facilityName)}\u0000${normalized(profile.address)}`;
    (grouped.get(key) ?? grouped.set(key, []).get(key)!).push(profile);
  }
  return [...grouped.entries()].map(([key, members]) => {
    const namedFacility = extractedFacilityName(members[0].name) ?? members[0].name;
    const canonical = canonicalByIdentity.get(key) ?? members.find((profile) => profile.canonicalClinic) ?? members[0];
    return {
      canonicalProfileId: canonical.id,
      canonicalName: canonical.canonicalClinic ? canonical.name : namedFacility,
      address: canonical.address,
      aliasProfileIds: members.filter((profile) => profile.id !== canonical.id).map((profile) => profile.id),
      resolutionMethod: canonical.canonicalClinic
        ? "canonical_clinic"
        : members.some((profile) => extractedFacilityName(profile.name))
          ? "named_facility_address"
          : "unresolved_source_profile",
    };
  });
}
