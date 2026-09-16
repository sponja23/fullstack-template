import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "./spinner";

const meta = { title: "ui/Spinner", component: Spinner, tags: ["autodocs"] } satisfies Meta<
    typeof Spinner
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
    render: () => (
        <div className="flex items-center gap-4">
            <Spinner className="size-3" />
            <Spinner />
            <Spinner className="size-6" />
        </div>
    ),
};
