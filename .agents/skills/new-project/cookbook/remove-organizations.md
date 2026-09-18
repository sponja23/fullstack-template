# Remove organizations: the user is the tenant

**When:** people use the product alone and there is no path to teams. This is the irreversible option; if teams are conceivable, use `personal-workspace.md` instead.

## Blast radius

Inventory before editing:

```bash
grep -rlE "organization|orgProcedure|OrgSession|activeOrganizationId|lastActiveOrganizationId" apps packages tools --include='*.ts' --include='*.tsx' | grep -v routeTree.gen
```

Seams the grep does not name: the dashboard route's `beforeLoad` (it reconciles an active organization before rendering anything), the storybook session fixture (it carries an active organization id every story assumes), the test harness seed (it creates an organization for the primary user and an external one for isolation cases), and the REST principal (a key identifies an organization today).

## Steps

1. **Auth.** Remove the `organization` plugin from `buildAuth` with its schema mapping, invitation email, and the after-remove-member hook; delete the session-revocation helper it called. Drop `activeOrganizationId` from the session table. Delete the organizations schema module and the member and invitation relations the user table declares.
2. **Procedures.** Delete `orgProcedure`, `OrgSession`, and `toOrgSession`. `authProcedure` is the only user procedure; the tenant key is `session.user.id`. Remove `orgProcedure` from the router context type and every router's `Deps`.
3. **Tables.** Every domain table's `organization_id` becomes `user_id` referencing the user. Repositories filter on it exactly as they filtered on the organization; the per-query isolation rule is unchanged, only the column is.
4. **API keys.** `apiKey({ references: "user" })`; the key router mints with the user's id as `referenceId`. In the REST adapter the principal carries `userId` instead of `organizationId`, and the composition root's verifier passes the reference id through unchanged.
5. **Superadmin.** The organization directory read model becomes a user directory, or remove superadmin entirely with its own recipe.
6. **Harness.** The seed signs a user up and stops there; `createOrganization` and the external-organization helper go. Isolation tests sign up a second user.
7. **Website.** Delete onboarding, new-org, the general and members settings pages, the organization query module, the last-active-organization hint, the organization components, and the switcher and "Create organization" entries in the avatar menu. The dashboard's `beforeLoad` needs only the session; its sidebar header shows the user. Settings keeps API keys and account. Role helpers keep only the superadmin check.
8. **Storybook.** The session fixture drops `activeOrganizationId`; worlds drop organization handlers; stories of deleted routes go.
9. **Exports.** Remove `OrgSession` and anything else organization-shaped from the backend's public surface.

## Docs that become false

- `packages/backend/AGENTS.md`: the stack bullet naming organizations, the `orgProcedure` bullet under principals, and the paragraph on capabilities owned by the organization plugin.
- `apps/website/AGENTS.md`: the sentence listing what Better Auth owns.
- `apps/website/src/lib/queries/AGENTS.md`: organization-scoped cache keys, `setActiveOrganization`, and the identity-change paragraph's organization steps.
- `apps/website/src/routes/_authenticated/_shell/AGENTS.md`: the whole active-organization section; keep "navigate before you invalidate" for sign-out.
- `CONTEXT.md`: Organization becomes User, "the tenant; every domain row belongs to exactly one".

## Verify

- `pnpm ready` passes; the backend suite passes with isolation cases rewritten around two users.
- Sign up lands on the dashboard with no onboarding step; the avatar menu has no organization entries.
- An API key minted in settings authenticates a `/v1/whoami` call as the user.
- The greps above return nothing outside the Better Auth tables that remain.
