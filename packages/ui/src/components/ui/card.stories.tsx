import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./card";

const meta = { title: "ui/Card", component: Card, tags: ["autodocs"] } satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <Card className="w-80">
            <CardHeader>
                <CardTitle>INV-1042</CardTitle>
                <CardDescription>Northstar Studio · due Oct 12</CardDescription>
                <CardAction>
                    <Button size="xs" variant="outline">
                        Open
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <span className="text-2xl font-semibold">$4,280.00</span>
            </CardContent>
            <CardFooter className="justify-between">
                <span>Issued</span>
                <span>USD</span>
            </CardFooter>
        </Card>
    ),
};
export const Compact: Story = {
    render: () => (
        <Card size="sm" className="w-72">
            <CardHeader>
                <CardTitle>Monthly revenue</CardTitle>
            </CardHeader>
            <CardContent>$18,920</CardContent>
        </Card>
    ),
};
