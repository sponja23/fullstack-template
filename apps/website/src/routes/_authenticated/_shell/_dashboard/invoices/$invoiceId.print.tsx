import { createFileRoute } from "@tanstack/react-router";
import { RouteError, RoutePending } from "@/components/layout/route-state";
import { ensureActiveOrganizationId } from "@/lib/queries/auth.queries";
import { ensureInvoiceData, useInvoice } from "@/lib/queries/invoices.queries";

export const Route = createFileRoute("/_authenticated/_shell/_dashboard/invoices/$invoiceId/print")(
    {
        loader: async ({ context, params }) => {
            const organizationId = await ensureActiveOrganizationId(context.queryClient);
            return ensureInvoiceData(
                context.queryClient,
                context.trpcClient,
                organizationId,
                params.invoiceId,
            );
        },
        pendingComponent: RoutePending,
        errorComponent: RouteError,
        component: PrintInvoice,
        staticData: { fullViewport: true },
    },
);

function PrintInvoice() {
    const { invoiceId } = Route.useParams();
    const { data: invoice } = useInvoice(invoiceId);
    const format = (amount: number) =>
        new Intl.NumberFormat(undefined, { style: "currency", currency: invoice.currency }).format(
            amount / 100,
        );
    return (
        <main className="invoice-print mx-auto min-h-screen max-w-4xl bg-white p-12 text-black">
            <header className="mb-12 flex justify-between">
                <div>
                    <p className="text-sm uppercase tracking-widest">Invoice</p>
                    <h1 className="text-4xl font-semibold">#{invoice.number}</h1>
                </div>
                <div className="text-right">
                    <p className="text-xl font-semibold">{invoice.clientName}</p>
                    <p>{invoice.billingEmail}</p>
                    <p>{invoice.issuedAt?.toLocaleDateString()}</p>
                </div>
            </header>
            <div className="divide-y border-y">
                {invoice.lineItems.map((line) => (
                    <div key={line.id} className="grid grid-cols-[1fr_auto] gap-6 py-4">
                        <div>
                            <p className="font-medium">{line.description}</p>
                            <p className="text-sm text-gray-600">
                                {line.kind === "generated"
                                    ? `${line.quantity} minutes`
                                    : `${line.quantity} × ${format(line.unitAmountMinor)}`}
                            </p>
                        </div>
                        <p>{format(line.totalMinor)}</p>
                    </div>
                ))}
            </div>
            <p className="mt-6 text-right text-2xl font-semibold">
                Total {format(invoice.lineItems.reduce((sum, line) => sum + line.totalMinor, 0))}
            </p>
        </main>
    );
}
