import type { ClientStatus, Currency } from "@repo/protocol";

export interface ClientRecord {
    id: string;
    name: string;
    billingEmail: string;
    currency: Currency;
    status: ClientStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface ClientsPort {
    list(organizationId: string): Promise<ClientRecord[]>;
    get(organizationId: string, id: string): Promise<ClientRecord>;
}
