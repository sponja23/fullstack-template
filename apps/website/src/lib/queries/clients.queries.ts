import {
    type QueryClient,
    queryOptions,
    useQueryClient,
    useSuspenseQuery,
} from "@tanstack/react-query";
import type { TRPCClient } from "@trpc/client";
import type { UserAppRouter } from "@repo/client";
import { useTRPCClient } from "@/lib/trpc";
import { ensureAPIQueryData, useAPIMutation } from "./api-queries";
import { useUser } from "./auth.queries";

function clientsQueryOptions(organizationId: string, client: TRPCClient<UserAppRouter>) {
    return queryOptions({
        queryKey: ["clients", organizationId] as const,
        queryFn: () => client.clients.list.query(),
    });
}

function clientQueryOptions(organizationId: string, id: string, client: TRPCClient<UserAppRouter>) {
    return queryOptions({
        queryKey: ["clients", organizationId, id] as const,
        queryFn: () => client.clients.get.query({ id }),
    });
}

export function useClients() {
    const { activeOrganizationId } = useUser();
    const client = useTRPCClient();
    if (activeOrganizationId == null) throw new Error("An active organization is required");
    return useSuspenseQuery(clientsQueryOptions(activeOrganizationId, client));
}

export function useClient(id: string) {
    const { activeOrganizationId } = useUser();
    const client = useTRPCClient();
    if (activeOrganizationId == null) throw new Error("An active organization is required");
    return useSuspenseQuery(clientQueryOptions(activeOrganizationId, id, client));
}

export function ensureClientsData(
    queryClient: QueryClient,
    client: TRPCClient<UserAppRouter>,
    organizationId: string,
) {
    return ensureAPIQueryData(queryClient, clientsQueryOptions(organizationId, client));
}

export function ensureClientData(
    queryClient: QueryClient,
    client: TRPCClient<UserAppRouter>,
    organizationId: string,
    id: string,
) {
    return ensureAPIQueryData(queryClient, clientQueryOptions(organizationId, id, client));
}

function useClientMutation<TVariables, TResult>(
    mutationFn: (client: TRPCClient<UserAppRouter>, variables: TVariables) => Promise<TResult>,
    title: string,
) {
    const queryClient = useQueryClient();
    const client = useTRPCClient();
    const { activeOrganizationId } = useUser();
    return useAPIMutation({
        mutationFn: (variables: TVariables) => mutationFn(client, variables),
        successToast: { title },
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["clients", activeOrganizationId] }),
    });
}

export function useCreateClient() {
    return useClientMutation(
        (client, input: Parameters<typeof client.clients.create.mutate>[0]) =>
            client.clients.create.mutate(input),
        "Client created",
    );
}

export function useUpdateClient() {
    return useClientMutation(
        (client, input: Parameters<typeof client.clients.update.mutate>[0]) =>
            client.clients.update.mutate(input),
        "Client updated",
    );
}

export function useArchiveClient() {
    return useClientMutation(
        (client, input: Parameters<typeof client.clients.archive.mutate>[0]) =>
            client.clients.archive.mutate(input),
        "Client archived",
    );
}
