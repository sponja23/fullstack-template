import type { Meta, StoryObj } from "@storybook/react";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "./navigation-menu";

const meta = {
    title: "ui/NavigationMenu",
    component: NavigationMenu,
    tags: ["autodocs"],
} satisfies Meta<typeof NavigationMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Billing</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <div className="grid w-72 gap-1 p-2">
                            <NavigationMenuLink href="#">Invoices</NavigationMenuLink>
                            <NavigationMenuLink href="#">Payments</NavigationMenuLink>
                            <NavigationMenuLink href="#">Clients</NavigationMenuLink>
                        </div>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink href="#">Reports</NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    ),
};
