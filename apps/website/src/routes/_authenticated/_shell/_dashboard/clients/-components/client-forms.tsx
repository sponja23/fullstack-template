import { FormError } from "@/components/form/form-error";
import {
    useCreateClientForm,
    useCreateClientFormContext,
    useEditClientForm,
    useEditClientFormContext,
} from "./client.form";

export function CreateClientForm({ onSuccess }: { onSuccess: () => void }) {
    const form = useCreateClientForm({ onSuccess });
    return (
        <form.AppForm>
            <form
                className="space-y-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    void form.handleSubmit();
                }}
            >
                <CreateNameField />
                <CreateBillingEmailField />
                <CurrencyField />
                <FormError />
                <form.SubmitButton label="Create client" submittingLabel="Creating…" />
            </form>
        </form.AppForm>
    );
}

export function EditClientForm({
    client,
}: {
    client: { id: string; name: string; billingEmail: string };
}) {
    const form = useEditClientForm(client);
    return (
        <form.AppForm>
            <form
                className="space-y-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    void form.handleSubmit();
                }}
            >
                <EditNameField />
                <EditBillingEmailField />
                <FormError />
                <form.SubmitButton label="Save client" submittingLabel="Saving…" />
            </form>
        </form.AppForm>
    );
}

function CreateNameField() {
    const form = useCreateClientFormContext();
    return (
        <form.AppField name="name">
            {(field) => <field.TextField label="Name" autoComplete="organization" />}
        </form.AppField>
    );
}

function CreateBillingEmailField() {
    const form = useCreateClientFormContext();
    return (
        <form.AppField name="billingEmail">
            {(field) => <field.TextField label="Billing email" type="email" />}
        </form.AppField>
    );
}

function CurrencyField() {
    const form = useCreateClientFormContext();
    return (
        <form.AppField name="currency">
            {(field) => (
                <field.SelectField
                    label="Currency"
                    options={[
                        { value: "USD", label: "USD — US dollar" },
                        { value: "EUR", label: "EUR — Euro" },
                    ]}
                    description="Currency cannot be changed later."
                />
            )}
        </form.AppField>
    );
}

function EditNameField() {
    const form = useEditClientFormContext();
    return <form.AppField name="name">{(field) => <field.TextField label="Name" />}</form.AppField>;
}

function EditBillingEmailField() {
    const form = useEditClientFormContext();
    return (
        <form.AppField name="billingEmail">
            {(field) => <field.TextField label="Billing email" type="email" />}
        </form.AppField>
    );
}
