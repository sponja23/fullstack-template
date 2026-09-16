# @repo/logger — redaction and trace correlation

A pino wrapper exposing the `Logger` interface used across the monorepo.

## Key redaction

Pino's built-in redaction in `config.ts` censors `authorization`, `cookie`, `password`, and `token`, including their one-level-nested forms, to `[REDACTED]`. This protection is key-name based.

## Trace correlation

`LoggerImpl.payload` stamps the active span's ids onto every line. It reads the span in the calling thread because the OTLP log transport cannot see this process's active span; it is a no-op when no span is active.

All three of `trace_id`, `span_id`, and `trace_flags` must be set together. The OTLP transport rebuilds the log record's trace context only when all three are present.

## Capture and the OTLP timestamp gotcha

`captureLogs` binds an in-process sink through `AsyncLocalStorage` and taps, without redirecting, every line. `CapturedLog` is a Zod schema because captured lines may cross a storage edge.

Transport selection lives in `config.ts`. When OTLP is active, timestamps must use pino's epoch-millis default because an ISO timestamp silently breaks OTLP export.
