import { Pool } from "pg";

let pool: Pool | undefined;

export function databaseUrl() {
  return process.env.DATABASE_URL || "postgresql://demo:demo@localhost:55439/urgent_care_demo";
}

export function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: databaseUrl(), max: 5 });
  }
  return pool;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
