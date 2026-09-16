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

const listOptions = (organizationId: string, client: TRPCClient<UserAppRouter>) =>
    queryOptions({
        queryKey: ["invoices", organizationId] as const,
        queryFn: () => client.invoices.list.query(),
    });
const detailOptions = (organizationId: string, id: string, client: TRPCClient<UserAppRouter>) =>
    queryOptions({
        queryKey: ["invoices", organizationId, id] as const,
        queryFn: () => client.invoices.get.query({ id }),
    });
const unbilledOptions = (
    organizationId: string,
    invoiceId: string,
    client: TRPCClient<UserAppRouter>,
) =>
    queryOptions({
        queryKey: ["invoices", organizationId, invoiceId, "unbilled"] as const,
        queryFn: () => client.invoices.listUnbilledEntries.query({ invoiceId }),
    });

export function ensureInvoicesData(
    queryClient: QueryClient,
    client: TRPCClient<UserAppRouter>,
    organizationId: string,
) {
    return ensureAPIQueryData(queryClient, listOptions(organizationId, client));
}
export function useInvoices() {
    const { activeOrganizationId } = useUser();
    const client = useTRPCClient();
    if (activeOrganizationId == null) throw new Error("An active organization is required");
    return useSuspenseQuery(listOptions(activeOrganizationId, client));
}
export function ensureInvoiceData(
    queryClient: QueryClient,
    client: TRPCClient<UserAppRouter>,
    organizationId: string,
    id: string,
) {
    return ensureAPIQueryData(queryClient, detailOptions(organizationId, id, client));
}
export function useInvoice(id: string) {
    const { activeOrganizationId } = useUser();
    const client = useTRPCClient();
    if (activeOrganizationId == null) throw new Error("An active organization is required");
    return useSuspenseQuery(detailOptions(activeOrganizationId, id, client));
}
export function useUnbilledEntries(invoiceId: string) {
    const { activeOrganizationId } = useUser();
    const client = useTRPCClient();
    if (activeOrganizationId == null) throw new Error("An active organization is required");
    return useSuspenseQuery(unbilledOptions(activeOrganizationId, invoiceId, client));
}

function useInvoiceMutation<TVariables, TResult>(
    mutationFn: (client: TRPCClient<UserAppRouter>, variables: TVariables) => Promise<TResult>,
) {
    const client = useTRPCClient();
    const queryClient = useQueryClient();
    const { activeOrganizationId } = useUser();
    return useAPIMutation({
        mutationFn: (variables: TVariables) => mutationFn(client, variables),
        onSuccess: () =>
            void queryClient.invalidateQueries({ queryKey: ["invoices", activeOrganizationId] }),
    });
}

export function useCreateDraft() {
    return useInvoiceMutation((client, input: { clientId: string }) =>
        client.invoices.createDraft.mutate(input),
    );
}
export function useAddManualLine() {
    return useInvoiceMutation(
        (
            client,
            input: {
                invoiceId: string;
                description: string;
                quantity: number;
                unitAmountMinor: number;
            },
        ) => client.invoices.addManualLine.mutate(input),
    );
}
export function useAddTimeLines() {
    return useInvoiceMutation((client, input: { invoiceId: string; entryIds: string[] }) =>
        client.invoices.addTimeLines.mutate(input),
    );
}
export function useRemoveLine() {
    return useInvoiceMutation((client, input: { invoiceId: string; lineItemId: string }) =>
        client.invoices.removeLine.mutate(input),
    );
}
export function useIssueInvoice() {
    return useInvoiceMutation((client, input: { id: string }) =>
        client.invoices.issue.mutate(input),
    );
}
export function useMarkInvoicePaid() {
    return useInvoiceMutation((client, input: { id: string }) =>
        client.invoices.markPaid.mutate(input),
    );
}
export function useVoidInvoice() {
    return useInvoiceMutation((client, input: { id: string }) =>
        client.invoices.void.mutate(input),
    );
}
