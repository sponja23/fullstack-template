import {
    type Attributes,
    type Link,
    type Span,
    SpanKind,
    SpanStatusCode,
    trace,
} from "@opentelemetry/api";

const TRACER_NAME = "@repo/telemetry";

export interface SpanOptions {
    attributes?: Attributes;
    kind?: SpanKind;
    links?: Link[];
}

/** Runs sync or async work in an active span and always ends it. */
export function withSpan<T>(name: string, fn: (span: Span) => T, options?: SpanOptions): T {
    const tracer = trace.getTracer(TRACER_NAME);
    return tracer.startActiveSpan(
        name,
        { kind: options?.kind, attributes: options?.attributes, links: options?.links },
        (span): T => {
            let result: T;
            try {
                result = fn(span);
            } catch (error) {
                endWithError(span, error);
                throw error;
            }
            if (result instanceof Promise) {
                return result.then(
                    (value) => {
                        span.end();
                        return value;
                    },
                    (error: unknown) => {
                        endWithError(span, error);
                        throw error;
                    },
                ) as T;
            }
            span.end();
            return result;
        },
    );
}

export function setSpanAttributes(attributes: Attributes): void {
    trace.getActiveSpan()?.setAttributes(attributes);
}

function endWithError(span: Span, error: unknown): void {
    const err = error instanceof Error ? error : new Error(String(error));
    span.recordException(err);
    span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
    span.end();
}

export { SpanKind, SpanStatusCode };
export type { Attributes, Link, Span };
