import { TRPCError } from "@trpc/server";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

export type BackendErrorCode =
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "BAD_REQUEST"
    | "CLIENT_NOT_FOUND"
    | "CLIENT_NAME_TAKEN"
    | "PROJECT_NOT_FOUND"
    | "PROJECT_SLUG_TAKEN"
    | "PROJECT_ARCHIVED"
    | "TIME_ENTRY_NOT_FOUND"
    | "TIME_ENTRY_BILLED"
    | "INVOICE_NOT_FOUND"
    | "INVOICE_NOT_EDITABLE"
    | "INVOICE_EMPTY"
    | "INVALID_INVOICE_TRANSITION"
    | "CURRENCY_MISMATCH";

export abstract class BackendError extends Error {
    abstract readonly errorCode: BackendErrorCode;
    abstract readonly trpcCode: TRPC_ERROR_CODE_KEY;

    toTRPCError(): TRPCError {
        return new TRPCError({ code: this.trpcCode, message: this.message, cause: this });
    }
}

export abstract class NotFoundError extends BackendError {
    readonly trpcCode = "NOT_FOUND" as const;
}

export abstract class ConflictError extends BackendError {
    readonly trpcCode = "CONFLICT" as const;
}

export class UnauthorizedError extends BackendError {
    readonly errorCode = "UNAUTHORIZED" as const;
    readonly trpcCode = "UNAUTHORIZED" as const;
    constructor(message = "Unauthorized") {
        super(message);
    }
}

export class ForbiddenError extends BackendError {
    readonly errorCode = "FORBIDDEN" as const;
    readonly trpcCode = "FORBIDDEN" as const;
    constructor(message = "Forbidden") {
        super(message);
    }
}

export class BadRequestError extends BackendError {
    readonly errorCode = "BAD_REQUEST" as const;
    readonly trpcCode = "BAD_REQUEST" as const;
    constructor(message: string) {
        super(message);
    }
}
