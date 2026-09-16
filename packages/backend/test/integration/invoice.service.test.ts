import { expect } from "vitest";
import { apiTestSuite } from "../suite.ts";

apiTestSuite({
    name: "invoice service",
    cases: (test) => {
        test("builds lines, issues atomically, and follows the lifecycle", async ({ request }) => {
            const client = await request.clients.create({
                name: "Invoice client",
                billingEmail: "invoice@example.test",
                currency: "USD",
            });
            const project = await request.projects.create({
                clientId: client.id,
                name: "Invoice project",
                slug: "invoice-project",
                rateMinor: 12_000,
            });
            const entry = await request.timeEntries.create({
                projectId: project.id,
                date: "2026-09-16",
                minutes: 90,
                note: "Design",
            });
            const draft = await request.invoices.createDraft({ clientId: client.id });
            await request.invoices.addTimeLines({ invoiceId: draft.id, entryIds: [entry.id] });
            await request.invoices.addManualLine({
                invoiceId: draft.id,
                description: "Expenses",
                quantity: 2,
                unitAmountMinor: 500,
            });
            const issued = await request.invoices.issue({ id: draft.id });
            expect(issued).toMatchObject({ status: "issued", number: 1 });
            expect(issued.lineItems).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ kind: "generated", totalMinor: 18_000 }),
                    expect.objectContaining({ kind: "manual", totalMinor: 1_000 }),
                ]),
            );
            await expect(
                request.timeEntries.update({
                    id: entry.id,
                    date: entry.date,
                    minutes: 30,
                    note: "Changed",
                }),
            ).rejects.toMatchObject({ cause: { errorCode: "TIME_ENTRY_BILLED" } });
            await expect(request.invoices.markPaid({ id: draft.id })).resolves.toMatchObject({
                status: "paid",
                paidAt: expect.any(Date),
            });
            await expect(request.invoices.void({ id: draft.id })).rejects.toMatchObject({
                cause: { errorCode: "INVALID_INVOICE_TRANSITION" },
            });
        });

        test("rejects empty issue, mismatched entries, and non-draft edits", async ({
            request,
        }) => {
            const usd = await request.clients.create({
                name: "USD invoice client",
                billingEmail: "usd@example.test",
                currency: "USD",
            });
            const eur = await request.clients.create({
                name: "EUR invoice client",
                billingEmail: "eur@example.test",
                currency: "EUR",
            });
            const eurProject = await request.projects.create({
                clientId: eur.id,
                name: "EUR project",
                slug: "eur-invoice-project",
                rateMinor: 10_000,
            });
            const entry = await request.timeEntries.create({
                projectId: eurProject.id,
                date: "2026-09-16",
                minutes: 60,
                note: "Foreign currency",
            });
            const empty = await request.invoices.createDraft({ clientId: usd.id });
            await expect(request.invoices.issue({ id: empty.id })).rejects.toMatchObject({
                cause: { errorCode: "INVOICE_EMPTY" },
            });
            await expect(
                request.invoices.addTimeLines({ invoiceId: empty.id, entryIds: [entry.id] }),
            ).rejects.toMatchObject({ cause: { errorCode: "CURRENCY_MISMATCH" } });
            await request.invoices.addManualLine({
                invoiceId: empty.id,
                description: "Retainer",
                quantity: 1,
                unitAmountMinor: 5_000,
            });
            await request.invoices.void({ id: empty.id });
            await expect(
                request.invoices.addManualLine({
                    invoiceId: empty.id,
                    description: "Late edit",
                    quantity: 1,
                    unitAmountMinor: 1,
                }),
            ).rejects.toMatchObject({ cause: { errorCode: "INVOICE_NOT_EDITABLE" } });
        });

        test("assigns consecutive per-organization numbers under concurrent issues", async ({
            request,
        }) => {
            const client = await request.clients.create({
                name: "Concurrent client",
                billingEmail: "concurrent@example.test",
                currency: "USD",
            });
            const drafts = await Promise.all(
                ["First", "Second"].map(async (description) => {
                    const draft = await request.invoices.createDraft({ clientId: client.id });
                    await request.invoices.addManualLine({
                        invoiceId: draft.id,
                        description,
                        quantity: 1,
                        unitAmountMinor: 100,
                    });
                    return draft;
                }),
            );
            const issued = await Promise.all(
                drafts.map((draft) => request.invoices.issue({ id: draft.id })),
            );
            expect(
                issued.map((invoice) => invoice.number).sort((a, b) => (a ?? 0) - (b ?? 0)),
            ).toEqual([2, 3]);
        });

        test("isolates invoices by organization", async ({ harness, request }) => {
            const client = await request.clients.create({
                name: "Private invoice client",
                billingEmail: "private-invoice@example.test",
                currency: "USD",
            });
            const invoice = await request.invoices.createDraft({ clientId: client.id });
            const outsider = await harness.signUpUser();
            await harness.createOrganization(
                outsider.cookieHeader,
                `outsider-invoice-${Date.now()}`,
            );
            await expect(outsider.request.invoices.list()).resolves.toEqual([]);
            await expect(outsider.request.invoices.get({ id: invoice.id })).rejects.toMatchObject({
                cause: { errorCode: "INVOICE_NOT_FOUND" },
            });
        });
    },
});
