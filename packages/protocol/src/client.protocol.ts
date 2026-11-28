import { z } from "zod";
import { idInputSchema, nameSchema } from "./fields.ts";

export const CURRENCIES = ["USD", "EUR"] as const;
export const currencySchema = z.enum(CURRENCIES);
export type Currency = z.infer<typeof currencySchema>;

export const CLIENT_STATUSES = ["active", "archived"] as const;
export const clientStatusSchema = z.enum(CLIENT_STATUSES);
export type ClientStatus = z.infer<typeof clientStatusSchema>;

export const billingEmailSchema = z.string().trim().email();

export const createClientInputSchema = z.object({
    name: nameSchema,
    billingEmail: billingEmailSchema,
    currency: currencySchema,
});

export const updateClientInputSchema = idInputSchema.extend({
    name: nameSchema,
    billingEmail: billingEmailSchema,
});
