import { Link, Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { BriefcaseBusiness, Building2, Clock3, ReceiptText, Settings } from "lucide-react";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@repo/ui/sidebar";
import { SectionHeader } from "@/components/shell/section-header";
import { lastActiveOrganizationId } from "@/lib/last-active-organization-id";
import { ensureSessionData } from "@/lib/queries/auth.queries";
import {
    ensureOrganizationsData,
    setActiveOrganization,
    useActiveOrganization,
} from "@/lib/queries/organizations.queries";
import { useRouteActive } from "@/lib/use-route-active";

export const Route = createFileRoute("/_authenticated/_shell/_dashboard")({
    beforeLoad: async ({ context, location }) => {
        const session = await ensureSessionData(context.queryClient);
        if (session?.session.activeOrganizationId) return;
        const organizations = await ensureOrganizationsData(context.queryClient);
        if (organizations.length === 0)
            throw redirect({ to: "/onboarding", search: { redirect: location.href } });
        const hint = lastActiveOrganizationId.read();
        const hinted =
            hint == null
                ? undefined
                : organizations.find((organization) => organization.id === hint);
        const first = [...organizations].sort(
            (a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() ||
                a.id.localeCompare(b.id),
        )[0];
        await setActiveOrganization(context.queryClient, (hinted ?? first).id);
    },
    component: () => <Outlet />,
    staticData: { Sidebar: DashboardSidebar },
});

function DashboardSidebar() {
    const { data: organization } = useActiveOrganization();
    const settingsActive = useRouteActive({ to: "/settings", activeOptions: { exact: false } });
    return (
        <>
            <SectionHeader>
                <span className="truncate text-sm font-semibold">
                    {organization?.name ?? "Organization"}
                </span>
            </SectionHeader>
            <SidebarGroup>
                <SidebarMenu>
                    <DashboardLink to="/clients" label="Clients" Icon={Building2} />
                    <DashboardLink to="/projects" label="Projects" Icon={BriefcaseBusiness} />
                    <DashboardLink to="/time" label="Time" Icon={Clock3} />
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Invoices (coming soon)" disabled>
                            <ReceiptText />
                            <span>Invoices</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup className="mt-auto">
                <SidebarGroupLabel>Manage</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Settings"
                            isActive={settingsActive}
                            render={<Link to="/settings" />}
                        >
                            <Settings />
                            <span>Settings</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
        </>
    );
}

function DashboardLink({
    to,
    label,
    Icon,
}: {
    to: "/clients" | "/projects" | "/time";
    label: string;
    Icon: typeof Building2;
}) {
    const active = useRouteActive({ to, activeOptions: { exact: false } });
    return (
        <SidebarMenuItem>
            <SidebarMenuButton tooltip={label} isActive={active} render={<Link to={to} />}>
                <Icon />
                <span>{label}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
