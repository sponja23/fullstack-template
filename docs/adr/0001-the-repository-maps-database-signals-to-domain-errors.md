# The repository maps database signals to domain errors

A Postgres constraint violation surfaces to callers as a domain error, and the repository (`*.repository.ts`) is the layer that translates it. The organizing rule: **a module translates the signals only it can decode.** SQLSTATE `23505` and a constraint name mean nothing above `DatabaseRepository`, and the statement that issued the write is the only place that knows what the write meant.

**Constraint violations are mapped at the statement.** A repository wraps the single statement that can fail in `withConstraintErrors(write, mapping)` from `packages/backend/src/db/constraint-errors.ts`. The helper walks the driver error's `cause` chain, matches a unique (`23505`), check (`23514`) or foreign-key (`23503`) violation by constraint name, and throws the mapped domain error with the driver error as its `cause`. `ClientRepository.create` maps `clientNameUnique` to `ClientNameTakenError`, and `ProjectRepository.create` maps `projectSlugUnique` to `ProjectSlugTakenError`. The helper always throws and never turns a violation into a return value, because a caller that swallows one inside a transaction leaves that transaction aborted for every later statement. Each mapped constraint name is a `const` exported from its schema module and used by both the Drizzle declaration and the mapping, so a rename is a compile error.

**Absence is not such a signal, so it stays with the caller.** A missing row is legible to every caller, and what it means is the caller's business: the same lookup can be a 404 on one path and "create one" on another. The rule runs through method naming instead: **`find*` and `resolve*` ask and return a total value; `require*` asserts and throws.** Both may exist over the same query, and a `require*` earns its place only when every caller of the asking form already performs the same throw. A repository never makes the asking method throw, which would leave callers no way to ask.

**An update that matches no row is judged from its `WHERE` clause.** When the predicate is identity only, no match means the row is gone, so the repository may assert it: `InvoiceRepository.requireTransition` filters on organization and id and throws `InvoiceNotFoundError`. Identity only makes an asserting method possible, not obligatory. When the predicate carries a guard, no match conflates a missing row with a guard that fired, and the repository must not name it: `InvoiceRepository.claimEntries` also filters on `line_item_id is null`, so it returns how many entries it claimed, and `InvoiceService.issue` decides that a shortfall means `TimeEntryBilledError`.

## Considered options

- **Map violations in tRPC middleware.** Rejected. It is transport-scoped, while `@repo/rest-api` calls the same services directly, so one write would be a clean `CONFLICT` over tRPC and a raw 500 over `/v1`. It also catches across the whole procedure call tree rather than the statement that meant it, so an incidental write failing deep in a call graph would be reported as a domain conflict instead of the 500 it is.
- **Map violations globally at `DatabaseRepository`.** Rejected: one constraint would carry one meaning everywhere, when a foreign-key violation can mean "the caller named something that does not exist" on one path and "an invariant broke" on another.
- **Return a neutral typed failure and let the service pick the error.** Rejected: it invents a second error vocabulary that only the repository and service speak. A repository method is already domain-named, and `create` failing on its uniqueness constraint is what "name taken" means.
- **Have repositories throw `NotFoundError` on absence too.** Rejected: absence is control flow for some callers and an error for others, so a throwing lookup would leave the first kind no way to ask.

## Consequences

- Domain errors reach `@repo/rest-api` as well as tRPC, and its `handleError` maps a thrown `BackendError` to its HTTP status, so a mapped violation gets the right status on both transports.
- Constraints that represent internal invariants stay unmapped and surface as 500s.
