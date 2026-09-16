import type { Meta, StoryObj } from "@storybook/react";
import { Bubble, BubbleContent } from "./bubble";
import {
    MessageScroller,
    MessageScrollerButton,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerProvider,
    MessageScrollerViewport,
} from "./message-scroller";

const meta = {
    title: "ui/MessageScroller",
    component: MessageScroller,
    tags: ["autodocs"],
} satisfies Meta<typeof MessageScroller>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Conversation: Story = {
    render: () => (
        <MessageScrollerProvider>
            <MessageScroller className="h-64 w-96 rounded-xl border">
                <MessageScrollerViewport>
                    <MessageScrollerContent className="p-4">
                        {Array.from({ length: 10 }, (_, index) => (
                            <MessageScrollerItem key={index} scrollAnchor={index === 9}>
                                <Bubble
                                    variant={index % 2 ? "default" : "muted"}
                                    align={index % 2 ? "end" : "start"}
                                >
                                    <BubbleContent>
                                        Message {index + 1} about invoice INV-1042.
                                    </BubbleContent>
                                </Bubble>
                            </MessageScrollerItem>
                        ))}
                    </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
            </MessageScroller>
        </MessageScrollerProvider>
    ),
};
