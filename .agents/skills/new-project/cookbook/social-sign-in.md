# Social sign-in and magic links

**When:** password sign-in is not enough. Both additions ride on Better Auth; the account table already stores provider rows.

## Social providers (GitHub and Google as examples)

1. Register an OAuth app at each provider with the callback `<api origin>/auth/callback/<provider>`.
2. Add the client id and secret for each provider to `apps/api/src/env.ts` as optional pairs and to `.env.example` commented out.
3. Extend `AuthConfig` with an optional `socialProviders` map; `buildAuth` passes it to Better Auth's `socialProviders`. The composition root builds the map only from pairs that are set, so an unconfigured provider does not exist.
4. Website: a `useSignInWith(provider)` hook in the auth query module wrapping `authClient.signIn.social` with the website origin as `callbackURL`, and a button per configured provider on the login and signup pages. Which providers are configured is website build knowledge: expose it as a `VITE_AUTH_PROVIDERS` list in the website env, since the browser cannot read the API's secrets.
5. Stories: the login and signup stories gain a variant with providers shown.

## Magic link

1. Add the `magicLink` plugin to `buildAuth`; its `sendMagicLink` sends through the `EmailSender` port, which the logging sender prints in development.
2. Add the matching client plugin to the website's auth client.
3. Login page: an "email me a link" path beside the password form, driven by a mutation over `authClient.signIn.magicLink`.
4. Tests: an auth suite case requests a link and follows the URL captured by the fake email sender.

## Docs that become false

- `apps/website/AGENTS.md`: the auth paragraph lists the sign-in methods.
- `packages/backend/AGENTS.md`: the stack bullet for Better Auth names the plugins in use.

## Verify

- Social: sign in through each provider locally against the registered callback; a new user gets an account row for the provider.
- Magic link: the suite case passes; locally the link appears in the API log and signs the user in.
- `pnpm ready` passes with the new env variables validated.
