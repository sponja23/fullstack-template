import type { AnyTRPCRouter } from "@trpc/server";
import { toOrgSession, toSession } from "../auth/session.ts";
import { BadRequestError, UnauthorizedError } from "../errors/base.ts";
import type { BaseProcedure, RouterBuilder } from "./init.ts";

export function buildUserProcedures(baseProcedure: BaseProcedure) {
    const authProcedure = baseProcedure.use(async ({ ctx: { auth, headers }, next }) => {
        const authSession = await auth.api.getSession({ headers });
        if (!authSession) throw new UnauthorizedError();
        return next({ ctx: { session: toSession(authSession) } });
    });
    const orgProcedure = baseProcedure.use(async ({ ctx: { auth, headers }, next }) => {
        const authSession = await auth.api.getSession({ headers });
        if (!authSession) throw new UnauthorizedError();
        const session = toSession(authSession);
        const organizationId = session.session.activeOrganizationId;
        if (!organizationId) throw new BadRequestError("Select an organization first.");
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
