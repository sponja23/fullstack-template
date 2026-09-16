import { BoldIcon, ItalicIcon } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";
import { Toggle } from "./toggle";

const meta = {
    title: "ui/Toggle",
    component: Toggle,
    tags: ["autodocs"],
    args: { "aria-label": "Toggle formatting" },
} satisfies Meta<typeof Toggle>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
    render: () => (
        <div className="flex items-center gap-2">
            <Toggle defaultPressed>
                <BoldIcon />
            </Toggle>
            <Toggle variant="outline">
                <ItalicIcon />
            </Toggle>
            <Toggle size="sm">Small</Toggle>
            <Toggle size="lg">Large</Toggle>
        </div>
    ),
};
