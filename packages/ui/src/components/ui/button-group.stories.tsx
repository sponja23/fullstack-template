import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { ButtonGroup, ButtonGroupText } from "./button-group";

const meta = { title: "ui/ButtonGroup", component: ButtonGroup, tags: ["autodocs"] } satisfies Meta<
    typeof ButtonGroup
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
    render: () => (
        <ButtonGroup>
            <Button variant="outline">Previous</Button>
            <Button variant="outline">Next</Button>
            <ButtonGroupText>2 of 8</ButtonGroupText>
        </ButtonGroup>
    ),
};
export const Vertical: Story = {
    render: () => (
        <ButtonGroup orientation="vertical">
            <Button variant="outline">Draft</Button>
            <Button variant="outline">Issued</Button>
            <Button variant="outline">Paid</Button>
        </ButtonGroup>
    ),
};
