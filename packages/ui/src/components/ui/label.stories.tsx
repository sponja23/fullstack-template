import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";
import { Label } from "./label";

const meta = { title: "ui/Label", component: Label, tags: ["autodocs"] } satisfies Meta<
    typeof Label
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WithInput: Story = {
    render: () => (
        <div className="grid w-80 gap-1.5">
            <Label htmlFor="company">Company name</Label>
            <Input id="company" defaultValue="Northstar Studio" />
        </div>
    ),
};
