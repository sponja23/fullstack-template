import { createFileRoute } from "@tanstack/react-router";
import { RouteError, RoutePending } from "@/components/layout/route-state";
import { SettingsPage } from "@/components/settings/settings-page";
import { ApiKeySettings } from "./-components/api-key-settings";

export const Route = createFileRoute("/_authenticated/_shell/_dashboard/settings/api-keys")({
    loader: () => null,
    pendingComponent: RoutePending,
    errorComponent: RouteError,
    component: ApiKeysPage,
});

function ApiKeysPage() {
    return (
        <SettingsPage title="API keys" description="Manage credentials for external integrations.">
            <ApiKeySettings />
        </SettingsPage>
    );
}
