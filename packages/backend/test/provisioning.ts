import { randomBytes } from "node:crypto";
import { resolveAdminPostgres } from "./containers.ts";
import { cloneSuiteDb, createTemplateDb, dropDb, dropRunDbs } from "./database.ts";

export interface ProvisionedDb {
    connectionString: string;
    dbName: string;
    teardown: () => Promise<void>;
}

export type DbProvisioner = () => Promise<ProvisionedDb>;

function buildSuiteUrl(dbName: string): string {
    const host = process.env.TEST_DB_HOST;
    const port = process.env.TEST_DB_PORT;
    const user = process.env.TEST_DB_USER;
    const password = process.env.TEST_DB_PASSWORD;
    if (!host || !port || !user || !password) {
        throw new Error("Test database environment was not initialized by global setup.");
    }
    return `postgres://${user}:${password}@${host}:${port}/${dbName}`;
}

export const provisionFromSharedTemplate: DbProvisioner = async () => {
    const adminUrl = process.env.TEST_ADMIN_DATABASE_URL;
    const runToken = process.env.TEST_DB_RUN_TOKEN;
    if (!adminUrl || !runToken) {
        throw new Error("Shared test template was not initialized by global setup.");
    }
    const { dbName, connectionString } = await cloneSuiteDb(adminUrl, buildSuiteUrl, runToken);
    return { dbName, connectionString, teardown: () => dropDb(adminUrl, dbName) };
};

export const provisionStandalone: DbProvisioner = async () => {
    const postgres = await resolveAdminPostgres();
    const runToken = randomBytes(6).toString("hex");
    await createTemplateDb(postgres.adminUrl, postgres.buildUrl, runToken);
    const { dbName, connectionString } = await cloneSuiteDb(
        postgres.adminUrl,
        postgres.buildUrl,
        runToken,
    );
    return {
        dbName,
        connectionString,
        teardown: async () => {
            try {
                await dropRunDbs(postgres.adminUrl, runToken);
            } finally {
                await postgres.release();
            }
        },
    };
};
