import { type QueryClient, queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth";
import { unwrapAuthResult } from "@/lib/better-auth";
import { lastActiveOrganizationId } from "@/lib/last-active-organization-id";
import { useAPIMutation } from "./api-queries";
import { ensureSessionData, sessionQueryOptions } from "./auth.queries";

function organizationsQueryOptions() {
    return queryOptions({
        queryKey: ["organizations", "list"] as const,
        queryFn: () =>
            unwrapAuthResult(authClient.organization.list(), "Failed to load organizations"),
    });
}

export function useOrganizations() {
    return useQuery(organizationsQueryOptions());
}

export function ensureOrganizationsData(queryClient: QueryClient) {
    return queryClient.ensureQueryData(organizationsQueryOptions());
}

export async function setActiveOrganization(queryClient: QueryClient, organizationId: string) {
    const data = await unwrapAuthResult(
        authClient.organization.setActive({ organizationId }),
        "Failed to switch organization",
    );
    lastActiveOrganizationId.write(organizationId);
    await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
    await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    return data;
}

function activeOrganizationQueryOptions(organizationId: string | null | undefined) {
    return queryOptions({
        queryKey: ["organizations", "active", organizationId] as const,
        enabled: organizationId != null,
        queryFn: () =>
            organizationId == null
                ? null
                : unwrapAuthResult(
                      authClient.organization.getFullOrganization({ query: { organizationId } }),
                      "Failed to load organization",
                  ),
    });
}

export function useActiveOrganization() {
    const session = useQuery(sessionQueryOptions());
    return useQuery(activeOrganizationQueryOptions(session.data?.session.activeOrganizationId));
}

export async function ensureActiveOrganizationData(queryClient: QueryClient) {
    const session = await ensureSessionData(queryClient);
    return queryClient.ensureQueryData(
        activeOrganizationQueryOptions(session?.session.activeOrganizationId),
    );
}

const MEMBERS_PAGE_SIZE = 100;

function organizationMembersQueryOptions(organizationId: string | null | undefined) {
    return queryOptions({
        queryKey: ["organizations", "members", organizationId] as const,
        enabled: organizationId != null,
        queryFn: async () => {
            if (organizationId == null) return null;
            const listPage = async (offset: number) =>
                unwrapAuthResult(
                    authClient.organization.listMembers({
                        query: { organizationId, limit: MEMBERS_PAGE_SIZE, offset },
                    }),
                    "Failed to load members",
                );
            const first = await listPage(0);
            const members = [...first.members];
            while (members.length < first.total) {
                const page = await listPage(members.length);
                if (page.members.length === 0) break;
                members.push(...page.members);
            }
            return { members, total: first.total };
        },
    });
}

export function useActiveOrganizationMembers() {
    const session = useQuery(sessionQueryOptions());
    return useQuery(organizationMembersQueryOptions(session.data?.session.activeOrganizationId));
}

export async function ensureActiveOrganizationMembersData(queryClient: QueryClient) {
    const session = await ensureSessionData(queryClient);
    return queryClient.ensureQueryData(
        organizationMembersQueryOptions(session?.session.activeOrganizationId),
    );
}

function organizationInvitationsQueryOptions(organizationId: string | null | undefined) {
    return queryOptions({
        queryKey: ["organizations", "invitations", organizationId] as const,
        enabled: organizationId != null,
        queryFn: async () => {
            if (organizationId == null) return null;
            const invitations = await unwrapAuthResult(
                authClient.organization.listInvitations({ query: { organizationId } }),
                "Failed to load invitations",
            );
            return invitations.filter((invitation) => invitation.status === "pending");
        },
    });
}

export function useActiveOrganizationInvitations() {
    const session = useQuery(sessionQueryOptions());
    return useQuery(
        organizationInvitationsQueryOptions(session.data?.session.activeOrganizationId),
    );
}

export async function ensureActiveOrganizationInvitationsData(queryClient: QueryClient) {
    const session = await ensureSessionData(queryClient);
    return queryClient.ensureQueryData(
        organizationInvitationsQueryOptions(session?.session.activeOrganizationId),
    );
}

export function useCreateOrganization() {
    const queryClient = useQueryClient();
    return useAPIMutation({
        mutationFn: (vars: { name: string; slug: string }) =>
            unwrapAuthResult(authClient.organization.create(vars), "Failed to create organization"),
        successToast: { title: "Organization created" },
        onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["organizations"] }),
    });
}

