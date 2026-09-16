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
};

export function handleError(error: Error, context: Context): Response {
    if (error instanceof BackendError) {
        return context.json(
            errorBody(error.errorCode, error.message),
            TRPC_TO_HTTP[error.trpcCode] ?? 500,
        );
    }
    log.error("unhandled REST error", { err: error });
    return context.json(errorBody("internal", "Internal server error."), 500);
}
