/** Reduce a caught `unknown` to a human-readable string. */
export function errMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

/** A switch met a value its type rules out, so the type and the runtime data disagree. */
export class UnreachableError extends Error {
    readonly value: unknown;

    constructor(value: never) {
        super(`unreachable value: ${describe(value)}`);
        this.name = "UnreachableError";
        this.value = value;
    }
}

function describe(value: unknown): string {
    try {
        return JSON.stringify(value) ?? String(value);
    } catch {
        return String(value);
    }
}
