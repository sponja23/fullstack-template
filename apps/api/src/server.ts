import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import {
    LoggingEmailSender,
    buildApp,
    buildAuth,
    buildDb,
    scopesFromMetadata,
} from "@repo/backend";
import { USER_TRPC_PATH } from "@repo/client";
import { logger } from "@repo/logger";
import { buildRestApi } from "@repo/rest-api";
import type { TelemetryTeardown } from "@repo/telemetry";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "./env.ts";
import { loggingMiddleware } from "./logging.middleware.ts";

/** Builds the graph, starts HTTP, and returns graceful teardown. */
export async function start(): Promise<TelemetryTeardown> {
    const { db, pool } = buildDb({ connectionString: env.DATABASE_URL });
    const auth = buildAuth({
        db,
        secret: env.BETTER_AUTH_SECRET,
        webUrl: env.WEB_URL,
        allowedHosts: env.AUTH_TRUSTED_HOSTS,
        emailSender: new LoggingEmailSender(),
        cookieDomain: env.AUTH_COOKIE_DOMAIN,
    });
    const { userRouter, createContext, services } = buildApp({ db, auth });
    const app = new Hono();

    app.use("*", loggingMiddleware);
    app.use("*", cors({ origin: env.WEB_URL, credentials: true }));
    app.on(["GET", "POST"], "/auth/*", (context) => auth.handler(context.req.raw));
    app.use(
        `${USER_TRPC_PATH}/*`,
        trpcServer({
            endpoint: USER_TRPC_PATH,
            router: userRouter,
            createContext: ({ req }) => createContext({ headers: req.headers }),
        }),
    );
    app.route(
        "/",
        buildRestApi({
            verifyApiKey: {
                verify: async (rawKey) => {
                    const result = await auth.api.verifyApiKey({ body: { key: rawKey } });
                    if (!result.valid || !result.key) return null;
                    return {
                        organizationId: result.key.referenceId,
                        scopes: new Set(scopesFromMetadata(result.key.metadata)),
                    };
                },
            },
            clients: services.clients,
            invoices: services.invoices,
        }),
    );
    app.get("/", (context) => context.text("ok"));

    const server = serve({ fetch: app.fetch, port: env.PORT }, ({ port }) => {
        logger.info("api listening", { url: `http://localhost:${port}`, port });
    });

    return async () => {
        await new Promise<void>((resolve, reject) => {
            logger.info("api shutting down");
            server.close((error) => (error ? reject(error) : resolve()));
        });
        await pool.end();
    };
}
