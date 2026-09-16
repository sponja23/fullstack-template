import { Outlet, createFileRoute, useMatches } from "@tanstack/react-router";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarInset,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from "@repo/ui/sidebar";
import { TooltipProvider } from "@repo/ui/tooltip";
import { AvatarMenu } from "@/components/shell/avatar-menu";
import { ImpersonationBanner } from "@/components/shell/impersonation-banner";

export const Route = createFileRoute("/_authenticated/_shell")({ component: ShellLayout });

function ShellLayout() {
    const fullViewport = useMatches({
        select: (matches) => matches.some((match) => match.staticData.fullViewport),
    });
    if (fullViewport)
        return (
            <TooltipProvider>
                <div className="flex h-full min-h-0 flex-col overflow-auto">
                    <ImpersonationBanner />
                    <Outlet />
                </div>
            </TooltipProvider>
        );
    return (
        <TooltipProvider>
            <SidebarProvider className="h-full min-h-0">
                <Sidebar collapsible="icon">
                    <SidebarContent className="overflow-hidden py-1">
                        <ShellSidebarSection />
                    </SidebarContent>
                    <SidebarFooter className="border-t border-sidebar-border">
                        <AvatarMenu />
                    </SidebarFooter>
                    <SidebarRail />
                </Sidebar>
                <SidebarInset className="min-h-0 min-w-0 overflow-auto">
                    <SidebarTrigger className="absolute left-2 top-2 z-20 md:hidden" />
                    <ImpersonationBanner />
                    <Outlet />
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
}

function ShellSidebarSection() {
    const Section = useMatches({
        select: (matches) =>
            matches.findLast((match) => match.staticData.Sidebar)?.staticData.Sidebar,
    });
    return Section == null ? null : (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <Section />
        </div>
    );
}
