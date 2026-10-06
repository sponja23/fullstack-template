import { and, asc, eq } from "drizzle-orm";
import { withConstraintErrors } from "../../db/constraint-errors.ts";
import { DatabaseRepository } from "../../db/repository.ts";
import { client, project, projectSlugUnique } from "../../db/schema/index.ts";
import {
    ProjectInvariantError,
    ProjectNotFoundError,
    ProjectSlugTakenError,
} from "./project.errors.ts";

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
    list(organizationId: string, clientId?: string) {
        return this.database
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

    async findById(organizationId: string, id: string) {
        const [row] = await this.database
            .select(selection)
            .from(project)
            .innerJoin(client, eq(project.clientId, client.id))
            .where(and(eq(project.organizationId, organizationId), eq(project.id, id)))
            .limit(1);
        return row;
    }

    async findBySlug(organizationId: string, slug: string) {
        const [row] = await this.database
            .select(selection)
            .from(project)
            .innerJoin(client, eq(project.clientId, client.id))
            .where(and(eq(project.organizationId, organizationId), eq(project.slug, slug)))
            .limit(1);
        return row;
    }

    async create(values: CreateProjectRecord) {
        const [created] = await withConstraintErrors(
            () => this.database.insert(project).values(values).returning(),
            { [projectSlugUnique]: (cause) => new ProjectSlugTakenError(cause) },
        );
        if (!created) throw new ProjectInvariantError("insert returned no row");
        return created;
    }

    async requireUpdate(organizationId: string, id: string, values: UpdateProjectRecord) {
        const [updated] = await this.database
            .update(project)
            .set({ ...values, updatedAt: new Date() })
            .where(and(eq(project.organizationId, organizationId), eq(project.id, id)))
            .returning({ id: project.id });
        if (!updated) throw new ProjectNotFoundError();
        const projectRow = await this.findById(organizationId, updated.id);
        if (!projectRow) throw new ProjectNotFoundError();
        return projectRow;
    }

    async requireArchive(organizationId: string, id: string) {
        const [updated] = await this.database
            .update(project)
            .set({ status: "archived", updatedAt: new Date() })
            .where(and(eq(project.organizationId, organizationId), eq(project.id, id)))
            .returning({ id: project.id });
        if (!updated) throw new ProjectNotFoundError();
        const projectRow = await this.findById(organizationId, updated.id);
        if (!projectRow) throw new ProjectNotFoundError();
        return projectRow;
    }
}
