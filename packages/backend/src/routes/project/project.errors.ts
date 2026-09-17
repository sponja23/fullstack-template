import { ConflictError, NotFoundError } from "../../errors/base.ts";

export class ProjectNotFoundError extends NotFoundError {
    readonly errorCode = "PROJECT_NOT_FOUND" as const;
    constructor() {
        super("Project not found");
    }
}

export class ProjectSlugTakenError extends ConflictError {
    readonly errorCode = "PROJECT_SLUG_TAKEN" as const;
    constructor(cause?: unknown) {
        super("A project with this slug already exists", { cause });
    }
}

export class ProjectArchivedError extends ConflictError {
    readonly errorCode = "PROJECT_ARCHIVED" as const;
    constructor() {
        super("Archived projects do not accept new time entries");
    }
}
