import type { Meta, StoryObj } from "@storybook/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

const meta = { title: "ui/Accordion", component: Accordion, tags: ["autodocs"] } satisfies Meta<
    typeof Accordion
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
    render: () => (
        <Accordion defaultValue={["billing"]} className="w-96">
            <AccordionItem value="billing">
                <AccordionTrigger>How does billing work?</AccordionTrigger>
                <AccordionContent>
                    Invoices are created as drafts and issued when they are ready.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="payments">
                <AccordionTrigger>Can I record a payment?</AccordionTrigger>
                <AccordionContent>Yes. Issued invoices can be marked paid.</AccordionContent>
            </AccordionItem>
        </Accordion>
    ),
};
