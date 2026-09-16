import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { Input } from "./input";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "./sheet";

const meta = { title: "ui/Sheet", component: Sheet, tags: ["autodocs"] } satisfies Meta<
    typeof Sheet
>;
export default meta;
type Story = StoryObj<typeof meta>;

function Editor() {
    return (
        <>
            <SheetHeader>
                <SheetTitle>Edit invoice</SheetTitle>
                <SheetDescription>Changes apply to this draft.</SheetDescription>
            </SheetHeader>
            <div className="px-4">
                <Input defaultValue="INV-1042" />
            </div>
            <SheetFooter>
                <SheetClose render={<Button />}>Save</SheetClose>
            </SheetFooter>
        </>
    );
}
export const Sides: Story = {
    render: () => (
        <div className="flex min-h-64 gap-2">
            <Sheet defaultOpen>
                <SheetTrigger render={<Button variant="outline" />}>Open right</SheetTrigger>
                <SheetContent side="right">
                    <Editor />
                </SheetContent>
            </Sheet>
            <Sheet>
                <SheetTrigger render={<Button variant="outline" />}>Open left</SheetTrigger>
                <SheetContent side="left">
                    <Editor />
                </SheetContent>
            </Sheet>
        </div>
    ),
};
