import { z } from "zod";
import { idSchema } from "./fields.ts";

export const NOTE_MAX_LENGTH = 1_000;

export const dateSchema = z.string().date();
export const minutesSchema = z.number().int().positive();
export const noteSchema = z.string().trim().max(NOTE_MAX_LENGTH);

const timeValuesSchema = z.object({
    date: dateSchema,
    minutes: minutesSchema,
    note: noteSchema,
});

export const listProjectTimeEntriesInputSchema = z.object({ projectId: idSchema });
export const listMyTimeEntriesInputSchema = z.object({ from: dateSchema, to: dateSchema });
export const createTimeEntryInputSchema = timeValuesSchema.extend({ projectId: idSchema });
export const updateTimeEntryInputSchema = timeValuesSchema.extend({ id: idSchema });
