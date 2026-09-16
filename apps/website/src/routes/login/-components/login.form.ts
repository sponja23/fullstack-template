import { z } from "zod";
import { formOptions, useMutationForm, useTypedAppFormContext } from "@/lib/form";
import { useSignIn } from "@/lib/queries/auth.queries";

const schema = z.object({
    email: z.email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
});
const options = formOptions({ defaultValues: { email: "", password: "" } });

export function useLoginForm(onSuccess: () => void | Promise<void>) {
    return useMutationForm({
        ...options,
        validators: { onChange: schema },
        mutation: useSignIn(),
        errorConfig: { INVALID_EMAIL_OR_PASSWORD: { message: "Email or password is incorrect." } },
        onSuccess,
    });
}

export function useLoginFormContext() {
    return useTypedAppFormContext(options);
}
