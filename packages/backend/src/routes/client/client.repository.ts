import { and, asc, eq } from "drizzle-orm";
import type { DatabaseExecutor } from "../../db/factory.ts";
import { DatabaseRepository } from "../../db/repository.ts";
import { client, type Currency } from "../../db/schema/index.ts";

export interface CreateClientRecord {
    id: string;
    organizationId: string;
    name: string;
    billingEmail: string;
    currency: Currency;
}

export interface UpdateClientRecord {
    name: string;
    billingEmail: string;
}

export class ClientRepository extends DatabaseRepository {
    list(organizationId: string, executor: DatabaseExecutor = this.database) {
        return executor
            .select()
            .from(client)
            .where(eq(client.organizationId, organizationId))
            .orderBy(asc(client.name));
    }

    async find(organizationId: string, id: string, executor: DatabaseExecutor = this.database) {
        const [row] = await executor
            .select()
            .from(client)
            .where(and(eq(client.organizationId, organizationId), eq(client.id, id)))
            .limit(1);
        return row;
    }

    async create(values: CreateClientRecord, executor: DatabaseExecutor = this.database) {
        const [row] = await executor.insert(client).values(values).returning();
        return row;
    }

    async update(
        organizationId: string,
        id: string,
        values: UpdateClientRecord,
        executor: DatabaseExecutor = this.database,
    ) {
        const [row] = await executor
            .update(client)
            .set({ ...values, updatedAt: new Date() })
            .where(and(eq(client.organizationId, organizationId), eq(client.id, id)))
            .returning();
        return row;
    }

    async archive(organizationId: string, id: string, executor: DatabaseExecutor = this.database) {
        const [row] = await executor
            .update(client)
            .set({ status: "archived", updatedAt: new Date() })
            .where(and(eq(client.organizationId, organizationId), eq(client.id, id)))
            .returning();
        return row;
    }
}
