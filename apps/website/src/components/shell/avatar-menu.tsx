import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@repo/ui/sidebar";
import { Building2, Check, ChevronsUpDown, LogOut, Settings, ShieldCheck } from "lucide-react";
import { useSignOut, useUser } from "@/lib/queries/auth.queries";
import { useOrganizations, useSetActiveOrganization } from "@/lib/queries/organizations.queries";

function initials(name: string | undefined, email: string | undefined): string {
    const value = name?.trim() || email?.trim() || "?";
    const parts = value.split(/\s+/);
    return parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : value.slice(0, 2).toUpperCase();
}

export function AvatarMenu() {
    const { user, isSuperadmin } = useUser();
    const signOut = useSignOut();
    const navigate = useNavigate();
    const avatar = (
        <Avatar>
            {user.image != null && <AvatarImage src={user.image} alt="" />}
            <AvatarFallback>{initials(user.name, user.email)}</AvatarFallback>
        </Avatar>
    );
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <SidebarMenuButton size="lg" aria-label="Account menu">
                                {avatar}
                                <div className="grid flex-1 text-left leading-tight">
                                    <span className="truncate font-medium">{user.name}</span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {user.email}
                                    </span>
                                </div>
                                <ChevronsUpDown className="ml-auto" />
                            </SidebarMenuButton>
                        }
                    />
                    <DropdownMenuContent
                        side="right"
                        align="end"
                        sideOffset={8}
                        className="min-w-56"
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>
                                {user.name}
                                <span className="block text-xs font-normal text-muted-foreground">
                                    {user.email}
                                </span>
                            </DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <OrgSwitcher />
                        <DropdownMenuItem render={<Link to="/new-org" />}>
                            <Building2 />
                            Create organization
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem render={<Link to="/account" />}>
                            <Settings />
                            Account
                        </DropdownMenuItem>
                        {isSuperadmin && (
                            <DropdownMenuItem render={<Link to="/superadmin/organizations" />}>
                                <ShieldCheck />
                                Superadmin
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            disabled={signOut.isPending}
                            onClick={async () => {
                                await navigate({ to: "/login" });
                                await signOut.mutateAsync();
                            }}
                        >
                            <LogOut />
                            {signOut.isPending ? "Signing out…" : "Sign out"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

function OrgSwitcher() {
    const { activeOrganizationId } = useUser();
    const { data = [] } = useOrganizations();
    const activate = useSetActiveOrganization();
    const navigate = useNavigate();
    const router = useRouter();
    if (data.length === 0) return null;
    return (
        <DropdownMenuGroup>
            <DropdownMenuLabel>Organizations</DropdownMenuLabel>
            {data.map((organization) => {
                const active = organization.id === activeOrganizationId;
                return (
                    <DropdownMenuItem
                        key={organization.id}
                        disabled={active || activate.isPending}
                        onClick={async () => {
                            await navigate({ to: "/" });
                            await activate.mutateAsync({ organizationId: organization.id });
                            await router.invalidate();
                        }}
                    >
                        <span className="truncate">{organization.name}</span>
                        {active && <Check className="ml-auto" />}
                    </DropdownMenuItem>
                );
            })}
        </DropdownMenuGroup>
    );
}
