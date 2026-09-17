import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@repo/ui/sidebar";
import { FormError } from "@/components/form/form-error";
import { RouteError, RoutePending } from "@/components/layout/route-state";
import { SectionHeader } from "@/components/shell/section-header";
import { useUser } from "@/lib/queries/auth.queries";
import { useRouteActive } from "@/lib/use-route-active";
import {
    useDisplayNameForm,
    useDisplayNameFormContext,
    usePasswordForm,
    usePasswordFormContext,
} from "./-components/account.form";

export const Route = createFileRoute("/_authenticated/_shell/account/")({
    loader: () => null,
    pendingComponent: RoutePending,
    errorComponent: RouteError,
    component: AccountPage,
    staticData: { Sidebar: AccountSidebar },
});

function AccountPage() {
    return (
        <div className="mx-auto w-full max-w-2xl space-y-8 p-6 md:p-10">
            <header>
                <h1 className="text-3xl font-semibold">Account</h1>
                <p className="text-sm text-muted-foreground">
                    Manage your display name and password.
                </p>
            </header>
            <DisplayNameCard />
            <PasswordCard />
        </div>
    );
}

function DisplayNameCard() {
    const { user } = useUser();
    const form = useDisplayNameForm(user.name);
    return (
        <Card>
            <CardHeader>
                <CardTitle>Display name</CardTitle>
                <CardDescription>The name shown to other organization members.</CardDescription>
            </CardHeader>
            <CardContent>
                <form.AppForm>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            void form.handleSubmit();
                        }}
                        className="space-y-4"
                    >
                        <NameField />
                        <FormError />
                        <form.SubmitButton label="Save name" submittingLabel="Saving…" />
                    </form>
                </form.AppForm>
            </CardContent>
        </Card>
    );
}

function NameField() {
    const form = useDisplayNameFormContext();
    return (
        <form.AppField name="name">
            {(field) => <field.TextField label="Display name" autoComplete="name" />}
        </form.AppField>
    );
}

function PasswordCard() {
    const form = usePasswordForm();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Change password</CardTitle>
                <CardDescription>
                    Confirm your current password before choosing a new one.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form.AppForm>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            void form.handleSubmit();
                        }}
                        className="space-y-4"
                    >
                        <CurrentPassword />
                        <NewPassword />
                        <ConfirmPassword />
                        <FormError />
                        <form.SubmitButton label="Change password" submittingLabel="Changing…" />
                    </form>
                </form.AppForm>
            </CardContent>
        </Card>
    );
}

function CurrentPassword() {
    const form = usePasswordFormContext();
    return (
        <form.AppField name="currentPassword">
            {(field) => (
                <field.TextField
                    label="Current password"
                    type="password"
                    autoComplete="current-password"
                />
            )}
        </form.AppField>
    );
}
function NewPassword() {
    const form = usePasswordFormContext();
    return (
        <form.AppField name="newPassword">
            {(field) => (
                <field.TextField label="New password" type="password" autoComplete="new-password" />
            )}
        </form.AppField>
    );
}
function ConfirmPassword() {
    const form = usePasswordFormContext();
    return (
        <form.AppField name="confirmPassword">
            {(field) => (
                <field.TextField
                    label="Confirm new password"
                    type="password"
                    autoComplete="new-password"
                />
            )}
        </form.AppField>
    );
}

function AccountSidebar() {
    const active = useRouteActive({ to: "/account", activeOptions: { exact: true } });
    return (
        <>
            <SectionHeader>
                <Link to="/" className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ArrowLeft className="size-3.5" />
                    Back
                </Link>
                <span className="text-sm font-semibold">Account</span>
            </SectionHeader>
            <SidebarGroup>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Account"
                            isActive={active}
                            render={<Link to="/account" />}
                        >
                            <User />
                            <span>Account</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
        </>
    );
}
