import type { Polygon } from "geojson";

export type DemoMetricKey =
  | "population"
  | "population_growth"
  | "competitive_saturation"
  | "healthcare_access_gap"
  | "employment_activity";

export type OpportunityKind = "listed_acquisition" | "offmarket_target" | "real_estate";

export interface DemoMetric {
  key: DemoMetricKey;
  label: string;
  rawValue: number;
  unit: string;
  normalizedScore: number;
  weight: number;
  contribution: number;
  source: string;
}

export interface DemoCompetitor {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  weeklyHours: number;
  operatorType: string;
  websiteUrl?: string;
  mapUrl: string;
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
}

export interface DemoScores {
  expansion: number;
  expansionBucket: "Top Priority" | "Attractive" | "Watchlist" | "Lower Priority";
  entryFeasibility: number;
  entryBucket: "High" | "Moderate" | "Low" | "No current path";
  nearTermPriority: number;
  nearTermBucket: "Immediate Review" | "Strong" | "Monitor" | "Low";
  saturationSignal: "++" | "+" | "○" | "-" | "--";
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
  centroidLat: number;
  centroidLon: number;
  geometry: Polygon;
  metrics: DemoMetric[];
  competitors: DemoCompetitor[];
  opportunities: DemoOpportunity[];
  scores: DemoScores;
  sourceStatus: string;
  methodologyNote: string;
}

