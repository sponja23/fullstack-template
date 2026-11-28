import { z } from "zod";

export const NAME_MAX_LENGTH = 120;
export const SLUG_MAX_LENGTH = 60;

export const nameSchema = z.string().trim().min(1).max(NAME_MAX_LENGTH);

export const slugSchema = z
    .string()
    .min(1)
    .max(SLUG_MAX_LENGTH)
    .regex(/^[a-z0-9-]+$/);

export const idSchema = z.uuid();

export const idInputSchema = z.object({ id: idSchema });
