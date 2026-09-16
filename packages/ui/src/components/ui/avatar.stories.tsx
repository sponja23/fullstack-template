import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount } from "./avatar";

const meta = { title: "ui/Avatar", component: Avatar, tags: ["autodocs"] } satisfies Meta<
    typeof Avatar
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
    render: () => (
        <AvatarGroup>
            <Avatar size="sm">
                <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <Avatar>
                <AvatarFallback>GH</AvatarFallback>
                <AvatarBadge />
            </Avatar>
            <Avatar size="lg">
                <AvatarFallback>KM</AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+4</AvatarGroupCount>
        </AvatarGroup>
    ),
};
