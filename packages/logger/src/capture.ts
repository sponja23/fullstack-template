import { AsyncLocalStorage } from "node:async_hooks";
import z from "zod";

export const LOG_LEVELS = ["trace", "debug", "info", "warn", "error", "fatal"] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

export const CapturedLogSchema = z.object({
    time: z.string(),
    level: z.enum(LOG_LEVELS),
    name: z.string().optional(),
    message: z.string(),
    attrs: z.record(z.string(), z.unknown()),
    err: z.unknown().optional(),
});

export type CapturedLog = z.infer<typeof CapturedLogSchema>;

const sinkStore = new AsyncLocalStorage<CapturedLog[]>();

/** Captures lines emitted in `fn`'s async scope while leaving configured transports unchanged. */
export function captureLogs<T>(fn: () => Promise<T>): Promise<{ result: T; logs: CapturedLog[] }> {
    const logs: CapturedLog[] = [];
    return sinkStore.run(logs, async () => ({ result: await fn(), logs }));
}

export function captureSink(): CapturedLog[] | undefined {
    return sinkStore.getStore();
}
