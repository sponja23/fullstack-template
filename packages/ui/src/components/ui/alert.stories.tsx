import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";

const meta = { title: "ui/Alert", component: Alert, tags: ["autodocs"] } satisfies Meta<
    typeof Alert
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
    render: () => (
        <div className="grid w-[30rem] gap-3">
            <Alert>
                <CheckCircle2Icon />
                <AlertTitle>Invoice issued</AlertTitle>
                <AlertDescription>The customer can now view and pay it.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>Payment failed</AlertTitle>
                <AlertDescription>Check the payment reference and try again.</AlertDescription>
                <AlertAction>
                    <Button size="xs" variant="outline">
                        Retry
                    </Button>
                </AlertAction>
            </Alert>
        </div>
    ),
};
