import type { AnyTRPCRouter } from "@trpc/server";
import { toSession } from "../auth/session.ts";
import { hasSuperadminRole } from "../auth/superadmin.ts";
import { ForbiddenError, UnauthorizedError } from "../errors/base.ts";
import type { BaseProcedure, RouterBuilder } from "./init.ts";

export function buildSuperadminProcedures(baseProcedure: BaseProcedure) {
    const superadminProcedure = baseProcedure.use(async ({ ctx: { auth, headers }, next }) => {
        const authSession = await auth.api.getSession({ headers });
        if (!authSession) throw new UnauthorizedError();
        const session = toSession(authSession);
        if (!hasSuperadminRole(session.user.role)) {
            throw new ForbiddenError("Superadmin privileges required.");
        }
        return next({ ctx: { session } });
    });
    return { superadminProcedure };
}

export type SuperadminProcedures = ReturnType<typeof buildSuperadminProcedures>;
export type SuperadminProcedure = SuperadminProcedures["superadminProcedure"];
export interface SuperadminRouterContext {
    router: RouterBuilder;
    superadminProcedure: SuperadminProcedure;
}
export type SuperadminRouterBuilder<TDeps extends SuperadminRouterContext> = (
    deps: TDeps,
) => AnyTRPCRouter;
