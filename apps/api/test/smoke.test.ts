import { type ChildProcess, spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { type ProvisionedDb, provisionStandalone } from "@repo/backend/test-harness";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const distDir = fileURLToPath(new URL("../dist", import.meta.url));
const entry = `${distDir}/index.js`;
const delay = (milliseconds: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

function startOtlpSink(): Promise<{ url: string; close: () => Promise<void> }> {
    const server = createServer((request, response) => {
        request.on("data", () => {});
        request.on("end", () =>
            response.writeHead(200, { "content-type": "application/x-protobuf" }).end(),
        );
    });
    return new Promise((resolve) => {
        server.listen(0, "127.0.0.1", () => {
            const address = server.address();
            const port = typeof address === "object" && address ? address.port : 0;
            resolve({
                url: `http://127.0.0.1:${port}`,
                close: () => new Promise((done) => server.close(() => done())),
            });
        });
    });
}

function freePort(): Promise<number> {
    const probe = createServer();
    return new Promise((resolve) => {
        probe.listen(0, "127.0.0.1", () => {
            const address = probe.address();
            const port = typeof address === "object" && address ? address.port : 0;
            probe.close(() => resolve(port));
        });
    });
}

describe("api dist smoke", () => {
    let db!: ProvisionedDb;
    let sink!: Awaited<ReturnType<typeof startOtlpSink>>;
    let child!: ChildProcess;
    let apiUrl: string;
    let output = "";

    beforeAll(async () => {
        if (!existsSync(entry))
            throw new Error(`Missing ${entry}. Build the api before the smoke.`);
        db = await provisionStandalone();
        sink = await startOtlpSink();
        const port = await freePort();
        apiUrl = `http://127.0.0.1:${port}`;
        child = spawn(process.execPath, [entry], {
            stdio: ["ignore", "pipe", "pipe"],
            env: {
                ...process.env,
                NODE_ENV: "test",
                PORT: String(port),
                DATABASE_URL: db.connectionString,
                BETTER_AUTH_SECRET: "smoke-secret",
                WEB_URL: "http://localhost:5173",
                AUTH_TRUSTED_HOSTS: `127.0.0.1:${port}`,
                OTEL_EXPORTER_OTLP_ENDPOINT: sink.url,
            },
        });
        child.stdout?.on("data", (data: Buffer) => (output += data.toString()));
        child.stderr?.on("data", (data: Buffer) => (output += data.toString()));

        const deadline = Date.now() + 120_000;
        for (;;) {
            if (child.exitCode !== null) {
                throw new Error(`api exited early with ${child.exitCode}:\n${output}`);
            }
            try {
                const response = await fetch(`${apiUrl}/`);
                if (response.ok) break;
            } catch {
                // Startup is still in progress.
            }
            if (Date.now() > deadline) throw new Error(`api never became ready:\n${output}`);
            await delay(250);
        }
    });

    afterAll(async () => {
        if (child?.exitCode === null) {
            child.kill("SIGTERM");
            await new Promise<void>((resolve) => child.once("exit", () => resolve()));
        }
        await sink?.close();
        await db?.teardown();
    });

    it("boots with telemetry enabled and serves auth", async () => {
        const root = await fetch(`${apiUrl}/`);
        expect(await root.text()).toBe("ok");
        const auth = await fetch(`${apiUrl}/auth/get-session`);
        expect(auth.status).toBe(200);
    });

    it("emits each runtime entrypoint", () => {
        for (const name of ["index", "server", "migrate", "superadmin-grant"]) {
            expect(existsSync(`${distDir}/${name}.js`)).toBe(true);
        }
    });

    it("keeps the server behind a rewritten dynamic import", () => {
        const code = readFileSync(entry, "utf8");
        expect(code).toMatch(/import\(\s*["']\.\/server\.js["']\s*\)/);
        expect(code).not.toMatch(/^\s*import\b[^(]*["']\.\/server(\.js)?["']/m);
    });
});
