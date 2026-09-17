import { Building2Icon } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemMedia,
    ItemTitle,
} from "./item";

const meta = { title: "ui/Item", component: Item, tags: ["autodocs"] } satisfies Meta<typeof Item>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
    render: () => (
        <ItemGroup className="w-[28rem]">
            {(["default", "outline", "muted"] as const).map((variant) => (
                <Item key={variant} variant={variant}>
                    <ItemMedia variant="icon">
                        <Building2Icon />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Northstar Studio</ItemTitle>
                        <ItemDescription>billing@example.test · 12 invoices</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                        <Button size="xs" variant="outline">
                            Open
                        </Button>
                    </ItemActions>
                </Item>
            ))}
        </ItemGroup>
    ),
};
