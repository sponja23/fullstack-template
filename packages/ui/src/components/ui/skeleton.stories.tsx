import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./skeleton";

const meta = { title: "ui/Skeleton", component: Skeleton, tags: ["autodocs"] } satisfies Meta<
    typeof Skeleton
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const InvoiceRow: Story = {
    render: () => (
        <div className="flex w-80 items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="grid flex-1 gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    ),
};
