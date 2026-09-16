import { outgoingEmailSchema } from "../src/email/email-sender.ts";
import type { EmailSender, OutgoingEmail } from "../src/email/email-sender.ts";

export class FakeEmailSender implements EmailSender {
    readonly sent: OutgoingEmail[] = [];

    async send(message: OutgoingEmail): Promise<void> {
        this.sent.push(outgoingEmailSchema.parse(message));
    }
}
