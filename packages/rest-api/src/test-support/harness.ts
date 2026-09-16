import type { ApiScope } from "@repo/backend";
import { buildRestApi } from "../rest-api.ts";
import { FakeClients } from "./fake-clients.ts";
import { FakeInvoices } from "./fake-invoices.ts";
import { fakeVerifier } from "./fake-verifier.ts";

const date = new Date("2026-01-01T00:00:00Z");
const client = {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Globex",
    billingEmail: "billing@globex.test",
    currency: "USD" as const,
    status: "active" as const,
    createdAt: date,
    updatedAt: date,
};
const invoice = {
    id: "20000000-0000-4000-8000-000000000001",
    clientId: client.id,
    clientName: client.name,
    billingEmail: client.billingEmail,
    currency: "USD" as const,
    number: 1,
    status: "issued" as const,
    issuedAt: date,
    paidAt: null,
    voidedAt: null,
    createdAt: date,
    updatedAt: date,
    lineItems: [
        {
            id: "30000000-0000-4000-8000-000000000001",
            kind: "manual" as const,
            description: "Consulting",
            quantity: 1,
            unitAmountMinor: 10_000,
            totalMinor: 10_000,
        },
    ],
};

export function createHarness(
    scopes: ApiScope[] = ["clients:read", "invoices:read", "invoices:write"],
) {
    const invoices = new FakeInvoices([{ ...invoice, lineItems: [...invoice.lineItems] }]);
    const app = buildRestApi({
        verifyApiKey: fakeVerifier({ valid: { organizationId: "org_1", scopes } }),
        clients: new FakeClients([client]),
        invoices,
    });
    const request = (path: string, init: RequestInit = {}) => {
        const headers = new Headers(init.headers);
        headers.set("x-api-key", "valid");
        return app.request(path, { ...init, headers });
    };
    return { app, request, client, invoice, invoices };
}
