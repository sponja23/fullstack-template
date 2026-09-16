import { useUser } from "@/lib/queries/auth.queries";
import { useActiveOrganizationMembers } from "@/lib/queries/organizations.queries";
import { isAdmin } from "@/lib/role";

export function useManageableOrgId(): string | null {
    const { user, activeOrganizationId } = useUser();
    const { data } = useActiveOrganizationMembers();
    const role = data?.members.find((member) => member.userId === user.id)?.role;
    return role != null && isAdmin(role) ? activeOrganizationId : null;
}
