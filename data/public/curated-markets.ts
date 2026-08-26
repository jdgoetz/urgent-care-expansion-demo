import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";

import zctaGeometry from "./curated-zcta.json";

import {
  DEMO_EXPANSION_WEIGHTS,
  entryBucket,
  expansionBucket,
  nearTermBucket,
  saturationSignal,
  scoreEntryFeasibility,
  scoreExpansion,
  scoreNearTermPriority,
} from "@/lib/scoring/demo";
import type {
  DemoCompetitor,
  DemoMarketType,
  DemoMetric,
  DemoMetricKey,
  DemoOpportunity,
  DemoPocket,
} from "@/lib/types";

type MarketSpec = {
  id: string;
  name: string;
  zipCode: string;
  stateId: "pa" | "il";
  stateName: string;
  metroId: string;
  metroName: string;
  marketType: DemoMarketType;
  displayRadiusMiles: number;
  population2024: number;
  population2019: number;
  competitorStrengthIndex: number;
  availabilityGapPct: number;
  workforceGrowthPct: number;
  industrialLogisticsPct: number;
  uninsuredPct: number;
  competitors: DemoCompetitor[];
  opportunities: DemoOpportunity[];
};

const VERIFIED_AT = "2026-08-25";
const CENSUS_2024 = "U.S. Census Bureau, ACS 2024 5-year estimates";
const CENSUS_2019 = "U.S. Census Bureau, ACS 2019 5-year estimates";
const TIGER_SOURCE = "U.S. Census Bureau TIGERweb, 2020 ZCTA geometry";
const LISTING_SOURCE_URL = "https://dealstream.com/d/biz-sale/medical-practices/unp24t";

function mapUrl(name: string, place: string) {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${name}, ${place}`)}`;
}

function competitor(
  id: string,
  name: string,
  place: string,
  operatorType: string,
  websiteUrl: string,
  weeklyHours?: number,
): DemoCompetitor {
  return {
    id,
    name,
    weeklyHours,
    operatorType,
    websiteUrl,
    mapUrl: mapUrl(name, place),
    sourceUrl: websiteUrl,
    sourceNote: weeklyHours
      ? `Public operator location page; hours verified ${VERIFIED_AT}. Ratings and review counts are not stored.`
      : `Public operator or location page; identity verified ${VERIFIED_AT}. Ratings, reviews, and unverified hours are not stored.`,
    physicalFacilityId: id,
    strictUrgentCare: true,
    sourceAliases: [],
  };
}

function unavailableTraffic(note = "No defensible precise public site location is asserted for this demo scenario.") {
  return {
    status: "precise_location_unavailable" as const,
    observationKind: "illustrative_demo_value" as const,
    note,
  };
}

function illustrativePath(id: string, title: string, pathScore: number): DemoOpportunity {
  return {
    id,
    kind: "real_estate",
    title,
    status: "illustrative demo path",
    pathScore,
    confidence: "Low",
    evidence: ["Public market fundamentals support a de novo diligence example", "No active property is asserted"],
    source: "Illustrative demo scenario",
    disclosure: "This path is illustrative and does not represent an active property listing.",
    observationKind: "illustrative_demo_value",
    siteTraffic: unavailableTraffic(),
  };
}

