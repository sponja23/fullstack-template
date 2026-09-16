import { logger } from "@repo/logger";
import { z } from "zod";

export const outgoingEmailSchema = z.object({
    to: z.string().email(),
    subject: z.string().min(1),
    text: z.string().min(1),
});

export type OutgoingEmail = z.infer<typeof outgoingEmailSchema>;

export interface EmailSender {
    send(message: OutgoingEmail): Promise<void>;
}

/** Local adapter that renders outgoing messages into structured logs. */
export class LoggingEmailSender implements EmailSender {
    private readonly logger = logger.child({ name: "LoggingEmailSender" });

    async send(message: OutgoingEmail): Promise<void> {
        this.logger.info("email sent", outgoingEmailSchema.parse(message));
    }
}
