import type { AnyTRPCRouter } from "@trpc/server";
import { toOrgSession, toSession } from "../auth/session.ts";
import { BadRequestError, UnauthenticatedError } from "../errors/base.ts";
import type { BaseProcedure, RouterBuilder } from "./init.ts";

export class NoActiveOrganizationError extends BadRequestError {
    readonly errorCode = "NO_ACTIVE_ORGANIZATION" as const;
    constructor() {
        super("Select an organization first");
    }
}

export function buildUserProcedures(baseProcedure: BaseProcedure) {
    const authProcedure = baseProcedure.use(async ({ ctx: { auth, headers }, next }) => {
        const authSession = await auth.api.getSession({ headers });
        if (!authSession) throw new UnauthenticatedError();
        return next({ ctx: { session: toSession(authSession) } });
    });
    const orgProcedure = baseProcedure.use(async ({ ctx: { auth, headers }, next }) => {
        const authSession = await auth.api.getSession({ headers });
        if (!authSession) throw new UnauthenticatedError();
        const session = toSession(authSession);
        const organizationId = session.session.activeOrganizationId;
        if (!organizationId) throw new NoActiveOrganizationError();
        return next({ ctx: { session: toOrgSession(session, organizationId) } });
    });
    return { authProcedure, orgProcedure };
}

export type UserProcedures = ReturnType<typeof buildUserProcedures>;
export type AuthProcedure = UserProcedures["authProcedure"];
export type OrgProcedure = UserProcedures["orgProcedure"];
export interface UserRouterContext {
    router: RouterBuilder;
    authProcedure: AuthProcedure;
    orgProcedure: OrgProcedure;
}
export type UserRouterBuilder<TDeps extends UserRouterContext> = (deps: TDeps) => AnyTRPCRouter;
