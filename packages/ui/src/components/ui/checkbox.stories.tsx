import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

const meta = { title: "ui/Checkbox", component: Checkbox, tags: ["autodocs"] } satisfies Meta<
    typeof Checkbox
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
    render: () => (
        <div className="grid gap-3">
            <Label className="flex items-center gap-2">
                <Checkbox defaultChecked />
                Email a receipt
            </Label>
            <Label className="flex items-center gap-2">
                <Checkbox />
                Include line-item detail
            </Label>
            <Label className="flex items-center gap-2 text-muted-foreground">
                <Checkbox disabled />
                Locked setting
            </Label>
        </div>
    ),
};
