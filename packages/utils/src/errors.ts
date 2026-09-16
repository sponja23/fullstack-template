/** Reduce a caught `unknown` to a human-readable string. */
export function errMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
