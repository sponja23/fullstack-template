import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent } from "@repo/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@repo/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { RouteError, RoutePending } from "@/components/layout/route-state";
import { ensureActiveOrganizationId } from "@/lib/queries/auth.queries";
import { ensureClientsData, useClients } from "@/lib/queries/clients.queries";
import { CreateClientForm } from "./-components/client.forms";

export const Route = createFileRoute("/_authenticated/_shell/_dashboard/clients/")({
    loader: async ({ context }) => {
        const organizationId = await ensureActiveOrganizationId(context.queryClient);
        return ensureClientsData(context.queryClient, context.trpcClient, organizationId);
    },
    pendingComponent: RoutePending,
    errorComponent: RouteError,
    component: ClientsPage,
});

function ClientsPage() {
    const { data: clients } = useClients();
    const [open, setOpen] = useState(false);
    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 p-6 md:p-10">
            <header className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Clients</h1>
                    <p className="text-sm text-muted-foreground">
                        Companies your organization bills.
                    </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger render={<Button />}>
                        <Plus /> New client
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create client</DialogTitle>
                            <DialogDescription>
                                Choose billing details and a permanent currency.
                            </DialogDescription>
                        </DialogHeader>
                        <CreateClientForm onSuccess={() => setOpen(false)} />
                    </DialogContent>
                </Dialog>
            </header>
            {clients.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-sm text-muted-foreground">
                        No clients yet. Create one to start organizing billable work.
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Billing email</TableHead>
                                    <TableHead>Currency</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clients.map((client) => (
                                    <TableRow key={client.id}>
                                        <TableCell>
                                            <Link
                                                to="/clients/$clientId"
                                                params={{ clientId: client.id }}
                                                className="font-medium hover:underline"
                                            >
                                                {client.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{client.billingEmail}</TableCell>
                                        <TableCell>{client.currency}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    client.status === "active"
                                                        ? "secondary"
                                                        : "outline"
                                                }
                                            >
                                                {client.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
