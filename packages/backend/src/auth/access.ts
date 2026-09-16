import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, userAc } from "better-auth/plugins/admin/access";
import { SUPERADMIN_ROLE } from "./superadmin.ts";

const accessControl = createAccessControl(defaultStatements);
const superadminAccess = accessControl.newRole({
    user: [...defaultStatements.user],
    session: [...defaultStatements.session],
});

export const roles = {
    [SUPERADMIN_ROLE]: superadminAccess,
    user: userAc,
};
