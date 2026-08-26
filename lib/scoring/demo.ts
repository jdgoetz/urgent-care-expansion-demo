import type { DemoMetric, DemoScores } from "@/lib/types";

export const DEMO_EXPANSION_V1_MODEL_ID = "demo_expansion_score_v1";
export const DEMO_EXPANSION_MODEL_ID = "demo_expansion_score_v2";
export const DEMO_NEAR_TERM_MODEL_ID = "demo_near_term_priority_v2";

export const DEMO_EXPANSION_V1_WEIGHTS = {
  population: 0.25,
  population_growth: 0.2,
  competitive_saturation: 0.25,
  healthcare_access_gap: 0.15,
  employment_activity: 0.15,
} as const;

// Public-demo configuration only. These weights intentionally do not reproduce production calibration.
export const DEMO_EXPANSION_WEIGHTS = {
  population: 0.15,
  population_growth: 0.2,
  competitors_per_10000_population: 0.2,
  competitor_strength: 0.1,
  competitive_availability_gap: 0.1,
  clinical_workforce_growth: 0.05,
  occupational_medicine_potential: 0.1,
  primary_care_underserved: 0.1,
} as const satisfies Record<DemoMetric["key"], number>;

export const DEMO_SIGNAL_WEIGHTS = {
  independent_operator: 10,
  single_site: 10,
  limited_hours: 5,
  active_listing: 30,
  institutional_operator: -20,
  recent_acquisition: -15,
} as const;

export type DemoSignal = keyof typeof DEMO_SIGNAL_WEIGHTS;

const clamp = (value: number) => Math.max(0, Math.min(100, value));
const round = (value: number) => Math.round(value * 10) / 10;

export function saturationSignal(normalizedScore: number): DemoScores["saturationSignal"] {
  if (normalizedScore >= 80) return "++";
  if (normalizedScore >= 60) return "+";
  if (normalizedScore >= 40) return "○";
  if (normalizedScore >= 20) return "-";
  return "--";
}

export function scoreExpansion(metrics: DemoMetric[]) {
  const byKey = new Map(metrics.map((metric) => [metric.key, metric]));
  const available = Object.entries(DEMO_EXPANSION_WEIGHTS).flatMap(([key, weight]) => {
    const metric = byKey.get(key as DemoMetric["key"]);
    return metric && Number.isFinite(metric.normalizedScore) ? [{ metric, weight }] : [];
  });
  const availableWeight = available.reduce((total, item) => total + item.weight, 0);
  const completenessPct = round((available.length / Object.keys(DEMO_EXPANSION_WEIGHTS).length) * 100);
  if (!available.length || availableWeight < 0.4) {
    return { score: null, completenessPct, status: "insufficient_data" as const };
  }
  const weighted = available.reduce((total, item) => total + item.metric.normalizedScore * item.weight, 0);
  return {
    score: round(weighted / availableWeight),
    completenessPct,
    status: available.length === Object.keys(DEMO_EXPANSION_WEIGHTS).length ? "complete" as const : "partial" as const,
  };
}

export function demoApproachability(signals: DemoSignal[]) {
  const score = 40 + signals.reduce((total, signal) => total + DEMO_SIGNAL_WEIGHTS[signal], 0);
  return round(clamp(score));
}

export function scoreEntryFeasibility(pathScores: number[]) {
  const viable = pathScores.filter((score) => score > 0).sort((a, b) => b - a);
  if (!viable.length) return 0;
  return round(clamp(viable[0] + (viable[1] ?? 0) * 0.1 + (viable[2] ?? 0) * 0.05));
}

export function scoreNearTermPriority(expansionScore: number, entryFeasibility: number) {
  if (entryFeasibility <= 0) return 0;
  return round(Math.sqrt(expansionScore * entryFeasibility));
}

export function expansionBucket(score: number): DemoScores["expansionBucket"] {
  if (score >= 72) return "Top Priority";
  if (score >= 60) return "Attractive";
  if (score >= 48) return "Watchlist";
  return "Lower Priority";
}

export function entryBucket(score: number): DemoScores["entryBucket"] {
  if (score >= 75) return "High";
  if (score >= 55) return "Moderate";
  if (score > 0) return "Low";
  return "No current path";
}

export function nearTermBucket(score: number): DemoScores["nearTermBucket"] {
  if (score >= 72) return "Immediate Review";
  if (score >= 60) return "Strong";
  if (score >= 45) return "Monitor";
  return "Low";
}

