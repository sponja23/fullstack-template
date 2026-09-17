import { FileTextIcon, HomeIcon, SettingsIcon, UsersIcon } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "./sidebar";

const meta = { title: "ui/Sidebar", component: Sidebar, tags: ["autodocs"] } satisfies Meta<
    typeof Sidebar
>;
export default meta;
type Story = StoryObj<typeof meta>;

const nav = [
    { label: "Overview", icon: HomeIcon },
    { label: "Invoices", icon: FileTextIcon, badge: "12" },
    { label: "Clients", icon: UsersIcon },
];
export const ApplicationShell: Story = {
    render: () => (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader>
                    <span className="px-2 font-heading text-sm font-medium">Demo</span>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {nav.map(({ label, icon: Icon, badge }) => (
                                    <SidebarMenuItem key={label}>
                                        <SidebarMenuButton isActive={label === "Invoices"}>
                                            <Icon />
                                            <span>{label}</span>
                                        </SidebarMenuButton>
                                        {badge && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <SettingsIcon />
                                <span>Settings</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-12 items-center gap-2 border-b px-4">
                    <SidebarTrigger />
                    Invoices
                </header>
                <main className="p-6 text-sm text-muted-foreground">Invoice workspace</main>
            </SidebarInset>
        </SidebarProvider>
    ),
};
