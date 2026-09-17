import { randomUUID } from "node:crypto";
import { ForbiddenError } from "../../errors/base.ts";
import { ProjectArchivedError, ProjectNotFoundError } from "../project/project.errors.ts";
import type { ProjectRepository } from "../project/project.repository.ts";
import { TimeEntryBilledError, TimeEntryNotFoundError } from "./time-entry.errors.ts";
import type { TimeEntryRepository } from "./time-entry.repository.ts";

export interface CreateTimeEntry {
    projectId: string;
    date: string;
    minutes: number;
    note: string;
}

export interface UpdateTimeEntry {
    id: string;
    date: string;
    minutes: number;
    note: string;
}

export class TimeEntryService {
    constructor(
        private readonly entries: TimeEntryRepository,
        private readonly projects: ProjectRepository,
    ) {}

    async listForProject(organizationId: string, projectId: string) {
        if (!(await this.projects.findById(organizationId, projectId))) {
            throw new ProjectNotFoundError();
        }
        return this.entries.listForProject(organizationId, projectId);
    }

    listMine(organizationId: string, userId: string, from: string, to: string) {
        return this.entries.listMine(organizationId, userId, from, to);
    }

    async create(organizationId: string, userId: string, input: CreateTimeEntry) {
        const project = await this.projects.findById(organizationId, input.projectId);
        if (!project) throw new ProjectNotFoundError();
        if (project.status === "archived") throw new ProjectArchivedError();
        const author = await this.entries.findMember(organizationId, userId);
        if (!author) throw new ForbiddenError();
        const created = await this.entries.create({
            id: randomUUID(),
            organizationId,
            authorId: author.userId,
            ...input,
        });
        return {
            ...created,
            projectName: project.name,
            projectSlug: project.slug,
            clientName: project.clientName,
            authorName: author.name,
        };
    }

    async update(organizationId: string, input: UpdateTimeEntry) {
        const current = await this.entries.find(organizationId, input.id);
        if (!current) throw new TimeEntryNotFoundError();
        if (current.lineItemId !== null) throw new TimeEntryBilledError();
        return this.entries.requireUpdate(organizationId, input.id, {
            date: input.date,
            minutes: input.minutes,
            note: input.note,
        });
    }

    async delete(organizationId: string, id: string) {
        const current = await this.entries.find(organizationId, id);
        if (!current) throw new TimeEntryNotFoundError();
        if (current.lineItemId !== null) throw new TimeEntryBilledError();
        await this.entries.requireDelete(organizationId, id);
        return { success: true as const };
    }
}
