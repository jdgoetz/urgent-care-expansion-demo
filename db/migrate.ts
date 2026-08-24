import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { closePool, getPool } from "@/lib/server/db";

async function main() {
  const migrationDir = path.join(process.cwd(), "db", "migrations");
  const files = (await readdir(migrationDir)).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) {
    const sql = await readFile(path.join(migrationDir, file), "utf8");
    await getPool().query(sql);
    console.log("Applied " + file);
  }
}

main()
  .then(closePool)
  .catch(async (error) => {
    console.error(error);
    await closePool();
    process.exitCode = 1;
  });

