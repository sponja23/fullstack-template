import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = { title: "ui/Tabs", component: Tabs, tags: ["autodocs"] } satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

const content = (
    <>
        <TabsContent value="overview">Invoice totals and payment status.</TabsContent>
        <TabsContent value="activity">A chronological audit trail.</TabsContent>
    </>
);
export const Default: Story = {
    render: () => (
        <Tabs defaultValue="overview" className="w-96">
            <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            {content}
        </Tabs>
    ),
};
export const Line: Story = {
    render: () => (
        <Tabs defaultValue="overview" className="w-96">
            <TabsList variant="line">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            {content}
        </Tabs>
    ),
};
export const Vertical: Story = {
    render: () => (
        <Tabs defaultValue="overview" orientation="vertical" className="w-96">
            <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            {content}
        </Tabs>
    ),
};
