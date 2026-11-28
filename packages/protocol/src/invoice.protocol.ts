import { z } from "zod";
import { idSchema } from "./fields.ts";

export const INVOICE_STATUSES = ["draft", "issued", "paid", "void"] as const;
export const invoiceStatusSchema = z.enum(INVOICE_STATUSES);
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;

export const LINE_ITEM_KINDS = ["generated", "manual"] as const;
export const lineItemKindSchema = z.enum(LINE_ITEM_KINDS);
export type LineItemKind = z.infer<typeof lineItemKindSchema>;

export const LINE_DESCRIPTION_MAX_LENGTH = 1_000;

export const lineDescriptionSchema = z.string().trim().min(1).max(LINE_DESCRIPTION_MAX_LENGTH);
export const lineQuantitySchema = z.number().int().positive();
export const unitAmountMinorSchema = z.number().int().nonnegative();

export const invoiceRefInputSchema = z.object({ invoiceId: idSchema });

export const listInvoicesInputSchema = z
    .object({ status: invoiceStatusSchema.optional() })
    .optional();

export const createDraftInvoiceInputSchema = z.object({ clientId: idSchema });

export const addManualLineInputSchema = invoiceRefInputSchema.extend({
    description: lineDescriptionSchema,
    quantity: lineQuantitySchema,
    unitAmountMinor: unitAmountMinorSchema,
});

export const addTimeLinesInputSchema = invoiceRefInputSchema.extend({
    entryIds: z.array(idSchema).min(1),
});

export const removeLineInputSchema = invoiceRefInputSchema.extend({ lineItemId: idSchema });
