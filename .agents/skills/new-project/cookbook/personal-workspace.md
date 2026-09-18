# Personal workspace: one hidden organization per user

**When:** people use the product alone today but teams are plausible later. Everything organization-shaped stays; each user gets exactly one organization at sign-up and never sees it. Reversing this is unhiding, which is why it is the recommended single-user option.

## Blast radius

Small. The backend gains two hooks; the website loses entry points. Inventory what the website exposes:

```bash
grep -rlE "useOrganizations|useCreateOrganization|useSetActiveOrganization|useInviteMember|/new-org|/onboarding|/settings/members" apps/website/src --include='*.ts' --include='*.tsx' | grep -v routeTree.gen
```

## Steps

1. **Create the organization at sign-up.** In `buildAuth`, a `databaseHooks.user.create.after` hook inserts an organization named after the user with a slug derived from the user id, and an owner member row, through the hook context's adapter. A `databaseHooks.session.create.before` hook sets `activeOrganizationId` to that organization, so every session starts with it active. Set `allowUserToCreateOrganization` to `false` so the server refuses a second one.
2. **Hide the entry points.** Delete the onboarding and new-org routes, the members settings page, the switcher and "Create organization" items in the avatar menu, and the invitations card. Leave the dashboard's active-organization reconciliation in place: it now always finds the one organization, and it is what a later teams feature builds on. The general settings page stays as the workspace's name.
3. **Harness.** The seed no longer creates an organization; it reads the one the sign-up hook created. Isolation cases sign up a second user, whose workspace is separate by construction.
4. **Storybook.** Worlds keep their organization data; remove handlers and stories for the deleted routes.

## Docs that become false

- `apps/website/src/routes/_authenticated/_shell/AGENTS.md`: step 4 of the reconciliation order (redirect to onboarding) no longer exists; state instead that every user owns exactly one organization, created at sign-up.
- `packages/backend/AGENTS.md`: add one sentence under the Better Auth paragraph naming the two hooks and the invariant they keep.
- `CONTEXT.md`: Organization is "the user's workspace, one per user".

## Verify

- Sign up lands on the dashboard; the organization exists with the user as owner; a second sign-up gets its own.
- The backend suite passes with the seed reading the auto-created organization.
- `grep -rn "allowUserToCreateOrganization" packages/backend/src` shows it set to `false`.

## Growing into teams later

Delete the two hooks and the `allowUserToCreateOrganization` flag, restore the routes and menu items from the template, and existing workspaces become the first organization of each user.
