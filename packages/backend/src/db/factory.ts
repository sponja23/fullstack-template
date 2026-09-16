import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index.ts";

export interface DbConfig {
    connectionString: string;
}

export function buildDb(config: DbConfig) {
    const pool = new Pool({ connectionString: config.connectionString });
    return { db: drizzle(pool, { schema }), pool };
}

export type DbBundle = ReturnType<typeof buildDb>;
export type Database = DbBundle["db"];
export type DatabaseExecutor = Database | Parameters<Parameters<Database["transaction"]>[0]>[0];
