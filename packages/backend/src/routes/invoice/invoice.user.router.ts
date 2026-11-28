import {
    addManualLineInputSchema,
    addTimeLinesInputSchema,
    createDraftInvoiceInputSchema,
    idInputSchema,
    invoiceRefInputSchema,
    listInvoicesInputSchema,
    removeLineInputSchema,
} from "@repo/protocol";
import type { UserRouterBuilder, UserRouterContext } from "../../trpc/user.procedures.ts";
import type { InvoiceService } from "./invoice.service.ts";

export interface InvoiceRouterDeps extends UserRouterContext {
    invoiceService: InvoiceService;
}

export const invoiceUserRouter = (({ router, orgProcedure, invoiceService }) =>
    router({
        list: orgProcedure
            .input(listInvoicesInputSchema)
            .query(({ ctx, input }) =>
                invoiceService.list(ctx.session.organizationId, input?.status),
            ),
        get: orgProcedure
            .input(idInputSchema)
            .query(({ ctx, input }) => invoiceService.get(ctx.session.organizationId, input.id)),
        createDraft: orgProcedure
            .input(createDraftInvoiceInputSchema)
            .mutation(({ ctx, input }) =>
                invoiceService.createDraft(ctx.session.organizationId, input.clientId),
            ),
        listUnbilledEntries: orgProcedure
            .input(invoiceRefInputSchema)
            .query(({ ctx, input }) =>
                invoiceService.listUnbilledEntries(ctx.session.organizationId, input.invoiceId),
            ),
        addManualLine: orgProcedure
            .input(addManualLineInputSchema)
            .mutation(({ ctx, input }) =>
                invoiceService.addManualLine(ctx.session.organizationId, input),
            ),
        addTimeLines: orgProcedure
            .input(addTimeLinesInputSchema)
            .mutation(({ ctx, input }) =>
                invoiceService.addTimeLines(
                    ctx.session.organizationId,
                    input.invoiceId,
                    input.entryIds,
                ),
            ),
        removeLine: orgProcedure
            .input(removeLineInputSchema)
            .mutation(({ ctx, input }) =>
                invoiceService.removeLine(
                    ctx.session.organizationId,
                    input.invoiceId,
                    input.lineItemId,
                ),
            ),
        issue: orgProcedure
            .input(idInputSchema)
            .mutation(({ ctx, input }) =>
                invoiceService.issue(ctx.session.organizationId, input.id),
            ),
        markPaid: orgProcedure
            .input(idInputSchema)
            .mutation(({ ctx, input }) =>
                invoiceService.markPaid(ctx.session.organizationId, input.id),
            ),
        void: orgProcedure
            .input(idInputSchema)
            .mutation(({ ctx, input }) =>
                invoiceService.void(ctx.session.organizationId, input.id),
            ),
    })) satisfies UserRouterBuilder<InvoiceRouterDeps>;
