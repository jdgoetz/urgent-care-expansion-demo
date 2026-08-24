import { randomUUID } from "node:crypto";

import { z } from "zod";

import { DEMO_POCKETS } from "@/data/synthetic/demo-data";
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
  geometry: z.object({ type: z.literal("Polygon"), coordinates: z.array(z.array(z.array(z.number()))) }),
  metrics: z.array(z.object({ key: z.string(), normalizedScore: z.number().min(0).max(100) }).passthrough()),
  competitors: z.array(z.object({ id: z.string(), name: z.string() }).passthrough()),
  opportunities: z.array(z.object({ id: z.string(), kind: z.string() }).passthrough()),
  scores: z.object({ expansion: z.number(), entryFeasibility: z.number(), nearTermPriority: z.number() }).passthrough(),
  sourceStatus: z.string(),
  methodologyNote: z.string(),
});

export function validateDemoPockets() {
  return z.array(pocketSchema).length(18).parse(DEMO_POCKETS);
}

async function main() {
  const pockets = validateDemoPockets();
  const client = await getPool().connect();
  const runId = randomUUID();
  try {
    await client.query("BEGIN");
    await client.query(
      "INSERT INTO demo_ingestion_runs (run_id, source_name, started_at, status) VALUES ($1, $2, now(), 'running')",
      [runId, "deterministic_synthetic_demo_v1"],
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
          centroid_lat, centroid_lon, geometry, metrics, competitors,
          opportunities, scores, source_status, methodology_note, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          ST_SetSRID(ST_GeomFromGeoJSON($8), 4326),
          $9::jsonb, $10::jsonb, $11::jsonb, $12::jsonb, $13, $14, now()
        )
        ON CONFLICT (pocket_id) DO UPDATE SET
          pocket_name=EXCLUDED.pocket_name,
          region_id=EXCLUDED.region_id,
          state_id=EXCLUDED.state_id,
          metro_id=EXCLUDED.metro_id,
          centroid_lat=EXCLUDED.centroid_lat,
          centroid_lon=EXCLUDED.centroid_lon,
          geometry=EXCLUDED.geometry,
          metrics=EXCLUDED.metrics,
          competitors=EXCLUDED.competitors,
          opportunities=EXCLUDED.opportunities,
          scores=EXCLUDED.scores,
          source_status=EXCLUDED.source_status,
          methodology_note=EXCLUDED.methodology_note,
          updated_at=now()
      `, [
        pocket.id, pocket.name, pocket.regionId, pocket.stateId, pocket.metroId,
        pocket.centroidLat, pocket.centroidLon, JSON.stringify(pocket.geometry),
        JSON.stringify(pocket.metrics), JSON.stringify(pocket.competitors),
        JSON.stringify(pocket.opportunities), JSON.stringify(pocket.scores),
        pocket.sourceStatus, pocket.methodologyNote,
      ]);
    }
    await client.query(
      "UPDATE demo_ingestion_runs SET status='succeeded', completed_at=now(), row_count=$2, metadata=$3::jsonb WHERE run_id=$1",
      [runId, pockets.length, JSON.stringify({ model: "demo_expansion_score_v1", deterministic: true })],
    );
    await client.query("COMMIT");
    console.log("Ingested " + pockets.length + " deterministic synthetic pockets.");
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

