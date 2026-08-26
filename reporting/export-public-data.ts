import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { DEMO_POCKETS } from "@/data/public/curated-markets";
import { DEMO_EXPANSION_MODEL_ID, DEMO_EXPANSION_WEIGHTS, DEMO_NEAR_TERM_MODEL_ID } from "@/lib/scoring/demo";

const ranked = [...DEMO_POCKETS].sort((a, b) => b.scores.nearTermPriority - a.scores.nearTermPriority).slice(0, 3);
const payload = {
  generated_for: "Curated public market demonstration",
  model: DEMO_EXPANSION_MODEL_ID,
  near_term_model: DEMO_NEAR_TERM_MODEL_ID,
  normalization: "Min-max normalization across the fixed nine-market curated public universe",
  disclaimer: "The public demo mirrors production business concepts but not production normalization, weights, thresholds, rankings, targets, or evidence.",
  weights: DEMO_EXPANSION_WEIGHTS,
  markets: ranked.map((market, index) => ({
    rank: index + 1,
    id: market.id,
    name: market.name,
    zip: market.zipCode,
    metro: market.metroName,
    state: market.stateName,
    listed: market.opportunities.some((item) => item.activePublicListing),
    scores: {
      expansion: market.scores.expansion,
      expansion_bucket: market.scores.expansionBucket,
      entry: market.scores.entryFeasibility,
      entry_bucket: market.scores.entryBucket,
      near_term: market.scores.nearTermPriority,
      near_term_bucket: market.scores.nearTermBucket,
      completeness: market.dataCompleteness,
    },
    metrics: market.metrics.map((metric) => ({
      label: metric.label,
      raw: metric.unit === "people" ? metric.rawValue.toLocaleString("en-US") : `${metric.rawValue.toFixed(1)} ${metric.unit}`,
      normalized: metric.normalizedScore.toFixed(1),
      weight: `${(metric.weight * 100).toFixed(0)}%`,
      contribution: metric.contribution.toFixed(1),
      explanation: metric.explanation,
      provenance: metric.observationKind,
    })),
    competitors: market.competitors.map((competitor) => ({
      name: competitor.name,
      rating: competitor.rating?.toFixed(1) ?? "Not stored",
      reviews: competitor.reviewCount?.toLocaleString("en-US") ?? "Not stored",
      weekly_hours: competitor.weeklyHours ?? "Not verified",
      operator: competitor.operatorType,
    })),
    opportunities: market.opportunities.map((opportunity) => ({
      path: opportunity.kind,
      title: opportunity.title,
      status: opportunity.status,
      score: opportunity.pathScore,
      confidence: opportunity.confidence,
      provenance: opportunity.observationKind,
      site_traffic: opportunity.siteTraffic.status === "precise_location_unavailable"
        ? "Precise location unavailable"
        : opportunity.siteTraffic.observationKind,
    })),
    context: {
      geometry: `Five-mile demo analysis area centered on Census ZCTA ${market.zipCode}`,
      provenance: `${market.metrics.filter((item) => item.observationKind === "real_public_observation").length} public, ${market.metrics.filter((item) => item.observationKind === "derived_public_observation").length} derived, ${market.metrics.filter((item) => item.observationKind === "illustrative_demo_value").length} illustrative score inputs`,
      note: market.methodologyNote,
    },
  })),
};

const output = resolve("reporting/public_report_data.json");
writeFileSync(output, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Public report data: ${output}`);
