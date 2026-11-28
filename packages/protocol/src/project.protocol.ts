import { z } from "zod";
import { idInputSchema, idSchema, nameSchema, slugSchema } from "./fields.ts";

export const PROJECT_STATUSES = ["active", "archived"] as const;
export const projectStatusSchema = z.enum(PROJECT_STATUSES);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

/** An hourly rate in the client's currency, in minor units. */
export const rateMinorSchema = z.number().int().nonnegative();

export const projectRefInputSchema = z.object({ slug: slugSchema });

export const listProjectsInputSchema = z.object({ clientId: idSchema.optional() }).optional();

export const createProjectInputSchema = z.object({
    clientId: idSchema,
    name: nameSchema,
    slug: slugSchema,
    rateMinor: rateMinorSchema,
});

export const updateProjectInputSchema = idInputSchema.extend({
    name: nameSchema,
    slug: slugSchema,
    rateMinor: rateMinorSchema,
});
