import type { BackendError } from "../errors/base.ts";

type ConstraintErrorMapping = Readonly<Record<string, (cause: unknown) => BackendError>>;

/** Maps a recognized Postgres constraint violation from one statement to a domain error. */
export async function withConstraintErrors<T>(
    write: () => Promise<T>,
    mapping: ConstraintErrorMapping,
): Promise<T> {
    try {
        return await write();
    } catch (error) {
        const violation = pgConstraintViolation(error);
        if (violation !== undefined) {
            const errorFactory = mapping[violation.constraint];
            if (errorFactory !== undefined) throw errorFactory(violation.cause);
        }
        throw error;
    }
}

function pgConstraintViolation(error: unknown): { constraint: string; cause: unknown } | undefined {
    let current: unknown = error;
    while (typeof current === "object" && current !== null) {
        const code = (current as { code?: unknown }).code;
        if (code === "23505" || code === "23514" || code === "23503") {
            const constraint = (current as { constraint?: unknown }).constraint;
            return typeof constraint === "string" ? { constraint, cause: current } : undefined;
        }
        if (!("cause" in current)) return undefined;
        current = (current as { cause?: unknown }).cause;
    }
    return undefined;
}
