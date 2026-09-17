import { z } from "zod";
import {
    type FormErrorConfig,
    formOptions,
    useMutationForm,
    useTypedAppFormContext,
} from "@/lib/form";
import { useCreateClient, useUpdateClient } from "@/lib/queries/clients.queries";

const createOptions = formOptions({
    defaultValues: { name: "", billingEmail: "", currency: "USD" as "USD" | "EUR" },
});
const editOptions = formOptions({ defaultValues: { name: "", billingEmail: "" } });
const commonSchema = {
    name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
    billingEmail: z.string().trim().email("Enter a valid billing email"),
};
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
        validators: { onChange: z.object({ ...commonSchema, currency: z.enum(["USD", "EUR"]) }) },
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
        validators: { onChange: z.object(commonSchema) },
        mutation: useUpdateClient(),
        errorConfig: editErrors,
        toVariables: (values) => ({ id: client.id, ...values }),
    });
}

export function useEditClientFormContext() {
    return useTypedAppFormContext(editOptions);
}
