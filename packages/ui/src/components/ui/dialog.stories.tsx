import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { Input } from "./input";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./dialog";

const meta = { title: "ui/Dialog", component: Dialog, tags: ["autodocs"] } satisfies Meta<
    typeof Dialog
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const EditClient: Story = {
    render: () => (
        <Dialog defaultOpen>
            <DialogTrigger render={<Button variant="outline" />}>Edit client</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit client</DialogTitle>
                    <DialogDescription>
                        Update the client name used on future invoices.
                    </DialogDescription>
                </DialogHeader>
                <Input defaultValue="Northstar Studio" />
                <DialogFooter>
                    <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                    <DialogClose render={<Button />}>Save</DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
};
