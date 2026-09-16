import type { Meta, StoryObj } from "@storybook/react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "./select";

const meta = { title: "ui/Select", component: Select, tags: ["autodocs"] } satisfies Meta<
    typeof Select
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Currency: Story = {
    render: () => (
        <Select defaultValue="usd">
            <SelectTrigger className="w-48">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Currency</SelectLabel>
                    <SelectItem value="usd">US Dollar (USD)</SelectItem>
                    <SelectItem value="eur">Euro (EUR)</SelectItem>
                    <SelectItem value="gbp">Pound (GBP)</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    ),
};
export const Open: Story = {
    render: () => (
        <div className="min-h-48">
            <Select defaultOpen defaultValue="usd">
                <SelectTrigger className="w-48">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="usd">US Dollar</SelectItem>
                    <SelectItem value="eur">Euro</SelectItem>
                </SelectContent>
            </Select>
        </div>
    ),
};
