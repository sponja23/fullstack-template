import { ConflictError, NotFoundError } from "../../errors/base.ts";

export class InvoiceNotFoundError extends NotFoundError {
    readonly errorCode = "INVOICE_NOT_FOUND" as const;
    constructor() {
        super("Invoice not found");
    }
}

export class InvoiceNotEditableError extends ConflictError {
    readonly errorCode = "INVOICE_NOT_EDITABLE" as const;
    constructor() {
        super("Only draft invoices can be edited");
    }
}

export class InvoiceEmptyError extends ConflictError {
    readonly errorCode = "INVOICE_EMPTY" as const;
    constructor() {
        super("An empty invoice cannot be issued");
    }
}

export class InvalidInvoiceTransitionError extends ConflictError {
    readonly errorCode = "INVALID_INVOICE_TRANSITION" as const;
    constructor() {
        super("The invoice cannot make that transition");
    }
}

export class CurrencyMismatchError extends ConflictError {
    readonly errorCode = "CURRENCY_MISMATCH" as const;
    constructor() {
        super("Time entries must belong to the invoice client and currency");
    }
}
