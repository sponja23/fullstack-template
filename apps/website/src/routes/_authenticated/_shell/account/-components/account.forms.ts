import { z } from "zod";
import {
    type FormErrorConfig,
    formOptions,
    useMutationForm,
    useTypedAppFormContext,
} from "@/lib/form";
import { useChangePassword, useUpdateUser } from "@/lib/queries/auth.queries";

const nameOptions = formOptions({ defaultValues: { name: "" } });

export function useDisplayNameForm(name: string) {
    const form = useMutationForm({
        ...nameOptions,
        defaultValues: { name },
        validators: {
            onChange: z.object({ name: z.string().trim().min(1, "Name is required").max(120) }),
        },
        mutation: useUpdateUser(),
    });
    return form;
}

export function useDisplayNameFormContext() {
    return useTypedAppFormContext(nameOptions);
}

const passwordOptions = formOptions({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
});
type PasswordValues = (typeof passwordOptions)["defaultValues"];
const passwordErrors: FormErrorConfig<PasswordValues> = {
    INVALID_PASSWORD: { field: "currentPassword", message: "The current password is incorrect." },
};

export function usePasswordForm() {
    const form = useMutationForm({
        ...passwordOptions,
        validators: {
            onChange: z
                .object({
                    currentPassword: z.string().min(1, "Current password is required"),
                    newPassword: z.string().min(8, "Use at least 8 characters"),
                    confirmPassword: z.string().min(1, "Confirm your password"),
                })
                .refine((value) => value.newPassword === value.confirmPassword, {
                    path: ["confirmPassword"],
                    message: "Passwords do not match",
                }),
        },
        mutation: useChangePassword(),
        toVariables: ({ currentPassword, newPassword }) => ({ currentPassword, newPassword }),
        errorConfig: passwordErrors,
    });
    return form;
}

export function usePasswordFormContext() {
    return useTypedAppFormContext(passwordOptions);
}
