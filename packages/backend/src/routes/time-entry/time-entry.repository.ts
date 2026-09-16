import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import type { DatabaseExecutor } from "../../db/factory.ts";
import { DatabaseRepository } from "../../db/repository.ts";
import { client, member, project, timeEntry, user } from "../../db/schema/index.ts";

export interface CreateTimeEntryRecord {
    id: string;
    organizationId: string;
    projectId: string;
    authorId: string;
    date: string;
    minutes: number;
    note: string;
}

export interface UpdateTimeEntryRecord {
    date: string;
    minutes: number;
    note: string;
}

const selection = {
    id: timeEntry.id,
    organizationId: timeEntry.organizationId,
    projectId: timeEntry.projectId,
    authorId: timeEntry.authorId,
    date: timeEntry.date,
    minutes: timeEntry.minutes,
    note: timeEntry.note,
    lineItemId: timeEntry.lineItemId,
    createdAt: timeEntry.createdAt,
    updatedAt: timeEntry.updatedAt,
    projectName: project.name,
    projectSlug: project.slug,
    clientName: client.name,
    authorName: user.name,
};

export class TimeEntryRepository extends DatabaseRepository {
    async findMember(
        organizationId: string,
        userId: string,
        executor: DatabaseExecutor = this.database,
    ) {
        const [row] = await executor
            .select({ id: member.id })
            .from(member)
            .where(and(eq(member.organizationId, organizationId), eq(member.userId, userId)))
            .limit(1);
        return row;
    }

    listForProject(
        organizationId: string,
        projectId: string,
        executor: DatabaseExecutor = this.database,
    ) {
        return this.baseSelect(executor)
            .where(
                and(
                    eq(timeEntry.organizationId, organizationId),
                    eq(timeEntry.projectId, projectId),
                ),
            )
            .orderBy(desc(timeEntry.date), desc(timeEntry.createdAt));
    }

    listMine(
        organizationId: string,
        userId: string,
        from: string,
        to: string,
        executor: DatabaseExecutor = this.database,
    ) {
        return this.baseSelect(executor)
            .where(
                and(
                    eq(timeEntry.organizationId, organizationId),
                    eq(member.userId, userId),
                    gte(timeEntry.date, from),
                    lte(timeEntry.date, to),
                ),
            )
            .orderBy(asc(timeEntry.date), asc(timeEntry.createdAt));
    }

    async find(organizationId: string, id: string, executor: DatabaseExecutor = this.database) {
        const [row] = await this.baseSelect(executor)
            .where(and(eq(timeEntry.organizationId, organizationId), eq(timeEntry.id, id)))
            .limit(1);
        return row;
    }

    async create(values: CreateTimeEntryRecord, executor: DatabaseExecutor = this.database) {
        const [created] = await executor
            .insert(timeEntry)
            .values(values)
            .returning({ id: timeEntry.id });
        return created && this.find(values.organizationId, created.id, executor);
    }

    async update(
        organizationId: string,
        id: string,
        values: UpdateTimeEntryRecord,
        executor: DatabaseExecutor = this.database,
    ) {
        const [updated] = await executor
            .update(timeEntry)
            .set({ ...values, updatedAt: new Date() })
            .where(and(eq(timeEntry.organizationId, organizationId), eq(timeEntry.id, id)))
            .returning({ id: timeEntry.id });
        return updated && this.find(organizationId, updated.id, executor);
    }

    async delete(organizationId: string, id: string, executor: DatabaseExecutor = this.database) {
        const [deleted] = await executor
            .delete(timeEntry)
            .where(and(eq(timeEntry.organizationId, organizationId), eq(timeEntry.id, id)))
            .returning({ id: timeEntry.id });
        return deleted;
    }

    private baseSelect(executor: DatabaseExecutor) {
        return executor
            .select(selection)
            .from(timeEntry)
            .innerJoin(project, eq(timeEntry.projectId, project.id))
            .innerJoin(client, eq(project.clientId, client.id))
            .innerJoin(member, eq(timeEntry.authorId, member.id))
            .innerJoin(user, eq(member.userId, user.id));
    }
}
