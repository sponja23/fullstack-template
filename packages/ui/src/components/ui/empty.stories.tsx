import { FileTextIcon } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "./empty";

const meta = { title: "ui/Empty", component: Empty, tags: ["autodocs"] } satisfies Meta<
    typeof Empty
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <Empty className="w-[28rem] border">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <FileTextIcon />
                </EmptyMedia>
                <EmptyTitle>No invoices yet</EmptyTitle>
                <EmptyDescription>Create a draft to start billing this client.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button>Create invoice</Button>
            </EmptyContent>
        </Empty>
    ),
};
