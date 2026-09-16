import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./label";
import { Switch } from "./switch";

const meta = { title: "ui/Switch", component: Switch, tags: ["autodocs"] } satisfies Meta<
    typeof Switch
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
    render: () => (
        <div className="grid gap-3">
            <Label className="flex items-center gap-2">
                <Switch defaultChecked />
                Email reminders
            </Label>
            <Label className="flex items-center gap-2">
                <Switch size="sm" />
                Compact switch
            </Label>
            <Label className="flex items-center gap-2 text-muted-foreground">
                <Switch disabled />
                Unavailable
            </Label>
        </div>
    ),
};
