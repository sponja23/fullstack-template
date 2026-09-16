import { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { Toaster, toast } from "./toast";

const meta = { title: "ui/Toast", component: Toaster, tags: ["autodocs"] } satisfies Meta<
    typeof Toaster
>;
export default meta;
type Story = StoryObj<typeof meta>;

function Showcase() {
    useEffect(() => {
        const success = toast.add({
            title: "Invoice sent",
            description: "INV-1042 was emailed to Acme Inc.",
            type: "success",
            timeout: 0,
        });
        const warning = toast.add({
            title: "Payment overdue",
            description: "INV-1038 is 7 days late.",
            type: "warning",
            timeout: 0,
        });
        return () => {
            toast.close(success);
            toast.close(warning);
        };
    }, []);
    return (
        <Toaster>
            <Button
                variant="outline"
                onClick={() => toast.add({ title: "Draft saved", type: "success" })}
            >
                Create toast
            </Button>
        </Toaster>
    );
}

export const Notifications: Story = { render: () => <Showcase /> };
