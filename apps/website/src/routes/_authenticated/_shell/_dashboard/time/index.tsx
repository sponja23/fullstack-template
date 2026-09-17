import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { RouteError, RoutePending } from "@/components/layout/route-state";
import { ensureActiveOrganizationId } from "@/lib/queries/auth.queries";
import { ensureProjectsData, useProjects } from "@/lib/queries/projects.queries";
import { ensureMyTimeEntriesData, useMyTimeEntries } from "@/lib/queries/time-entries.queries";
import { CreateTimeEntryForm } from "./-components/time-entry-forms";

export const Route = createFileRoute("/_authenticated/_shell/_dashboard/time/")({
    loader: async ({ context }) => {
        const organizationId = await ensureActiveOrganizationId(context.queryClient);
        const range = currentWeek();
        await Promise.all([
            ensureProjectsData(context.queryClient, context.trpcClient, organizationId),
            ensureMyTimeEntriesData(context.queryClient, context.trpcClient, organizationId, range),
        ]);
    },
    pendingComponent: RoutePending,
    errorComponent: RouteError,
    component: TimePage,
});

function TimePage() {
    const range = currentWeek();
    const { data: entries } = useMyTimeEntries(range);
    const { data: projects } = useProjects();
    const activeProjects = projects.filter((project) => project.status === "active");
    const total = entries.reduce((minutes, entry) => minutes + entry.minutes, 0);
    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 p-6 md:p-10">
            <header>
                <h1 className="text-3xl font-semibold tracking-tight">Time</h1>
                <p className="text-sm text-muted-foreground">
                    Your entries for {range.from} through {range.to} · {formatDuration(total)}
                </p>
            </header>
            <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
                <Card>
                    <CardHeader>
                        <CardTitle>This week</CardTitle>
                        <CardDescription>Only work authored by you is shown.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {entries.length === 0 ? (
                            <p className="p-6 text-sm text-muted-foreground">
                                You have not recorded any time this week.
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Author</TableHead>
                                        <TableHead>Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {entries.map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell>{entry.date}</TableCell>
                                            <TableCell>
                                                {entry.clientName} — {entry.projectName}
                                            </TableCell>
                                            <TableCell>{entry.authorName}</TableCell>
                                            <TableCell>{formatDuration(entry.minutes)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Quick add</CardTitle>
                        <CardDescription>Record work on an active project.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activeProjects.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Create an active project before adding time.
                            </p>
                        ) : (
                            <CreateTimeEntryForm projects={activeProjects} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export function currentWeek(now = new Date()): { from: string; to: string } {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const day = date.getDay();
    date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
    const end = new Date(date);
    end.setDate(end.getDate() + 6);
    const format = (value: Date) =>
        `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
    return { from: format(date), to: format(end) };
}

function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return hours === 0 ? `${remainder}m` : `${hours}h ${remainder}m`;
}
