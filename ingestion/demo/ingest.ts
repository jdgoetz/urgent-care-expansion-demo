import { randomUUID } from "node:crypto";

import { z } from "zod";

import { DEMO_POCKETS } from "@/data/public/curated-markets";
import { closePool, getPool } from "@/lib/server/db";

const pocketSchema = z.object({
  id: z.string().min(3),
  name: z.string().min(3),
  regionId: z.string(),
  regionName: z.string(),
  stateId: z.string(),
  stateName: z.string(),
  metroId: z.string(),
  metroName: z.string(),
  centroidLat: z.number(),
  centroidLon: z.number(),
  displayRadiusMiles: z.number().positive().max(25),
  zipCode: z.string().length(5),
  marketType: z.enum(["standard", "opportunity_driven", "listed_acquisition", "comparison"]),
  geometry: z.object({ type: z.enum(["Polygon", "MultiPolygon"]), coordinates: z.array(z.unknown()) }),
  metrics: z.array(z.object({ key: z.string(), normalizedScore: z.number().min(0).max(100) }).passthrough()),
  competitors: z.array(z.object({ id: z.string(), name: z.string() }).passthrough()),
  opportunities: z.array(z.object({ id: z.string(), kind: z.string() }).passthrough()),
  scores: z.object({ expansion: z.number(), entryFeasibility: z.number(), nearTermPriority: z.number() }).passthrough(),
  dataCompleteness: z.number().min(0).max(100),
  sourceStatus: z.string(),
  methodologyNote: z.string(),
});

export function validateDemoPockets() {
  return z.array(pocketSchema).length(9).parse(DEMO_POCKETS);
}

async function main() {
  const pockets = validateDemoPockets();
  const client = await getPool().connect();
  const runId = randomUUID();
  try {
    await client.query("BEGIN");
    await client.query(
      "INSERT INTO demo_ingestion_runs (run_id, source_name, started_at, status) VALUES ($1, $2, now(), 'running')",
      [runId, "curated_public_demo_v2"],
    );
    for (const pocket of pockets) {
      await client.query(
        "INSERT INTO demo_regions (region_id, region_name) VALUES ($1, $2) ON CONFLICT (region_id) DO UPDATE SET region_name=EXCLUDED.region_name",
        [pocket.regionId, pocket.regionName],
      );
      await client.query(
        "INSERT INTO demo_states (state_id, region_id, state_name) VALUES ($1, $2, $3) ON CONFLICT (state_id) DO UPDATE SET region_id=EXCLUDED.region_id, state_name=EXCLUDED.state_name",
        [pocket.stateId, pocket.regionId, pocket.stateName],
      );
      await client.query(
        "INSERT INTO demo_metros (metro_id, state_id, metro_name) VALUES ($1, $2, $3) ON CONFLICT (metro_id) DO UPDATE SET state_id=EXCLUDED.state_id, metro_name=EXCLUDED.metro_name",
        [pocket.metroId, pocket.stateId, pocket.metroName],
      );
      await client.query(`
        INSERT INTO demo_pockets (
          pocket_id, pocket_name, region_id, state_id, metro_id,
          zip_code, market_type, centroid_lat, centroid_lon, display_radius_miles, geometry, metrics, competitors,
          opportunities, scores, data_completeness, source_status, methodology_note, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          ST_SetSRID(ST_GeomFromGeoJSON($11), 4326),
          $12::jsonb, $13::jsonb, $14::jsonb, $15::jsonb, $16, $17, $18, now()
        )
        ON CONFLICT (pocket_id) DO UPDATE SET
          pocket_name=EXCLUDED.pocket_name,
          region_id=EXCLUDED.region_id,
          state_id=EXCLUDED.state_id,
          metro_id=EXCLUDED.metro_id,
          zip_code=EXCLUDED.zip_code,
          market_type=EXCLUDED.market_type,
          centroid_lat=EXCLUDED.centroid_lat,
          centroid_lon=EXCLUDED.centroid_lon,
          display_radius_miles=EXCLUDED.display_radius_miles,
          geometry=EXCLUDED.geometry,
          metrics=EXCLUDED.metrics,
          competitors=EXCLUDED.competitors,
          opportunities=EXCLUDED.opportunities,
          scores=EXCLUDED.scores,
          data_completeness=EXCLUDED.data_completeness,
          source_status=EXCLUDED.source_status,
          methodology_note=EXCLUDED.methodology_note,
          updated_at=now()
      `, [
        pocket.id, pocket.name, pocket.regionId, pocket.stateId, pocket.metroId,
        pocket.zipCode, pocket.marketType, pocket.centroidLat, pocket.centroidLon, pocket.displayRadiusMiles,
        JSON.stringify(pocket.geometry), JSON.stringify(pocket.metrics), JSON.stringify(pocket.competitors),
        JSON.stringify(pocket.opportunities), JSON.stringify(pocket.scores),
        pocket.dataCompleteness, pocket.sourceStatus, pocket.methodologyNote,
      ]);
    }
    await client.query("DELETE FROM demo_pockets WHERE NOT (pocket_id = ANY($1::text[]))", [pockets.map((pocket) => pocket.id)]);
    await client.query("DELETE FROM demo_metros WHERE NOT EXISTS (SELECT 1 FROM demo_pockets p WHERE p.metro_id=demo_metros.metro_id)");
    await client.query("DELETE FROM demo_states WHERE NOT EXISTS (SELECT 1 FROM demo_pockets p WHERE p.state_id=demo_states.state_id)");
    await client.query("DELETE FROM demo_regions WHERE NOT EXISTS (SELECT 1 FROM demo_pockets p WHERE p.region_id=demo_regions.region_id)");
    await client.query(
      "UPDATE demo_ingestion_runs SET status='succeeded', completed_at=now(), row_count=$2, metadata=$3::jsonb WHERE run_id=$1",
      [runId, pockets.length, JSON.stringify({ model: "demo_expansion_score_v2", deterministic: true, geography: "public_zcta", productionCalibrationIncluded: false })],
    );
    await client.query("COMMIT");
    console.log("Ingested " + pockets.length + " curated public demo markets.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

if (process.argv[1]?.endsWith("ingest.ts")) {
  main()
    .then(closePool)
    .catch(async (error) => {
      console.error(error);
      await closePool();
      process.exitCode = 1;
    });
}
