# Remove superadmin

**When:** no operator needs to list organizations or act as a user from inside the product. Support then happens through the database and logs.

## Blast radius

```bash
grep -rliE "superadmin|impersonat|adminRoles|banned" apps packages tools --include='*.ts' --include='*.tsx' | grep -v routeTree.gen
```

Seams the grep does not name: the `admin` plugin's columns on the user and session tables (`role`, `banned`, `ban_reason`, `ban_expires`, `impersonated_by`), and the storybook session fixture, whose user carries the superadmin role.

## Steps

1. **Auth.** Remove the `admin` plugin from `buildAuth`; delete the access-control roles module and the superadmin module. Drop the admin plugin's columns from the user and session tables.
2. **Backend.** Delete the superadmin procedures, the superadmin route directory with its organization directory read model, their wiring in `buildApp`, and their exports from the package surface.
3. **api.** Delete the grant script and its `superadmin:grant` entry in the app's `package.json`.
4. **Website.** Delete the superadmin routes and query module, the impersonation banner and its mount in the shell, the superadmin entry in the avatar menu, `isSuperadmin` on `useUser`, and the superadmin role check in the role helpers. The identity-change cache clearing stays for sign-out.
5. **Storybook.** The session fixture's user gets `role: null` and no `impersonatedBy`; superadmin stories and world handlers go.
6. **Tests.** Remove the grant, impersonation, and directory cases from the auth suite.

## Docs that become false

- `packages/backend/AGENTS.md`: "administration" in the stack bullet and the Superadmin bullet under principals.
- `apps/website/AGENTS.md`: "the app-level superadmin role" in the auth paragraph.
- `apps/website/src/lib/queries/AGENTS.md`: the identity-change paragraph shrinks to sign-out.

## Verify

- `pnpm ready` and every suite pass.
- The grep above returns nothing.
- The avatar menu shows account and sign-out only.
