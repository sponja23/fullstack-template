import type { Meta, StoryObj } from "@storybook/react";
import { DirectionProvider } from "./direction";
import { Input } from "./input";

const meta = {
    title: "ui/Direction",
    component: DirectionProvider,
    tags: ["autodocs"],
} satisfies Meta<typeof DirectionProvider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Directions: Story = {
    render: () => (
        <div className="grid w-80 gap-3">
            <DirectionProvider direction="ltr">
                <Input defaultValue="Left to right" />
            </DirectionProvider>
            <DirectionProvider direction="rtl">
                <Input defaultValue="من اليمين إلى اليسار" />
            </DirectionProvider>
        </div>
    ),
};
