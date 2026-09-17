import { and, asc, eq } from "drizzle-orm";
import { withConstraintErrors } from "../../db/constraint-errors.ts";
import type { DatabaseExecutor } from "../../db/factory.ts";
import { DatabaseRepository } from "../../db/repository.ts";
import { client, clientNameUnique, type Currency } from "../../db/schema/index.ts";
import { ClientNameTakenError, ClientNotFoundError } from "./client.errors.ts";

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
        const [row] = await withConstraintErrors(
            () => executor.insert(client).values(values).returning(),
            { [clientNameUnique]: (cause) => new ClientNameTakenError(cause) },
        );
        if (!row) throw new Error("Client insert returned no row");
        return row;
    }

    async requireUpdate(
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
        if (!row) throw new ClientNotFoundError();
        return row;
    }

    async requireArchive(
        organizationId: string,
        id: string,
        executor: DatabaseExecutor = this.database,
    ) {
        const [row] = await executor
            .update(client)
            .set({ status: "archived", updatedAt: new Date() })
            .where(and(eq(client.organizationId, organizationId), eq(client.id, id)))
            .returning();
        if (!row) throw new ClientNotFoundError();
        return row;
    }
}
