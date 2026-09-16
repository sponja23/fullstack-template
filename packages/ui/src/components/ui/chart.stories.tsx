import type { Meta, StoryObj } from "@storybook/react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./chart";

const config = {
    revenue: { label: "Revenue", color: "var(--color-primary)" },
} satisfies ChartConfig;
const data = [
    { month: "May", revenue: 12400 },
    { month: "Jun", revenue: 18100 },
    { month: "Jul", revenue: 15900 },
    { month: "Aug", revenue: 22300 },
];
const meta = { title: "ui/Chart", tags: ["autodocs"] } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Revenue: Story = {
    render: () => (
        <ChartContainer config={config} className="h-64 w-[32rem]">
            <BarChart data={data}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={6} />
            </BarChart>
        </ChartContainer>
    ),
};
