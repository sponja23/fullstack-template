import { BadGatewayError, InternalServerError, type BackendErrorCode } from "@repo/backend";
import { captureLogs } from "@repo/logger";
import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { handleError } from "./backend-error.ts";

class UpstreamFailedError extends BadGatewayError {
    readonly errorCode = "UPSTREAM_FAILED" as BackendErrorCode;
}

class BrokenInvariantError extends InternalServerError {
    readonly errorCode = "CLIENT_INVARIANT_VIOLATION" as const;
}

async function responseTo(error: Error): Promise<Response> {
    const app = new Hono();
    app.get("/boom", () => {
        throw error;
    });
    app.onError(handleError);
    return app.request("/boom");
}

describe("handleError", () => {
    it("answers an upstream failure with 502 and its errorCode, logged at warn", async () => {
        const { result: response, logs } = await captureLogs(() =>
            responseTo(new UpstreamFailedError("connect ECONNREFUSED")),
        );

        expect(response.status).toBe(502);
        expect(await response.json()).toMatchObject({
            error: { code: "UPSTREAM_FAILED" },
        });
        expect(logs).toMatchObject([{ level: "warn", attrs: { errorCode: "UPSTREAM_FAILED" } }]);
    });

    it("answers a broken backend invariant with 500, logged at error", async () => {
        const { result: response, logs } = await captureLogs(() =>
            responseTo(new BrokenInvariantError("insert returned no row")),
        );

        expect(response.status).toBe(500);
        expect(logs).toMatchObject([
            {
                level: "error",
                attrs: {
                    errorCode: "CLIENT_INVARIANT_VIOLATION",
                    trpcCode: "INTERNAL_SERVER_ERROR",
                },
            },
        ]);
    });
});
