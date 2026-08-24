import type { Polygon } from "geojson";

import {
  DEMO_EXPANSION_WEIGHTS,
  demoApproachability,
  entryBucket,
  expansionBucket,
  nearTermBucket,
  saturationSignal,
  scoreEntryFeasibility,
  scoreExpansion,
  scoreNearTermPriority,
  type DemoSignal,
} from "@/lib/scoring/demo";
import type { DemoCompetitor, DemoMetric, DemoOpportunity, DemoPocket } from "@/lib/types";

type PocketSpec = {
  id: string;
  name: string;
  stateId: "nx" | "sx";
  stateName: string;
  metroId: string;
  metroName: string;
  lat: number;
  lon: number;
  population: number;
  growth: number;
  competitorsPer10k: number;
  accessGap: number;
  activity: number;
  competitorCount: number;
  signals: DemoSignal[];
  realEstate?: boolean;
};

const SPECS: PocketSpec[] = [
  { id: "nx_alder_riverfront", name: "Alder Riverfront", stateId: "nx", stateName: "Northland Demo", metroId: "nx_alder_bay", metroName: "Alder Bay", lat: 42.34, lon: -75.42, population: 138000, growth: 5.8, competitorsPer10k: 0.42, accessGap: 74, activity: 82, competitorCount: 5, signals: ["independent_operator", "single_site", "active_listing"], realEstate: true },
  { id: "nx_alder_university", name: "Alder University", stateId: "nx", stateName: "Northland Demo", metroId: "nx_alder_bay", metroName: "Alder Bay", lat: 42.23, lon: -75.18, population: 91000, growth: 6.4, competitorsPer10k: 0.55, accessGap: 68, activity: 88, competitorCount: 5, signals: ["independent_operator", "limited_hours"], realEstate: true },
  { id: "nx_alder_eastgate", name: "Alder Eastgate", stateId: "nx", stateName: "Northland Demo", metroId: "nx_alder_bay", metroName: "Alder Bay", lat: 42.29, lon: -74.92, population: 116000, growth: 2.9, competitorsPer10k: 0.78, accessGap: 54, activity: 76, competitorCount: 9, signals: ["institutional_operator"], realEstate: false },
  { id: "nx_alder_hills", name: "Alder Hills", stateId: "nx", stateName: "Northland Demo", metroId: "nx_alder_bay", metroName: "Alder Bay", lat: 42.48, lon: -75.04, population: 64000, growth: 1.2, competitorsPer10k: 0.94, accessGap: 61, activity: 57, competitorCount: 6, signals: ["single_site"], realEstate: false },
  { id: "nx_lakehaven_central", name: "Lakehaven Central", stateId: "nx", stateName: "Northland Demo", metroId: "nx_lakehaven", metroName: "Lakehaven", lat: 43.05, lon: -73.92, population: 154000, growth: 4.7, competitorsPer10k: 0.51, accessGap: 72, activity: 84, competitorCount: 8, signals: ["independent_operator", "single_site"], realEstate: true },
  { id: "nx_lakehaven_north", name: "Lakehaven North", stateId: "nx", stateName: "Northland Demo", metroId: "nx_lakehaven", metroName: "Lakehaven", lat: 43.26, lon: -73.82, population: 87000, growth: 5.1, competitorsPer10k: 0.36, accessGap: 79, activity: 63, competitorCount: 3, signals: ["active_listing", "independent_operator"], realEstate: false },
  { id: "nx_lakehaven_crossing", name: "Lakehaven Crossing", stateId: "nx", stateName: "Northland Demo", metroId: "nx_lakehaven", metroName: "Lakehaven", lat: 42.91, lon: -73.63, population: 73000, growth: 0.9, competitorsPer10k: 1.08, accessGap: 44, activity: 61, competitorCount: 8, signals: ["recent_acquisition"], realEstate: false },
  { id: "nx_summit_west", name: "Summit West", stateId: "nx", stateName: "Northland Demo", metroId: "nx_summit_valley", metroName: "Summit Valley", lat: 41.79, lon: -76.24, population: 102000, growth: 3.6, competitorsPer10k: 0.63, accessGap: 66, activity: 72, competitorCount: 6, signals: ["independent_operator", "limited_hours"], realEstate: true },
  { id: "nx_summit_square", name: "Summit Square", stateId: "nx", stateName: "Northland Demo", metroId: "nx_summit_valley", metroName: "Summit Valley", lat: 41.66, lon: -75.98, population: 121000, growth: 2.2, competitorsPer10k: 0.82, accessGap: 57, activity: 80, competitorCount: 10, signals: ["institutional_operator"], realEstate: true },
  { id: "sx_cedar_midtown", name: "Cedar Midtown", stateId: "sx", stateName: "Southridge Demo", metroId: "sx_cedar_junction", metroName: "Cedar Junction", lat: 40.54, lon: -74.91, population: 168000, growth: 4.9, competitorsPer10k: 0.47, accessGap: 71, activity: 91, competitorCount: 8, signals: ["independent_operator", "single_site"], realEstate: true },
  { id: "sx_cedar_turnpike", name: "Cedar Turnpike", stateId: "sx", stateName: "Southridge Demo", metroId: "sx_cedar_junction", metroName: "Cedar Junction", lat: 40.36, lon: -74.67, population: 144000, growth: 6.2, competitorsPer10k: 0.58, accessGap: 64, activity: 86, competitorCount: 8, signals: ["independent_operator", "limited_hours"], realEstate: true },
  { id: "sx_cedar_south", name: "Cedar South", stateId: "sx", stateName: "Southridge Demo", metroId: "sx_cedar_junction", metroName: "Cedar Junction", lat: 40.18, lon: -74.83, population: 79000, growth: 3.1, competitorsPer10k: 0.74, accessGap: 83, activity: 62, competitorCount: 6, signals: ["active_listing", "single_site"], realEstate: false },
  { id: "sx_cedar_airport", name: "Cedar Airport", stateId: "sx", stateName: "Southridge Demo", metroId: "sx_cedar_junction", metroName: "Cedar Junction", lat: 40.29, lon: -74.39, population: 96000, growth: 5.4, competitorsPer10k: 0.91, accessGap: 48, activity: 94, competitorCount: 9, signals: ["recent_acquisition", "institutional_operator"], realEstate: true },
  { id: "sx_harbor_old_port", name: "Harbor Old Port", stateId: "sx", stateName: "Southridge Demo", metroId: "sx_harbor_plains", metroName: "Harbor Plains", lat: 39.77, lon: -73.88, population: 132000, growth: 1.8, competitorsPer10k: 0.69, accessGap: 59, activity: 81, competitorCount: 9, signals: ["independent_operator"], realEstate: true },
  { id: "sx_harbor_medical", name: "Harbor Medical District", stateId: "sx", stateName: "Southridge Demo", metroId: "sx_harbor_plains", metroName: "Harbor Plains", lat: 39.58, lon: -73.69, population: 111000, growth: 3.8, competitorsPer10k: 1.14, accessGap: 31, activity: 89, competitorCount: 13, signals: ["institutional_operator", "recent_acquisition"], realEstate: false },
  { id: "sx_harbor_west", name: "Harbor West", stateId: "sx", stateName: "Southridge Demo", metroId: "sx_harbor_plains", metroName: "Harbor Plains", lat: 39.64, lon: -74.16, population: 85000, growth: 5.7, competitorsPer10k: 0.39, accessGap: 77, activity: 67, competitorCount: 3, signals: ["independent_operator", "single_site", "limited_hours"], realEstate: true },
  { id: "sx_harbor_coastal", name: "Harbor Coastal", stateId: "sx", stateName: "Southridge Demo", metroId: "sx_harbor_plains", metroName: "Harbor Plains", lat: 39.41, lon: -73.98, population: 57000, growth: -0.4, competitorsPer10k: 0.88, accessGap: 69, activity: 48, competitorCount: 5, signals: ["single_site"], realEstate: false },
  { id: "sx_harbor_inland", name: "Harbor Inland", stateId: "sx", stateName: "Southridge Demo", metroId: "sx_harbor_plains", metroName: "Harbor Plains", lat: 39.91, lon: -74.28, population: 69000, growth: 2.5, competitorsPer10k: 0.62, accessGap: 81, activity: 55, competitorCount: 4, signals: ["independent_operator", "limited_hours"], realEstate: true },
];

