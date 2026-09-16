import { describe, expect, it } from "vitest";
import { captureLogs } from "./capture.ts";
import { logger } from "./index.ts";

function tick(): Promise<void> {
    return new Promise((resolve) => setImmediate(resolve));
}

describe("captureLogs", () => {
    it("captures global and child logger lines", async () => {
        const { result, logs } = await captureLogs(async () => {
            logger.info("parent line", { value: 1 });
            logger.child({ name: "child" }).warn("child line");
            return 42;
        });
        expect(result).toBe(42);
        expect(logs.find((line) => line.message === "parent line")?.attrs).toMatchObject({
            value: 1,
        });
        expect(logs.find((line) => line.message === "child line")?.name).toBe("child");
    });

    it("serializes errors and preserves attributes", async () => {
        const { logs } = await captureLogs(async () => {
            logger.warn("degraded", new Error("boom"), { requestId: "r1" });
        });
        expect(logs[0]?.err).toMatchObject({ type: "Error", message: "boom" });
        expect(logs[0]?.attrs).toMatchObject({ requestId: "r1" });
    });

    it("isolates concurrent captures", async () => {
        const [a, b] = await Promise.all([
            captureLogs(async () => {
                logger.info("A1");
                await tick();
                logger.info("A2");
            }),
            captureLogs(async () => {
                logger.info("B1");
                await tick();
                logger.info("B2");
            }),
        ]);
        expect(a.logs.map((line) => line.message)).toEqual(["A1", "A2"]);
        expect(b.logs.map((line) => line.message)).toEqual(["B1", "B2"]);
    });
});