const SPECS: MarketSpec[] = [
  {
    id: "pa_state_college_16801",
    name: "State College",
    zipCode: "16801",
    stateId: "pa",
    stateName: "Pennsylvania",
    metroId: "pa_state_college",
    metroName: "State College",
    marketType: "standard",
    displayRadiusMiles: 5,
    population2024: 40_774,
    population2019: 45_280,
    competitorStrengthIndex: 62,
    availabilityGapPct: 38,
    workforceGrowthPct: 3.2,
    industrialLogisticsPct: 7.5,
    uninsuredPct: 3.2,
    competitors: [
      competitor("state_college_geisinger", "Geisinger ConvenientCare State College", "State College, PA", "Health-system urgent care", "https://www.geisinger.org/locations/find-a-location/geisinger-convenientcare-state-college", 75),
      competitor("state_college_medexpress", "MedExpress Urgent Care - State College", "State College, PA", "Urgent care", "https://www.medexpress.com/location/pa/state-college/stc/"),
    ],
    opportunities: [illustrativePath("state_college_denovo", "Illustrative medical-office search", 58)],
  },
  {
    id: "pa_royersford_19468",
    name: "Royersford / Limerick",
    zipCode: "19468",
    stateId: "pa",
    stateName: "Pennsylvania",
    metroId: "pa_philadelphia",
    metroName: "Greater Philadelphia",
    marketType: "opportunity_driven",
    displayRadiusMiles: 5,
    population2024: 28_194,
    population2019: 26_008,
    competitorStrengthIndex: 55,
    availabilityGapPct: 45,
    workforceGrowthPct: 4.6,
    industrialLogisticsPct: 18,
    uninsuredPct: 2.3,
    competitors: [
      competitor("royersford_tower", "Tower Health Urgent Care - Limerick", "Limerick, PA", "Health-system urgent care", "https://towerhealth.org/locations/tower-health-urgent-care-limerick", 84),
      competitor("royersford_afc", "AFC Urgent Care Limerick", "Limerick, PA", "Urgent care", "https://www.afcurgentcare.com/limerick/"),
    ],
    opportunities: [
      {
        id: "royersford_sanitized_offmarket",
        kind: "offmarket_target",
        title: "Illustrative Independent Operator",
        status: "sanitized case study",
        pathScore: 78,
        confidence: "Medium",
        evidence: ["Independent local-operator example", "Limited-location footprint example", "Public facts intentionally generalized"],
        source: "Sanitized illustrative case study",
        disclosure: "Off-market information in this public demo is sanitized and is not a prediction that an owner will sell.",
        observationKind: "illustrative_demo_value",
        siteTraffic: unavailableTraffic(),
      },
      {
        id: "royersford_illustrative_occupational",
        kind: "occupational_medicine_target",
        title: "Illustrative Occupational Health Target",
        status: "sanitized case study",
        pathScore: 55,
        confidence: "Low",
        evidence: ["Illustrative standalone occupational-health facility", "Not included in urgent-care competitor saturation"],
        source: "Illustrative demo scenario",
        disclosure: "This synthetic target demonstrates target-type separation and does not identify a real business or seller.",
        observationKind: "illustrative_demo_value",
        siteTraffic: unavailableTraffic(),
      },
      illustrativePath("royersford_denovo", "Illustrative medical-office conversion path", 64),
    ],
  },
  {
    id: "il_hoffman_estates_60169",
    name: "Hoffman Estates",
    zipCode: "60169",
    stateId: "il",
    stateName: "Illinois",
    metroId: "il_chicago",
    metroName: "Chicago Northwest Suburbs",
    marketType: "listed_acquisition",
    displayRadiusMiles: 5,
    population2024: 33_401,
    population2019: 33_373,
    competitorStrengthIndex: 70,
    availabilityGapPct: 30,
    workforceGrowthPct: 2.8,
    industrialLogisticsPct: 12,
    uninsuredPct: 10.8,
    competitors: [
      competitor("hoffman_physicians_immediate", "Physicians Immediate Care", "Hoffman Estates, IL", "Urgent care", "https://physiciansimmediatecare.com/"),
      competitor("hoffman_ascension", "Ascension Saint Alexius Immediate Care", "Hoffman Estates, IL", "Health-system immediate care", "https://healthcare.ascension.org/"),
    ],
    opportunities: [
      {
        id: "hoffman_public_listing",
        kind: "listed_acquisition",
        title: "Premier OB/GYN & Med Spa Practice - Chicago Suburb",
        status: "active public listing",
        pathScore: 92,
        confidence: "High",
        evidence: ["Publicly advertised healthcare-practice sale", "Operating practice established in 2005", "Disclosed clinical and administrative team of 15"],
        source: "DealStream public listing",
        sourceUrl: LISTING_SOURCE_URL,
        lastVerified: VERIFIED_AT,
        activePublicListing: true,
        details: {
          "Asking price": "$6,000,000",
          "Practice type": "OB/GYN and med spa",
          "Listing date": "July 23, 2025",
          "Last renewed": "February 4, 2026",
          "Real estate": "Not disclosed",
        },
        disclosure: `Public listing snapshot - verified ${VERIFIED_AT}. Availability and terms may subsequently change.`,
        observationKind: "real_public_observation",
        siteTraffic: unavailableTraffic("The public listing does not disclose a defensible precise site location; a market centroid is not substituted."),
      },
      illustrativePath("hoffman_denovo", "Illustrative medical-office alternative", 58),
    ],
  },
  {
    id: "pa_lancaster_17601",
    name: "Lancaster",
    zipCode: "17601",
    stateId: "pa",
    stateName: "Pennsylvania",
    metroId: "pa_lancaster",
    metroName: "Lancaster",
    marketType: "comparison",
    displayRadiusMiles: 5,
    population2024: 56_382,
    population2019: 52_552,
    competitorStrengthIndex: 72,
    availabilityGapPct: 25,
    workforceGrowthPct: 3.7,
    industrialLogisticsPct: 22,
    uninsuredPct: 3.7,
    competitors: [
      competitor("lancaster_patient_first", "Patient First - Lancaster", "Lancaster, PA", "Urgent care", "https://www.patientfirst.com/locations/central-pa/lancaster"),
      competitor("lancaster_lgh", "Penn Medicine Lancaster General Health Urgent Care", "Lancaster, PA", "Health-system urgent care", "https://www.lancastergeneralhealth.org/services-and-treatments/urgent-care"),
      competitor("lancaster_medexpress", "MedExpress Urgent Care - Lancaster", "Lancaster, PA", "Urgent care", "https://www.medexpress.com/"),
    ],
    opportunities: [illustrativePath("lancaster_denovo", "Illustrative site-screening path", 55)],
  },
  {
    id: "pa_york_17402",
    name: "East York",
    zipCode: "17402",
    stateId: "pa",
    stateName: "Pennsylvania",
    metroId: "pa_york",
    metroName: "York",
    marketType: "comparison",
    displayRadiusMiles: 5,
    population2024: 37_466,
    population2019: 38_078,
    competitorStrengthIndex: 60,
    availabilityGapPct: 40,
    workforceGrowthPct: 2.1,
    industrialLogisticsPct: 25,
    uninsuredPct: 4.1,
    competitors: [
      competitor("york_patient_first", "Patient First - East York", "York, PA", "Urgent care", "https://www.patientfirst.com/locations/central-pa/east-york"),
      competitor("york_wellspan", "WellSpan Urgent Care", "York, PA", "Health-system urgent care", "https://www.wellspan.org/"),
    ],
    opportunities: [illustrativePath("york_denovo", "Illustrative site-screening path", 48)],
  },
  {
    id: "pa_harrisburg_17110",
    name: "North Harrisburg",
    zipCode: "17110",
    stateId: "pa",
    stateName: "Pennsylvania",
    metroId: "pa_harrisburg",
    metroName: "Greater Harrisburg",
    marketType: "comparison",
    displayRadiusMiles: 5,
    population2024: 27_364,
    population2019: 24_743,
    competitorStrengthIndex: 75,
    availabilityGapPct: 20,
    workforceGrowthPct: 3,
    industrialLogisticsPct: 16,
    uninsuredPct: 6.2,
    competitors: [
      competitor("harrisburg_patient_first", "Patient First - Colonial Park", "Harrisburg, PA", "Urgent care", "https://www.patientfirst.com/locations/central-pa/colonial-park"),
      competitor("harrisburg_upmc", "UPMC Urgent Care", "Harrisburg, PA", "Health-system urgent care", "https://www.upmc.com/services/urgent-care"),
      competitor("harrisburg_concentra", "Concentra Urgent Care", "Harrisburg, PA", "Occupational health and urgent care", "https://www.concentra.com/"),
    ],
    opportunities: [illustrativePath("harrisburg_denovo", "Illustrative medical-office path", 60)],
  },
  {
    id: "pa_erie_16509",
    name: "South Erie",
    zipCode: "16509",
    stateId: "pa",
    stateName: "Pennsylvania",
    metroId: "pa_erie",
    metroName: "Erie",
    marketType: "comparison",
    displayRadiusMiles: 5,
    population2024: 28_595,
    population2019: 26_863,
    competitorStrengthIndex: 58,
    availabilityGapPct: 42,
    workforceGrowthPct: 1.5,
    industrialLogisticsPct: 20,
    uninsuredPct: 3.1,
    competitors: [
      competitor("erie_medexpress", "MedExpress Urgent Care - Erie", "Erie, PA", "Urgent care", "https://www.medexpress.com/"),
      competitor("erie_upmc", "UPMC Urgent Care", "Erie, PA", "Health-system urgent care", "https://www.upmc.com/services/urgent-care"),
    ],
    opportunities: [illustrativePath("erie_denovo", "Illustrative site-screening path", 52)],
  },
  {
    id: "il_schaumburg_60173",
    name: "Schaumburg",
    zipCode: "60173",
    stateId: "il",
    stateName: "Illinois",
    metroId: "il_chicago",
    metroName: "Chicago Northwest Suburbs",
    marketType: "comparison",
    displayRadiusMiles: 5,
    population2024: 13_650,
    population2019: 12_610,
    competitorStrengthIndex: 68,
    availabilityGapPct: 34,
    workforceGrowthPct: 2.5,
    industrialLogisticsPct: 14,
    uninsuredPct: 5.3,
    competitors: [
      competitor("schaumburg_physicians", "Physicians Immediate Care", "Schaumburg, IL", "Urgent care", "https://physiciansimmediatecare.com/"),
      competitor("schaumburg_midwest", "Midwest Express Clinic", "Schaumburg, IL", "Urgent care", "https://midwestexpressclinic.com/"),
    ],
    opportunities: [illustrativePath("schaumburg_denovo", "Illustrative site-screening path", 50)],
  },
  {
    id: "il_arlington_heights_60004",
    name: "Arlington Heights",
    zipCode: "60004",
    stateId: "il",
    stateName: "Illinois",
    metroId: "il_chicago",
    metroName: "Chicago Northwest Suburbs",
    marketType: "comparison",
    displayRadiusMiles: 5,
    population2024: 51_835,
    population2019: 50_639,
    competitorStrengthIndex: 72,
    availabilityGapPct: 28,
    workforceGrowthPct: 2.7,
    industrialLogisticsPct: 12,
    uninsuredPct: 4.7,
    competitors: [
      competitor("arlington_nch", "NCH Immediate Care", "Arlington Heights, IL", "Health-system immediate care", "https://www.nch.org/"),
      competitor("arlington_physicians", "Physicians Immediate Care", "Arlington Heights, IL", "Urgent care", "https://physiciansimmediatecare.com/"),
    ],
    opportunities: [illustrativePath("arlington_denovo", "Illustrative site-screening path", 57)],
  },
];

