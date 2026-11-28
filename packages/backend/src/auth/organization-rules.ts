import { nameSchema, slugSchema } from "@repo/protocol";
import { APIError } from "better-auth/api";
import type { z } from "zod";

const rules = { name: nameSchema, slug: slugSchema } as const;
type RuledField = keyof typeof rules;

export class InvalidOrganizationFieldError extends APIError {
    constructor(
        readonly field: RuledField,
        cause: z.ZodError,
    ) {
        super("BAD_REQUEST", {
            code: "INVALID_ORGANIZATION_FIELD",
            message: `Organization ${field} breaks its rule`,
        });
        this.name = "InvalidOrganizationFieldError";
        this.cause = cause;
    }
}

function ruled(field: RuledField, value: string | undefined): { [key: string]: string } {
    if (value === undefined) return {};
    const parsed = rules[field].safeParse(value);
    if (!parsed.success) throw new InvalidOrganizationFieldError(field, parsed.error);
    return { [field]: parsed.data };
}

/** Returns the organization with its name and slug parsed, so a stored name is trimmed. */
export function ruledOrganization<T extends { name?: string; slug?: string }>(organization: T): T {
    return {
        ...organization,
        ...ruled("name", organization.name),
        ...ruled("slug", organization.slug),
    };
}
