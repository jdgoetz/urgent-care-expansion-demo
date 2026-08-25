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
  employmentPct: number;
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
    employmentPct: 54.7,
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
    employmentPct: 71.4,
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
    employmentPct: 66.7,
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
    employmentPct: 62,
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
    employmentPct: 57.3,
    uninsuredPct: 4.1,
    competitors: [
      competitor("york_patient_first", "Patient First - East York", "York, PA", "Urgent care", "https://www.patientfirst.com/locations/central-pa/east-york"),
      competitor("york_wellspan", "WellSpan Urgent Care", "York, PA", "Health-system urgent care", "https://www.wellspan.org/"),
      competitor("york_oss", "OSS Health Urgent Care", "York, PA", "Orthopedic urgent care", "https://osshealth.com/"),
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
    employmentPct: 62.1,
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
    employmentPct: 59.4,
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
    employmentPct: 71.3,
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
    employmentPct: 65.9,
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
  competitive_saturation: competitorsPer10k,
  healthcare_access_gap: (spec) => spec.uninsuredPct,
  employment_activity: (spec) => spec.employmentPct,
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
  const directed = key === "competitive_saturation" ? 1 - position : position;
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
  }> = [
    { key: "population", label: "Population / Demand", unit: "people", source: CENSUS_2024, sourceUrl: populationUrl, vintage: "2024 ACS 5-year", kind: "real_public_observation" },
    { key: "population_growth", label: "Population Growth", unit: "% change, 2019-2024", source: `${CENSUS_2019} and ${CENSUS_2024}`, sourceUrl: populationUrl, vintage: "2019 and 2024 ACS 5-year", kind: "derived_public_observation" },
    { key: "competitive_saturation", label: "Competitive Saturation", unit: "curated competitors per 10k", source: "Derived from curated public competitor snapshot and ACS population", sourceUrl: populationUrl, vintage: `Competitors verified ${VERIFIED_AT}; population 2024`, kind: "derived_public_observation" },
    { key: "healthcare_access_gap", label: "Healthcare Access Gap", unit: "% uninsured", source: `${CENSUS_2024}, table B27010`, sourceUrl: `https://data.census.gov/table/ACSDT5Y2024.B27010?g=860XX00US${spec.zipCode}`, vintage: "2024 ACS 5-year", kind: "derived_public_observation" },
    { key: "employment_activity", label: "Employment / Activity", unit: "% employed, population 16+", source: `${CENSUS_2024}, table B23025`, sourceUrl: `https://data.census.gov/table/ACSDT5Y2024.B23025?g=860XX00US${spec.zipCode}`, vintage: "2024 ACS 5-year", kind: "derived_public_observation" },
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
    };
  });
}

export function buildDemoPockets(): DemoPocket[] {
  return SPECS.map((spec) => {
    const feature = geometryByZip.get(spec.zipCode);
    if (!feature) throw new Error(`Missing TIGERweb geometry for ZCTA ${spec.zipCode}`);
    const metrics = metricsFor(spec);
    const expansion = scoreExpansion(metrics);
    const entryFeasibility = scoreEntryFeasibility(spec.opportunities.map((item) => item.pathScore));
    const nearTermPriority = scoreNearTermPriority(expansion, entryFeasibility);
    const saturation = metrics.find((metric) => metric.key === "competitive_saturation")?.normalizedScore ?? 0;
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
      },
      dataCompleteness: 100,
      sourceStatus: "Real public and derived public observations; opportunity fields labeled by status",
      methodologyNote: `Real ZCTA geography and public observations are paired with a simplified illustrative decision model. ${TIGER_SOURCE}. The public map uses a ${spec.displayRadiusMiles}-mile circular overlay to represent the curated market analysis area rather than the literal ZIP boundary. Production methodology is intentionally excluded.`,
    };
  });
}

export const DEMO_POCKETS = buildDemoPockets();
