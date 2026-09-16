/** Database constraints whose violations map to a domain error. */
export type ConstraintName =
    | "client_organization_name_unique"
    | "project_organization_slug_unique"
    | "project_rate_minor_nonnegative"
    | "time_entry_minutes_positive";
