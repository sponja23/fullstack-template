import type { BetterAuthSession } from "./factory.ts";

export interface Session {
    user: BetterAuthSession["user"];
    session: BetterAuthSession["session"];
}

export interface OrgSession extends Session {
    organizationId: string;
}

export function toSession(authSession: BetterAuthSession): Session {
    return { user: authSession.user, session: authSession.session };
}

export function toOrgSession(session: Session, organizationId: string): OrgSession {
    return { ...session, organizationId };
}
