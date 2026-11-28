import { FormError } from "@/components/form/form-error";
import { useManualLineForm, useManualLineFormContext } from "./manual-line.form";

export function ManualLineForm({ invoiceId, currency }: { invoiceId: string; currency: string }) {
    const form = useManualLineForm(invoiceId);
    return (
        <form.AppForm>
            <form
                className="space-y-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    void form.handleSubmit();
                }}
            >
                <DescriptionField />
                <div className="grid grid-cols-2 gap-2">
                    <QuantityField />
                    <AmountField currency={currency} />
                </div>
                <FormError />
                <form.SubmitButton label="Add manual line" submittingLabel="Adding…" />
            </form>
        </form.AppForm>
    );
}

function DescriptionField() {
    const form = useManualLineFormContext();
    return (
        <form.AppField name="description">
            {(field) => <field.TextField label="Description" />}
        </form.AppField>
    );
}

function QuantityField() {
    const form = useManualLineFormContext();
    return (
        <form.AppField name="quantity">
            {(field) => <field.TextField label="Quantity" />}
        </form.AppField>
    );
}

function AmountField({ currency }: { currency: string }) {
    const form = useManualLineFormContext();
    return (
        <form.AppField name="amount">
            {(field) => (
                <field.TextField label={`Unit amount (${currency})`} placeholder="125.00" />
            )}
        </form.AppField>
    );
}
