import { randomUUID } from "node:crypto";
import type { Currency } from "../../db/schema/index.ts";
import { ClientNotFoundError } from "./client.errors.ts";
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

    update(organizationId: string, input: UpdateClient) {
        return this.clients.requireUpdate(organizationId, input.id, {
            name: input.name,
            billingEmail: input.billingEmail,
        });
    }

    archive(organizationId: string, id: string) {
        return this.clients.requireArchive(organizationId, id);
    }
}
