import { expect } from "vitest";
import { apiTestSuite } from "../suite.ts";

apiTestSuite({
    name: "time entry service",
    cases: (test) => {
        test("creates, edits, deletes, and projects the member author", async ({
            harness,
            request,
        }) => {
            const client = await request.clients.create({
                name: "Time client",
                billingEmail: "time@example.test",
                currency: "USD",
            });
            const project = await request.projects.create({
                clientId: client.id,
                name: "Time project",
                slug: "time-project",
                rateMinor: 10_000,
            });
            const entry = await request.timeEntries.create({
                projectId: project.id,
                date: "2026-09-15",
                minutes: 60,
                note: "Initial work",
            });
            expect(entry.authorName).toContain("Test User");
            await expect(
                request.timeEntries.listMine({ from: "2026-09-14", to: "2026-09-20" }),
            ).resolves.toEqual([
                expect.objectContaining({ id: entry.id, authorId: expect.any(String) }),
            ]);
            await expect(
                request.timeEntries.update({
                    id: entry.id,
                    date: "2026-09-16",
                    minutes: 90,
                    note: "Revised work",
                }),
            ).resolves.toMatchObject({ minutes: 90, note: "Revised work" });
            await expect(request.timeEntries.delete({ id: entry.id })).resolves.toEqual({
                success: true,
            });
            expect(harness.userId).toBeTruthy();
        });

        test("refuses new entries on archived projects", async ({ request }) => {
            const client = await request.clients.create({
                name: "Archive client",
                billingEmail: "archive@example.test",
                currency: "EUR",
            });
            const project = await request.projects.create({
                clientId: client.id,
                name: "Archived",
                slug: "archived",
                rateMinor: 5_000,
            });
            await request.projects.archive({ id: project.id });
            await expect(
                request.timeEntries.create({
                    projectId: project.id,
                    date: "2026-09-16",
                    minutes: 30,
                    note: "Too late",
                }),
            ).rejects.toMatchObject({ cause: { errorCode: "PROJECT_ARCHIVED" } });
        });

        test("refuses changes to billed entries and reports missing entries", async ({
            request,
        }) => {
            const client = await request.clients.create({
                name: "Billing client",
                billingEmail: "billing-time@example.test",
                currency: "USD",
            });
            const project = await request.projects.create({
                clientId: client.id,
                name: "Billing project",
                slug: "billing-project",
                rateMinor: 8_000,
            });
            const entry = await request.timeEntries.create({
                projectId: project.id,
                date: "2026-09-16",
                minutes: 45,
                note: "Claimed",
            });
            const invoice = await request.invoices.createDraft({ clientId: client.id });
            await request.invoices.addTimeLines({
                invoiceId: invoice.id,
                entryIds: [entry.id],
            });
            await request.invoices.issue({ id: invoice.id });
            await expect(request.timeEntries.delete({ id: entry.id })).rejects.toMatchObject({
                cause: { errorCode: "TIME_ENTRY_BILLED" },
            });
            await expect(
                request.timeEntries.delete({ id: "00000000-0000-4000-8000-000000000000" }),
            ).rejects.toMatchObject({ cause: { errorCode: "TIME_ENTRY_NOT_FOUND" } });
        });

        test("isolates entries by organization", async ({ harness, request }) => {
            const client = await request.clients.create({
                name: "Isolated time client",
                billingEmail: "isolated@example.test",
                currency: "USD",
            });
            const project = await request.projects.create({
                clientId: client.id,
                name: "Isolated time project",
                slug: "isolated-time-project",
                rateMinor: 7_000,
            });
            const entry = await request.timeEntries.create({
                projectId: project.id,
                date: "2026-09-16",
                minutes: 15,
                note: "Private",
            });
            const outsider = await harness.signUpUser();
            await harness.createOrganization(outsider.cookieHeader, `outsider-time-${Date.now()}`);
            await expect(
                outsider.request.timeEntries.listMine({ from: "2026-09-14", to: "2026-09-20" }),
            ).resolves.toEqual([]);
            await expect(
                outsider.request.timeEntries.update({
                    id: entry.id,
                    date: "2026-09-16",
                    minutes: 30,
                    note: "Stolen",
                }),
            ).rejects.toMatchObject({ cause: { errorCode: "TIME_ENTRY_NOT_FOUND" } });
        });
    },
});
