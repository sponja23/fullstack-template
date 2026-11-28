import type { ReactNode } from "react";
import { Checkbox } from "@repo/ui/checkbox";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@repo/ui/field";
import { useFieldContext } from "@/lib/form";

export interface CheckboxGroupOption {
    label: ReactNode;
    value: string;
}

export interface CheckboxGroupFieldProps {
    label: ReactNode;
    options: readonly CheckboxGroupOption[];
    description?: ReactNode;
}

export function CheckboxGroupField({ label, options, description }: CheckboxGroupFieldProps) {
    const field = useFieldContext<string[]>();
    const showInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
    const errors = field.state.meta.errors as ReadonlyArray<unknown>;
    const toggle = (value: string, checked: boolean) => {
        const others = field.state.value.filter((current) => current !== value);
        field.handleChange(checked ? [...others, value] : others);
        field.handleBlur();
    };
    return (
        <FieldSet data-invalid={showInvalid}>
            <FieldLegend variant="label">{label}</FieldLegend>
            {description != null && <FieldDescription>{description}</FieldDescription>}
            <div data-slot="checkbox-group" className="grid gap-3 sm:grid-cols-3">
                {options.map((option) => {
                    const id = `${field.name}-${option.value}`;
                    return (
                        <Field key={option.value} orientation="horizontal">
                            <Checkbox
                                id={id}
                                aria-invalid={showInvalid}
                                checked={field.state.value.includes(option.value)}
                                onCheckedChange={(checked) => toggle(option.value, checked)}
                            />
                            <FieldContent>
                                <FieldLabel htmlFor={id}>{option.label}</FieldLabel>
                            </FieldContent>
                        </Field>
                    );
                })}
            </div>
            {showInvalid && errors.length > 0 && <FieldError>{formatError(errors[0])}</FieldError>}
        </FieldSet>
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
