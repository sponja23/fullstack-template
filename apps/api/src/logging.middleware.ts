import { logger } from "@repo/logger";
import { SpanKind, SpanStatusCode, withSpan } from "@repo/telemetry";
import type { MiddlewareHandler } from "hono";

/** Adds request correlation and one completion log around every HTTP request. */
export const loggingMiddleware: MiddlewareHandler = (context, next) => {
    const requestId = context.req.header("x-request-id") ?? crypto.randomUUID();
    const { method } = context.req;
    const path = context.req.path;
    context.header("x-request-id", requestId);
    return withSpan(
        `${method} ${path}`,
        async (span) => {
            await logger.withTags({ requestId }, async () => {
                const startedAt = performance.now();
                logger.info("request received", { method, path });
                await next();
                const fields = {
                    method,
                    path,
                    status: context.res.status,
                    durationMs: Math.round(performance.now() - startedAt),
                };
                span.setAttribute("http.response.status_code", context.res.status);
                if (context.error !== undefined) {
                    span.setStatus({ code: SpanStatusCode.ERROR, message: context.error.message });
                    logger.error("request failed", context.error, fields);
                } else if (context.res.status >= 500) {
                    span.setStatus({ code: SpanStatusCode.ERROR });
                    logger.error("request completed with server error", undefined, fields);
                } else {
                    logger.info("request completed", fields);
                }
            });
        },
        {
            kind: SpanKind.SERVER,
            attributes: {
                "http.request.method": method,
                "url.path": path,
                "http.request.header.x_request_id": requestId,
            },
        },
    );
};
