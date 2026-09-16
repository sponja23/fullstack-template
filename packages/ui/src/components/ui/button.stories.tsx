import { ArrowRightIcon, PlusIcon } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta = {
    title: "ui/Button",
    component: Button,
    tags: ["autodocs"],
    args: { children: "Create invoice" },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
    render: () => (
        <div className="flex flex-wrap gap-2">
            {(["default", "outline", "secondary", "ghost", "destructive", "link"] as const).map(
                (variant) => (
                    <Button key={variant} variant={variant}>
                        {variant}
                    </Button>
                ),
            )}
        </div>
    ),
};
export const Sizes: Story = {
    render: () => (
        <div className="flex items-center gap-2">
            {(["xs", "sm", "default", "lg"] as const).map((size) => (
                <Button key={size} size={size}>
                    {size}
                    <ArrowRightIcon data-icon="inline-end" />
                </Button>
            ))}
            <Button size="icon" aria-label="Add">
                <PlusIcon />
            </Button>
        </div>
    ),
};
export const Disabled: Story = { args: { disabled: true } };
