import type { ReactNode } from "react";
import { Button } from "@repo/ui/button";
import { useFormContext } from "@/lib/form";

export interface SubmitButtonProps {
    label: ReactNode;
    submittingLabel?: ReactNode;
    disabled?: boolean;
    className?: string;
}

export function SubmitButton({ label, submittingLabel, disabled, className }: SubmitButtonProps) {
    const form = useFormContext();
    return (
        <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
                <Button
                    type="submit"
                    className={className ?? "w-full"}
                    disabled={isSubmitting || disabled === true}
                >
                    {isSubmitting ? (submittingLabel ?? label) : label}
                </Button>
            )}
        </form.Subscribe>
    );
}
