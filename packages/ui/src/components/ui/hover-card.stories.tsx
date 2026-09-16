import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback } from "./avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

const meta = { title: "ui/HoverCard", component: HoverCard, tags: ["autodocs"] } satisfies Meta<
    typeof HoverCard
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ClientPreview: Story = {
    render: () => (
        <div className="flex min-h-40 items-start justify-center">
            <HoverCard defaultOpen>
                <HoverCardTrigger className="text-sm underline underline-offset-4">
                    Acme Inc.
                </HoverCardTrigger>
                <HoverCardContent>
                    <div className="flex gap-3">
                        <Avatar>
                            <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">Acme Inc.</div>
                            <div className="text-muted-foreground">
                                12 invoices · $48,200 billed
                            </div>
                        </div>
                    </div>
                </HoverCardContent>
            </HoverCard>
        </div>
    ),
};
