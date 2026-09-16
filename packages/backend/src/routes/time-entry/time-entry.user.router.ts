import { z } from "zod";
import type { UserRouterBuilder, UserRouterContext } from "../../trpc/user.procedures.ts";
import type { TimeEntryService } from "./time-entry.service.ts";

const idInput = z.object({ id: z.string().uuid() });
const dateSchema = z.string().date();
const timeValues = z.object({
    date: dateSchema,
    minutes: z.number().int().positive(),
    note: z.string().trim().max(1_000),
});

export interface TimeEntryRouterDeps extends UserRouterContext {
    timeEntryService: TimeEntryService;
}

export const timeEntryUserRouter = ((deps: TimeEntryRouterDeps) => {
    const { router, orgProcedure, timeEntryService } = deps;
    return router({
        listForProject: orgProcedure
            .input(z.object({ projectId: z.string().uuid() }))
            .query(({ ctx, input }) =>
                timeEntryService.listForProject(ctx.session.organizationId, input.projectId),
            ),
        listMine: orgProcedure
            .input(z.object({ from: dateSchema, to: dateSchema }))
            .query(({ ctx, input }) =>
                timeEntryService.listMine(
                    ctx.session.organizationId,
                    ctx.session.user.id,
                    input.from,
                    input.to,
                ),
            ),
        create: orgProcedure
            .input(timeValues.extend({ projectId: z.string().uuid() }))
            .mutation(({ ctx, input }) =>
                timeEntryService.create(ctx.session.organizationId, ctx.session.user.id, input),
            ),
        update: orgProcedure
            .input(timeValues.extend({ id: z.string().uuid() }))
            .mutation(({ ctx, input }) =>
                timeEntryService.update(ctx.session.organizationId, input),
            ),
        delete: orgProcedure
            .input(idInput)
            .mutation(({ ctx, input }) =>
                timeEntryService.delete(ctx.session.organizationId, input.id),
            ),
    });
}) satisfies UserRouterBuilder<TimeEntryRouterDeps>;
