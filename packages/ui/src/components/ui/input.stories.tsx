import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";

const meta = {
    title: "ui/Input",
    component: Input,
    tags: ["autodocs"],
    args: { placeholder: "client@acme.test", className: "w-80" },
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filled: Story = { args: { defaultValue: "billing@acme.test" } };
export const Invalid: Story = { args: { defaultValue: "not-an-email", "aria-invalid": true } };
export const Disabled: Story = { args: { defaultValue: "Locked", disabled: true } };
