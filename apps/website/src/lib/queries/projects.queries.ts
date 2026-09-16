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

function projectsQueryOptions(
    organizationId: string,
    client: TRPCClient<UserAppRouter>,
    clientId?: string,
) {
    return queryOptions({
        queryKey: ["projects", organizationId, { clientId }] as const,
        queryFn: () => client.projects.list.query(clientId ? { clientId } : undefined),
    });
}

function projectQueryOptions(
    organizationId: string,
    slug: string,
    client: TRPCClient<UserAppRouter>,
) {
    return queryOptions({
        queryKey: ["projects", organizationId, "detail", slug] as const,
        queryFn: () => client.projects.get.query({ slug }),
    });
}

export function useProjects(clientId?: string) {
    const { activeOrganizationId } = useUser();
    const client = useTRPCClient();
    if (activeOrganizationId == null) throw new Error("An active organization is required");
    return useSuspenseQuery(projectsQueryOptions(activeOrganizationId, client, clientId));
}

export function useProject(slug: string) {
    const { activeOrganizationId } = useUser();
    const client = useTRPCClient();
    if (activeOrganizationId == null) throw new Error("An active organization is required");
    return useSuspenseQuery(projectQueryOptions(activeOrganizationId, slug, client));
}

export function ensureProjectsData(
    queryClient: QueryClient,
    client: TRPCClient<UserAppRouter>,
    organizationId: string,
    clientId?: string,
) {
    return ensureAPIQueryData(queryClient, projectsQueryOptions(organizationId, client, clientId));
}

export function ensureProjectData(
    queryClient: QueryClient,
    client: TRPCClient<UserAppRouter>,
    organizationId: string,
    slug: string,
) {
    return ensureAPIQueryData(queryClient, projectQueryOptions(organizationId, slug, client));
}

function useProjectMutation<TVariables, TResult>(
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
            queryClient.invalidateQueries({ queryKey: ["projects", activeOrganizationId] }),
    });
}

export function useCreateProject() {
    return useProjectMutation(
        (client, input: Parameters<typeof client.projects.create.mutate>[0]) =>
            client.projects.create.mutate(input),
        "Project created",
    );
}

export function useUpdateProject() {
    return useProjectMutation(
        (client, input: Parameters<typeof client.projects.update.mutate>[0]) =>
            client.projects.update.mutate(input),
        "Project updated",
    );
}

export function useArchiveProject() {
    return useProjectMutation(
        (client, input: Parameters<typeof client.projects.archive.mutate>[0]) =>
            client.projects.archive.mutate(input),
        "Project archived",
    );
}
