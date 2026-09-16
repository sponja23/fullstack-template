import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { NativeSelect, NativeSelectOption } from "@repo/ui/native-select";
import { RouteError, RoutePending } from "@/components/layout/route-state";
import { ensureClientsData, useClients } from "@/lib/queries/clients.queries";
import { useCreateDraft } from "@/lib/queries/invoices.queries";
import { ensureActiveOrganizationId } from "@/lib/queries/auth.queries";

export const Route = createFileRoute("/_authenticated/_shell/_dashboard/invoices/new")({
    loader: async ({ context }) => {
        const organizationId = await ensureActiveOrganizationId(context.queryClient);
        return ensureClientsData(context.queryClient, context.trpcClient, organizationId);
    },
    pendingComponent: RoutePending,
    errorComponent: RouteError,
    component: NewInvoicePage,
});

function NewInvoicePage() {
    const { data: clients } = useClients();
    const [clientId, setClientId] = useState(
        clients.find((client) => client.status === "active")?.id ?? "",
    );
    const create = useCreateDraft();
    const navigate = useNavigate();
    return (
        <main className="mx-auto w-full max-w-2xl p-6">
            <Card>
                <CardHeader>
                    <CardTitle>New invoice</CardTitle>
                    <CardDescription>
                        Choose the client. You can add time and manual lines to the draft next.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <NativeSelect
                        aria-label="Client"
                        value={clientId}
                        onChange={(event) => setClientId(event.target.value)}
                    >
                        <NativeSelectOption value="">Select a client</NativeSelectOption>
                        {clients
                            .filter((client) => client.status === "active")
                            .map((client) => (
                                <NativeSelectOption key={client.id} value={client.id}>
                                    {client.name} ({client.currency})
                                </NativeSelectOption>
                            ))}
                    </NativeSelect>
                    <Button
                        disabled={!clientId || create.isPending}
                        onClick={() =>
                            create.mutate(
                                { clientId },
                                {
                                    onSuccess: (invoice) =>
                                        void navigate({
                                            to: "/invoices/$invoiceId",
                                            params: { invoiceId: invoice.id },
                                        }),
                                },
                            )
                        }
                    >
                        {create.isPending ? "Creating…" : "Create draft"}
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}
