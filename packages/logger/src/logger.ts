import { isSpanContextValid, trace } from "@opentelemetry/api";
import { pino, stdSerializers } from "pino";
import type { Logger as PinoLogger } from "pino";
import { captureSink, type LogLevel } from "./capture.ts";
import { buildPinoOptions } from "./config.ts";
import { currentTags, withTags } from "./context.ts";
import type { Attrs } from "./context.ts";

export interface Logger {
    trace(message: string, attrs?: Attrs): void;
    debug(message: string, attrs?: Attrs): void;
    info(message: string, attrs?: Attrs): void;
    warn(message: string, attrs?: Attrs): void;
    warn(message: string, error: unknown, attrs?: Attrs): void;
    error(message: string, error?: unknown, attrs?: Attrs): void;
    fatal(message: string, error?: unknown, attrs?: Attrs): void;
    child(options: { name: string } & Attrs): Logger;
    withTags<T>(tags: Attrs, fn: () => T): T;
}

class LoggerImpl implements Logger {
    constructor(private readonly inner: PinoLogger) {}

    private toError(error: unknown): Error {
        return error instanceof Error ? error : new Error(String(error));
    }

    private payload(attrs?: Attrs, err?: Error): Attrs {
        const out: Attrs = { ...currentTags(), ...attrs };
        if (err !== undefined) out.err = err;
        const spanContext = trace.getActiveSpan()?.spanContext();
        if (spanContext !== undefined && isSpanContextValid(spanContext)) {
            // The transport restores correlation only when this complete tuple is present.
            out.trace_id = spanContext.traceId;
            out.span_id = spanContext.spanId;
            out.trace_flags = spanContext.traceFlags;
        }
        return out;
    }

    private capture(level: LogLevel, message: string, attrs?: Attrs, error?: Error): void {
        const sink = captureSink();
        if (sink === undefined || !this.inner.isLevelEnabled(level)) return;
        const name = this.inner.bindings().name;
        sink.push({
            time: new Date().toISOString(),
            level,
            message,
            attrs: { ...currentTags(), ...attrs },
            ...(typeof name === "string" ? { name } : {}),
            ...(error !== undefined ? { err: stdSerializers.err(error) } : {}),
        });
    }

    trace(message: string, attrs?: Attrs): void {
        this.inner.trace(this.payload(attrs), message);
        this.capture("trace", message, attrs);
    }
    debug(message: string, attrs?: Attrs): void {
        this.inner.debug(this.payload(attrs), message);
        this.capture("debug", message, attrs);
    }
    info(message: string, attrs?: Attrs): void {
        this.inner.info(this.payload(attrs), message);
        this.capture("info", message, attrs);
    }
    warn(message: string, attrs?: Attrs): void;
    warn(message: string, error: unknown, attrs?: Attrs): void;
    warn(message: string, errorOrAttrs?: unknown, attrs?: Attrs): void {
        const errorGiven = attrs !== undefined || errorOrAttrs instanceof Error;
        const err =
            errorGiven && errorOrAttrs !== undefined ? this.toError(errorOrAttrs) : undefined;
        const resolvedAttrs = errorGiven ? attrs : (errorOrAttrs as Attrs | undefined);
        this.inner.warn(this.payload(resolvedAttrs, err), message);
        this.capture("warn", message, resolvedAttrs, err);
    }
    error(message: string, error?: unknown, attrs?: Attrs): void {
        const err = error !== undefined ? this.toError(error) : undefined;
        this.inner.error(this.payload(attrs, err), message);
        this.capture("error", message, attrs, err);
    }
    fatal(message: string, error?: unknown, attrs?: Attrs): void {
        const err = error !== undefined ? this.toError(error) : undefined;
        this.inner.fatal(this.payload(attrs, err), message);
        this.capture("fatal", message, attrs, err);
    }
    child(options: { name: string } & Attrs): Logger {
        return new LoggerImpl(this.inner.child(options));
    }
    withTags<T>(tags: Attrs, fn: () => T): T {
        return withTags(tags, fn);
    }
}

export interface CreateLoggerOptions {
    name?: string;
    level?: string;
    base?: Attrs;
}

export function createLogger(options?: CreateLoggerOptions): Logger {
    const pinoOptions = buildPinoOptions({
        ...(options?.level !== undefined ? { level: options.level } : {}),
        ...(options?.base !== undefined || options?.name !== undefined
            ? { base: { ...options?.base, ...(options?.name ? { name: options.name } : {}) } }
            : {}),
    });
    return new LoggerImpl(pino(pinoOptions));
}
