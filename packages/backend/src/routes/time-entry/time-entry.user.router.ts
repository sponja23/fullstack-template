import {
    createTimeEntryInputSchema,
    idInputSchema,
    listMyTimeEntriesInputSchema,
    listProjectTimeEntriesInputSchema,
    updateTimeEntryInputSchema,
} from "@repo/protocol";
import type { UserRouterBuilder, UserRouterContext } from "../../trpc/user.procedures.ts";
import type { TimeEntryService } from "./time-entry.service.ts";

export interface TimeEntryRouterDeps extends UserRouterContext {
    timeEntryService: TimeEntryService;
}

export const timeEntryUserRouter = ((deps: TimeEntryRouterDeps) => {
    const { router, orgProcedure, timeEntryService } = deps;
    return router({
        listForProject: orgProcedure
            .input(listProjectTimeEntriesInputSchema)
            .query(({ ctx, input }) =>
                timeEntryService.listForProject(ctx.session.organizationId, input.projectId),
            ),
        listMine: orgProcedure
            .input(listMyTimeEntriesInputSchema)
            .query(({ ctx, input }) =>
                timeEntryService.listMine(
                    ctx.session.organizationId,
                    ctx.session.user.id,
                    input.from,
                    input.to,
                ),
            ),
        create: orgProcedure
            .input(createTimeEntryInputSchema)
            .mutation(({ ctx, input }) =>
                timeEntryService.create(ctx.session.organizationId, ctx.session.user.id, input),
            ),
        update: orgProcedure
            .input(updateTimeEntryInputSchema)
            .mutation(({ ctx, input }) =>
                timeEntryService.update(ctx.session.organizationId, input),
            ),
        delete: orgProcedure
            .input(idInputSchema)
            .mutation(({ ctx, input }) =>
                timeEntryService.delete(ctx.session.organizationId, input.id),
            ),
    });
}) satisfies UserRouterBuilder<TimeEntryRouterDeps>;
