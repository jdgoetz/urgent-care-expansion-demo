import assert from "node:assert/strict";

import { DEMO_POCKETS } from "@/data/public/curated-markets";
import { closePool } from "@/lib/server/db";
import { listPockets } from "@/lib/server/repository";

function publicConcepts(pockets: typeof DEMO_POCKETS) {
  return pockets.map((pocket) => ({
    id: pocket.id,
    metricKeys: pocket.metrics.map((metric) => metric.key),
    competitorIds: pocket.competitors.map((competitor) => competitor.physicalFacilityId),
    opportunityKinds: pocket.opportunities.map((opportunity) => opportunity.kind),
    scores: pocket.scores,
  })).sort((a, b) => a.id.localeCompare(b.id));
}

async function main() {
  process.env.DEMO_DATA_MODE = "database";
  const database = await listPockets();
  assert.deepStrictEqual(publicConcepts(database), publicConcepts(DEMO_POCKETS), "Database and deterministic preview concepts differ");
  console.log(JSON.stringify({ markets: database.length, equivalent: true, model: database[0]?.scores.expansionModelId }, null, 2));
}

main().then(closePool).catch(async (error) => {
  console.error(error);
  await closePool();
  process.exitCode = 1;
});
