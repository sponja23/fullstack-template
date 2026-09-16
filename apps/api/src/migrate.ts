import { fileURLToPath } from "node:url";
import { buildDb, migrateDatabase } from "@repo/backend";
import { logger } from "@repo/logger";
import { z } from "zod";

const databaseUrl = z.url().parse(process.env.DATABASE_URL);
const migrationsFolder = fileURLToPath(new URL("../drizzle", import.meta.url));
const { db, pool } = buildDb({ connectionString: databaseUrl });

try {
    logger.info("applying drizzle migrations");
    await migrateDatabase(db, migrationsFolder);
    logger.info("drizzle schema is up to date");
} finally {
    await pool.end();
}
