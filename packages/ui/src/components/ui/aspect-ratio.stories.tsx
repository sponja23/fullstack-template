import type { Meta, StoryObj } from "@storybook/react";
import { AspectRatio } from "./aspect-ratio";

const meta = {
    title: "ui/AspectRatio",
    component: AspectRatio,
    tags: ["autodocs"],
    args: { ratio: 16 / 9 },
} satisfies Meta<typeof AspectRatio>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Ratios: Story = {
    render: () => (
        <div className="grid w-[32rem] grid-cols-2 gap-4">
            <AspectRatio
                ratio={16 / 9}
                className="flex items-center justify-center rounded-xl bg-muted text-sm"
            >
                16:9
            </AspectRatio>
            <AspectRatio
                ratio={1}
                className="flex items-center justify-center rounded-xl bg-muted text-sm"
            >
                1:1
            </AspectRatio>
        </div>
    ),
};
