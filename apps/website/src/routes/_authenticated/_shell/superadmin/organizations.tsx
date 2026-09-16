import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { LogIn } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { RouteError, RoutePending } from "@/components/layout/route-state";
import { isOwner } from "@/lib/role";
import {
    ensureSuperadminOrganizationsData,
    useEnterAsOwner,
    useSuperadminOrganizations,
} from "@/lib/queries/superadmin.queries";

export const Route = createFileRoute("/_authenticated/_shell/superadmin/organizations")({
    loader: ({ context }) => ensureSuperadminOrganizationsData(context.queryClient, context.trpc),
    pendingComponent: RoutePending,
    errorComponent: RouteError,
    component: OrganizationsPage,
});

type Organization = ReturnType<typeof useSuperadminOrganizations>["data"][number];

function OrganizationsPage() {
    const { data } = useSuperadminOrganizations();
    return (
        <div className="mx-auto w-full max-w-4xl space-y-6 p-6 md:p-10">
            <header>
                <h1 className="text-3xl font-semibold">Organizations</h1>
                <p className="text-sm text-muted-foreground">
                    Enter any organization as its owner. The cache is cleared when identity changes.
                </p>
            </header>
            {data.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-sm text-muted-foreground">
                        No organizations yet.
                    </CardContent>
                </Card>
            ) : (
                data.map((organization) => (
                    <OrganizationCard key={organization.id} organization={organization} />
                ))
            )}
        </div>
    );
}

function OrganizationCard({ organization }: { organization: Organization }) {
    const enter = useEnterAsOwner();
    const navigate = useNavigate();
    const router = useRouter();
    const owner = organization.members.find((member) => isOwner(member.role));
    return (
        <Card>
            <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <CardTitle>{organization.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{organization.slug}</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={owner == null || enter.isPending}
                        onClick={() =>
                            owner != null &&
                            enter.mutate(
                                { organizationId: organization.id, ownerUserId: owner.userId },
                                {
                                    onSuccess: async () => {
                                        await navigate({ to: "/" });
                                        await router.invalidate();
                                    },
                                },
                            )
                        }
                    >
                        <LogIn />
                        Enter as owner
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="divide-y p-0">
                {organization.members.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground">No members.</p>
                ) : (
                    organization.members.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-4">
                            <Avatar className="size-8">
                                {member.image != null && <AvatarImage src={member.image} alt="" />}
                                <AvatarFallback>
                                    {initials(member.name, member.email)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                    {member.name || member.email}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {member.email}
                                </p>
                            </div>
                            <Badge variant="secondary" className="capitalize">
                                {member.role}
                            </Badge>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

function initials(name: string, email: string): string {
    const parts = (name.trim() || email).split(/\s+/);
    return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
}
