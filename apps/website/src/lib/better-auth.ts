export class BetterAuthActionError extends Error {
    constructor(
        readonly code: string | undefined,
        message: string,
    ) {
        super(message);
        this.name = "BetterAuthActionError";
    }
}

type AuthResult =
    | { data: unknown; error: null }
    | { data: null; error: { code?: string | null; message?: string } };

export async function unwrapAuthResult<R extends AuthResult>(
    call: Promise<R>,
    fallbackMessage: string,
): Promise<NonNullable<R["data"]>> {
    const result: AuthResult = await call;
    if (result.error) {
        throw new BetterAuthActionError(
            result.error.code ?? undefined,
            result.error.message ?? fallbackMessage,
        );
    }
    return result.data as NonNullable<R["data"]>;
}
