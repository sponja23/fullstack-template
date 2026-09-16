import type { Meta, StoryObj } from "@storybook/react";
import { Progress, ProgressLabel, ProgressValue } from "./progress";

const meta = {
    title: "ui/Progress",
    component: Progress,
    tags: ["autodocs"],
    args: { value: 64 },
} satisfies Meta<typeof Progress>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WithLabel: Story = {
    render: () => (
        <Progress value={64} className="w-80">
            <ProgressLabel>Invoice setup</ProgressLabel>
            <ProgressValue />
        </Progress>
    ),
};
export const Indeterminate: Story = { args: { value: null, className: "w-80" } };
