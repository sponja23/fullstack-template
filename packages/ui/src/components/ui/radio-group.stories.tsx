import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./label";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const meta = { title: "ui/RadioGroup", component: RadioGroup, tags: ["autodocs"] } satisfies Meta<
    typeof RadioGroup
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Terms: Story = {
    render: () => (
        <RadioGroup defaultValue="30" className="w-52">
            {["Due on receipt", "Net 15", "Net 30"].map((label, index) => {
                const value = String(index * 15);
                return (
                    <Label key={value} className="flex items-center gap-2">
                        <RadioGroupItem value={value} />
                        {label}
                    </Label>
                );
            })}
        </RadioGroup>
    ),
};
