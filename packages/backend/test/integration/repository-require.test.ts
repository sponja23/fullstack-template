import { expect } from "vitest";
import { ClientNotFoundError } from "../../src/routes/client/client.errors.ts";
import { ClientRepository } from "../../src/routes/client/client.repository.ts";
import { InvoiceNotFoundError } from "../../src/routes/invoice/invoice.errors.ts";
import { InvoiceRepository } from "../../src/routes/invoice/invoice.repository.ts";
import { ProjectNotFoundError } from "../../src/routes/project/project.errors.ts";
import { ProjectRepository } from "../../src/routes/project/project.repository.ts";
import { TimeEntryNotFoundError } from "../../src/routes/time-entry/time-entry.errors.ts";
import { TimeEntryRepository } from "../../src/routes/time-entry/time-entry.repository.ts";
import { apiTestSuite } from "../suite.ts";

const missingId = "00000000-0000-4000-8000-000000000000";

apiTestSuite({
    name: "asserting repository writes",
    cases: (test) => {
        test("throws each resource error when an identity-only write matches no row", async ({
            harness,
        }) => {
            const clients = new ClientRepository(harness.db);
            const projects = new ProjectRepository(harness.db);
            const entries = new TimeEntryRepository(harness.db);
            const invoices = new InvoiceRepository(harness.db);

            await expect(
                clients.requireUpdate(harness.organizationId, missingId, {
                    name: "Missing",
                    billingEmail: "missing@example.test",
                }),
            ).rejects.toBeInstanceOf(ClientNotFoundError);
            await expect(
                clients.requireArchive(harness.organizationId, missingId),
            ).rejects.toBeInstanceOf(ClientNotFoundError);
            await expect(
                projects.requireUpdate(harness.organizationId, missingId, {
                    name: "Missing",
                    slug: "missing",
                    rateMinor: 1,
                }),
            ).rejects.toBeInstanceOf(ProjectNotFoundError);
            await expect(
                projects.requireArchive(harness.organizationId, missingId),
            ).rejects.toBeInstanceOf(ProjectNotFoundError);
            await expect(
                entries.requireUpdate(harness.organizationId, missingId, {
                    date: "2026-09-16",
                    minutes: 1,
                    note: "Missing",
                }),
            ).rejects.toBeInstanceOf(TimeEntryNotFoundError);
            await expect(
                entries.requireDelete(harness.organizationId, missingId),
            ).rejects.toBeInstanceOf(TimeEntryNotFoundError);
            await expect(
                invoices.requireTransition(harness.organizationId, missingId, {
                    status: "paid",
                    paidAt: new Date(),
                }),
            ).rejects.toBeInstanceOf(InvoiceNotFoundError);
        });
    },
});
