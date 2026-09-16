import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback } from "./avatar";
import { Bubble, BubbleContent } from "./bubble";
import {
    Message,
    MessageAvatar,
    MessageContent,
    MessageFooter,
    MessageGroup,
    MessageHeader,
} from "./message";

const meta = { title: "ui/Message", component: Message, tags: ["autodocs"] } satisfies Meta<
    typeof Message
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Thread: Story = {
    render: () => (
        <MessageGroup className="w-[30rem]">
            <Message>
                <MessageAvatar>
                    <Avatar>
                        <AvatarFallback>AL</AvatarFallback>
                    </Avatar>
                </MessageAvatar>
                <MessageContent>
                    <MessageHeader>Ada · 9:41</MessageHeader>
                    <Bubble variant="muted">
                        <BubbleContent>Could you resend invoice INV-1042?</BubbleContent>
                    </Bubble>
                    <MessageFooter>Delivered</MessageFooter>
                </MessageContent>
            </Message>
            <Message align="end">
                <MessageContent>
                    <MessageHeader>You · 9:43</MessageHeader>
                    <Bubble>
                        <BubbleContent>Done — it is on the way.</BubbleContent>
                    </Bubble>
                    <MessageFooter>Read</MessageFooter>
                </MessageContent>
            </Message>
        </MessageGroup>
    ),
};
