export type MemberRole = "owner" | "admin" | "member";
export const SUPERADMIN_ROLE = "superadmin";

function includesRole(role: string | null | undefined, target: string): boolean {
    return role?.split(",").some((part) => part.trim() === target) ?? false;
}

export function hasRole(role: string, target: MemberRole): boolean {
    return includesRole(role, target);
}

export function isAdmin(role: string): boolean {
    return hasRole(role, "owner") || hasRole(role, "admin");
}

export function isOwner(role: string): boolean {
    return hasRole(role, "owner");
}

export function isSuperadmin(role: string | null | undefined): boolean {
    return includesRole(role, SUPERADMIN_ROLE);
}
