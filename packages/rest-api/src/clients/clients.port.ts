import type { Currency } from "@repo/backend";

export interface ClientRecord {
    id: string;
    name: string;
    billingEmail: string;
    currency: Currency;
    status: "active" | "archived";
    createdAt: Date;
    updatedAt: Date;
}

export interface ClientsPort {
    list(organizationId: string): Promise<ClientRecord[]>;
    get(organizationId: string, id: string): Promise<ClientRecord>;
}
