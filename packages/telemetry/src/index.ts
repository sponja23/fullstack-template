export {
    initTelemetry,
    getExternalSpanPipeline,
    shutdownTelemetry,
    runWithTelemetry,
    runOnceWithTelemetry,
} from "./init.ts";
export type { ExternalSpanPipeline, InitTelemetryOptions, TelemetryTeardown } from "./init.ts";
export { withSpan, setSpanAttributes, SpanKind, SpanStatusCode } from "./span.ts";
export type { SpanOptions, Span, Attributes, Link } from "./span.ts";
