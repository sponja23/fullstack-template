import { z } from "zod";
import { formOptions, useMutationForm, useTypedAppFormContext } from "@/lib/form";
import { useSignUp } from "@/lib/queries/auth.queries";

const schema = z
    .object({
        name: z.string().trim().min(1, "Name is required"),
        email: z.email("Enter a valid email"),
        password: z.string().min(8, "Use at least 8 characters"),
        confirmPassword: z.string().min(1, "Confirm your password"),
    })
    .refine((values) => values.password === values.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    });
const options = formOptions({
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
});

export function useSignupForm(onSuccess: () => void | Promise<void>) {
    return useMutationForm({
        ...options,
        validators: { onChange: schema },
        mutation: useSignUp(),
        toVariables: ({ name, email, password }) => ({ name, email, password }),
        errorConfig: {
            USER_ALREADY_EXISTS: { field: "email", message: "An account already uses this email." },
        },
        onSuccess,
    });
}

export function useSignupFormContext() {
    return useTypedAppFormContext(options);
}
