import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { z } from "zod";
import { CenteredContainer } from "@/components/layout/centered-container";
import { RouteError, RoutePending } from "@/components/layout/route-state";
import { CreateOrganizationCard } from "@/components/organization/create-organization-card";
import { UserInvitationsCard } from "@/components/organization/user-invitations-card";
import {
    ensureOrganizationsData,
    ensureUserInvitationsData,
    useOrganizations,
    useSetActiveOrganization,
    useUserInvitations,
} from "@/lib/queries/organizations.queries";

export const Route = createFileRoute("/_authenticated/onboarding/")({
    validateSearch: z.object({ redirect: z.string().optional() }),
    beforeLoad: ({ context }) =>
        Promise.all([
            ensureOrganizationsData(context.queryClient),
            ensureUserInvitationsData(context.queryClient),
        ]),
    pendingComponent: RoutePending,
    errorComponent: RouteError,
    component: OnboardingPage,
});

function OnboardingPage() {
    const navigate = useNavigate();
    const { redirect } = Route.useSearch();
    const { data: organizations = [] } = useOrganizations();
    const { data: invitations = [] } = useUserInvitations();
    const activate = useSetActiveOrganization();
    const proceed = () => navigate({ to: redirect ?? "/" });
    return (
        <CenteredContainer className="enter-page max-w-xl">
            <div>
                <h1 className="text-3xl font-semibold">Set up your workspace</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Create an organization, accept an invitation, or continue with an existing
                    membership.
                </p>
            </div>
            {invitations.length > 0 && <UserInvitationsCard onAccepted={proceed} />}
            {organizations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Existing organizations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {organizations.map((organization) => (
                            <Button
                                key={organization.id}
                                variant="outline"
                                className="w-full justify-between"
                                disabled={activate.isPending}
                                onClick={async () => {
                                    await activate.mutateAsync({ organizationId: organization.id });
                                    await proceed();
                                }}
                            >
                                <span>{organization.name}</span>
                                <span className="text-xs text-muted-foreground">
                                    {organization.slug}
                                </span>
                            </Button>
                        ))}
                    </CardContent>
                </Card>
            )}
            <CreateOrganizationCard
                heading={
                    organizations.length > 0
                        ? "Create another organization"
                        : "Create your organization"
                }
                onSuccess={proceed}
            />
        </CenteredContainer>
    );
}
