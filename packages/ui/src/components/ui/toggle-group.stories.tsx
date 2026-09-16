import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

const meta = { title: "ui/ToggleGroup", component: ToggleGroup, tags: ["autodocs"] } satisfies Meta<
    typeof ToggleGroup
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Alignment: Story = {
    render: () => (
        <ToggleGroup defaultValue={["left"]} variant="outline" spacing={0}>
            <ToggleGroupItem value="left" aria-label="Align left">
                <AlignLeftIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="center" aria-label="Align center">
                <AlignCenterIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="right" aria-label="Align right">
                <AlignRightIcon />
            </ToggleGroupItem>
        </ToggleGroup>
    ),
};
