import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { CenteredContainer } from "@/components/layout/centered-container";
import { RouteError, RoutePending } from "@/components/layout/route-state";
import { CreateOrganizationCard } from "@/components/organization/create-organization-card";

export const Route = createFileRoute("/_authenticated/new-org/")({
    validateSearch: z.object({ redirect: z.string().optional() }),
    loader: () => null,
    pendingComponent: RoutePending,
    errorComponent: RouteError,
    component: NewOrganizationPage,
});

function NewOrganizationPage() {
    const navigate = useNavigate();
    const { redirect } = Route.useSearch();
    return (
        <CenteredContainer className="enter-page">
            <div>
                <h1 className="text-3xl font-semibold">Create an organization</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    It becomes your active organization when it is created.
                </p>
            </div>
            <CreateOrganizationCard
                heading="Organization details"
                onSuccess={() => navigate({ to: redirect ?? "/" })}
            />
        </CenteredContainer>
    );
}
