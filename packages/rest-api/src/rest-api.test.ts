import { describe, expect, it } from "vitest";
import { createHarness } from "./test-support/harness.ts";

describe("REST API", () => {
    it("serves health, OpenAPI, and Scalar docs", async () => {
        const { app } = createHarness();
        expect(await (await app.request("/v1/health")).json()).toEqual({ status: "ok" });
        const document = (await (await app.request("/v1/openapi.json")).json()) as {
            paths: Record<string, unknown>;
        };
        expect(document.paths["/v1/clients/{id}"]).toBeDefined();
        expect(document.paths["/v1/invoices/{number}/mark-paid"]).toBeDefined();
        expect((await app.request("/v1/docs")).status).toBe(200);
    });

    it("distinguishes a bad key from a missing scope", async () => {
        const { app } = createHarness([]);
        expect((await app.request("/v1/clients", { headers: { "x-api-key": "bad" } })).status).toBe(
            401,
        );
        expect(
            (await app.request("/v1/clients", { headers: { "x-api-key": "valid" } })).status,
        ).toBe(403);
    });

    it("identifies a valid key", async () => {
        const { request } = createHarness(["clients:read"]);
        const response = await request("/v1/whoami");
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
            organizationId: "org_1",
            scopes: ["clients:read"],
        });
    });

    it("lists and reads clients", async () => {
        const { request, client } = createHarness(["clients:read"]);
        expect((await request("/v1/clients")).status).toBe(200);
        const response = await request(`/v1/clients/${client.id}`);
        expect(response.status).toBe(200);
        expect((await response.json()) as { name: string }).toMatchObject({ name: "Globex" });
    });

    it("lists, reads, and marks invoices paid", async () => {
        const { request } = createHarness(["invoices:read", "invoices:write"]);
        expect((await request("/v1/invoices")).status).toBe(200);
        expect((await request("/v1/invoices/1")).status).toBe(200);
        const response = await request("/v1/invoices/1/mark-paid", { method: "POST" });
        expect(response.status).toBe(200);
        expect((await response.json()) as { status: string }).toMatchObject({ status: "paid" });
    });
});
