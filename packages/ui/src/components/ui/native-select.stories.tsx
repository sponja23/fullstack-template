import type { Meta, StoryObj } from "@storybook/react";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "./native-select";

const meta = {
    title: "ui/NativeSelect",
    component: NativeSelect,
    tags: ["autodocs"],
} satisfies Meta<typeof NativeSelect>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
    render: () => (
        <div className="flex items-center gap-3">
            <NativeSelect defaultValue="usd">
                <NativeSelectOptGroup label="Currencies">
                    <NativeSelectOption value="usd">USD</NativeSelectOption>
                    <NativeSelectOption value="eur">EUR</NativeSelectOption>
                </NativeSelectOptGroup>
            </NativeSelect>
            <NativeSelect size="sm" defaultValue="30">
                <NativeSelectOption value="15">Net 15</NativeSelectOption>
                <NativeSelectOption value="30">Net 30</NativeSelectOption>
            </NativeSelect>
        </div>
    ),
};
