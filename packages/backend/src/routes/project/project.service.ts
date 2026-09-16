import { randomUUID } from "node:crypto";
import type { ClientRepository } from "../client/client.repository.ts";
import {
    ClientNotFoundError,
    ProjectNotFoundError,
    ProjectSlugTakenError,
} from "../invoicing/invoicing.errors.ts";
import type { ProjectRepository } from "./project.repository.ts";

export interface CreateProject {
    clientId: string;
    name: string;
    slug: string;
    rateMinor: number;
}

export interface UpdateProject {
    id: string;
    name: string;
    slug: string;
    rateMinor: number;
}

export class ProjectService {
    constructor(
        private readonly projects: ProjectRepository,
        private readonly clients: ClientRepository,
    ) {}

    list(organizationId: string, clientId?: string) {
        return this.projects.list(organizationId, clientId);
    }

    async get(organizationId: string, slug: string) {
        const project = await this.projects.findBySlug(organizationId, slug);
        if (!project) throw new ProjectNotFoundError();
        return project;
    }

    async create(organizationId: string, input: CreateProject) {
        if (!(await this.clients.find(organizationId, input.clientId))) {
            throw new ClientNotFoundError();
        }
        const created = await this.projects.create({
            id: randomUUID(),
            organizationId,
            ...input,
        });
        if (!created) throw new ProjectNotFoundError();
        return created;
    }

    async update(organizationId: string, input: UpdateProject) {
        const project = await this.projects.update(organizationId, input.id, {
            name: input.name,
            slug: input.slug,
            rateMinor: input.rateMinor,
        });
        if (!project) throw new ProjectNotFoundError();
        return project;
    }

    async archive(organizationId: string, id: string) {
        const project = await this.projects.archive(organizationId, id);
        if (!project) throw new ProjectNotFoundError();
        return project;
    }
}

export { ProjectSlugTakenError };
