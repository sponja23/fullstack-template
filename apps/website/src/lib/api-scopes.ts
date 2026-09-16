export const SCOPE_CATALOG = {
    "clients:read": "Read clients",
    "invoices:read": "Read invoices",
    "invoices:write": "Mark invoices paid",
} as const;
export type ApiScope = keyof typeof SCOPE_CATALOG;
export const API_SCOPES = Object.keys(SCOPE_CATALOG) as ApiScope[];
