import { type Currency, createClientInputSchema, updateClientInputSchema } from "@repo/protocol";
import {
    type FormErrorConfig,
    formOptions,
    useMutationForm,
    useTypedAppFormContext,
} from "@/lib/form";
import { nameMessages, withMessages } from "@/lib/form-messages";
import { useCreateClient, useUpdateClient } from "@/lib/queries/clients.queries";

const createOptions = formOptions({
    defaultValues: { name: "", billingEmail: "", currency: "USD" as Currency },
});
const editOptions = formOptions({ defaultValues: { name: "", billingEmail: "" } });
const messages = {
    name: nameMessages,
    billingEmail: { invalid_format: "Enter a valid billing email" },
};
const createSchema = withMessages(createClientInputSchema, messages);
const editSchema = withMessages(updateClientInputSchema.omit({ id: true }), messages);
const nameTaken = { field: "name", message: "A client with this name already exists." } as const;
const createErrors: FormErrorConfig<(typeof createOptions)["defaultValues"]> = {
    CLIENT_NAME_TAKEN: nameTaken,
};
const editErrors: FormErrorConfig<(typeof editOptions)["defaultValues"]> = {
    CLIENT_NAME_TAKEN: nameTaken,
};

export function useCreateClientForm({ onSuccess }: { onSuccess: () => void }) {
    return useMutationForm({
        ...createOptions,
        validators: { onChange: createSchema },
        mutation: useCreateClient(),
        errorConfig: createErrors,
        onSuccess,
    });
}

export function useCreateClientFormContext() {
    return useTypedAppFormContext(createOptions);
}

export function useEditClientForm(client: { id: string; name: string; billingEmail: string }) {
    return useMutationForm({
        ...editOptions,
        defaultValues: { name: client.name, billingEmail: client.billingEmail },
        validators: { onChange: editSchema },
        mutation: useUpdateClient(),
        errorConfig: editErrors,
        toVariables: (values) => ({ id: client.id, ...values }),
    });
}

export function useEditClientFormContext() {
    return useTypedAppFormContext(editOptions);
}
