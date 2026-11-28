# @repo/protocol

The wire contract between the server and its clients: each router's input schemas, the field rules they are built from, the closed sets a response carries, and the paths a client dials. The backend's routers validate with these schemas and the website's forms build on the same ones, so a rule is written once.

## Imports

It imports only Zod, so the backend and the browser can both depend on it. The website reaches the backend through `@repo/client` for types alone, which makes this package the one home for a runtime value both sides need.

## Layout

One `<resource>.protocol.ts` per router resource, holding its field schemas (`billingEmailSchema`), its procedures' inputs (`createClientInputSchema`) and the closed sets it owns. A field several resources share sits in `fields.ts`, and mount paths in `paths.ts`.

A schema only one side uses stays with that side: storage schemas in the backend, a form-only field such as a password confirmation in the website.

## Rules, not wording

A schema here carries no message. In Zod a message set on a check beats one given at parse time, so a message here would stop a client from wording that rule for its reader. The website words a failure with `withMessages` (`apps/website/src/lib/form-messages.ts`), by field and Zod issue code. A rule a client words separately is its own check: a slug's characters are a `regex` and its length a `max`.

Every limit is exported as a constant beside its schema (`NAME_MAX_LENGTH`), and a client's copy names the constant. Two rules that must agree are built one from the other.

## Closed sets

A closed set that crosses the wire is declared once, as a `SCREAMING_CASE` tuple, a `z.enum` schema over it and the type inferred from that schema (`CURRENCIES`, `currencySchema`, `Currency`). The backend builds its columns from the tuple.

Labels stay in the website, as a `Record` over the type, so a new value with no label fails to build.
