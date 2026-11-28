import { createClientInputSchema, idInputSchema, updateClientInputSchema } from "@repo/protocol";
import type { UserRouterBuilder, UserRouterContext } from "../../trpc/user.procedures.ts";
import type { ClientService } from "./client.service.ts";

interface ClientRouterDeps extends UserRouterContext {
    clientService: ClientService;
}

export const clientUserRouter = (({ router, orgProcedure, clientService }) =>
    router({
        list: orgProcedure.query(({ ctx }) => clientService.list(ctx.session.organizationId)),
        get: orgProcedure
            .input(idInputSchema)
            .query(({ ctx, input }) => clientService.get(ctx.session.organizationId, input.id)),
        create: orgProcedure
            .input(createClientInputSchema)
            .mutation(({ ctx, input }) => clientService.create(ctx.session.organizationId, input)),
        update: orgProcedure
            .input(updateClientInputSchema)
            .mutation(({ ctx, input }) => clientService.update(ctx.session.organizationId, input)),
        archive: orgProcedure
            .input(idInputSchema)
            .mutation(({ ctx, input }) =>
                clientService.archive(ctx.session.organizationId, input.id),
            ),
    })) satisfies UserRouterBuilder<ClientRouterDeps>;
