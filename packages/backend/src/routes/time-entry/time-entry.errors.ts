import { ConflictError, InternalServerError, NotFoundError } from "../../errors/base.ts";

export class TimeEntryNotFoundError extends NotFoundError {
    readonly errorCode = "TIME_ENTRY_NOT_FOUND" as const;
    constructor() {
        super("Time entry not found");
    }
}

export class TimeEntryBilledError extends ConflictError {
    readonly errorCode = "TIME_ENTRY_BILLED" as const;
    constructor() {
        super("Billed time entries cannot be changed");
    }
}

export class TimeEntryInvariantError extends InternalServerError {
    readonly errorCode = "TIME_ENTRY_INVARIANT_VIOLATION" as const;
    constructor(readonly detail: string) {
        super(`time entry invariant violated: ${detail}`);
    }
}
