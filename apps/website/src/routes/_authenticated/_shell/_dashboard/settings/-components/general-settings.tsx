import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@repo/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@repo/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
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
    useActiveOrganization,
    useActiveOrganizationMembers,
    useDeleteOrganization,
    useLeaveOrganization,
    useUpdateOrganization,
} from "@/lib/queries/organizations.queries";
import { isAdmin, isOwner } from "@/lib/role";
import { useManageableOrgId } from "./manageable-org";

const options = formOptions({ defaultValues: { name: "" } });
const errorConfig: FormErrorConfig<{ name: string }> = {
    YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_ORGANIZATION: {
        message: "You cannot rename this organization.",
    },
};

export function OrganizationIdentityCard() {
    const { data: organization } = useActiveOrganization();
    const manageable = useManageableOrgId();
    if (organization == null) return null;
    if (manageable == null)
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Identity</CardTitle>
                    <CardDescription>
                        Only an owner or admin can rename the organization.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Name</p>
                        <p>{organization.name}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Slug</p>
                        <p className="font-mono text-xs">{organization.slug}</p>
                    </div>
                </CardContent>
            </Card>
        );
    return <EditableIdentity name={organization.name} slug={organization.slug} />;
}

function EditableIdentity({ name, slug }: { name: string; slug: string }) {
    const mutation = useUpdateOrganization();
    const form = useMutationForm({
        ...options,
        defaultValues: { name },
        validators: {
            onChange: z.object({ name: z.string().trim().min(1, "Name is required").max(120) }),
        },
        mutation,
        errorConfig,
    });
    return (
        <form.AppForm>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    void form.handleSubmit();
                }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Identity</CardTitle>
                        <CardDescription>
                            The organization name is visible to every member.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <NameField />
                        <div>
                            <p className="text-sm font-medium">Slug</p>
                            <p className="font-mono text-xs text-muted-foreground">{slug}</p>
                        </div>
                        <FormError />
                    </CardContent>
                    <CardFooter className="justify-end">
                        <form.SubmitButton
                            className="w-auto"
                            label="Save"
                            submittingLabel="Saving…"
                        />
                    </CardFooter>
                </Card>
            </form>
        </form.AppForm>
    );
}

function NameField() {
    const form = useTypedAppFormContext(options);
    return <form.AppField name="name">{(field) => <field.TextField label="Name" />}</form.AppField>;
}

export function OrganizationDangerZone() {
    const { user, activeOrganizationId } = useUser();
    const { data: organization } = useActiveOrganization();
    const { data: roster } = useActiveOrganizationMembers();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const leave = useLeaveOrganization();
    const remove = useDeleteOrganization();
    const [action, setAction] = useState<"leave" | "delete" | null>(null);
    if (organization == null || roster == null || activeOrganizationId == null) return null;
    const role = roster.members.find((member) => member.userId === user.id)?.role;
    if (role == null) return null;
    const lastAdmin =
        isAdmin(role) && roster.members.filter((member) => isAdmin(member.role)).length <= 1;
    const soleOwner =
        isOwner(role) && roster.members.filter((member) => isOwner(member.role)).length <= 1;
    const canLeave = !lastAdmin && !soleOwner;
    const after = async () => {
        setAction(null);
        await navigate({ to: "/onboarding" });
        await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
        await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    };
    return (
        <Card className="ring-destructive/30">
            <CardHeader>
                <CardTitle>Danger zone</CardTitle>
                <CardDescription>
                    Membership and organization deletion cannot be undone.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <DangerRow
                    title="Leave organization"
                    description={
                        canLeave
                            ? "End your membership without affecting other members."
                            : "Promote another administrator before leaving."
                    }
                    action={
                        <Button
                            variant="destructive"
                            disabled={!canLeave}
                            onClick={() => setAction("leave")}
                        >
                            Leave
                        </Button>
                    }
                />
                {isOwner(role) && (
                    <DangerRow
                        title="Delete organization"
                        description="Delete the organization and all of its data."
                        action={
                            <Button variant="destructive" onClick={() => setAction("delete")}>
                                Delete
                            </Button>
                        }
                    />
                )}
            </CardContent>
            <ConfirmDialog
                open={action != null}
                onOpenChange={(open) => !open && setAction(null)}
                organizationName={organization.name}
                label={action === "delete" ? "Delete organization" : "Leave organization"}
                pending={leave.isPending || remove.isPending}
                onConfirm={() =>
                    action === "delete"
                        ? remove.mutate(
                              { organizationId: activeOrganizationId },
                              { onSuccess: after },
                          )
                        : leave.mutate(
                              { organizationId: activeOrganizationId },
                              { onSuccess: after },
                          )
                }
            />
        </Card>
    );
}

function DangerRow({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action: React.ReactNode;
}) {
    return (
        <div className="flex items-center gap-4 rounded-lg border border-destructive/30 p-4">
            <div className="flex-1">
                <p className="font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {action}
        </div>
    );
}

function ConfirmDialog({
    open,
    onOpenChange,
    organizationName,
    label,
    pending,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organizationName: string;
    label: string;
    pending: boolean;
    onConfirm: () => void;
}) {
    const [value, setValue] = useState("");
    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setValue("");
                onOpenChange(next);
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{label}?</DialogTitle>
                    <DialogDescription>
                        Type <strong>{organizationName}</strong> to confirm.
                    </DialogDescription>
                </DialogHeader>
                <Input
                    aria-label="Organization name"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                />
                <DialogFooter>
                    <Button
                        variant="destructive"
                        disabled={value !== organizationName || pending}
                        onClick={onConfirm}
                    >
                        {pending ? "Working…" : label}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
