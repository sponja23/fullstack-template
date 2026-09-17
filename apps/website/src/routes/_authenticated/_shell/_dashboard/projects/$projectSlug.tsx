import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Archive, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { RouteError, RoutePending } from "@/components/layout/route-state";
import { ensureActiveOrganizationId } from "@/lib/queries/auth.queries";
import { ensureProjectData, useArchiveProject, useProject } from "@/lib/queries/projects.queries";
import {
    ensureProjectTimeEntriesData,
    useDeleteTimeEntry,
    useProjectTimeEntries,
} from "@/lib/queries/time-entries.queries";
import { EditProjectForm } from "./-components/project-forms";
import { CreateTimeEntryForm, EditTimeEntryForm } from "../time/-components/time-entry-forms";

export const Route = createFileRoute("/_authenticated/_shell/_dashboard/projects/$projectSlug")({
    loader: async ({ context, params }) => {
        const organizationId = await ensureActiveOrganizationId(context.queryClient);
        const project = await ensureProjectData(
            context.queryClient,
            context.trpcClient,
            organizationId,
            params.projectSlug,
        );
        await ensureProjectTimeEntriesData(
            context.queryClient,
            context.trpcClient,
            organizationId,
            project.id,
        );
    },
    pendingComponent: RoutePending,
    errorComponent: RouteError,
    component: ProjectPage,
});

function ProjectPage() {
    const { projectSlug } = Route.useParams();
    const { data: project } = useProject(projectSlug);
    const { data: entries } = useProjectTimeEntries(project.id);
    const archive = useArchiveProject();
    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 p-6 md:p-10">
            <header className="space-y-3">
                <Link
                    to="/projects"
                    className="flex items-center gap-1 text-sm text-muted-foreground"
                >
                    <ArrowLeft className="size-4" /> Projects
                </Link>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
                    <Badge variant="outline">{project.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                    {project.clientName} · {formatMoney(project.rateMinor, project.currency)}/hour
                </p>
            </header>
            <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
                <Card>
                    <CardHeader>
                        <CardTitle>Time entries</CardTitle>
                        <CardDescription>Work recorded against this project.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <EntriesTable entries={entries} />
                    </CardContent>
                </Card>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {project.status === "archived" ? (
                                <p className="text-sm text-muted-foreground">
                                    Archived projects do not accept new entries.
                                </p>
                            ) : (
                                <CreateTimeEntryForm
                                    projects={[project]}
                                    initialProjectId={project.id}
                                />
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Project details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <EditProjectForm project={project} />
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Button
                variant="destructive"
                disabled={project.status === "archived" || archive.isPending}
                onClick={() => archive.mutate({ id: project.id })}
            >
                <Archive /> Archive project
            </Button>
        </div>
    );
}

type Entry = ReturnType<typeof useProjectTimeEntries>["data"][number];

function EntriesTable({ entries }: { entries: Entry[] }) {
    const remove = useDeleteTimeEntry();
    const [editing, setEditing] = useState<Entry | null>(null);
    if (entries.length === 0)
        return <p className="p-6 text-sm text-muted-foreground">No time entries yet.</p>;
    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead>Minutes</TableHead>
                        <TableHead />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entries.map((entry) => (
                        <TableRow key={entry.id}>
                            <TableCell>{entry.date}</TableCell>
                            <TableCell>{entry.authorName}</TableCell>
                            <TableCell className="max-w-64 truncate">{entry.note || "—"}</TableCell>
                            <TableCell>{entry.minutes}</TableCell>
                            <TableCell className="flex justify-end gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    disabled={entry.lineItemId !== null}
                                    onClick={() => setEditing(entry)}
                                >
                                    <Pencil />
                                    <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    disabled={entry.lineItemId !== null || remove.isPending}
                                    onClick={() => remove.mutate({ id: entry.id })}
                                >
                                    <Trash2 />
                                    <span className="sr-only">Delete</span>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit time entry</DialogTitle>
                    </DialogHeader>
                    {editing && (
                        <EditTimeEntryForm entry={editing} onSuccess={() => setEditing(null)} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

function formatMoney(minor: number, currency: string) {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(minor / 100);
}
