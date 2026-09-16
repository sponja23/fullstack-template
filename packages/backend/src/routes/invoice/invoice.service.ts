import { randomUUID } from "node:crypto";
import type { InvoiceStatus } from "../../db/schema/index.ts";
import {
    ClientNotFoundError,
    CurrencyMismatchError,
    InvalidInvoiceTransitionError,
    InvoiceEmptyError,
    InvoiceNotEditableError,
    InvoiceNotFoundError,
    TimeEntryBilledError,
} from "../invoicing/invoicing.errors.ts";
import type { ClientRepository } from "../client/client.repository.ts";
import type { InvoiceRepository } from "./invoice.repository.ts";

export interface AddManualLine {
    invoiceId: string;
    description: string;
    quantity: number;
    unitAmountMinor: number;
}

export class InvoiceService {
    constructor(
        private readonly invoices: InvoiceRepository,
        private readonly clients: ClientRepository,
    ) {}

    list(organizationId: string, status?: InvoiceStatus) {
        return this.invoices.list(organizationId, status);
    }

    async get(organizationId: string, id: string) {
        const invoice = await this.invoices.find(organizationId, id);
        if (!invoice) throw new InvoiceNotFoundError();
        return invoice;
    }

    async getByNumber(organizationId: string, number: number) {
        const invoice = await this.invoices.findByNumber(organizationId, number);
        if (!invoice) throw new InvoiceNotFoundError();
        return invoice;
    }

    async createDraft(organizationId: string, clientId: string) {
        const client = await this.clients.find(organizationId, clientId);
        if (!client) throw new ClientNotFoundError();
        const draft = await this.invoices.createDraft({
            id: randomUUID(),
            organizationId,
            clientId,
            currency: client.currency,
        });
        if (!draft) throw new InvoiceNotFoundError();
        return draft;
    }

    async listUnbilledEntries(organizationId: string, invoiceId: string) {
        const invoice = await this.editable(organizationId, invoiceId);
        return this.invoices.listUnbilledForClient(organizationId, invoice.clientId);
    }

    async addManualLine(organizationId: string, input: AddManualLine) {
        await this.editable(organizationId, input.invoiceId);
        await this.invoices.addLine({
            id: randomUUID(),
            invoiceId: input.invoiceId,
            kind: "manual",
            description: input.description,
            quantity: input.quantity,
            unitAmountMinor: input.unitAmountMinor,
            totalMinor: input.quantity * input.unitAmountMinor,
        });
        return this.get(organizationId, input.invoiceId);
    }

    async addTimeLines(organizationId: string, invoiceId: string, entryIds: string[]) {
        const invoice = await this.editable(organizationId, invoiceId);
        const uniqueIds = [...new Set(entryIds)];
        const entries = await this.invoices.findUnbilledEntries(organizationId, uniqueIds);
        if (entries.length !== uniqueIds.length) throw new TimeEntryBilledError();
        if (entries.some((entry) => entry.clientId !== invoice.clientId)) {
            throw new CurrencyMismatchError();
        }
        const groups = Map.groupBy(entries, (entry) => entry.projectId);
        for (const projectEntries of groups.values()) {
            const first = projectEntries[0];
            if (!first) continue;
            const minutes = projectEntries.reduce((total, entry) => total + entry.minutes, 0);
            await this.invoices.addLine({
                id: randomUUID(),
                invoiceId,
                projectId: first.projectId,
                kind: "generated",
                description: first.projectName,
                quantity: minutes,
                unitAmountMinor: first.rateMinor,
                totalMinor: Math.round((minutes * first.rateMinor) / 60),
                sourceEntryIds: projectEntries.map((entry) => entry.id),
            });
        }
        return this.get(organizationId, invoiceId);
    }

    async removeLine(organizationId: string, invoiceId: string, lineItemId: string) {
        await this.editable(organizationId, invoiceId);
        if (!(await this.invoices.removeLine(invoiceId, lineItemId))) {
            throw new InvoiceNotFoundError();
        }
        return this.get(organizationId, invoiceId);
    }

    issue(organizationId: string, id: string) {
        return this.invoices.transaction(async (executor) => {
            const invoice = await this.invoices.find(organizationId, id, executor);
            if (!invoice) throw new InvoiceNotFoundError();
            if (invoice.status !== "draft") throw new InvoiceNotEditableError();
            if (invoice.lineItems.length === 0) throw new InvoiceEmptyError();
            for (const item of invoice.lineItems) {
                const claimed = await this.invoices.claimEntries(
                    organizationId,
                    item.id,
                    item.sourceEntryIds,
                    executor,
                );
                if (claimed !== item.sourceEntryIds.length) throw new TimeEntryBilledError();
            }
            const number = await this.invoices.allocateNumber(organizationId, executor);
            const issued = await this.invoices.transition(
                organizationId,
                id,
                { status: "issued", number, issuedAt: new Date() },
                executor,
            );
            if (!issued) throw new InvoiceNotFoundError();
            return issued;
        });
    }

    async markPaid(organizationId: string, id: string) {
        const invoice = await this.get(organizationId, id);
        if (invoice.status !== "issued") throw new InvalidInvoiceTransitionError();
        const paid = await this.invoices.transition(organizationId, id, {
            status: "paid",
            paidAt: new Date(),
        });
        if (!paid) throw new InvoiceNotFoundError();
        return paid;
    }

    async markPaidByNumber(organizationId: string, number: number) {
        const invoice = await this.getByNumber(organizationId, number);
        return this.markPaid(organizationId, invoice.id);
    }

    async void(organizationId: string, id: string) {
        const invoice = await this.get(organizationId, id);
        if (invoice.status !== "draft" && invoice.status !== "issued") {
            throw new InvalidInvoiceTransitionError();
        }
        const voided = await this.invoices.transition(organizationId, id, {
            status: "void",
            voidedAt: new Date(),
        });
        if (!voided) throw new InvoiceNotFoundError();
        return voided;
    }

    private async editable(organizationId: string, id: string) {
        const invoice = await this.get(organizationId, id);
        if (invoice.status !== "draft") throw new InvoiceNotEditableError();
        return invoice;
    }
}