export function useUpdateOrganization() {
    const queryClient = useQueryClient();
    return useAPIMutation({
        mutationFn: (vars: { name: string }) =>
            unwrapAuthResult(
                authClient.organization.update({ data: vars }),
                "Failed to rename organization",
            ),
        successToast: { title: "Organization renamed" },
        onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["organizations"] }),
    });
}

export function useLeaveOrganization() {
    return useAPIMutation({
        mutationFn: ({ organizationId }: { organizationId: string }) =>
            unwrapAuthResult(
                authClient.organization.leave({ organizationId }),
                "Failed to leave organization",
            ),
        successToast: { title: "Left organization" },
    });
}

export function useDeleteOrganization() {
    return useAPIMutation({
        mutationFn: ({ organizationId }: { organizationId: string }) =>
            unwrapAuthResult(
                authClient.organization.delete({ organizationId }),
                "Failed to delete organization",
            ),
        successToast: { title: "Organization deleted" },
    });
}

export function useSetActiveOrganization() {
    const queryClient = useQueryClient();
    return useAPIMutation({
        mutationFn: ({ organizationId }: { organizationId: string }) =>
            setActiveOrganization(queryClient, organizationId),
    });
}

export type AssignableMemberRole = "admin" | "member";

export function useRemoveMember(organizationId: string) {
    const queryClient = useQueryClient();
    return useAPIMutation({
        mutationFn: ({ memberIdOrEmail }: { memberIdOrEmail: string }) =>
            unwrapAuthResult(
                authClient.organization.removeMember({ memberIdOrEmail, organizationId }),
                "Failed to remove member",
            ),
        successToast: { title: "Member removed" },
        onSuccess: () =>
            void queryClient.invalidateQueries({
                queryKey: ["organizations", "members", organizationId],
            }),
    });
}

export function useUpdateMemberRole(organizationId: string) {
    const queryClient = useQueryClient();
    return useAPIMutation({
        mutationFn: ({ memberId, role }: { memberId: string; role: AssignableMemberRole }) =>
            unwrapAuthResult(
                authClient.organization.updateMemberRole({ memberId, role, organizationId }),
                "Failed to update role",
            ),
        successToast: { title: "Role updated" },
        onSuccess: () =>
            void queryClient.invalidateQueries({
                queryKey: ["organizations", "members", organizationId],
            }),
    });
}

export function useInviteMember() {
    const queryClient = useQueryClient();
    return useAPIMutation({
        mutationFn: (vars: { email: string; role: "member" | "admin" }) =>
            unwrapAuthResult(authClient.organization.inviteMember(vars), "Failed to invite member"),
        successToast: { title: "Invitation created" },
        onSuccess: () =>
            void queryClient.invalidateQueries({ queryKey: ["organizations", "invitations"] }),
    });
}

export function useCancelInvitation() {
    const queryClient = useQueryClient();
    return useAPIMutation({
        mutationFn: ({ invitationId }: { invitationId: string }) =>
            unwrapAuthResult(
                authClient.organization.cancelInvitation({ invitationId }),
                "Failed to cancel invitation",
            ),
        successToast: { title: "Invitation cancelled" },
        onSuccess: () =>
            void queryClient.invalidateQueries({ queryKey: ["organizations", "invitations"] }),
    });
}

function userInvitationsQueryOptions() {
    return queryOptions({
        queryKey: ["organizations", "userInvitations"] as const,
        queryFn: async () => {
            const invitations = await unwrapAuthResult(
                authClient.organization.listUserInvitations(),
                "Failed to load invitations",
            );
            const now = Date.now();
            return invitations.filter(
                (invitation) => new Date(invitation.expiresAt).getTime() > now,
            );
        },
    });
}

export function useUserInvitations() {
    return useQuery(userInvitationsQueryOptions());
}

export function ensureUserInvitationsData(queryClient: QueryClient) {
    return queryClient.ensureQueryData(userInvitationsQueryOptions());
}

export function useAcceptInvitation() {
    const queryClient = useQueryClient();
    return useAPIMutation({
        mutationFn: ({ invitationId }: { invitationId: string }) =>
            unwrapAuthResult(
                authClient.organization.acceptInvitation({ invitationId }),
                "Failed to accept invitation",
            ),
        onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["organizations"] }),
    });
}

export function useRejectInvitation() {
    const queryClient = useQueryClient();
    return useAPIMutation({
        mutationFn: ({ invitationId }: { invitationId: string }) =>
            unwrapAuthResult(
                authClient.organization.rejectInvitation({ invitationId }),
                "Failed to decline invitation",
            ),
        successToast: { title: "Invitation declined" },
        onSuccess: () =>
            void queryClient.invalidateQueries({ queryKey: ["organizations", "userInvitations"] }),
    });
}
