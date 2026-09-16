import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
    FieldLegend,
} from "./field";

const meta = { title: "ui/Field", component: Field, tags: ["autodocs"] } satisfies Meta<
    typeof Field
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Form: Story = {
    render: () => (
        <FieldSet className="w-96">
            <FieldLegend>Client details</FieldLegend>
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="field-name">Name</FieldLabel>
                    <Input id="field-name" defaultValue="Acme Inc." />
                    <FieldDescription>Shown on invoices and receipts.</FieldDescription>
                </Field>
                <Field data-invalid="true">
                    <FieldLabel htmlFor="field-email">Billing email</FieldLabel>
                    <Input id="field-email" defaultValue="invalid" aria-invalid />
                    <FieldError>Enter a valid email address.</FieldError>
                </Field>
            </FieldGroup>
        </FieldSet>
    ),
};
export const Horizontal: Story = {
    render: () => (
        <Field orientation="horizontal" className="w-96">
            <FieldLabel htmlFor="reference">Reference</FieldLabel>
            <Input id="reference" defaultValue="PO-2026-17" />
        </Field>
    ),
};
