import type { ReactNode } from "react";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@repo/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { useFieldContext } from "@/lib/form";

export interface SelectFieldOption {
    label: ReactNode;
    value: string;
}

export interface SelectFieldProps {
    label: ReactNode;
    options: SelectFieldOption[];
    description?: ReactNode;
    placeholder?: ReactNode;
}

export function SelectField({ label, options, description, placeholder }: SelectFieldProps) {
    const field = useFieldContext<string>();
    const showInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
    const errors = field.state.meta.errors as ReadonlyArray<unknown>;
    return (
        <Field data-invalid={showInvalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <FieldContent>
                <Select
                    name={field.name}
                    items={options}
                    value={field.state.value === "" ? null : field.state.value}
                    onValueChange={(value) => {
                        field.handleChange(value ?? "");
                        field.handleBlur();
                    }}
                >
                    <SelectTrigger id={field.name} aria-invalid={showInvalid} className="w-full">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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
