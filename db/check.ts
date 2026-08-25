import { closePool, getPool } from "@/lib/server/db";

async function main() {
  const postgis = await getPool().query("SELECT PostGIS_Version() AS version");
  const counts = await getPool().query(`
    SELECT
      (SELECT count(*)::int FROM demo_regions) AS regions,
      (SELECT count(*)::int FROM demo_states) AS states,
      (SELECT count(*)::int FROM demo_metros) AS metros,
      (SELECT count(*)::int FROM demo_pockets) AS pockets,
      (SELECT count(*)::int FROM demo_pockets WHERE display_radius_miles <= 0) AS invalid_display_radii,
      (SELECT count(*)::int FROM demo_pockets WHERE NOT ST_IsValid(geometry)) AS invalid_geometries
  `);
  const row = counts.rows[0];
  if (row.regions !== 1 || row.states !== 2 || row.metros !== 7 || row.pockets !== 9) {
    throw new Error("Unexpected deterministic demo counts: " + JSON.stringify(row));
  }
  if (row.invalid_geometries !== 0) throw new Error("Invalid public-market geometries found");
  if (row.invalid_display_radii !== 0) throw new Error("Invalid public-market display radii found");
  console.log(JSON.stringify({ postgis: postgis.rows[0].version, ...row }, null, 2));
}

main()
  .then(closePool)
  .catch(async (error) => {
    console.error(error);
    await closePool();
    process.exitCode = 1;
  });
