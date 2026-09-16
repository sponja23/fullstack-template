import type { Meta, StoryObj } from "@storybook/react";
import { Kbd, KbdGroup } from "./kbd";

const meta = { title: "ui/Kbd", component: Kbd, tags: ["autodocs"] } satisfies Meta<typeof Kbd>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Shortcut: Story = {
    render: () => (
        <div className="flex items-center gap-2 text-sm">
            Save invoice{" "}
            <KbdGroup>
                <Kbd>⌘</Kbd>
                <Kbd>S</Kbd>
            </KbdGroup>
        </div>
    ),
};
