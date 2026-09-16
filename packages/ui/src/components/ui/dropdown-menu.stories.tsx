import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "./dropdown-menu";

const meta = {
    title: "ui/DropdownMenu",
    component: DropdownMenu,
    tags: ["autodocs"],
} satisfies Meta<typeof DropdownMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
    render: () => (
        <div className="min-h-48">
            <DropdownMenu defaultOpen>
                <DropdownMenuTrigger render={<Button variant="outline" />}>
                    Invoice actions
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>INV-1042</DropdownMenuLabel>
                        <DropdownMenuItem>
                            Duplicate<DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuCheckboxItem checked>Email receipt</DropdownMenuCheckboxItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">Void invoice</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ),
};
