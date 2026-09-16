import { z } from "@hono/zod-openapi";
import type { RouteRegistrar } from "../http/authenticated-route.ts";

export function registerWhoamiRoutes(register: RouteRegistrar): void {
    register({
        method: "get",
        path: "/whoami",
        summary: "Identify the API key",
        tags: ["Meta"],
        responses: {
            200: {
                description: "The authenticated principal.",
                schema: z.object({ organizationId: z.string(), scopes: z.array(z.string()) }),
            },
        },
        handler: async ({ principal, reply }) =>
            reply(200, { organizationId: principal.organizationId, scopes: [...principal.scopes] }),
    });
}
