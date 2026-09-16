import { z } from "zod";
import { invoiceStatuses } from "../../db/schema/index.ts";
import type { UserRouterBuilder, UserRouterContext } from "../../trpc/user.procedures.ts";
import type { InvoiceService } from "./invoice.service.ts";

const id = z.string().uuid();

export interface InvoiceRouterDeps extends UserRouterContext {
    invoiceService: InvoiceService;
}

export const invoiceUserRouter = (({ router, orgProcedure, invoiceService }) =>
    router({
        list: orgProcedure
            .input(z.object({ status: z.enum(invoiceStatuses).optional() }).optional())
            .query(({ ctx, input }) =>
                invoiceService.list(ctx.session.organizationId, input?.status),
            ),
        get: orgProcedure
            .input(z.object({ id }))
            .query(({ ctx, input }) => invoiceService.get(ctx.session.organizationId, input.id)),
        createDraft: orgProcedure
            .input(z.object({ clientId: id }))
            .mutation(({ ctx, input }) =>
                invoiceService.createDraft(ctx.session.organizationId, input.clientId),
            ),
        listUnbilledEntries: orgProcedure
            .input(z.object({ invoiceId: id }))
            .query(({ ctx, input }) =>
                invoiceService.listUnbilledEntries(ctx.session.organizationId, input.invoiceId),
            ),
        addManualLine: orgProcedure
            .input(
                z.object({
                    invoiceId: id,
                    description: z.string().trim().min(1).max(1_000),
                    quantity: z.number().int().positive(),
                    unitAmountMinor: z.number().int().nonnegative(),
                }),
            )
            .mutation(({ ctx, input }) =>
                invoiceService.addManualLine(ctx.session.organizationId, input),
            ),
        addTimeLines: orgProcedure
            .input(z.object({ invoiceId: id, entryIds: z.array(id).min(1) }))
            .mutation(({ ctx, input }) =>
                invoiceService.addTimeLines(
                    ctx.session.organizationId,
                    input.invoiceId,
                    input.entryIds,
                ),
            ),
        removeLine: orgProcedure
            .input(z.object({ invoiceId: id, lineItemId: id }))
            .mutation(({ ctx, input }) =>
                invoiceService.removeLine(
                    ctx.session.organizationId,
                    input.invoiceId,
                    input.lineItemId,
                ),
            ),
        issue: orgProcedure
            .input(z.object({ id }))
            .mutation(({ ctx, input }) =>
                invoiceService.issue(ctx.session.organizationId, input.id),
            ),
        markPaid: orgProcedure
            .input(z.object({ id }))
            .mutation(({ ctx, input }) =>
                invoiceService.markPaid(ctx.session.organizationId, input.id),
            ),
        void: orgProcedure
            .input(z.object({ id }))
            .mutation(({ ctx, input }) =>
                invoiceService.void(ctx.session.organizationId, input.id),
            ),
    })) satisfies UserRouterBuilder<InvoiceRouterDeps>;
