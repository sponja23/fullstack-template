import { randomUUID } from "node:crypto";
import type { ClientRepository } from "../client/client.repository.ts";
import { ClientNotFoundError } from "../client/client.errors.ts";
import { ProjectNotFoundError } from "./project.errors.ts";
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
        const client = await this.clients.find(organizationId, input.clientId);
        if (!client) throw new ClientNotFoundError();
        const created = await this.projects.create({
            id: randomUUID(),
            organizationId,
            ...input,
        });
        return { ...created, clientName: client.name, currency: client.currency };
    }

    update(organizationId: string, input: UpdateProject) {
        return this.projects.requireUpdate(organizationId, input.id, {
            name: input.name,
            slug: input.slug,
            rateMinor: input.rateMinor,
        });
    }

    archive(organizationId: string, id: string) {
        return this.projects.requireArchive(organizationId, id);
    }
}
