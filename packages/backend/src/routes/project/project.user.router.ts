import { z } from "zod";
import { nameSchema, slugSchema } from "../../lib/identifiers.ts";
import type { UserRouterBuilder, UserRouterContext } from "../../trpc/user.procedures.ts";
import type { ProjectService } from "./project.service.ts";

const idInput = z.object({ id: z.string().uuid() });
const projectCreateInput = z.object({
    clientId: z.string().uuid(),
    name: nameSchema,
    slug: slugSchema,
    rateMinor: z.number().int().nonnegative(),
});
const projectUpdateInput = idInput.extend({
    name: nameSchema,
    slug: slugSchema,
    rateMinor: z.number().int().nonnegative(),
});

interface ProjectRouterDeps extends UserRouterContext {
    projectService: ProjectService;
}

export const projectUserRouter = (({ router, orgProcedure, projectService }) =>
    router({
        list: orgProcedure
            .input(z.object({ clientId: z.string().uuid().optional() }).optional())
            .query(({ ctx, input }) =>
                projectService.list(ctx.session.organizationId, input?.clientId),
            ),
        get: orgProcedure
            .input(z.object({ slug: slugSchema }))
            .query(({ ctx, input }) => projectService.get(ctx.session.organizationId, input.slug)),
        create: orgProcedure
            .input(projectCreateInput)
            .mutation(({ ctx, input }) => projectService.create(ctx.session.organizationId, input)),
        update: orgProcedure
            .input(projectUpdateInput)
            .mutation(({ ctx, input }) => projectService.update(ctx.session.organizationId, input)),
        archive: orgProcedure
            .input(idInput)
            .mutation(({ ctx, input }) =>
                projectService.archive(ctx.session.organizationId, input.id),
            ),
    })) satisfies UserRouterBuilder<ProjectRouterDeps>;