function squarePolygon(lat: number, lon: number, index: number): Polygon {
  const dx = 0.105 + (index % 3) * 0.012;
  const dy = 0.075 + (index % 2) * 0.014;
  return {
    type: "Polygon",
    coordinates: [[
      [lon - dx, lat - dy],
      [lon + dx, lat - dy],
      [lon + dx, lat + dy],
      [lon - dx, lat + dy],
      [lon - dx, lat - dy],
    ]],
  };
}

function normalizeMetrics(spec: PocketSpec): DemoMetric[] {
  const populationScore = Math.max(0, Math.min(100, ((spec.population - 25000) / 145000) * 100));
  const growthScore = Math.max(0, Math.min(100, ((spec.growth + 1) / 7.5) * 100));
  const saturationScore = Math.max(0, Math.min(100, 110 - spec.competitorsPer10k * 90));
  const definitions = [
    ["population", "Population / Demand", spec.population, "people", populationScore, "Synthetic demographic model"],
    ["population_growth", "Population Growth", spec.growth, "percent", growthScore, "Synthetic demographic model"],
    ["competitive_saturation", "Competitive Saturation", spec.competitorsPer10k, "competitors per 10k", saturationScore, "Synthetic competitor universe"],
    ["healthcare_access_gap", "Healthcare Access Gap", spec.accessGap, "index", spec.accessGap, "Synthetic access model"],
    ["employment_activity", "Employment / Activity", spec.activity, "index", spec.activity, "Synthetic activity model"],
  ] as const;
  return definitions.map(([key, label, rawValue, unit, normalizedScore, source]) => {
    const weight = DEMO_EXPANSION_WEIGHTS[key];
    return {
      key,
      label,
      rawValue,
      unit,
      normalizedScore: Math.round(normalizedScore * 10) / 10,
      weight,
      contribution: Math.round(normalizedScore * weight * 10) / 10,
      source,
    };
  });
}

