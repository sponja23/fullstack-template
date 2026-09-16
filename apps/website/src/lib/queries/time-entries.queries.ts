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

function projectEntriesQueryOptions(
    organizationId: string,
    projectId: string,
    client: TRPCClient<UserAppRouter>,
) {
    return queryOptions({
        queryKey: ["timeEntries", organizationId, "project", projectId] as const,
        queryFn: () => client.timeEntries.listForProject.query({ projectId }),
    });
}

function myEntriesQueryOptions(
    organizationId: string,
    range: { from: string; to: string },
    client: TRPCClient<UserAppRouter>,
) {
    return queryOptions({
        queryKey: ["timeEntries", organizationId, "mine", range] as const,
        queryFn: () => client.timeEntries.listMine.query(range),
    });
}

export function useProjectTimeEntries(projectId: string) {
    const { activeOrganizationId } = useUser();
    const client = useTRPCClient();
    if (activeOrganizationId == null) throw new Error("An active organization is required");
    return useSuspenseQuery(projectEntriesQueryOptions(activeOrganizationId, projectId, client));
}

export function useMyTimeEntries(range: { from: string; to: string }) {
    const { activeOrganizationId } = useUser();
    const client = useTRPCClient();
    if (activeOrganizationId == null) throw new Error("An active organization is required");
    return useSuspenseQuery(myEntriesQueryOptions(activeOrganizationId, range, client));
}

export function ensureProjectTimeEntriesData(
    queryClient: QueryClient,
    client: TRPCClient<UserAppRouter>,
    organizationId: string,
    projectId: string,
) {
    return ensureAPIQueryData(
        queryClient,
        projectEntriesQueryOptions(organizationId, projectId, client),
    );
}

export function ensureMyTimeEntriesData(
    queryClient: QueryClient,
    client: TRPCClient<UserAppRouter>,
    organizationId: string,
    range: { from: string; to: string },
) {
    return ensureAPIQueryData(queryClient, myEntriesQueryOptions(organizationId, range, client));
}

function useTimeEntryMutation<TVariables, TResult>(
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
            queryClient.invalidateQueries({ queryKey: ["timeEntries", activeOrganizationId] }),
    });
}

export function useCreateTimeEntry() {
    return useTimeEntryMutation(
        (client, input: Parameters<typeof client.timeEntries.create.mutate>[0]) =>
            client.timeEntries.create.mutate(input),
        "Time added",
    );
}

export function useUpdateTimeEntry() {
    return useTimeEntryMutation(
        (client, input: Parameters<typeof client.timeEntries.update.mutate>[0]) =>
            client.timeEntries.update.mutate(input),
        "Time entry updated",
    );
}

export function useDeleteTimeEntry() {
    return useTimeEntryMutation(
        (client, input: Parameters<typeof client.timeEntries.delete.mutate>[0]) =>
            client.timeEntries.delete.mutate(input),
        "Time entry deleted",
    );
}
