import { FileTextIcon, SearchIcon, UserIcon } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "./command";

const meta = { title: "ui/Command", component: Command, tags: ["autodocs"] } satisfies Meta<
    typeof Command
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Palette: Story = {
    render: () => (
        <Command className="w-96 rounded-xl border">
            <CommandInput placeholder="Search invoices and clients…" />
            <CommandList>
                <CommandEmpty>No result found.</CommandEmpty>
                <CommandGroup heading="Invoices">
                    <CommandItem>
                        <FileTextIcon />
                        Create invoice<CommandShortcut>⌘N</CommandShortcut>
                    </CommandItem>
                    <CommandItem>
                        <SearchIcon />
                        Find invoice
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Clients">
                    <CommandItem>
                        <UserIcon />
                        Open Northstar Studio
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </Command>
    ),
};
