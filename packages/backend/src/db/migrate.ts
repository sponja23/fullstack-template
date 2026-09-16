import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { Database } from "./factory.ts";

/** Applies pending Drizzle migrations and no-ops when the schema is current. */
export async function migrateDatabase(db: Database, migrationsFolder: string): Promise<void> {
    await migrate(db, { migrationsFolder });
}
