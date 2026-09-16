import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client, Pool } from "pg";

const directory = path.dirname(fileURLToPath(import.meta.url));
export const MIGRATIONS_FOLDER = path.resolve(directory, "..", "drizzle");
const DB_PREFIX = "backend_test_";

export type BuildUrl = (dbName: string) => string;

function templateDbName(runToken: string): string {
    return `${DB_PREFIX}${runToken}_template`;
}

function suiteDbName(runToken: string): string {
    return `${DB_PREFIX}${runToken}_${randomBytes(6).toString("hex")}`;
}

async function withAdminClient<T>(
    adminUrl: string,
    fn: (client: Client) => Promise<T>,
): Promise<T> {
    const client = new Client({ connectionString: adminUrl });
    await client.connect();
    try {
        return await fn(client);
    } finally {
        await client.end();
    }
}

export async function closePool(pool: Pool): Promise<void> {
    await pool.end();
}

export async function createTemplateDb(
    adminUrl: string,
    buildUrl: BuildUrl,
    runToken: string,
): Promise<void> {
    const template = templateDbName(runToken);
    await withAdminClient(adminUrl, async (client) => {
        await client.query(`DROP DATABASE IF EXISTS "${template}" WITH (FORCE)`);
        await client.query(`CREATE DATABASE "${template}"`);
    });
    const pool = new Pool({ connectionString: buildUrl(template) });
    try {
        await migrate(drizzle(pool), { migrationsFolder: MIGRATIONS_FOLDER });
    } finally {
        await closePool(pool);
    }
}

export async function cloneSuiteDb(
    adminUrl: string,
    buildUrl: BuildUrl,
    runToken: string,
): Promise<{ dbName: string; connectionString: string }> {
    const dbName = suiteDbName(runToken);
    const template = templateDbName(runToken);
    await withAdminClient(adminUrl, async (client) => {
        await client.query(`CREATE DATABASE "${dbName}" TEMPLATE "${template}"`);
    });
    return { dbName, connectionString: buildUrl(dbName) };
}

export async function dropDb(adminUrl: string, dbName: string): Promise<void> {
    await withAdminClient(adminUrl, async (client) => {
        await terminateConnections(client, dbName);
        await client.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
    });
}

export async function dropRunDbs(adminUrl: string, runToken: string): Promise<void> {
    await withAdminClient(adminUrl, async (client) => {
        const { rows } = await client.query<{ datname: string }>(
            "SELECT datname FROM pg_database WHERE datname LIKE $1",
            [`${DB_PREFIX}${runToken}_%`],
        );
        for (const { datname } of rows) {
            await terminateConnections(client, datname);
            await client.query(`DROP DATABASE IF EXISTS "${datname}" WITH (FORCE)`);
        }
    });
}

async function terminateConnections(client: Client, dbName: string): Promise<void> {
    await client.query(
        `SELECT pg_terminate_backend(pid)
           FROM pg_stat_activity
          WHERE datname = $1 AND pid <> pg_backend_pid()`,
        [dbName],
    );
}
