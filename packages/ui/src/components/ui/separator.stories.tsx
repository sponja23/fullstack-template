import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./separator";

const meta = { title: "ui/Separator", component: Separator, tags: ["autodocs"] } satisfies Meta<
    typeof Separator
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Orientations: Story = {
    render: () => (
        <div className="flex h-16 w-80 items-center gap-4">
            <span>Draft</span>
            <Separator orientation="vertical" />
            <span>Issued</span>
            <div className="w-24">
                <Separator className="my-2" />
            </div>
        </div>
    ),
};
