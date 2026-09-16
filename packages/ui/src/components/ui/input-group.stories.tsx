import { SearchIcon } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
    InputGroupTextarea,
} from "./input-group";

const meta = { title: "ui/InputGroup", component: InputGroup, tags: ["autodocs"] } satisfies Meta<
    typeof InputGroup
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WithAddons: Story = {
    render: () => (
        <div className="grid w-96 gap-3">
            <InputGroup>
                <InputGroupAddon>
                    <InputGroupText>$</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput defaultValue="4280.00" inputMode="decimal" />
                <InputGroupAddon align="inline-end">
                    <InputGroupText>USD</InputGroupText>
                </InputGroupAddon>
            </InputGroup>
            <InputGroup>
                <InputGroupInput placeholder="Search clients" />
                <InputGroupAddon align="inline-end">
                    <InputGroupButton size="icon-xs" aria-label="Search">
                        <SearchIcon />
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
            <InputGroup>
                <InputGroupTextarea placeholder="Invoice notes" />
                <InputGroupAddon align="block-end">
                    <InputGroupText>Visible to the client</InputGroupText>
                </InputGroupAddon>
            </InputGroup>
        </div>
    ),
};
