import { logger } from "@repo/logger";
import { SpanStatusCode, withSpan } from "@repo/telemetry";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { BackendError } from "../errors/base.ts";
import type { AppContext } from "./context.ts";

export function buildTrpc() {
    const t = initTRPC.context<AppContext>().create({
        transformer: superjson,
        errorFormatter({ shape, error }) {
            return {
                ...shape,
                data: {
                    ...shape.data,
                    errorCode:
                        error.cause instanceof BackendError
                            ? error.cause.errorCode
                            : shape.data.code,
                },
            };
        },
    });
    const trpcLogger = logger.child({ name: "TrpcMiddleware" });
    const baseProcedure = t.procedure
        .use(({ path, type, next }) =>
            logger.withTags({ trpcPath: path, trpcType: type }, () =>
                withSpan(
                    `trpc ${path}`,
                    async (span) => {
                        const startedAt = performance.now();
                        trpcLogger.info("trpc procedure invoked");
                        const result = await next();
                        const durationMs = Math.round(performance.now() - startedAt);
                        if (result.ok) {
                            trpcLogger.info("trpc procedure completed", { durationMs });
                        } else {
                            span.setStatus({ code: SpanStatusCode.ERROR });
                            trpcLogger.warn("trpc procedure failed", result.error, { durationMs });
                        }
                        return result;
                    },
                    { attributes: { "rpc.system": "trpc", "rpc.method": path, "trpc.type": type } },
                ),
            ),
        )
        .use(async ({ next }) => {
            const result = await next();
            if (!result.ok && result.error.cause instanceof BackendError) {
                return { ...result, error: result.error.cause.toTRPCError() };
            }
            return result;
        });
    return { t, router: t.router, baseProcedure };
}

export type Trpc = ReturnType<typeof buildTrpc>;
export type RouterBuilder = Trpc["router"];
export type BaseProcedure = Trpc["baseProcedure"];
