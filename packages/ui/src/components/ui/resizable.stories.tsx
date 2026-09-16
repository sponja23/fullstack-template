import type { Meta, StoryObj } from "@storybook/react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./resizable";

const meta = {
    title: "ui/Resizable",
    component: ResizablePanelGroup,
    tags: ["autodocs"],
} satisfies Meta<typeof ResizablePanelGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
    render: () => (
        <ResizablePanelGroup orientation="horizontal" className="h-48 w-[32rem] rounded-lg border">
            <ResizablePanel defaultSize={35}>
                <div className="flex h-full items-center justify-center text-sm">Invoice list</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={65}>
                <div className="flex h-full items-center justify-center bg-muted/30 text-sm">
                    Preview
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    ),
};
