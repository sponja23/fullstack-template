import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Checkbox } from "@repo/ui/checkbox";
import { Input } from "@repo/ui/input";
import { RouteError, RoutePending } from "@/components/layout/route-state";
import { ensureActiveOrganizationId } from "@/lib/queries/auth.queries";
import {
    ensureInvoiceData,
    useAddManualLine,
    useAddTimeLines,
    useInvoice,
    useIssueInvoice,
    useMarkInvoicePaid,
    useRemoveLine,
    useUnbilledEntries,
    useVoidInvoice,
} from "@/lib/queries/invoices.queries";

export const Route = createFileRoute("/_authenticated/_shell/_dashboard/invoices/$invoiceId")({
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
    component: InvoicePage,
});

const money = (amount: number, currency: string) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount / 100);

function InvoicePage() {
    const { invoiceId } = Route.useParams();
    const { data: invoice } = useInvoice(invoiceId);
    const issue = useIssueInvoice();
    const pay = useMarkInvoicePaid();
    const voidInvoice = useVoidInvoice();
    const total = invoice.lineItems.reduce((sum, line) => sum + line.totalMinor, 0);
    return (
        <main className="mx-auto w-full max-w-5xl space-y-6 p-6">
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-semibold">
                            {invoice.number == null
                                ? "Draft invoice"
                                : `Invoice #${invoice.number}`}
                        </h1>
                        <Badge variant="outline">{invoice.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {invoice.clientName} · {invoice.billingEmail}
                    </p>
                </div>
                <div className="flex gap-2">
                    {invoice.status !== "draft" && (
                        <Button
                            variant="outline"
                            render={<Link to="/invoices/$invoiceId/print" params={{ invoiceId }} />}
                        >
                            Print
                        </Button>
                    )}
                    {invoice.status === "draft" && (
                        <Button
                            disabled={issue.isPending}
                            onClick={() => issue.mutate({ id: invoiceId })}
                        >
                            Issue
                        </Button>
                    )}
                    {invoice.status === "issued" && (
                        <Button
                            disabled={pay.isPending}
                            onClick={() => pay.mutate({ id: invoiceId })}
                        >
                            Mark paid
                        </Button>
                    )}
                    {(invoice.status === "draft" || invoice.status === "issued") && (
                        <Button
                            variant="outline"
                            disabled={voidInvoice.isPending}
                            onClick={() => voidInvoice.mutate({ id: invoiceId })}
                        >
                            Void
                        </Button>
                    )}
                </div>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Line items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {invoice.lineItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            This invoice has no line items.
                        </p>
                    ) : (
                        invoice.lineItems.map((line) => (
                            <LineItem
                                key={line.id}
                                invoiceId={invoiceId}
                                editable={invoice.status === "draft"}
                                currency={invoice.currency}
                                line={line}
                            />
                        ))
                    )}
                    <div className="flex justify-end border-t pt-3 text-lg font-semibold">
                        Total&nbsp; {money(total, invoice.currency)}
                    </div>
                </CardContent>
            </Card>
            {invoice.status === "draft" && (
                <DraftEditor invoiceId={invoiceId} currency={invoice.currency} />
            )}
        </main>
    );
}

function LineItem({
    invoiceId,
    editable,
    currency,
    line,
}: {
    invoiceId: string;
    editable: boolean;
    currency: string;
    line: {
        id: string;
        description: string;
        kind: string;
        quantity: number;
        unitAmountMinor: number;
        totalMinor: number;
    };
}) {
    const remove = useRemoveLine();
    return (
        <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex-1">
                <p className="font-medium">{line.description}</p>
                <p className="text-xs text-muted-foreground">
                    {line.kind === "generated"
                        ? `${line.quantity} minutes`
                        : `${line.quantity} × ${money(line.unitAmountMinor, currency)}`}
                </p>
            </div>
            <span className="font-medium">{money(line.totalMinor, currency)}</span>
            {editable && (
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove.mutate({ invoiceId, lineItemId: line.id })}
                >
                    Remove
                </Button>
            )}
        </div>
    );
}

function DraftEditor({ invoiceId, currency }: { invoiceId: string; currency: string }) {
    const { data: entries } = useUnbilledEntries(invoiceId);
    const [selected, setSelected] = useState<string[]>([]);
    const [description, setDescription] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [amount, setAmount] = useState("");
    const addTime = useAddTimeLines();
    const addManual = useAddManualLine();
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Unbilled time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {entries.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No unbilled entries for this client.
                        </p>
                    ) : (
                        entries.map((entry) => (
                            <label
                                key={entry.id}
                                className="flex items-center gap-3 rounded-lg border p-3 text-sm"
                            >
                                <Checkbox
                                    checked={selected.includes(entry.id)}
                                    onCheckedChange={(checked) =>
                                        setSelected((current) =>
                                            checked
                                                ? [...current, entry.id]
                                                : current.filter((id) => id !== entry.id),
                                        )
                                    }
                                />
                                <span className="flex-1">
                                    {entry.projectName}
                                    <span className="block text-xs text-muted-foreground">
                                        {entry.date} · {entry.minutes} min
                                    </span>
                                </span>
                            </label>
                        ))
                    )}
                    <Button
                        variant="outline"
                        disabled={selected.length === 0 || addTime.isPending}
                        onClick={() =>
                            addTime.mutate(
                                { invoiceId, entryIds: selected },
                                { onSuccess: () => setSelected([]) },
                            )
                        }
                    >
                        Add selected time
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Manual line</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Input
                        aria-label="Description"
                        placeholder="Description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            aria-label="Quantity"
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(event) => setQuantity(event.target.value)}
                        />
                        <Input
                            aria-label={`Unit amount in ${currency}`}
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder={`Amount (${currency})`}
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                        />
                    </div>
                    <Button
                        variant="outline"
                        disabled={!description.trim() || !amount || addManual.isPending}
                        onClick={() =>
                            addManual.mutate(
                                {
                                    invoiceId,
                                    description: description.trim(),
                                    quantity: Number(quantity),
                                    unitAmountMinor: Math.round(Number(amount) * 100),
                                },
                                {
                                    onSuccess: () => {
                                        setDescription("");
                                        setAmount("");
                                    },
                                },
                            )
                        }
                    >
                        Add manual line
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
