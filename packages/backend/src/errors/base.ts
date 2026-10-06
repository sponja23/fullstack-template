import { TRPCError } from "@trpc/server";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";
import { z } from "zod";

export type BackendErrorCode =
    | "UNAUTHORIZED"
    | "NOT_ORGANIZATION_OWNER"
    | "NOT_ORGANIZATION_MEMBER"
    | "NOT_SUPERADMIN"
    | "BAD_REQUEST"
    | "NO_ACTIVE_ORGANIZATION"
    | "MALFORMED_JSON_BODY"
    | "SUPERADMIN_USER_NOT_FOUND"
    | "CLIENT_NOT_FOUND"
    | "CLIENT_NAME_TAKEN"
    | "CLIENT_INVARIANT_VIOLATION"
    | "PROJECT_NOT_FOUND"
    | "PROJECT_SLUG_TAKEN"
    | "PROJECT_ARCHIVED"
    | "PROJECT_INVARIANT_VIOLATION"
    | "TIME_ENTRY_NOT_FOUND"
    | "TIME_ENTRY_BILLED"
    | "TIME_ENTRY_INVARIANT_VIOLATION"
    | "INVOICE_NOT_FOUND"
    | "INVOICE_NOT_EDITABLE"
    | "INVOICE_EMPTY"
    | "INVALID_INVOICE_TRANSITION"
    | "CURRENCY_MISMATCH"
    | "INVOICE_INVARIANT_VIOLATION"
    | "TRANSACTION_INVARIANT_VIOLATION"
    | "AFTER_COMMIT_EFFECT_FAILED";

export abstract class BackendError extends Error {
    abstract readonly errorCode: BackendErrorCode;
    abstract readonly trpcCode: TRPC_ERROR_CODE_KEY;

    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = new.target.name;
    }

    toTRPCError(): TRPCError {
        return new TRPCError({ code: this.trpcCode, message: this.message, cause: this });
    }
}

export abstract class BadRequestError extends BackendError {
    readonly trpcCode = "BAD_REQUEST" as const;
}

export abstract class UnauthorizedError extends BackendError {
    readonly trpcCode = "UNAUTHORIZED" as const;
}

export abstract class ForbiddenError extends BackendError {
    readonly trpcCode = "FORBIDDEN" as const;
}

export abstract class NotFoundError extends BackendError {
    readonly trpcCode = "NOT_FOUND" as const;
}

export abstract class ConflictError extends BackendError {
    readonly trpcCode = "CONFLICT" as const;
}

export abstract class InternalServerError extends BackendError {
    readonly trpcCode = "INTERNAL_SERVER_ERROR" as const;
}

export abstract class BadGatewayError extends BackendError {
    readonly trpcCode = "BAD_GATEWAY" as const;
}

export class UnauthenticatedError extends UnauthorizedError {
    readonly errorCode = "UNAUTHORIZED" as const;
    constructor() {
        super("Authentication required");
    }
}

/** The request is well-formed at the transport level but fails its schema. */
export class InvalidInputError extends BadRequestError {
    readonly errorCode = "BAD_REQUEST" as const;
    constructor(readonly validation: z.ZodError) {
        super(z.prettifyError(validation), { cause: validation });
    }
}
