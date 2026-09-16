import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";

const meta = { title: "ui/Collapsible", component: Collapsible, tags: ["autodocs"] } satisfies Meta<
    typeof Collapsible
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
    render: () => (
        <Collapsible defaultOpen className="w-80 space-y-2">
            <CollapsibleTrigger render={<Button variant="outline" />}>
                Invoice details
            </CollapsibleTrigger>
            <CollapsibleContent className="rounded-lg border p-3 text-sm text-muted-foreground">
                Three line items · net 30 · USD
            </CollapsibleContent>
        </Collapsible>
    ),
};
