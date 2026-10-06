/** An organization-scoped read ran while the session had no active organization. */
export class MissingActiveOrganizationError extends Error {
    constructor() {
        super("An active organization is required");
        this.name = "MissingActiveOrganizationError";
    }
}

/** `useUser` ran on a route that does not guarantee a signed-in user. */
export class UnauthenticatedRouteError extends Error {
    constructor() {
        super("useUser requires an authenticated route");
        this.name = "UnauthenticatedRouteError";
    }
}
