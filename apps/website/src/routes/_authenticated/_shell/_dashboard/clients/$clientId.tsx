import { Link, createFileRoute } from "@tanstack/react-router";
import { Archive, ArrowLeft } from "lucide-react";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { RouteError, RoutePending } from "@/components/layout/route-state";
import { ensureActiveOrganizationId } from "@/lib/queries/auth.queries";
import { ensureClientData, useArchiveClient, useClient } from "@/lib/queries/clients.queries";
import { ensureProjectsData, useProjects } from "@/lib/queries/projects.queries";
import { EditClientForm } from "./-components/client.forms";

export const Route = createFileRoute("/_authenticated/_shell/_dashboard/clients/$clientId")({
    loader: async ({ context, params }) => {
        const organizationId = await ensureActiveOrganizationId(context.queryClient);
        await Promise.all([
            ensureClientData(
                context.queryClient,
                context.trpcClient,
                organizationId,
                params.clientId,
            ),
            ensureProjectsData(
                context.queryClient,
                context.trpcClient,
                organizationId,
                params.clientId,
            ),
        ]);
    },
    pendingComponent: RoutePending,
    errorComponent: RouteError,
    component: ClientPage,
});

function ClientPage() {
    const { clientId } = Route.useParams();
    const { data: client } = useClient(clientId);
    const { data: projects } = useProjects(clientId);
    const archive = useArchiveClient();
    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 p-6 md:p-10">
            <header className="space-y-3">
                <Link
                    to="/clients"
                    className="flex items-center gap-1 text-sm text-muted-foreground"
                >
                    <ArrowLeft className="size-4" /> Clients
                </Link>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-semibold tracking-tight">{client.name}</h1>
                    <Badge variant={client.status === "active" ? "secondary" : "outline"}>
                        {client.status}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                    {client.billingEmail} · {client.currency}
                </p>
            </header>
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Billing details</CardTitle>
                        <CardDescription>
                            Currency is fixed at {client.currency} for this client.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EditClientForm client={client} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Projects</CardTitle>
                        <CardDescription>Work tracked for this client.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {projects.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No projects yet.</p>
                        ) : (
                            projects.map((project) => (
                                <Link
                                    key={project.id}
                                    to="/projects/$projectSlug"
                                    params={{ projectSlug: project.slug }}
                                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                                >
                                    <span className="font-medium">{project.name}</span>
                                    <Badge variant="outline">{project.status}</Badge>
                                </Link>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
            <Card className="ring-destructive/30">
                <CardHeader>
                    <CardTitle>Archive client</CardTitle>
                    <CardDescription>
                        Keep historical records while marking this client inactive.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        variant="destructive"
                        disabled={client.status === "archived" || archive.isPending}
                        onClick={() => archive.mutate({ id: client.id })}
                    >
                        <Archive /> Archive client
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