const featureCollection = zctaGeometry as FeatureCollection<Polygon | MultiPolygon, { ZCTA5: string; CENTLAT: string; CENTLON: string }>;
const geometryByZip = new Map(featureCollection.features.map((feature) => [feature.properties.ZCTA5, feature]));

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function growthPct(spec: MarketSpec) {
  return round(((spec.population2024 - spec.population2019) / spec.population2019) * 100);
}

function competitorsPer10k(spec: MarketSpec) {
  return round((spec.competitors.length / spec.population2024) * 10_000);
}

const rawByKey: Record<DemoMetricKey, (spec: MarketSpec) => number> = {
  population: (spec) => spec.population2024,
  population_growth: growthPct,
  competitors_per_10000_population: competitorsPer10k,
  competitor_strength: (spec) => spec.competitorStrengthIndex,
  competitive_availability_gap: (spec) => spec.availabilityGapPct,
  clinical_workforce_growth: (spec) => spec.workforceGrowthPct,
  occupational_medicine_potential: (spec) => spec.industrialLogisticsPct,
  primary_care_underserved: (spec) => spec.uninsuredPct,
};

const ranges = Object.fromEntries(
  Object.entries(rawByKey).map(([key, getter]) => {
    const values = SPECS.map(getter);
    return [key, { min: Math.min(...values), max: Math.max(...values) }];
  }),
) as Record<DemoMetricKey, { min: number; max: number }>;

