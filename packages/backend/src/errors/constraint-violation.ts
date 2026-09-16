import type { ConstraintName } from "../db/constraint-names.ts";
import type { BackendError } from "./base.ts";

export type ConstraintViolationRegistry = Record<ConstraintName, (cause: unknown) => BackendError>;

/** Returns a recognized Postgres constraint name while walking wrapped causes. */
export function pgConstraintViolation(error: unknown): string | undefined {
    let current: unknown = error;
    while (typeof current === "object" && current !== null) {
        const code = (current as { code?: unknown }).code;
        if (code === "23505" || code === "23514" || code === "23503") {
            const constraint = (current as { constraint?: unknown }).constraint;
            return typeof constraint === "string" ? constraint : undefined;
        }
        if ("cause" in current) {
            current = (current as { cause?: unknown }).cause;
            continue;
        }
        return undefined;
    }
    return undefined;
}
