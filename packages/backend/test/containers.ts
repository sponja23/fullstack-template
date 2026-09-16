import { PostgreSqlContainer } from "@testcontainers/postgresql";

const POSTGRES_IMAGE = "postgres:16-alpine";
const CONTAINER_USER = "test";
const CONTAINER_PASSWORD = "test";
const ADMIN_DATABASE = "postgres";

export interface AdminPostgres {
    adminUrl: string;
    host: string;
    port: string;
    user: string;
    password: string;
    buildUrl: (dbName: string) => string;
    release: () => Promise<void>;
}

function urlBuilder(
    host: string,
    port: string,
    user: string,
    password: string,
): (dbName: string) => string {
    return (dbName) => `postgres://${user}:${password}@${host}:${port}/${dbName}`;
}

/** Resolves a shared Postgres when configured, otherwise starts a disposable container. */
export async function resolveAdminPostgres(): Promise<AdminPostgres> {
    const sharedUrl = process.env.TEST_PG_ADMIN_URL;
    if (sharedUrl) {
        const parsed = new URL(sharedUrl);
        const host = parsed.hostname;
        const port = parsed.port || "5432";
        const user = decodeURIComponent(parsed.username);
        const password = decodeURIComponent(parsed.password);
        return {
            adminUrl: sharedUrl,
            host,
            port,
            user,
            password,
            buildUrl: urlBuilder(host, port, user, password),
            release: async () => {},
        };
    }

    const container = await new PostgreSqlContainer(POSTGRES_IMAGE)
        .withUsername(CONTAINER_USER)
        .withPassword(CONTAINER_PASSWORD)
        .withDatabase(ADMIN_DATABASE)
        .start();
    const host = container.getHost();
    const port = String(container.getMappedPort(5432));
    const buildUrl = urlBuilder(host, port, CONTAINER_USER, CONTAINER_PASSWORD);
    return {
        adminUrl: buildUrl(ADMIN_DATABASE),
        host,
        port,
        user: CONTAINER_USER,
        password: CONTAINER_PASSWORD,
        buildUrl,
        release: async () => {
            await container.stop();
        },
    };
}
