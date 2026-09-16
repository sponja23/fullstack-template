import type { Meta, StoryObj } from "@storybook/react";
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "./bubble";

const meta = { title: "ui/Bubble", component: Bubble, tags: ["autodocs"] } satisfies Meta<
    typeof Bubble
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Conversation: Story = {
    render: () => (
        <BubbleGroup className="w-96">
            <Bubble variant="muted">
                <BubbleContent>Could you resend invoice INV-1042?</BubbleContent>
            </Bubble>
            <Bubble variant="default" align="end">
                <BubbleContent>Done — it is on the way.</BubbleContent>
                <BubbleReactions>✓</BubbleReactions>
            </Bubble>
        </BubbleGroup>
    ),
};

export const Variants: Story = {
    render: () => (
        <BubbleGroup>
            {(
                [
                    "default",
                    "secondary",
                    "muted",
                    "tinted",
                    "outline",
                    "ghost",
                    "destructive",
                ] as const
            ).map((variant) => (
                <Bubble key={variant} variant={variant}>
                    <BubbleContent>{variant}</BubbleContent>
                </Bubble>
            ))}
        </BubbleGroup>
    ),
};
