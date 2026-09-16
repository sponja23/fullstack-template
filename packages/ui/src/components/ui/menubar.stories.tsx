import type { Meta, StoryObj } from "@storybook/react";
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from "./menubar";

const meta = { title: "ui/Menubar", component: Menubar, tags: ["autodocs"] } satisfies Meta<
    typeof Menubar
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <Menubar>
            <MenubarMenu>
                <MenubarTrigger>Invoice</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>
                        New<MenubarShortcut>⌘N</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>Duplicate</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem variant="destructive">Void</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>Preview</MenubarItem>
                    <MenubarItem>Print</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    ),
};
