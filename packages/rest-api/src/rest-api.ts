import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import type { ApiKeyVerifier } from "./auth/api-key-verifier.ts";
import { API_KEY_HEADER, type ApiEnv } from "./auth/api-key.middleware.ts";
import type { ClientsPort } from "./clients/clients.port.ts";
import { registerClientRoutes } from "./clients/clients.route.ts";
import { registerHealthRoutes } from "./health/health.route.ts";
import { handleError } from "./http/backend-error.ts";
import { createRouteRegistrar } from "./http/authenticated-route.ts";
import type { InvoicesPort } from "./invoices/invoices.port.ts";
import { registerInvoiceRoutes } from "./invoices/invoices.route.ts";
import { registerWhoamiRoutes } from "./whoami/whoami.route.ts";

export interface RestApiDeps {
    verifyApiKey: ApiKeyVerifier;
    clients: ClientsPort;
    invoices: InvoicesPort;
}

export function buildRestApi({ verifyApiKey, clients, invoices }: RestApiDeps) {
    const app = new OpenAPIHono<ApiEnv>().basePath("/v1");
    app.onError(handleError);
    app.openAPIRegistry.registerComponent("securitySchemes", "ApiKey", {
        type: "apiKey",
        in: "header",
        name: API_KEY_HEADER,
    });
    const register = createRouteRegistrar(app, verifyApiKey);
    registerHealthRoutes(app);
    registerWhoamiRoutes(register);
    registerClientRoutes(register, clients);
    registerInvoiceRoutes(register, invoices);
    app.doc31("/openapi.json", {
        openapi: "3.1.0",
        info: { title: "Acme REST API", version: "1.0.0" },
    });
    app.get("/docs", Scalar({ url: "/v1/openapi.json" }));
    return app;
}
