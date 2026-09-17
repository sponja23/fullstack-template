import { ConflictError, NotFoundError } from "../../errors/base.ts";

export class ClientNotFoundError extends NotFoundError {
    readonly errorCode = "CLIENT_NOT_FOUND" as const;
    constructor() {
        super("Client not found");
    }
}

export class ClientNameTakenError extends ConflictError {
    readonly errorCode = "CLIENT_NAME_TAKEN" as const;
    constructor(cause?: unknown) {
        super("A client with this name already exists", { cause });
    }
}
