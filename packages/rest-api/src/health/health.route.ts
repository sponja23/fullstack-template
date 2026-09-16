import { type OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { ApiEnv } from "../auth/api-key.middleware.ts";

const route = createRoute({
    method: "get",
    path: "/health",
    summary: "Liveness check",
    tags: ["Meta"],
    responses: {
        200: {
            description: "The service is up.",
            content: { "application/json": { schema: z.object({ status: z.literal("ok") }) } },
        },
    },
});
export function registerHealthRoutes(app: OpenAPIHono<ApiEnv>): void {
    app.openapi(route, (context) => context.json({ status: "ok" as const }, 200));
}
