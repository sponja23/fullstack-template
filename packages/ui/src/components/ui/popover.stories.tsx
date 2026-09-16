import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "./popover";

const meta = { title: "ui/Popover", component: Popover, tags: ["autodocs"] } satisfies Meta<
    typeof Popover
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
    render: () => (
        <div className="flex min-h-40 items-start justify-center">
            <Popover defaultOpen>
                <PopoverTrigger render={<Button variant="outline" />}>Payment terms</PopoverTrigger>
                <PopoverContent>
                    <PopoverHeader>
                        <PopoverTitle>Net 30</PopoverTitle>
                        <PopoverDescription>
                            Payment is due thirty days after issue.
                        </PopoverDescription>
                    </PopoverHeader>
                </PopoverContent>
            </Popover>
        </div>
    ),
};
