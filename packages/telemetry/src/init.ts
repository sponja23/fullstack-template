import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { PgInstrumentation } from "@opentelemetry/instrumentation-pg";
import { UndiciInstrumentation } from "@opentelemetry/instrumentation-undici";
import {
    defaultResource,
    detectResources,
    envDetector,
    resourceFromAttributes,
    type Resource,
} from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
    AlwaysOnSampler,
    BatchSpanProcessor,
    ParentBasedSampler,
    type SpanProcessor,
} from "@opentelemetry/sdk-trace-base";

const IGNORED_INCOMING_PATHS = ["/", "/health", "/-/ready", "/-/healthy"];
const SAFE_REQUEST_HEADERS = ["x-request-id"];

export interface InitTelemetryOptions {
    serviceName: string;
    otlpEndpoint?: string;
}

let sdk: NodeSDK | undefined;
let telemetryServiceName: string | undefined;
let externalSpanPipeline: ExternalSpanPipeline | undefined;

export interface ExternalSpanPipeline {
    resource: Resource;
    spanProcessor: SpanProcessor;
}

/** Starts tracing before application modules load; absence of an endpoint keeps it a no-op. */
export function initTelemetry(options: InitTelemetryOptions): void {
    if (sdk !== undefined) return;
    telemetryServiceName = options.serviceName;
    if (process.env.OTEL_DIAG === "true") {
        diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
    }
    const endpoint = options.otlpEndpoint ?? process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    if (endpoint === undefined || endpoint === "") return;

    bridgeToLogTransport(endpoint, options.serviceName);
    sdk = new NodeSDK({
        traceExporter: new OTLPTraceExporter(),
        sampler: new ParentBasedSampler({ root: new AlwaysOnSampler() }),
        instrumentations: [
            new HttpInstrumentation({
                ignoreIncomingRequestHook: (req) => {
                    const path = (req.url ?? "").split("?", 1)[0];
                    return IGNORED_INCOMING_PATHS.includes(path);
                },
                headersToSpanAttributes: { server: { requestHeaders: SAFE_REQUEST_HEADERS } },
            }),
            new PgInstrumentation({ requireParentSpan: true, enhancedDatabaseReporting: false }),
            new UndiciInstrumentation(),
        ],
    });
    sdk.start();
}

export async function shutdownTelemetry(): Promise<void> {
    await externalSpanPipeline?.spanProcessor.shutdown();
    externalSpanPipeline = undefined;
    if (sdk !== undefined) {
        await sdk.shutdown();
        sdk = undefined;
    }
    telemetryServiceName = undefined;
}

/** Returns a lazily-created OTLP pipeline for runtimes that cannot use the global provider. */
export function getExternalSpanPipeline(): ExternalSpanPipeline | undefined {
    if (externalSpanPipeline !== undefined) return externalSpanPipeline;
    if (
        telemetryServiceName === undefined ||
        process.env.OTEL_EXPORTER_OTLP_ENDPOINT === undefined
    ) {
        return undefined;
    }
    const resource = defaultResource()
        .merge(detectResources({ detectors: [envDetector] }))
        .merge(resourceFromAttributes({ "service.name": telemetryServiceName }));
    externalSpanPipeline = {
        resource,
        spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
    };
    return externalSpanPipeline;
}

export type TelemetryTeardown = () => Promise<void> | void;

/** Owns startup, signal handling, application teardown, and final telemetry flush. */
export async function runWithTelemetry(
    options: InitTelemetryOptions,
    start: () => Promise<TelemetryTeardown | void> | TelemetryTeardown | void,
): Promise<void> {
    initTelemetry(options);
    const signalled = waitForShutdownSignal();
    let teardown: TelemetryTeardown | void = undefined;
    try {
        teardown = await start();
        await signalled;
    } catch (error) {
        const { logger } = await import("@repo/logger");
        logger.child({ name: options.serviceName }).fatal("service exited with error", error);
        throw error;
    } finally {
        try {
            await teardown?.();
        } finally {
            await shutdownTelemetry();
        }
    }
}

/** Owns a one-shot command's telemetry lifecycle and flushes after the command finishes. */
export async function runOnceWithTelemetry(
    options: InitTelemetryOptions,
    run: () => Promise<void> | void,
): Promise<void> {
    initTelemetry(options);
    try {
        await run();
    } catch (error) {
        const { logger } = await import("@repo/logger");
        logger.child({ name: options.serviceName }).fatal("job exited with error", error);
        throw error;
    } finally {
        await shutdownTelemetry();
    }
}

function waitForShutdownSignal(): Promise<void> {
    return new Promise((resolve) => {
        const onSignal = (): void => {
            process.off("SIGTERM", onSignal);
            process.off("SIGINT", onSignal);
            resolve();
        };
        process.once("SIGTERM", onSignal);
        process.once("SIGINT", onSignal);
    });
}

function bridgeToLogTransport(endpoint: string, serviceName: string): void {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = endpoint;
    process.env.OTEL_EXPORTER_OTLP_PROTOCOL ??= "http/protobuf";
    process.env.OTEL_SERVICE_NAME = serviceName;
}
