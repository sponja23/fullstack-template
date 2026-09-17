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
import { ensureProjectsData, useProjects } from "@/lib/queries/projects.queries";
import { CreateProjectForm } from "./-components/project-forms";

export const Route = createFileRoute("/_authenticated/_shell/_dashboard/projects/")({
    loader: async ({ context }) => {
        const organizationId = await ensureActiveOrganizationId(context.queryClient);
        await Promise.all([
            ensureClientsData(context.queryClient, context.trpcClient, organizationId),
            ensureProjectsData(context.queryClient, context.trpcClient, organizationId),
        ]);
    },
    pendingComponent: RoutePending,
    errorComponent: RouteError,
    component: ProjectsPage,
});

function ProjectsPage() {
    const { data: clients } = useClients();
    const { data: projects } = useProjects();
    const [open, setOpen] = useState(false);
    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 p-6 md:p-10">
            <header className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
                    <p className="text-sm text-muted-foreground">
                        Billable work across all clients.
                    </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger render={<Button disabled={clients.length === 0} />}>
                        <Plus /> New project
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create project</DialogTitle>
                            <DialogDescription>
                                Set the client, URL slug, and hourly rate.
                            </DialogDescription>
                        </DialogHeader>
                        <CreateProjectForm clients={clients} onSuccess={() => setOpen(false)} />
                    </DialogContent>
                </Dialog>
            </header>
            {projects.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-sm text-muted-foreground">
                        {clients.length === 0
                            ? "Create a client before adding a project."
                            : "No projects yet."}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Rate</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projects.map((project) => (
                                    <TableRow key={project.id}>
                                        <TableCell>
                                            <Link
                                                to="/projects/$projectSlug"
                                                params={{ projectSlug: project.slug }}
                                                className="font-medium hover:underline"
                                            >
                                                {project.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{project.clientName}</TableCell>
                                        <TableCell>
                                            {formatMoney(project.rateMinor, project.currency)}/hr
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{project.status}</Badge>
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

function formatMoney(minor: number, currency: string) {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(minor / 100);
}
