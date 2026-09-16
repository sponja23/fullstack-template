import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "./drawer";

const meta = { title: "ui/Drawer", component: Drawer, tags: ["autodocs"] } satisfies Meta<
    typeof Drawer
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Bottom: Story = {
    render: () => (
        <Drawer defaultOpen>
            <DrawerTrigger render={<Button variant="outline" />}>Show totals</DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Invoice total</DrawerTitle>
                    <DrawerDescription>Three items plus tax.</DrawerDescription>
                </DrawerHeader>
                <div className="px-4 py-6 text-center text-3xl font-semibold">$4,280.00</div>
                <DrawerFooter>
                    <DrawerClose render={<Button />}>Done</DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    ),
};
