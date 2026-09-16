import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { z } from "zod";
import { FormError } from "@/components/form/form.error";
import {
    type FormErrorConfig,
    formOptions,
    useMutationForm,
    useTypedAppFormContext,
} from "@/lib/form";
import { useUser } from "@/lib/queries/auth.queries";
import {
    useActiveOrganizationInvitations,
    useActiveOrganizationMembers,
    useCancelInvitation,
    useInviteMember,
    useRemoveMember,
    useUpdateMemberRole,
} from "@/lib/queries/organizations.queries";
import { isOwner } from "@/lib/role";
import { useManageableOrgId } from "./manageable-org";

type Member = NonNullable<
    ReturnType<typeof useActiveOrganizationMembers>["data"]
>["members"][number];

export function RosterCard() {
    const { data } = useActiveOrganizationMembers();
    const manageableOrgId = useManageableOrgId();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Members</CardTitle>
                <CardDescription>Everyone with access to this organization.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y rounded-lg border p-0">
                {data?.members.map((member) => (
                    <MemberRow key={member.id} member={member} organizationId={manageableOrgId} />
                ))}
            </CardContent>
        </Card>
    );
}

function MemberRow({ member, organizationId }: { member: Member; organizationId: string | null }) {
    const { user } = useUser();
    const update = useUpdateMemberRole(organizationId ?? "");
    const remove = useRemoveMember(organizationId ?? "");
    const controllable =
        organizationId != null && member.userId !== user.id && !isOwner(member.role);
    const role = member.role.includes("admin") ? "admin" : "member";
    return (
        <div className="flex items-center gap-3 p-3">
            <Avatar className="size-8">
                {member.user.image != null && <AvatarImage src={member.user.image} alt="" />}
                <AvatarFallback>{initials(member.user.name, member.user.email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                    {member.user.name || member.user.email}
                </p>
                <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
            </div>
            {controllable ? (
                <>
                    <Select
                        value={role}
                        onValueChange={(next) =>
                            next != null &&
                            update.mutate({ memberId: member.id, role: next as "admin" | "member" })
                        }
                    >
                        <SelectTrigger size="sm" aria-label={`Role for ${member.user.email}`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={remove.isPending}
                        onClick={() => remove.mutate({ memberIdOrEmail: member.id })}
                    >
                        Remove
                    </Button>
                </>
            ) : (
                <Badge variant="secondary" className="capitalize">
                    {member.role}
                </Badge>
            )}
        </div>
    );
}

function initials(name: string, email: string): string {
    const parts = (name.trim() || email).split(/\s+/);
    return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
}

const options = formOptions({ defaultValues: { email: "", role: "member" as "member" | "admin" } });
const errorConfig: FormErrorConfig<(typeof options)["defaultValues"]> = {
    USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION: {
        field: "email",
        message: "This person is already a member.",
    },
    USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION: {
        field: "email",
        message: "This email already has a pending invitation.",
    },
};

export function InvitationsCard() {
    const { data } = useActiveOrganizationInvitations();
    const invitations = data ?? [];
    const invite = useInviteMember();
    const cancel = useCancelInvitation();
    const form = useMutationForm({
        ...options,
        validators: {
            onChange: z.object({
                email: z.email("Enter a valid email"),
                role: z.enum(["member", "admin"]),
            }),
        },
        mutation: invite,
        errorConfig,
    });
    return (
        <Card>
            <CardHeader>
                <CardTitle>Invitations</CardTitle>
                <CardDescription>
                    Invite a member by email. The logged email includes the acceptance path.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <form.AppForm>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            void form.handleSubmit();
                        }}
                        className="grid gap-4 md:grid-cols-[1fr_10rem_auto]"
                    >
                        <InviteEmailField />
                        <InviteRoleField />
                        <form.SubmitButton
                            className="self-end"
                            label="Invite"
                            submittingLabel="Sending…"
                        />
                        <FormError />
                    </form>
                </form.AppForm>
                <div className="divide-y rounded-lg border">
                    {invitations.length === 0 ? (
                        <p className="p-3 text-sm text-muted-foreground">No pending invitations.</p>
                    ) : (
                        invitations.map((invitation) => (
                            <div key={invitation.id} className="flex items-center gap-3 p-3">
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{invitation.email}</p>
                                    <p className="text-xs capitalize text-muted-foreground">
                                        {invitation.role}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={cancel.isPending}
                                    onClick={() => cancel.mutate({ invitationId: invitation.id })}
                                >
                                    Cancel
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function InviteEmailField() {
    const form = useTypedAppFormContext(options);
    return (
        <form.AppField name="email">
            {(field) => <field.TextField label="Email" type="email" />}
        </form.AppField>
    );
}
function InviteRoleField() {
    const form = useTypedAppFormContext(options);
    return (
        <form.AppField name="role">
            {(field) => (
                <field.SelectField
                    label="Role"
                    options={[
                        { label: "Member", value: "member" },
                        { label: "Admin", value: "admin" },
                    ]}
                />
            )}
        </form.AppField>
    );
}
