import { FileTextIcon, XIcon } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "./spinner";
import {
    Attachment,
    AttachmentAction,
    AttachmentActions,
    AttachmentContent,
    AttachmentDescription,
    AttachmentGroup,
    AttachmentMedia,
    AttachmentTitle,
} from "./attachment";

const meta = { title: "ui/Attachment", component: Attachment, tags: ["autodocs"] } satisfies Meta<
    typeof Attachment
>;
export default meta;
type Story = StoryObj<typeof meta>;

function FileAttachment({
    state,
    orientation = "horizontal",
}: {
    state: "idle" | "uploading" | "processing" | "error" | "done";
    orientation?: "horizontal" | "vertical";
}) {
    return (
        <Attachment state={state} orientation={orientation}>
            <AttachmentMedia>
                {state === "uploading" ? <Spinner /> : <FileTextIcon />}
            </AttachmentMedia>
            <AttachmentContent>
                <AttachmentTitle>invoice-1042.pdf</AttachmentTitle>
                <AttachmentDescription>
                    {state === "error" ? "Upload failed" : state}
                </AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
                <AttachmentAction aria-label="Remove">
                    <XIcon />
                </AttachmentAction>
            </AttachmentActions>
        </Attachment>
    );
}

export const States: Story = {
    render: () => (
        <AttachmentGroup>
            {(["idle", "uploading", "processing", "error", "done"] as const).map((state) => (
                <FileAttachment key={state} state={state} />
            ))}
        </AttachmentGroup>
    ),
};
export const Vertical: Story = {
    render: () => <FileAttachment state="done" orientation="vertical" />,
};
