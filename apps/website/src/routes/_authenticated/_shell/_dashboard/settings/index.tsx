import { Link, createFileRoute } from "@tanstack/react-router";
import { KeyRound, Settings, Users } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { RouteError, RoutePending } from "@/components/layout/route-state";
import { SettingsPage } from "@/components/settings/settings-page";

export const Route = createFileRoute("/_authenticated/_shell/_dashboard/settings/")({
    loader: () => null,
    pendingComponent: RoutePending,
    errorComponent: RouteError,
    component: SettingsOverview,
});

const pages = [
    {
        to: "/settings/general" as const,
        title: "General",
        description: "Rename or leave the organization.",
        Icon: Settings,
    },
    {
        to: "/settings/members" as const,
        title: "Members",
        description: "Manage roles and invitations.",
        Icon: Users,
    },
    {
        to: "/settings/api-keys" as const,
        title: "API keys",
        description: "Issue and revoke API credentials.",
        Icon: KeyRound,
    },
];

function SettingsOverview() {
    return (
        <SettingsPage
            title="Settings"
            description="Manage organization identity, access, and credentials."
        >
            <div className="grid gap-4 md:grid-cols-3">
                {pages.map(({ to, title, description, Icon }) => (
                    <Link key={to} to={to}>
                        <Card className="h-full transition-colors hover:bg-muted/50">
                            <CardHeader>
                                <Icon className="size-5" />
                                <CardTitle>{title}</CardTitle>
                                <CardDescription>{description}</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </SettingsPage>
    );
}
