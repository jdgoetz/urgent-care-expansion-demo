import type { MultiPolygon, Polygon } from "geojson";

export type DemoMetricKey =
  | "population"
  | "population_growth"
  | "competitors_per_10000_population"
  | "competitor_strength"
  | "competitive_availability_gap"
  | "clinical_workforce_growth"
  | "occupational_medicine_potential"
  | "primary_care_underserved";

export type OpportunityKind =
  | "listed_acquisition"
  | "offmarket_target"
  | "occupational_medicine_target"
  | "real_estate";

export type DemoObservationKind =
  | "real_public_observation"
  | "derived_public_observation"
  | "illustrative_demo_value";

export type DemoMarketType = "standard" | "opportunity_driven" | "listed_acquisition" | "comparison";

export interface DemoMetric {
  key: DemoMetricKey;
  label: string;
  rawValue: number;
  unit: string;
  normalizedScore: number;
  weight: number;
  contribution: number;
  source: string;
  sourceUrl?: string;
  vintage?: string;
  observationKind: DemoObservationKind;
  explanation: string;
}

export interface DemoCompetitor {
  id: string;
  name: string;
  rating?: number;
  reviewCount?: number;
  weeklyHours?: number;
  operatorType: string;
  websiteUrl?: string;
  mapUrl: string;
  sourceUrl?: string;
  sourceNote: string;
  physicalFacilityId: string;
  strictUrgentCare: true;
  sourceAliases: string[];
}

export interface DemoSiteTraffic {
  status: "precise_location_unavailable" | "illustrative_demo_value" | "public_observation";
  observationKind: DemoObservationKind;
  nearestAadt?: number;
  road?: string;
  distanceMiles?: number;
  countYear?: number;
  maxAadtQuarterMile?: number;
  maxAadtHalfMile?: number;
  source?: string;
  sourceUrl?: string;
  note: string;
}

export interface DemoOpportunity {
  id: string;
  kind: OpportunityKind;
  title: string;
  status: string;
  pathScore: number;
  confidence: "High" | "Medium" | "Low";
  evidence: string[];
  source: string;
  sourceUrl?: string;
  lastVerified?: string;
  details?: Record<string, string | number>;
  disclosure?: string;
  activePublicListing?: boolean;
  observationKind: DemoObservationKind;
  siteTraffic: DemoSiteTraffic;
}

export interface DemoScores {
  expansion: number;
  expansionBucket: "Top Priority" | "Attractive" | "Watchlist" | "Lower Priority";
  entryFeasibility: number;
  entryBucket: "High" | "Moderate" | "Low" | "No current path";
  nearTermPriority: number;
  nearTermBucket: "Immediate Review" | "Strong" | "Monitor" | "Low";
  saturationSignal: "++" | "+" | "○" | "-" | "--";
  expansionModelId: "demo_expansion_score_v2";
  nearTermModelId: "demo_near_term_priority_v2";
  expansionStatus: "complete" | "partial" | "insufficient_data";
}

export interface DemoPocket {
  id: string;
  name: string;
  regionId: string;
  regionName: string;
  stateId: string;
  stateName: string;
  metroId: string;
  metroName: string;
  zipCode: string;
  marketType: DemoMarketType;
  centroidLat: number;
  centroidLon: number;
  displayRadiusMiles: number;
  geometry: Polygon | MultiPolygon;
  metrics: DemoMetric[];
  competitors: DemoCompetitor[];
  opportunities: DemoOpportunity[];
  scores: DemoScores;
  dataCompleteness: number;
  sourceStatus: string;
  methodologyNote: string;
}
