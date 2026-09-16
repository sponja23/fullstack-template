import type { Currency, InvoiceStatus, LineItemKind } from "@repo/backend";

export interface InvoiceLineRecord {
    id: string;
    kind: LineItemKind;
    description: string;
    quantity: number;
    unitAmountMinor: number;
    totalMinor: number;
}

export interface InvoiceRecord {
    id: string;
    clientId: string;
    clientName: string;
    billingEmail: string;
    currency: Currency;
    number: number | null;
    status: InvoiceStatus;
    issuedAt: Date | null;
    paidAt: Date | null;
    voidedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    lineItems: InvoiceLineRecord[];
}

export interface InvoiceSummaryRecord extends Omit<InvoiceRecord, "lineItems"> {
    totalMinor: number;
}

export interface InvoicesPort {
    list(organizationId: string, status?: InvoiceStatus): Promise<InvoiceSummaryRecord[]>;
    getByNumber(organizationId: string, number: number): Promise<InvoiceRecord>;
    markPaidByNumber(organizationId: string, number: number): Promise<InvoiceRecord>;
}
