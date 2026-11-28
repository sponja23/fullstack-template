import { z } from "zod";

const NUMBER_TEXT = /^\d+(\.\d+)?$/;
const AMOUNT_TEXT = /^\d+(\.\d{1,2})?$/;

/** A number typed as text, which `schema` then checks as the number the wire carries. */
export function numberText<TSchema extends z.ZodType<unknown, number>>(schema: TSchema) {
    return z.string().regex(NUMBER_TEXT).transform(Number).pipe(schema);
}

/** An amount typed in major units, which `schema` then checks in the minor units the wire carries. */
export function amountText<TSchema extends z.ZodType<unknown, number>>(schema: TSchema) {
    return z.string().regex(AMOUNT_TEXT).transform(toMinor).pipe(schema);
}

export function toMinor(amount: string): number {
    return Math.round(Number(amount) * 100);
}
