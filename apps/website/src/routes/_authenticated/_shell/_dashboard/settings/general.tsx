import { createFileRoute } from "@tanstack/react-router";
import { RouteError, RoutePending } from "@/components/layout/route-state";
import { SettingsPage } from "@/components/settings/settings-page";
import { OrganizationDangerZone, OrganizationIdentityCard } from "./-components/general-settings";

export const Route = createFileRoute("/_authenticated/_shell/_dashboard/settings/general")({
    loader: () => null,
    pendingComponent: RoutePending,
    errorComponent: RouteError,
    component: GeneralSettings,
});

function GeneralSettings() {
    return (
        <SettingsPage
            title="General"
            description="Update the organization's identity and lifecycle."
        >
            <OrganizationIdentityCard />
            <OrganizationDangerZone />
        </SettingsPage>
    );
}
