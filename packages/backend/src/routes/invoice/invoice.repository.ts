import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import type { DatabaseExecutor } from "../../db/factory.ts";
import { DatabaseRepository } from "../../db/repository.ts";
import {
    client,
    invoice,
    invoiceCounter,
    lineItem,
    project,
    timeEntry,
    type Currency,
    type InvoiceStatus,
    type LineItemKind,
} from "../../db/schema/index.ts";
import { InvoiceNotFoundError } from "./invoice.errors.ts";

export interface CreateLineItemRecord {
    id: string;
    invoiceId: string;
    projectId?: string;
    kind: LineItemKind;
    description: string;
    quantity: number;
    unitAmountMinor: number;
    totalMinor: number;
    sourceEntryIds?: string[];
}

const invoiceSelection = {
    id: invoice.id,
    organizationId: invoice.organizationId,
    clientId: invoice.clientId,
    clientName: client.name,
    billingEmail: client.billingEmail,
    currency: invoice.currency,
    number: invoice.number,
    status: invoice.status,
    issuedAt: invoice.issuedAt,
    paidAt: invoice.paidAt,
    voidedAt: invoice.voidedAt,
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
};

export class InvoiceRepository extends DatabaseRepository {
    transaction<T>(callback: (executor: DatabaseExecutor) => Promise<T>) {
        return this.database.transaction(callback);
    }

    list(
        organizationId: string,
        status?: InvoiceStatus,
        executor: DatabaseExecutor = this.database,
    ) {
        return executor
            .select({
                ...invoiceSelection,
                totalMinor: sql<number>`coalesce((select sum(${lineItem.totalMinor}) from ${lineItem} where ${lineItem.invoiceId} = ${invoice.id}), 0)::int`,
            })
            .from(invoice)
            .innerJoin(client, eq(invoice.clientId, client.id))
            .where(
                status
                    ? and(eq(invoice.organizationId, organizationId), eq(invoice.status, status))
                    : eq(invoice.organizationId, organizationId),
            )
            .orderBy(desc(invoice.createdAt));
    }

    async find(organizationId: string, id: string, executor: DatabaseExecutor = this.database) {
        const [row] = await executor
            .select(invoiceSelection)
            .from(invoice)
            .innerJoin(client, eq(invoice.clientId, client.id))
            .where(and(eq(invoice.organizationId, organizationId), eq(invoice.id, id)))
            .limit(1);
        if (!row) return undefined;
        return { ...row, lineItems: await this.listLines(id, executor) };
    }

    async findByNumber(
        organizationId: string,
        number: number,
        executor: DatabaseExecutor = this.database,
    ) {
        const [row] = await executor
            .select(invoiceSelection)
            .from(invoice)
            .innerJoin(client, eq(invoice.clientId, client.id))
            .where(and(eq(invoice.organizationId, organizationId), eq(invoice.number, number)))
            .limit(1);
        if (!row) return undefined;
        return { ...row, lineItems: await this.listLines(row.id, executor) };
    }

    async createDraft(
        values: { id: string; organizationId: string; clientId: string; currency: Currency },
        executor: DatabaseExecutor = this.database,
    ) {
        const [draft] = await executor.insert(invoice).values(values).returning();
        if (!draft) throw new Error("Invoice insert returned no row");
        return draft;
    }

    async addLine(values: CreateLineItemRecord, executor: DatabaseExecutor = this.database) {
        const [row] = await executor.insert(lineItem).values(values).returning();
        return row;
    }

    async removeLine(
        invoiceId: string,
        lineItemId: string,
        executor: DatabaseExecutor = this.database,
    ) {
        const [row] = await executor
            .delete(lineItem)
            .where(and(eq(lineItem.invoiceId, invoiceId), eq(lineItem.id, lineItemId)))
            .returning({ id: lineItem.id });
        return row;
    }

    listUnbilledForClient(
        organizationId: string,
        clientId: string,
        executor: DatabaseExecutor = this.database,
    ) {
        return executor
            .select({
                id: timeEntry.id,
                projectId: project.id,
                projectName: project.name,
                rateMinor: project.rateMinor,
                date: timeEntry.date,
                minutes: timeEntry.minutes,
                note: timeEntry.note,
            })
            .from(timeEntry)
            .innerJoin(project, eq(timeEntry.projectId, project.id))
            .where(
                and(
                    eq(timeEntry.organizationId, organizationId),
                    eq(project.clientId, clientId),
                    isNull(timeEntry.lineItemId),
                ),
            )
            .orderBy(asc(project.name), asc(timeEntry.date));
    }

    findUnbilledEntries(
        organizationId: string,
        ids: string[],
        executor: DatabaseExecutor = this.database,
    ) {
        if (ids.length === 0) return Promise.resolve([]);
        return executor
            .select({
                id: timeEntry.id,
                projectId: project.id,
                projectName: project.name,
                clientId: project.clientId,
                rateMinor: project.rateMinor,
                minutes: timeEntry.minutes,
            })
            .from(timeEntry)
            .innerJoin(project, eq(timeEntry.projectId, project.id))
            .where(
                and(
                    eq(timeEntry.organizationId, organizationId),
                    inArray(timeEntry.id, ids),
                    isNull(timeEntry.lineItemId),
                ),
            );
    }

    async allocateNumber(organizationId: string, executor: DatabaseExecutor) {
        await executor.insert(invoiceCounter).values({ organizationId }).onConflictDoNothing();
        const [row] = await executor
            .update(invoiceCounter)
            .set({ next: sql`${invoiceCounter.next} + 1` })
            .where(eq(invoiceCounter.organizationId, organizationId))
            .returning({ number: invoiceCounter.next });
        if (!row) throw new Error("Invoice counter could not be allocated");
        return row.number;
    }

    async claimEntries(
        organizationId: string,
        itemId: string,
        ids: string[],
        executor: DatabaseExecutor,
    ) {
        if (ids.length === 0) return 0;
        const rows = await executor
            .update(timeEntry)
            .set({ lineItemId: itemId, updatedAt: new Date() })
            .where(
                and(
                    eq(timeEntry.organizationId, organizationId),
                    inArray(timeEntry.id, ids),
                    isNull(timeEntry.lineItemId),
                ),
            )
            .returning({ id: timeEntry.id });
        return rows.length;
    }

    async requireTransition(
        organizationId: string,
        id: string,
        values: Partial<{
            status: InvoiceStatus;
            number: number;
            issuedAt: Date;
            paidAt: Date;
            voidedAt: Date;
        }>,
        executor: DatabaseExecutor = this.database,
    ) {
        const [row] = await executor
            .update(invoice)
            .set({ ...values, updatedAt: new Date() })
            .where(and(eq(invoice.organizationId, organizationId), eq(invoice.id, id)))
            .returning({ id: invoice.id });
        if (!row) throw new InvoiceNotFoundError();
        const transitioned = await this.find(organizationId, row.id, executor);
        if (!transitioned) throw new InvoiceNotFoundError();
        return transitioned;
    }

    private listLines(invoiceId: string, executor: DatabaseExecutor) {
        return executor
            .select()
            .from(lineItem)
            .where(eq(lineItem.invoiceId, invoiceId))
            .orderBy(asc(lineItem.createdAt), asc(lineItem.id));
    }
}
