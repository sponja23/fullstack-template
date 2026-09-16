import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./textarea";

const meta = {
    title: "ui/Textarea",
    component: Textarea,
    tags: ["autodocs"],
    args: { placeholder: "Payment terms and notes…", className: "w-80" },
} satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filled: Story = { args: { defaultValue: "Thank you for your business." } };
export const Invalid: Story = { args: { defaultValue: "Too short", "aria-invalid": true } };
