import { and, asc, eq } from "drizzle-orm";
import type { DatabaseExecutor } from "../../db/factory.ts";
import { DatabaseRepository } from "../../db/repository.ts";
import { client, project } from "../../db/schema/index.ts";

export interface CreateProjectRecord {
    id: string;
    organizationId: string;
    clientId: string;
    name: string;
    slug: string;
    rateMinor: number;
}

export interface UpdateProjectRecord {
    name: string;
    slug: string;
    rateMinor: number;
}

const selection = {
    id: project.id,
    organizationId: project.organizationId,
    clientId: project.clientId,
    name: project.name,
    slug: project.slug,
    rateMinor: project.rateMinor,
    status: project.status,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    clientName: client.name,
    currency: client.currency,
};

export class ProjectRepository extends DatabaseRepository {
    list(organizationId: string, clientId?: string, executor: DatabaseExecutor = this.database) {
        return executor
            .select(selection)
            .from(project)
            .innerJoin(client, eq(project.clientId, client.id))
            .where(
                clientId === undefined
                    ? eq(project.organizationId, organizationId)
                    : and(
                          eq(project.organizationId, organizationId),
                          eq(project.clientId, clientId),
                      ),
            )
            .orderBy(asc(project.name));
    }

    async findById(organizationId: string, id: string, executor: DatabaseExecutor = this.database) {
        const [row] = await executor
            .select(selection)
            .from(project)
            .innerJoin(client, eq(project.clientId, client.id))
            .where(and(eq(project.organizationId, organizationId), eq(project.id, id)))
            .limit(1);
        return row;
    }

    async findBySlug(
        organizationId: string,
        slug: string,
        executor: DatabaseExecutor = this.database,
    ) {
        const [row] = await executor
            .select(selection)
            .from(project)
            .innerJoin(client, eq(project.clientId, client.id))
            .where(and(eq(project.organizationId, organizationId), eq(project.slug, slug)))
            .limit(1);
        return row;
    }

    async create(values: CreateProjectRecord, executor: DatabaseExecutor = this.database) {
        const [created] = await executor
            .insert(project)
            .values(values)
            .returning({ id: project.id });
        return created && this.findById(values.organizationId, created.id, executor);
    }

    async update(
        organizationId: string,
        id: string,
        values: UpdateProjectRecord,
        executor: DatabaseExecutor = this.database,
    ) {
        const [updated] = await executor
            .update(project)
            .set({ ...values, updatedAt: new Date() })
            .where(and(eq(project.organizationId, organizationId), eq(project.id, id)))
            .returning({ id: project.id });
        return updated && this.findById(organizationId, updated.id, executor);
    }

    async archive(organizationId: string, id: string, executor: DatabaseExecutor = this.database) {
        const [updated] = await executor
            .update(project)
            .set({ status: "archived", updatedAt: new Date() })
            .where(and(eq(project.organizationId, organizationId), eq(project.id, id)))
            .returning({ id: project.id });
        return updated && this.findById(organizationId, updated.id, executor);
    }
}
