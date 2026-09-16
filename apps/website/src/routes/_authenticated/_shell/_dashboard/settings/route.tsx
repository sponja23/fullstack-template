import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, KeyRound, Settings, Users } from "lucide-react";
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@repo/ui/sidebar";
import { RouteError, RoutePending } from "@/components/layout/route-state";
import { SectionHeader } from "@/components/shell/section-header";
import { ensureApiKeysData } from "@/lib/queries/api-keys.queries";
import {
    ensureActiveOrganizationData,
    ensureActiveOrganizationInvitationsData,
    ensureActiveOrganizationMembersData,
    useActiveOrganization,
} from "@/lib/queries/organizations.queries";
import { useRouteActive } from "@/lib/use-route-active";

export const Route = createFileRoute("/_authenticated/_shell/_dashboard/settings")({
    loader: ({ context }) =>
        Promise.all([
            ensureActiveOrganizationData(context.queryClient),
            ensureActiveOrganizationMembersData(context.queryClient),
            ensureActiveOrganizationInvitationsData(context.queryClient),
            ensureApiKeysData(context.queryClient, context.trpc),
        ]),
    pendingComponent: RoutePending,
    errorComponent: RouteError,
    component: () => <Outlet />,
    staticData: { Sidebar: SettingsSidebar },
});

const pages = [
    { to: "/settings/general" as const, label: "General", Icon: Settings },
    { to: "/settings/members" as const, label: "Members", Icon: Users },
    { to: "/settings/api-keys" as const, label: "API keys", Icon: KeyRound },
];

function SettingsSidebar() {
    const { data } = useActiveOrganization();
    return (
        <>
            <SectionHeader>
                <Link to="/" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ArrowLeft className="size-3.5" />
                    {data?.name ?? "Organization"}
                </Link>
                <span className="text-sm font-semibold">Settings</span>
            </SectionHeader>
            <SidebarGroup>
                <SidebarMenu>
                    {pages.map((page) => (
                        <SettingsLink key={page.to} {...page} />
                    ))}
                </SidebarMenu>
            </SidebarGroup>
        </>
    );
}

function SettingsLink({ to, label, Icon }: (typeof pages)[number]) {
    const active = useRouteActive({ to, activeOptions: { exact: true } });
    return (
        <SidebarMenuItem>
            <SidebarMenuButton tooltip={label} isActive={active} render={<Link to={to} />}>
                <Icon />
                <span>{label}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
