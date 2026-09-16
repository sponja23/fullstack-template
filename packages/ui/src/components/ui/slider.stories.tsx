import type { Meta, StoryObj } from "@storybook/react";
import { Slider } from "./slider";

const meta = { title: "ui/Slider", component: Slider, tags: ["autodocs"] } satisfies Meta<
    typeof Slider
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = { args: { defaultValue: [35], className: "w-80" } };
export const Range: Story = { args: { defaultValue: [20, 80], className: "w-80" } };
export const Vertical: Story = {
    args: { defaultValue: [60], orientation: "vertical", className: "h-48" },
};
