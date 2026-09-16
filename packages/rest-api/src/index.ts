export { buildRestApi } from "./rest-api.ts";
export type { RestApiDeps } from "./rest-api.ts";
export type { ApiKeyVerifier, ApiPrincipal } from "./auth/api-key-verifier.ts";
export { API_KEY_HEADER } from "./auth/api-key.middleware.ts";
export type { ClientsPort, ClientRecord } from "./clients/clients.port.ts";
export type {
    InvoicesPort,
    InvoiceRecord,
    InvoiceSummaryRecord,
} from "./invoices/invoices.port.ts";
