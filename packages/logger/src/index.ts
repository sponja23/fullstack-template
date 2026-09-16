import { createLogger } from "./logger.ts";

export type { Attrs } from "./context.ts";
export type { Logger, CreateLoggerOptions } from "./logger.ts";
export { createLogger };
export { currentTags, withTags } from "./context.ts";
export { captureLogs, CapturedLogSchema, LOG_LEVELS } from "./capture.ts";
export type { CapturedLog, LogLevel } from "./capture.ts";

export const logger = createLogger();