function normalizedScore(key: DemoMetricKey, value: number) {
  const { min, max } = ranges[key];
  const position = max === min ? 0.5 : (value - min) / (max - min);
  const directed = ["competitors_per_10000_population", "competitor_strength"].includes(key)
    ? 1 - position
    : position;
  return round(Math.max(0, Math.min(100, directed * 100)));
}

function metricsFor(spec: MarketSpec): DemoMetric[] {
  const populationUrl = `https://data.census.gov/table/ACSDT5Y2024.B01003?g=860XX00US${spec.zipCode}`;
  const definitions: Array<{
    key: DemoMetricKey;
    label: string;
    unit: string;
    source: string;
    sourceUrl: string;
    vintage: string;
    kind: DemoMetric["observationKind"];
    explanation: string;
  }> = [
    { key: "population", label: "Population", unit: "people", source: CENSUS_2024, sourceUrl: populationUrl, vintage: "2024 ACS 5-year", kind: "real_public_observation", explanation: "Larger markets provide greater absolute demand potential." },
    { key: "population_growth", label: "Population Growth", unit: "% change, 2019-2024", source: `${CENSUS_2019} and ${CENSUS_2024}`, sourceUrl: populationUrl, vintage: "2019 and 2024 ACS 5-year", kind: "derived_public_observation", explanation: "Faster growth indicates expanding future demand." },
    { key: "competitors_per_10000_population", label: "Competitors / 10k Population", unit: "physical competitors per 10k", source: "Derived from curated public physical-facility snapshot and ACS population", sourceUrl: populationUrl, vintage: `Facilities verified ${VERIFIED_AT}; population 2024`, kind: "derived_public_observation", explanation: "Measures urgent-care supply relative to population; lower saturation is more favorable." },
    { key: "competitor_strength", label: "Competitor Strength", unit: "illustrative index", source: "Illustrative public-demo competitor composite", sourceUrl: "", vintage: "Demo v2", kind: "illustrative_demo_value", explanation: "Combines public ratings and log-adjusted review volume conceptually to approximate competitive entrenchment." },
    { key: "competitive_availability_gap", label: "Competitive Availability Gap", unit: "% of standard hours", source: "Illustrative public-demo schedule coverage", sourceUrl: "", vintage: "Demo v2", kind: "illustrative_demo_value", explanation: "Estimates standard urgent-care hours when relatively few competitors are open." },
    { key: "clinical_workforce_growth", label: "Clinical Workforce Growth", unit: "% illustrative change", source: "Illustrative public-demo workforce trend", sourceUrl: "", vintage: "Demo v2", kind: "illustrative_demo_value", explanation: "Indicates whether the local clinician ecosystem appears to be expanding." },
    { key: "occupational_medicine_potential", label: "Occupational Medicine Potential", unit: "% illustrative industrial/logistics share", source: "Illustrative public-demo employment composition", sourceUrl: "", vintage: "Demo v2", kind: "illustrative_demo_value", explanation: "Uses employment composition to approximate employer-health and occupational-care demand." },
    { key: "primary_care_underserved", label: "Primary-Care Underserved", unit: "% uninsured access proxy", source: `${CENSUS_2024}, table B27010`, sourceUrl: `https://data.census.gov/table/ACSDT5Y2024.B27010?g=860XX00US${spec.zipCode}`, vintage: "2024 ACS 5-year", kind: "derived_public_observation", explanation: "Represents a simplified public access-gap proxy that may support demand for convenient care." },
  ];

  return definitions.map((definition) => {
    const rawValue = rawByKey[definition.key](spec);
    const score = normalizedScore(definition.key, rawValue);
    const weight = DEMO_EXPANSION_WEIGHTS[definition.key];
    return {
      key: definition.key,
      label: definition.label,
      rawValue,
      unit: definition.unit,
      normalizedScore: score,
      weight,
      contribution: round(score * weight),
      source: definition.source,
      sourceUrl: definition.sourceUrl,
      vintage: definition.vintage,
      observationKind: definition.kind,
      explanation: definition.explanation,
    };
  });
}

