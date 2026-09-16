import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent } from "./card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "./carousel";

const meta = { title: "ui/Carousel", component: Carousel, tags: ["autodocs"] } satisfies Meta<
    typeof Carousel
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Invoices: Story = {
    render: () => (
        <Carousel className="w-72">
            <CarouselContent>
                {["INV-1042", "INV-1041", "INV-1040"].map((number) => (
                    <CarouselItem key={number}>
                        <Card>
                            <CardContent className="flex h-36 items-center justify-center text-xl font-semibold">
                                {number}
                            </CardContent>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    ),
};
