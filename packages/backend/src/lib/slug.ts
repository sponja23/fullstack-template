import { randomBytes } from "node:crypto";

const BASE_MAX_LENGTH = 40;
const SUFFIX_BYTES = 8;

export function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function generateSlug(name: string): string {
    const base = slugify(name).slice(0, BASE_MAX_LENGTH).replace(/-+$/, "");
    const suffix = randomBytes(SUFFIX_BYTES).toString("hex");
    return base ? `${base}-${suffix}` : suffix;
}