export function buildDemoPockets(): DemoPocket[] {
  return SPECS.map((spec) => {
    const feature = geometryByZip.get(spec.zipCode);
    if (!feature) throw new Error(`Missing TIGERweb geometry for ZCTA ${spec.zipCode}`);
    const metrics = metricsFor(spec);
    const expansionResult = scoreExpansion(metrics);
    if (expansionResult.score === null) throw new Error(`Demo v2 score is unavailable for ${spec.id}`);
    const expansion = expansionResult.score;
    const entryFeasibility = scoreEntryFeasibility(spec.opportunities.map((item) => item.pathScore));
    const nearTermPriority = scoreNearTermPriority(expansion, entryFeasibility);
    const saturation = metrics.find((metric) => metric.key === "competitors_per_10000_population")?.normalizedScore ?? 0;
    return {
      id: spec.id,
      name: spec.name,
      regionId: "curated_public_markets",
      regionName: "Curated Public Demo Markets",
      stateId: spec.stateId,
      stateName: spec.stateName,
      metroId: spec.metroId,
      metroName: spec.metroName,
      zipCode: spec.zipCode,
      marketType: spec.marketType,
      centroidLat: Number(feature.properties.CENTLAT),
      centroidLon: Number(feature.properties.CENTLON),
      displayRadiusMiles: spec.displayRadiusMiles,
      geometry: feature.geometry,
      metrics,
      competitors: spec.competitors,
      opportunities: spec.opportunities,
      scores: {
        expansion,
        expansionBucket: expansionBucket(expansion),
        entryFeasibility,
        entryBucket: entryBucket(entryFeasibility),
        nearTermPriority,
        nearTermBucket: nearTermBucket(nearTermPriority),
        saturationSignal: saturationSignal(saturation),
        expansionModelId: "demo_expansion_score_v2",
        nearTermModelId: "demo_near_term_priority_v2",
        expansionStatus: expansionResult.status,
      },
      dataCompleteness: expansionResult.completenessPct,
      sourceStatus: "Real public and derived public observations; opportunity fields labeled by status",
      methodologyNote: `Real ZCTA geography and labeled public or illustrative observations are paired with demo_expansion_score_v2. ${TIGER_SOURCE}. The public map uses a ${spec.displayRadiusMiles}-mile circular analysis area rather than the literal ZIP boundary. Production normalization, weights, thresholds, rankings, and opportunity intelligence are intentionally excluded.`,
    };
  });
}

export const DEMO_POCKETS = buildDemoPockets();
