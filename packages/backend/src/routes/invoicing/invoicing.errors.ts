import { BadRequestError, ConflictError, NotFoundError } from "../../errors/base.ts";

export class ClientNotFoundError extends NotFoundError {
    readonly errorCode = "CLIENT_NOT_FOUND" as const;
    constructor() {
        super("Client not found");
    }
}

export class ClientNameTakenError extends ConflictError {
    readonly errorCode = "CLIENT_NAME_TAKEN" as const;
    constructor() {
        super("A client with this name already exists");
    }
}

export class ProjectNotFoundError extends NotFoundError {
    readonly errorCode = "PROJECT_NOT_FOUND" as const;
    constructor() {
        super("Project not found");
    }
}

export class ProjectSlugTakenError extends ConflictError {
    readonly errorCode = "PROJECT_SLUG_TAKEN" as const;
    constructor() {
        super("A project with this slug already exists");
    }
}

export class ProjectArchivedError extends ConflictError {
    readonly errorCode = "PROJECT_ARCHIVED" as const;
    constructor() {
        super("Archived projects do not accept new time entries");
    }
}

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

export class MemberNotFoundError extends BadRequestError {
    constructor() {
        super("The signed-in user is not a member of this organization");
    }
}
