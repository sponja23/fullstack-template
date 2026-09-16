import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./alert-dialog";

const meta = { title: "ui/AlertDialog", component: AlertDialog, tags: ["autodocs"] } satisfies Meta<
    typeof AlertDialog
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Confirmation: Story = {
    render: () => (
        <AlertDialog defaultOpen>
            <AlertDialogTrigger render={<Button variant="destructive" />}>
                Void invoice
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Void this invoice?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This cannot be undone. The invoice will remain in the audit trail.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive">Void invoice</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    ),
};
