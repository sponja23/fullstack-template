import type { AnyTRPCRouter } from "@trpc/server";
import { toSession } from "../auth/session.ts";
import { hasSuperadminRole } from "../auth/superadmin.ts";
import { ForbiddenError, UnauthenticatedError } from "../errors/base.ts";
import type { BaseProcedure, RouterBuilder } from "./init.ts";

export class NotSuperadminError extends ForbiddenError {
    readonly errorCode = "NOT_SUPERADMIN" as const;
    constructor(readonly userId: string) {
        super(`User ${userId} is not a superadmin`);
    }
}

export function buildSuperadminProcedures(baseProcedure: BaseProcedure) {
    const superadminProcedure = baseProcedure.use(async ({ ctx: { auth, headers }, next }) => {
        const authSession = await auth.api.getSession({ headers });
        if (!authSession) throw new UnauthenticatedError();
        const session = toSession(authSession);
        if (!hasSuperadminRole(session.user.role)) {
            throw new NotSuperadminError(session.user.id);
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
