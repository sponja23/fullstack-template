import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { RouteError, RoutePending } from "@/components/layout/route-state";
import { useActiveOrganization } from "@/lib/queries/organizations.queries";

export const Route = createFileRoute("/_authenticated/_shell/_dashboard/")({
    loader: () => null,
    pendingComponent: RoutePending,
    errorComponent: RouteError,
    component: DashboardPage,
});

function DashboardPage() {
    const { data } = useActiveOrganization();
    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 p-6 md:p-10">
            <div>
                <p className="text-sm text-muted-foreground">{data?.name ?? "Organization"}</p>
                <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Your workspace is ready</CardTitle>
                    <CardDescription>
                        Product routes can be added to this shell without changing authentication,
                        tenancy, or navigation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">There is nothing here yet.</p>
                </CardContent>
            </Card>
        </div>
    );
}
