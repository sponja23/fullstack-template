import { NAME_MAX_LENGTH, SLUG_MAX_LENGTH } from "@repo/protocol";
import type { z } from "zod";

export type IssueCode = z.core.$ZodIssue["code"];

/** The copy a form shows for each field, by the code of the rule it broke. */
export type FieldMessages<TValues> = {
    [Field in keyof TValues]?: Partial<Record<IssueCode, string>>;
};

/** A form validator that checks `schema`'s rules and words each failure with the form's own copy. */
export function withMessages<TSchema extends z.ZodType>(
    schema: TSchema,
    messages: FieldMessages<z.input<TSchema>>,
): Pick<TSchema, "~standard"> {
    const byField = messages as Record<PropertyKey, Partial<Record<IssueCode, string>> | undefined>;
    return {
        "~standard": {
            ...schema["~standard"],
            validate: (value) => {
                const result = schema.safeParse(value, {
                    error: (issue) => {
                        const field = issue.path?.[0];
                        return field === undefined ? undefined : byField[field]?.[issue.code];
                    },
                });
                if (result.success) return { value: result.data };
                return {
                    issues: result.error.issues.map(({ message, path }) => ({ message, path })),
                };
            },
        },
    };
}

/** A limit as the copy writes it, such as "1,000". */
export function count(limit: number): string {
    return limit.toLocaleString("en-US");
}

export const nameMessages = {
    too_small: "Name is required",
    too_big: `Keep the name to ${count(NAME_MAX_LENGTH)} characters`,
};

export const slugMessages = {
    too_small: "Slug is required",
    too_big: `Keep the slug to ${count(SLUG_MAX_LENGTH)} characters`,
    invalid_format: "Use lowercase letters, numbers, and hyphens",
};
