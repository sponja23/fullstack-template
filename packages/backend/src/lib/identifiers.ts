import { z } from "zod";

export const slugSchema = z
    .string()
    .min(1, "Slug is required")
    .max(60, "Slug is too long")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only");

export const nameSchema = z.string().trim().min(1, "Name is required").max(120, "Name is too long");
