import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import { DatabaseRepository } from "../../db/repository.ts";
import { client, member, project, timeEntry, user } from "../../db/schema/index.ts";
import { TimeEntryInvariantError, TimeEntryNotFoundError } from "./time-entry.errors.ts";

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
    async findMember(organizationId: string, userId: string) {
        const [row] = await this.database
            .select({ userId: member.userId, name: user.name })
            .from(member)
            .innerJoin(user, eq(member.userId, user.id))
            .where(and(eq(member.organizationId, organizationId), eq(member.userId, userId)))
            .limit(1);
        return row;
    }

    listForProject(organizationId: string, projectId: string) {
        return this.baseSelect()
            .where(
                and(
                    eq(timeEntry.organizationId, organizationId),
                    eq(timeEntry.projectId, projectId),
                ),
            )
            .orderBy(desc(timeEntry.date), desc(timeEntry.createdAt));
    }

    listMine(organizationId: string, userId: string, from: string, to: string) {
        return this.baseSelect()
            .where(
                and(
                    eq(timeEntry.organizationId, organizationId),
                    eq(timeEntry.authorId, userId),
                    gte(timeEntry.date, from),
                    lte(timeEntry.date, to),
                ),
            )
            .orderBy(asc(timeEntry.date), asc(timeEntry.createdAt));
    }

    async find(organizationId: string, id: string) {
        const [row] = await this.baseSelect()
            .where(and(eq(timeEntry.organizationId, organizationId), eq(timeEntry.id, id)))
            .limit(1);
        return row;
    }

    async create(values: CreateTimeEntryRecord) {
        const [created] = await this.database.insert(timeEntry).values(values).returning();
        if (!created) throw new TimeEntryInvariantError("insert returned no row");
        return created;
    }

    async requireUpdate(organizationId: string, id: string, values: UpdateTimeEntryRecord) {
        const [updated] = await this.database
            .update(timeEntry)
            .set({ ...values, updatedAt: new Date() })
            .where(and(eq(timeEntry.organizationId, organizationId), eq(timeEntry.id, id)))
            .returning({ id: timeEntry.id });
        if (!updated) throw new TimeEntryNotFoundError();
        const entry = await this.find(organizationId, updated.id);
        if (!entry) throw new TimeEntryNotFoundError();
        return entry;
    }

    async requireDelete(organizationId: string, id: string) {
        const [deleted] = await this.database
            .delete(timeEntry)
            .where(and(eq(timeEntry.organizationId, organizationId), eq(timeEntry.id, id)))
            .returning({ id: timeEntry.id });
        if (!deleted) throw new TimeEntryNotFoundError();
        return deleted;
    }

    private baseSelect() {
        return this.database
            .select(selection)
            .from(timeEntry)
            .innerJoin(project, eq(timeEntry.projectId, project.id))
            .innerJoin(client, eq(project.clientId, client.id))
            .innerJoin(user, eq(timeEntry.authorId, user.id));
    }
}
