import {
    createProjectInputSchema,
    idInputSchema,
    listProjectsInputSchema,
    projectRefInputSchema,
    updateProjectInputSchema,
} from "@repo/protocol";
import type { UserRouterBuilder, UserRouterContext } from "../../trpc/user.procedures.ts";
import type { ProjectService } from "./project.service.ts";

interface ProjectRouterDeps extends UserRouterContext {
    projectService: ProjectService;
}

export const projectUserRouter = (({ router, orgProcedure, projectService }) =>
    router({
        list: orgProcedure
            .input(listProjectsInputSchema)
            .query(({ ctx, input }) =>
                projectService.list(ctx.session.organizationId, input?.clientId),
            ),
        get: orgProcedure
            .input(projectRefInputSchema)
            .query(({ ctx, input }) => projectService.get(ctx.session.organizationId, input.slug)),
        create: orgProcedure
            .input(createProjectInputSchema)
            .mutation(({ ctx, input }) => projectService.create(ctx.session.organizationId, input)),
        update: orgProcedure
            .input(updateProjectInputSchema)
            .mutation(({ ctx, input }) => projectService.update(ctx.session.organizationId, input)),
        archive: orgProcedure
            .input(idInputSchema)
            .mutation(({ ctx, input }) =>
                projectService.archive(ctx.session.organizationId, input.id),
            ),
    })) satisfies UserRouterBuilder<ProjectRouterDeps>;
