import { FieldError } from "@repo/ui/field";
import { useFormContext } from "@/lib/form";

/** Renders the form-level error set by `useMutationForm`. */
export function FormError() {
    const form = useFormContext();
    return (
        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
            {(error) => {
                const message = extractMessage(error);
                return message === undefined ? null : <FieldError>{message}</FieldError>;
            }}
        </form.Subscribe>
    );
}

function extractMessage(error: unknown): string | undefined {
    if (typeof error === "string") return error;
    if (error != null && typeof error === "object" && "form" in error) {
        const formError = (error as { form?: unknown }).form;
        return typeof formError === "string" ? formError : undefined;
    }
    return undefined;
}
