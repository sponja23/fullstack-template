import { createFileRoute } from "@tanstack/react-router";
import { RouteError, RoutePending } from "@/components/layout/route-state";
import { SettingsPage } from "@/components/settings/settings-page";
import { InvitationsCard, RosterCard } from "./-components/member-settings";
import { useManageableOrgId } from "./-components/manageable-org";

export const Route = createFileRoute("/_authenticated/_shell/_dashboard/settings/members")({
    loader: () => null,
    pendingComponent: RoutePending,
    errorComponent: RouteError,
    component: MemberSettings,
});

function MemberSettings() {
    const manageable = useManageableOrgId();
    return (
        <SettingsPage
            title="Members"
            description="Review the roster, change roles, and invite teammates."
        >
            <RosterCard />
            {manageable != null && <InvitationsCard />}
        </SettingsPage>
    );
}