function competitorsFor(spec: PocketSpec, index: number): DemoCompetitor[] {
  const categories = ["urgent care", "walk-in clinic", "occupational health", "primary care"];
  return Array.from({ length: spec.competitorCount }, (_, competitorIndex) => ({
    id: spec.id + "_competitor_" + (competitorIndex + 1),
    name: ["DemoCare", "Northstar Clinic", "Civic Immediate Care", "HealthBridge"][competitorIndex % 4] + " " + (competitorIndex + 1),
    rating: Math.round((3.4 + ((index + competitorIndex) % 14) / 10) * 10) / 10,
    reviewCount: 24 + ((index + 3) * (competitorIndex + 5) * 17) % 780,
    weeklyHours: 42 + ((index + competitorIndex) % 8) * 5,
    operatorType: categories[competitorIndex % categories.length],
    websiteUrl: competitorIndex % 3 === 0 ? undefined : "https://example.com/demo-clinic",
    mapUrl: "https://www.openstreetmap.org/?mlat=" + spec.lat + "&mlon=" + spec.lon,
  }));
}

function opportunitiesFor(spec: PocketSpec, index: number): DemoOpportunity[] {
  const approachability = demoApproachability(spec.signals);
  const items: DemoOpportunity[] = [{
    id: spec.id + "_offmarket",
    kind: "offmarket_target",
    title: "Illustrative independent clinic target",
    status: "unreviewed demo signal",
    pathScore: approachability,
    confidence: spec.signals.length >= 3 ? "High" : "Medium",
    evidence: spec.signals.map((signal) => signal.replaceAll("_", " ")),
    source: "Synthetic evidence generator",
  }];
  if (spec.signals.includes("active_listing")) {
    items.push({
      id: spec.id + "_listing",
      kind: "listed_acquisition",
      title: "Illustrative clinic acquisition listing",
      status: "active demo listing",
      pathScore: 90,
      confidence: "High",
      evidence: ["synthetic active listing", "operating clinic", "demo financials withheld"],
      source: "Synthetic listing feed",
    });
  }
  if (spec.realEstate) {
    items.push({
      id: spec.id + "_realestate",
      kind: "real_estate",
      title: "Illustrative medical office site",
      status: "available demo property",
      pathScore: 68 + (index % 4) * 4,
      confidence: "Medium",
      evidence: ["ground-floor access", "existing medical buildout", "parking noted"],
      source: "Synthetic real-estate feed",
    });
  }
  return items;
}

export function buildDemoPockets(): DemoPocket[] {
  return SPECS.map((spec, index) => {
    const metrics = normalizeMetrics(spec);
    const opportunities = opportunitiesFor(spec, index);
    const expansion = scoreExpansion(metrics);
    const entryFeasibility = scoreEntryFeasibility(opportunities.map((item) => item.pathScore));
    const nearTermPriority = scoreNearTermPriority(expansion, entryFeasibility);
    const saturation = metrics.find((metric) => metric.key === "competitive_saturation")?.normalizedScore ?? 0;
    return {
      id: spec.id,
      name: spec.name,
      regionId: "demo_northeast",
      regionName: "Demo Northeast Region",
      stateId: spec.stateId,
      stateName: spec.stateName,
      metroId: spec.metroId,
      metroName: spec.metroName,
      centroidLat: spec.lat,
      centroidLon: spec.lon,
      geometry: squarePolygon(spec.lat, spec.lon, index),
      metrics,
      competitors: competitorsFor(spec, index),
      opportunities,
      scores: {
        expansion,
        expansionBucket: expansionBucket(expansion),
        entryFeasibility,
        entryBucket: entryBucket(entryFeasibility),
        nearTermPriority,
        nearTermBucket: nearTermBucket(nearTermPriority),
        saturationSignal: saturationSignal(saturation),
      },
      sourceStatus: "Synthetic, deterministic, demo-only",
      methodologyNote: "Illustrative public model. Not a reproduction of production scoring.",
    };
  });
}

export const DEMO_POCKETS = buildDemoPockets();

