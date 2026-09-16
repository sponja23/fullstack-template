import { pino } from "pino";
import type { LoggerOptions, TransportTargetOptions } from "pino";

const REDACT_PATHS = [
    "authorization",
    "cookie",
    "password",
    "token",
    "*.authorization",
    "*.cookie",
    "*.password",
    "*.token",
];

export function buildPinoOptions(overrides?: Partial<LoggerOptions>): LoggerOptions {
    const isProd = process.env.NODE_ENV === "production";
    const level = process.env.LOG_LEVEL ?? (isProd ? "info" : "debug");
    // OTLP requires epoch milliseconds; an ISO string silently prevents export.
    const otlpActive = isProd && (process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "") !== "";

    const options: LoggerOptions = {
        level,
        messageKey: "message",
        ...(otlpActive ? {} : { timestamp: pino.stdTimeFunctions.isoTime }),
        redact: { paths: REDACT_PATHS, censor: "[REDACTED]" },
        ...overrides,
    };

    const transport = buildTransport({ isProd, level });
    if (transport !== undefined) options.transport = transport;
    return options;
}

function buildTransport(args: {
    isProd: boolean;
    level: string;
}): LoggerOptions["transport"] | undefined {
    const { isProd, level } = args;
    if (!isProd) {
        return {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "SYS:HH:MM:ss.l",
                messageKey: "message",
                ignore: "pid,hostname",
            },
        };
    }

    const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    if (otlpEndpoint === undefined || otlpEndpoint === "") return undefined;

    const targets: TransportTargetOptions[] = [
        { target: "pino/file", level, options: { destination: 1 } },
        { target: "pino-opentelemetry-transport", level, options: {} },
    ];
    return { targets };
}
