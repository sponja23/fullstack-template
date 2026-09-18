# Send real email

**When:** invitations, password resets, or magic links must reach an inbox. Until then the logging sender is correct: it prints the message and the link.

The core already has the port: `EmailSender` with `LoggingEmailSender` in `packages/backend/src/email/`. A provider is an adapter in the composition root; the core and the test harness do not change.

## Steps (Resend as the example)

1. `pnpm --filter @repo/api add resend --save-catalog`.
2. Write `apps/api/src/resend-email-sender.ts` implementing `EmailSender`: construct the client with the key, `send` maps `OutgoingEmail` to the provider's send call with a configured `from` address, and throws on a provider error so the caller's failure is visible.
3. Add `RESEND_API_KEY` and `EMAIL_FROM` to `apps/api/src/env.ts` as optional, and to `.env.example` commented out.
4. In `server.ts`, pick the adapter by presence: both set means the provider, otherwise `LoggingEmailSender`. Development and CI stay zero-config.
5. Verify the sender domain at the provider; `EMAIL_FROM` must belong to it.

Another provider is the same shape with a different step 1 and 2.

## Docs that become false

- `packages/backend/AGENTS.md`: the sentence saying the API uses `LoggingEmailSender` becomes "the API picks the adapter from its environment".

## Verify

- With the variables set, invite a member locally and receive the email.
- With them unset, the invitation is logged as before.
- The backend suite passes unchanged; it substitutes the fake sender.
