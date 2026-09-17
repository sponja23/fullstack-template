import { expect } from "vitest";
import { apiTestSuite } from "../suite.ts";

apiTestSuite({
    name: "client service",
    cases: (test) => {
        test("creates, updates, archives, and keeps currency fixed", async ({ request }) => {
            const created = await request.clients.create({
                name: "Northwind",
                billingEmail: "billing@northwind.test",
                currency: "USD",
            });
            const updated = await request.clients.update({
                id: created.id,
                name: "Northwind Traders",
                billingEmail: "accounts@northwind.test",
            });
            expect(updated).toMatchObject({
                name: "Northwind Traders",
                currency: "USD",
                status: "active",
            });
            await expect(request.clients.archive({ id: created.id })).resolves.toMatchObject({
                status: "archived",
            });
        });

        test("maps duplicate names and missing clients to domain errors", async ({ request }) => {
            await request.clients.create({
                name: "Duplicate",
                billingEmail: "one@example.test",
                currency: "EUR",
            });
            await expect(
                request.clients.create({
                    name: "Duplicate",
                    billingEmail: "two@example.test",
                    currency: "USD",
                }),
            ).rejects.toMatchObject({
                cause: {
                    errorCode: "CLIENT_NAME_TAKEN",
                    cause: expect.objectContaining({ code: "23505" }),
                },
            });
            await expect(
                request.clients.get({ id: "00000000-0000-4000-8000-000000000000" }),
            ).rejects.toMatchObject({ cause: { errorCode: "CLIENT_NOT_FOUND" } });
        });

        test("isolates rows by organization", async ({ harness, request }) => {
            const privateClient = await request.clients.create({
                name: "Private",
                billingEmail: "private@example.test",
                currency: "USD",
            });
            const outsider = await harness.signUpUser();
            await harness.createOrganization(
                outsider.cookieHeader,
                `outsider-client-${Date.now()}`,
            );
            await expect(outsider.request.clients.list()).resolves.toEqual([]);
            await expect(
                outsider.request.clients.update({
                    id: privateClient.id,
                    name: "Stolen",
                    billingEmail: "stolen@example.test",
                }),
            ).rejects.toMatchObject({ cause: { errorCode: "CLIENT_NOT_FOUND" } });
        });
    },
});
