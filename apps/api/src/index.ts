import { runWithTelemetry } from "@repo/telemetry";

try {
    await runWithTelemetry({ serviceName: "api" }, async () => {
        const { start } = await import("./server.ts");
        return start();
    });
    process.exit(0);
} catch {
    process.exit(1);
}
