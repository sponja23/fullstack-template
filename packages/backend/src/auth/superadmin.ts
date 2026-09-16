import { eq } from "drizzle-orm";
import { user } from "../db/schema/auth.schema.ts";
import type { Database } from "../db/factory.ts";

export const SUPERADMIN_ROLE = "superadmin";

export function hasSuperadminRole(role: string | null | undefined): boolean {
    if (!role) return false;
    return role
        .split(",")
        .map((part) => part.trim())
        .includes(SUPERADMIN_ROLE);
}

export interface GrantedSuperadmin {
    id: string;
    email: string;
}

/** Bootstraps the first superadmin without requiring an existing administrator. */
export async function grantSuperadmin(db: Database, email: string): Promise<GrantedSuperadmin> {
    const [granted] = await db
        .update(user)
        .set({ role: SUPERADMIN_ROLE })
        .where(eq(user.email, email))
        .returning({ id: user.id, email: user.email });
    if (!granted) throw new Error(`No user found with email ${email}`);
    return granted;
}
