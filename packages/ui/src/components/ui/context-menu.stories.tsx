import type { Meta, StoryObj } from "@storybook/react";
import {
    ContextMenu,
    ContextMenuCheckboxItem,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "./context-menu";

const meta = { title: "ui/ContextMenu", component: ContextMenu, tags: ["autodocs"] } satisfies Meta<
    typeof ContextMenu
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const InvoiceActions: Story = {
    render: () => (
        <ContextMenu>
            <ContextMenuTrigger className="flex h-40 w-72 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                Right-click this invoice
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuLabel>INV-1042</ContextMenuLabel>
                <ContextMenuItem>Open</ContextMenuItem>
                <ContextMenuItem>Duplicate</ContextMenuItem>
                <ContextMenuCheckboxItem checked>Show line items</ContextMenuCheckboxItem>
                <ContextMenuSeparator />
                <ContextMenuItem variant="destructive">Void invoice</ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    ),
};
