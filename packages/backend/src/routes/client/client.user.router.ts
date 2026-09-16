import { z } from "zod";
import { currencies } from "../../db/schema/index.ts";
import { nameSchema } from "../../lib/identifiers.ts";
import type { UserRouterBuilder, UserRouterContext } from "../../trpc/user.procedures.ts";
import type { ClientService } from "./client.service.ts";

const idInput = z.object({ id: z.string().uuid() });
const clientCreateInput = z.object({
    name: nameSchema,
    billingEmail: z.string().trim().email(),
    currency: z.enum(currencies),
});
const clientUpdateInput = idInput.extend({
    name: nameSchema,
    billingEmail: z.string().trim().email(),
});

interface ClientRouterDeps extends UserRouterContext {
    clientService: ClientService;
}

export const clientUserRouter = (({ router, orgProcedure, clientService }) =>
    router({
        list: orgProcedure.query(({ ctx }) => clientService.list(ctx.session.organizationId)),
        get: orgProcedure
            .input(idInput)
            .query(({ ctx, input }) => clientService.get(ctx.session.organizationId, input.id)),
        create: orgProcedure
            .input(clientCreateInput)
            .mutation(({ ctx, input }) => clientService.create(ctx.session.organizationId, input)),
        update: orgProcedure
            .input(clientUpdateInput)
            .mutation(({ ctx, input }) => clientService.update(ctx.session.organizationId, input)),
        archive: orgProcedure
            .input(idInput)
            .mutation(({ ctx, input }) =>
                clientService.archive(ctx.session.organizationId, input.id),
            ),
    })) satisfies UserRouterBuilder<ClientRouterDeps>;
