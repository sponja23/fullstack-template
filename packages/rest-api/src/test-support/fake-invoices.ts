import type { InvoiceRecord, InvoicesPort } from "../invoices/invoices.port.ts";

export class FakeInvoices implements InvoicesPort {
    constructor(readonly records: InvoiceRecord[]) {}
    async list() {
        return this.records.map(({ lineItems, ...invoice }) => ({
            ...invoice,
            totalMinor: lineItems.reduce((sum, line) => sum + line.totalMinor, 0),
        }));
    }
    async getByNumber(_organizationId: string, number: number) {
        const invoice = this.records.find((record) => record.number === number);
        if (!invoice) throw new Error("invoice not found");
        return invoice;
    }
    async markPaidByNumber(organizationId: string, number: number) {
        const invoice = await this.getByNumber(organizationId, number);
        invoice.status = "paid";
        invoice.paidAt = new Date("2026-01-03T00:00:00Z");
        return invoice;
    }
}
