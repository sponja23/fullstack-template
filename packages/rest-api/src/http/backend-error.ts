import { BackendError } from "@repo/backend";
import { logger } from "@repo/logger";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { errorBody } from "./error-response.ts";

const log = logger.child({ name: "rest-api" });
const TRPC_TO_HTTP: Record<string, ContentfulStatusCode> = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    BAD_GATEWAY: 502,
};

export function handleError(error: Error, context: Context): Response {
    if (error instanceof BackendError) {
        const status = TRPC_TO_HTTP[error.trpcCode] ?? 500;
        const attrs = { errorCode: error.errorCode, trpcCode: error.trpcCode };
        if (error.trpcCode === "BAD_GATEWAY")
            log.warn("an upstream the backend called failed", error, attrs);
        else if (status >= 500) log.error("backend error surfaced as 5xx", error, attrs);
        return context.json(errorBody(error.errorCode, error.message), status);
    }
    log.error("unhandled REST error", error);
    return context.json(errorBody("internal", "Internal server error."), 500);
}
