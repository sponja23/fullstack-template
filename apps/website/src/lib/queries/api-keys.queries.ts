import { type QueryClient, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { type TRPCProxy, useTRPC, useTRPCClient } from "@/lib/trpc";
import { ensureAPIQueryData, useAPIMutation } from "./api-queries";
import type { ApiScope } from "../api-scopes";

export function useApiKeys() {
    const trpc = useTRPC();
    return useSuspenseQuery(trpc.apiKeys.list.queryOptions());
}

export function ensureApiKeysData(queryClient: QueryClient, trpc: TRPCProxy) {
    return ensureAPIQueryData(queryClient, trpc.apiKeys.list.queryOptions());
}

export function useIssueApiKey() {
    const trpc = useTRPC();
    const client = useTRPCClient();
    const queryClient = useQueryClient();
    return useAPIMutation({
        mutationFn: (vars: { name: string; scopes: ApiScope[] }) =>
            client.apiKeys.issue.mutate(vars),
        onSuccess: () =>
            void queryClient.invalidateQueries({ queryKey: trpc.apiKeys.list.queryKey() }),
    });
}

export function useRevokeApiKey() {
    const trpc = useTRPC();
    const client = useTRPCClient();
    const queryClient = useQueryClient();
    return useAPIMutation({
        mutationFn: (vars: { keyId: string }) => client.apiKeys.revoke.mutate(vars),
        successToast: { title: "Key revoked" },
        onSuccess: () =>
            void queryClient.invalidateQueries({ queryKey: trpc.apiKeys.list.queryKey() }),
    });
}
