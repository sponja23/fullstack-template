import type { Meta, StoryObj } from "@storybook/react";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "./combobox";

const meta = { title: "ui/Combobox", component: Combobox, tags: ["autodocs"] } satisfies Meta<
    typeof Combobox
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Clients: Story = {
    render: () => (
        <div className="min-h-48">
            <Combobox defaultOpen defaultValue="northstar">
                <ComboboxInput placeholder="Choose a client" />
                <ComboboxContent>
                    <ComboboxEmpty>No client found.</ComboboxEmpty>
                    <ComboboxList>
                        <ComboboxItem value="northstar">Northstar Studio</ComboboxItem>
                        <ComboboxItem value="globex">Globex</ComboboxItem>
                        <ComboboxItem value="initech">Initech</ComboboxItem>
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </div>
    ),
};
