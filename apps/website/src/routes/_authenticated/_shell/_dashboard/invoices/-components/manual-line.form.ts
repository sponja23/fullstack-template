import {
    LINE_DESCRIPTION_MAX_LENGTH,
    lineDescriptionSchema,
    lineQuantitySchema,
    unitAmountMinorSchema,
} from "@repo/protocol";
import { z } from "zod";
import {
    type FormErrorConfig,
    formOptions,
    useMutationForm,
    useTypedAppFormContext,
} from "@/lib/form";
import { count, withMessages } from "@/lib/form-messages";
import { amountText, numberText, toMinor } from "@/lib/number-text";
import { useAddManualLine } from "@/lib/queries/invoices.queries";

const options = formOptions({ defaultValues: { description: "", quantity: "1", amount: "" } });
type Values = (typeof options)["defaultValues"];
const schema = withMessages(
    z.object({
        description: lineDescriptionSchema,
        quantity: numberText(lineQuantitySchema),
        amount: amountText(unitAmountMinorSchema),
    }),
    {
        description: {
            too_small: "Describe the line",
            too_big: `Keep the description to ${count(LINE_DESCRIPTION_MAX_LENGTH)} characters`,
        },
        quantity: {
            invalid_format: "Enter a whole quantity",
            invalid_type: "Enter a whole quantity",
            too_small: "Quantity must be at least 1",
        },
        amount: { invalid_format: "Enter a non-negative amount" },
    },
);
const errorConfig: FormErrorConfig<Values> = {
    INVOICE_NOT_EDITABLE: { message: "Only a draft invoice can be changed." },
};

export function useManualLineForm(invoiceId: string) {
    const form = useMutationForm({
        ...options,
        validators: { onChange: schema },
        mutation: useAddManualLine(),
        errorConfig,
        toVariables: ({ description, quantity, amount }: Values) => ({
            invoiceId,
            description,
            quantity: Number(quantity),
            unitAmountMinor: toMinor(amount),
        }),
        onSuccess: (): void => form.reset(),
    });
    return form;
}

export function useManualLineFormContext() {
    return useTypedAppFormContext(options);
}
