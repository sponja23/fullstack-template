import { Link, Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { ArrowLeft, Building2 } from "lucide-react";
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@repo/ui/sidebar";
import { SectionHeader } from "@/components/shell/section-header";
import { ensureSessionData } from "@/lib/queries/auth.queries";
import { isSuperadmin } from "@/lib/role";
import { useRouteActive } from "@/lib/use-route-active";

export const Route = createFileRoute("/_authenticated/_shell/superadmin")({
    beforeLoad: async ({ context }) => {
        const session = await ensureSessionData(context.queryClient);
        if (!isSuperadmin(session?.user.role)) throw redirect({ to: "/" });
    },
    component: () => <Outlet />,
    staticData: { Sidebar: SuperadminSidebar },
});

function SuperadminSidebar() {
    const active = useRouteActive({
        to: "/superadmin/organizations",
        activeOptions: { exact: true },
    });
    return (
        <>
            <SectionHeader>
                <Link to="/" className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ArrowLeft className="size-3.5" />
                    Back
                </Link>
                <span className="text-sm font-semibold">Superadmin</span>
            </SectionHeader>
            <SidebarGroup>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Organizations"
                            isActive={active}
                            render={<Link to="/superadmin/organizations" />}
                        >
                            <Building2 />
                            <span>Organizations</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
        </>
    );
}
