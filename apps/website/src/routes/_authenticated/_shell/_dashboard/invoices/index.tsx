import { Link, createFileRoute } from "@tanstack/react-router";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent } from "@repo/ui/card";
import { NativeSelect, NativeSelectOption } from "@repo/ui/native-select";
import { RouteError, RoutePending } from "@/components/layout/route-state";
import { ensureActiveOrganizationId } from "@/lib/queries/auth.queries";
import { ensureInvoicesData, useInvoices } from "@/lib/queries/invoices.queries";

export const Route = createFileRoute("/_authenticated/_shell/_dashboard/invoices/")({
    loader: async ({ context }) => {
        const organizationId = await ensureActiveOrganizationId(context.queryClient);
        return ensureInvoicesData(context.queryClient, context.trpcClient, organizationId);
    },
    pendingComponent: RoutePending,
    errorComponent: RouteError,
    component: InvoicesPage,
});

function money(amount: number, currency: string) {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount / 100);
}

function InvoicesPage() {
    const { data: invoices } = useInvoices();
    const [status, setStatus] = useState("all");
    const visible =
        status === "all" ? invoices : invoices.filter((invoice) => invoice.status === status);
    return (
        <main className="mx-auto w-full max-w-6xl space-y-6 p-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Invoices</h1>
                    <p className="text-sm text-muted-foreground">
                        Draft, issue, and track client invoices.
                    </p>
                </div>
                <div className="flex gap-2">
                    <NativeSelect
                        aria-label="Filter by status"
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                    >
                        <NativeSelectOption value="all">All statuses</NativeSelectOption>
                        <NativeSelectOption value="draft">Draft</NativeSelectOption>
                        <NativeSelectOption value="issued">Issued</NativeSelectOption>
                        <NativeSelectOption value="paid">Paid</NativeSelectOption>
                        <NativeSelectOption value="void">Void</NativeSelectOption>
                    </NativeSelect>
                    <Button render={<Link to="/invoices/new" />}>New invoice</Button>
                </div>
            </header>
            {visible.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-sm text-muted-foreground">
                        No invoices yet.
                    </CardContent>
                </Card>
            ) : (
                <div className="divide-y rounded-xl border">
                    {visible.map((invoice) => (
                        <Link
                            key={invoice.id}
                            to="/invoices/$invoiceId"
                            params={{ invoiceId: invoice.id }}
                            className="flex items-center gap-4 p-4 hover:bg-muted/50"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="font-medium">
                                    {invoice.number == null
                                        ? "Draft"
                                        : `Invoice #${invoice.number}`}
                                </p>
                                <p className="truncate text-sm text-muted-foreground">
                                    {invoice.clientName}
                                </p>
                            </div>
                            <Badge variant="outline">{invoice.status}</Badge>
                            <span className="w-28 text-right text-sm font-medium">
                                {money(invoice.totalMinor, invoice.currency)}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
import { useState } from "react";
