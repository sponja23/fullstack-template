import { randomUUID } from "node:crypto";
import type { Currency } from "../../db/schema/index.ts";
import { ClientNameTakenError, ClientNotFoundError } from "../invoicing/invoicing.errors.ts";
import type { ClientRepository } from "./client.repository.ts";

export interface CreateClient {
    name: string;
    billingEmail: string;
    currency: Currency;
}

export interface UpdateClient {
    id: string;
    name: string;
    billingEmail: string;
}

export class ClientService {
    constructor(private readonly clients: ClientRepository) {}

    list(organizationId: string) {
        return this.clients.list(organizationId);
    }

    async get(organizationId: string, id: string) {
        const client = await this.clients.find(organizationId, id);
        if (!client) throw new ClientNotFoundError();
        return client;
    }

    create(organizationId: string, input: CreateClient) {
        return this.clients.create({ id: randomUUID(), organizationId, ...input });
    }

    async update(organizationId: string, input: UpdateClient) {
        const client = await this.clients.update(organizationId, input.id, {
            name: input.name,
            billingEmail: input.billingEmail,
        });
        if (!client) throw new ClientNotFoundError();
        return client;
    }

    async archive(organizationId: string, id: string) {
        const client = await this.clients.archive(organizationId, id);
        if (!client) throw new ClientNotFoundError();
        return client;
    }
}

export { ClientNameTakenError };
