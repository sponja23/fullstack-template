import { z } from "zod";
import { FormError } from "@/components/form/form.error";
import { type FormErrorConfig, formOptions, useMutationForm } from "@/lib/form";
import { useCreateClient, useUpdateClient } from "@/lib/queries/clients.queries";

const createOptions = formOptions({
    defaultValues: { name: "", billingEmail: "", currency: "USD" as "USD" | "EUR" },
});
const editOptions = formOptions({ defaultValues: { name: "", billingEmail: "" } });
const commonSchema = {
    name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
    billingEmail: z.string().trim().email("Enter a valid billing email"),
};
const createSchema = z.object({ ...commonSchema, currency: z.enum(["USD", "EUR"]) });
const editSchema = z.object(commonSchema);
const createErrors: FormErrorConfig<(typeof createOptions)["defaultValues"]> = {
    CLIENT_NAME_TAKEN: { field: "name", message: "A client with this name already exists." },
};
const editErrors: FormErrorConfig<(typeof editOptions)["defaultValues"]> = {
    CLIENT_NAME_TAKEN: { field: "name", message: "A client with this name already exists." },
};

export function CreateClientForm({ onSuccess }: { onSuccess: () => void }) {
    const mutation = useCreateClient();
    const form = useMutationForm({
        ...createOptions,
        validators: { onChange: createSchema },
        mutation,
        errorConfig: createErrors,
        onSuccess,
    });
    return (
        <form.AppForm>
            <form
                className="space-y-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    void form.handleSubmit();
                }}
            >
                <form.AppField name="name">
                    {(field) => <field.TextField label="Name" autoComplete="organization" />}
                </form.AppField>
                <form.AppField name="billingEmail">
                    {(field) => <field.TextField label="Billing email" type="email" />}
                </form.AppField>
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
    const mutation = useUpdateClient();
    const form = useMutationForm({
        ...editOptions,
        defaultValues: { name: client.name, billingEmail: client.billingEmail },
        validators: { onChange: editSchema },
        mutation,
        errorConfig: editErrors,
        toVariables: (values) => ({ id: client.id, ...values }),
    });
    return (
        <form.AppForm>
            <form
                className="space-y-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    void form.handleSubmit();
                }}
            >
                <form.AppField name="name">
                    {(field) => <field.TextField label="Name" />}
                </form.AppField>
                <form.AppField name="billingEmail">
                    {(field) => <field.TextField label="Billing email" type="email" />}
                </form.AppField>
                <FormError />
                <form.SubmitButton label="Save client" submittingLabel="Saving…" />
            </form>
        </form.AppForm>
    );
}
