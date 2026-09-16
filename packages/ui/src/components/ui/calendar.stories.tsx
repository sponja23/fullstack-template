import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "./calendar";

const meta = { title: "ui/Calendar", component: Calendar, tags: ["autodocs"] } satisfies Meta<
    typeof Calendar
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
    args: { mode: "single", defaultMonth: new Date(2026, 8), selected: new Date(2026, 8, 16) },
};
export const Range: Story = {
    args: {
        mode: "range",
        defaultMonth: new Date(2026, 8),
        selected: { from: new Date(2026, 8, 10), to: new Date(2026, 8, 18) },
    },
};
