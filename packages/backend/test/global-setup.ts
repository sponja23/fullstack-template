import { randomBytes } from "node:crypto";
import { type AdminPostgres, resolveAdminPostgres } from "./containers.ts";
import { createTemplateDb, dropRunDbs } from "./database.ts";

let postgres: AdminPostgres | undefined;

export async function setup(): Promise<void> {
    postgres = await resolveAdminPostgres();
    const runToken = randomBytes(6).toString("hex");
    await createTemplateDb(postgres.adminUrl, postgres.buildUrl, runToken);
    process.env.TEST_ADMIN_DATABASE_URL = postgres.adminUrl;
    process.env.TEST_DB_HOST = postgres.host;
    process.env.TEST_DB_PORT = postgres.port;
    process.env.TEST_DB_USER = postgres.user;
    process.env.TEST_DB_PASSWORD = postgres.password;
    process.env.TEST_DB_RUN_TOKEN = runToken;
}

export async function teardown(): Promise<void> {
    if (!postgres) return;
    const runToken = process.env.TEST_DB_RUN_TOKEN;
    try {
        if (runToken) await dropRunDbs(postgres.adminUrl, runToken);
    } finally {
        await postgres.release();
    }
}
