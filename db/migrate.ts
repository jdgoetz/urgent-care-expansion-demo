import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { closePool, getPool } from "@/lib/server/db";

const MAX_STARTUP_ATTEMPTS = 15;
const STARTUP_RETRY_DELAY_MS = 1_000;

export function isRetryableDatabaseStartupError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const code = (error as Error & { code?: string }).code;
  return (
    code === "ECONNREFUSED" ||
    code === "ECONNRESET" ||
    code === "57P03" ||
    /connection terminated|connect econnrefused/i.test(error.message)
  );
}

async function applyMigration(sql: string, file: string) {
  for (let attempt = 1; attempt <= MAX_STARTUP_ATTEMPTS; attempt += 1) {
    try {
      await getPool().query(sql);
      return;
    } catch (error) {
      if (attempt === MAX_STARTUP_ATTEMPTS || !isRetryableDatabaseStartupError(error)) throw error;
      await closePool();
      console.warn(`Database is still starting; retrying ${file} (${attempt}/${MAX_STARTUP_ATTEMPTS}).`);
      await new Promise((resolve) => setTimeout(resolve, STARTUP_RETRY_DELAY_MS));
    }
  }
}

async function main() {
  const migrationDir = path.join(process.cwd(), "db", "migrations");
  const files = (await readdir(migrationDir)).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) {
    const sql = await readFile(path.join(migrationDir, file), "utf8");
    await applyMigration(sql, file);
    console.log("Applied " + file);
  }
}

if (process.argv[1]?.endsWith("migrate.ts")) {
  main()
    .then(closePool)
    .catch(async (error) => {
      console.error(error);
      await closePool();
      process.exitCode = 1;
    });
}
