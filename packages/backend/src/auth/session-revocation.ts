import { and, eq } from "drizzle-orm";
import { session } from "../db/schema/auth.schema.ts";
import type { Database } from "../db/factory.ts";

/** Revokes sessions that still hold a removed organization active. */
export async function revokeMemberSessions(
    db: Database,
    params: { userId: string; organizationId: string },
): Promise<number> {
    const revoked = await db
        .delete(session)
        .where(
            and(
                eq(session.userId, params.userId),
                eq(session.activeOrganizationId, params.organizationId),
            ),
        )
        .returning({ id: session.id });
    return revoked.length;
}
