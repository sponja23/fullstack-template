import type { ApiScope } from "@repo/protocol";

export const SCOPE_CATALOG: Record<ApiScope, string> = {
    "clients:read": "Read clients",
    "invoices:read": "Read invoices",
    "invoices:write": "Mark invoices paid",
};
