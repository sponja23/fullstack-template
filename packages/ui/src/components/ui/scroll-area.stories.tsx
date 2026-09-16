import type { Meta, StoryObj } from "@storybook/react";
import { ScrollArea } from "./scroll-area";

const meta = { title: "ui/ScrollArea", component: ScrollArea, tags: ["autodocs"] } satisfies Meta<
    typeof ScrollArea
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const InvoiceHistory: Story = {
    render: () => (
        <ScrollArea className="h-48 w-72 rounded-lg border p-3">
            <div className="grid gap-3">
                {Array.from({ length: 12 }, (_, index) => (
                    <div key={index} className="border-b pb-2 text-sm">
                        <div className="font-medium">INV-{1042 - index}</div>
                        <div className="text-muted-foreground">
                            Acme Inc. · ${(1200 + index * 175).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    ),
};
