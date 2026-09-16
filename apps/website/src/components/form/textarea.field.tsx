import type { ReactNode } from "react";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@repo/ui/field";
import { Textarea } from "@repo/ui/textarea";
import { useFieldContext } from "@/lib/form";

export interface TextareaFieldProps {
    label: ReactNode;
    description?: ReactNode;
    placeholder?: string;
    rows?: number;
}

export function TextareaField({ label, description, placeholder, rows }: TextareaFieldProps) {
    const field = useFieldContext<string>();
    const showInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
    const errors = field.state.meta.errors as ReadonlyArray<unknown>;
    return (
        <Field data-invalid={showInvalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <FieldContent>
                <Textarea
                    id={field.name}
                    name={field.name}
                    rows={rows}
                    placeholder={placeholder}
                    aria-invalid={showInvalid}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                />
                {description != null && <FieldDescription>{description}</FieldDescription>}
                {showInvalid && errors.length > 0 && (
                    <FieldError>{formatError(errors[0])}</FieldError>
                )}
            </FieldContent>
        </Field>
    );
}

function formatError(error: unknown): string {
    if (typeof error === "string") return error;
    if (error != null && typeof error === "object" && "message" in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === "string") return message;
    }
    return String(error);
}
