import { type QueryClient, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth";
import { unwrapAuthResult } from "@/lib/better-auth";
import { type TRPCProxy, useTRPC } from "@/lib/trpc";
import { ensureAPIQueryData, useAPIMutation } from "./api-queries";
import { useSession } from "./auth.queries";

export function useSuperadminOrganizations() {
    const trpc = useTRPC();
    return useSuspenseQuery(trpc.superadmin.organizations.list.queryOptions());
}

export function ensureSuperadminOrganizationsData(queryClient: QueryClient, trpc: TRPCProxy) {
    return ensureAPIQueryData(queryClient, trpc.superadmin.organizations.list.queryOptions());
}

export function useEnterAsOwner() {
    const queryClient = useQueryClient();
    return useAPIMutation({
        mutationFn: async ({
            organizationId,
            ownerUserId,
        }: {
            organizationId: string;
            ownerUserId: string;
        }) => {
            await unwrapAuthResult(
                authClient.admin.impersonateUser({ userId: ownerUserId }),
                "Failed to impersonate owner",
            );
            return unwrapAuthResult(
                authClient.organization.setActive({ organizationId }),
                "Failed to activate organization",
            );
        },
        successToast: { title: "Entered as owner" },
        onSuccess: () => queryClient.clear(),
    });
}

export function useImpersonation() {
    const { data } = useSession();
    return {
        isImpersonating: Boolean(data?.session.impersonatedBy),
        viewingAs: data?.user,
    };
}

export function useStopImpersonating() {
    const queryClient = useQueryClient();
    return useAPIMutation({
        mutationFn: () =>
            unwrapAuthResult(authClient.admin.stopImpersonating(), "Failed to stop impersonating"),
        successToast: { title: "Stopped impersonating" },
        onSuccess: () => queryClient.clear(),
    });
}
