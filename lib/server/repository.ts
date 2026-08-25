import { DEMO_POCKETS } from "@/data/public/curated-markets";
import type { DemoPocket } from "@/lib/types";

import { getPool } from "./db";

function useDatabase() {
  return process.env.DEMO_DATA_MODE === "database";
}

function filterPockets(pockets: DemoPocket[], stateId?: string, metroId?: string) {
  return pockets.filter((pocket) => {
    if (stateId && pocket.stateId !== stateId) return false;
    if (metroId && pocket.metroId !== metroId) return false;
    return true;
  });
}

export async function listPockets(stateId?: string, metroId?: string): Promise<DemoPocket[]> {
  if (!useDatabase()) return filterPockets(DEMO_POCKETS, stateId, metroId);
  const values: string[] = [];
  const clauses: string[] = [];
  if (stateId) {
    values.push(stateId);
    clauses.push("p.state_id=$" + values.length);
  }
  if (metroId) {
    values.push(metroId);
    clauses.push("p.metro_id=$" + values.length);
  }
  const where = clauses.length ? "WHERE " + clauses.join(" AND ") : "";
  const result = await getPool().query({
    text: `
      SELECT p.pocket_id, p.pocket_name, p.region_id, r.region_name,
        p.state_id, s.state_name, p.metro_id, m.metro_name, p.zip_code, p.market_type,
        p.centroid_lat, p.centroid_lon, ST_AsGeoJSON(p.geometry)::json AS geometry,
        p.metrics, p.competitors, p.opportunities, p.scores,
        p.data_completeness, p.source_status, p.methodology_note
      FROM demo_pockets p
      JOIN demo_regions r ON r.region_id=p.region_id
      JOIN demo_states s ON s.state_id=p.state_id
      JOIN demo_metros m ON m.metro_id=p.metro_id
      ${where}
      ORDER BY (p.scores->>'nearTermPriority')::numeric DESC
    `,
    values,
  });
  return result.rows.map((row) => ({
    id: row.pocket_id,
    name: row.pocket_name,
    regionId: row.region_id,
    regionName: row.region_name,
    stateId: row.state_id,
    stateName: row.state_name,
    metroId: row.metro_id,
    metroName: row.metro_name,
    zipCode: row.zip_code,
    marketType: row.market_type,
    centroidLat: Number(row.centroid_lat),
    centroidLon: Number(row.centroid_lon),
    geometry: row.geometry,
    metrics: row.metrics,
    competitors: row.competitors,
    opportunities: row.opportunities,
    scores: row.scores,
    dataCompleteness: Number(row.data_completeness),
    sourceStatus: row.source_status,
    methodologyNote: row.methodology_note,
  }));
}

export async function getPocket(pocketId: string) {
  const pockets = await listPockets();
  return pockets.find((pocket) => pocket.id === pocketId) ?? null;
}
