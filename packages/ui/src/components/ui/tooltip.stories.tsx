import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { Kbd } from "./kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

const meta = { title: "ui/Tooltip", component: Tooltip, tags: ["autodocs"] } satisfies Meta<
    typeof Tooltip
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
    render: () => (
        <TooltipProvider>
            <div className="flex min-h-24 items-end justify-center">
                <Tooltip defaultOpen>
                    <TooltipTrigger render={<Button variant="outline" />}>Save</TooltipTrigger>
                    <TooltipContent>
                        Save invoice <Kbd>⌘S</Kbd>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    ),
};
