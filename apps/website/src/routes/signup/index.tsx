import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { z } from "zod";
import { FormError } from "@/components/form/form.error";
import { CenteredContainer } from "@/components/layout/centered.container";
import { CenteredScreen } from "@/components/layout/centered.screen";
import { RouteError, RoutePending } from "@/components/layout/route-state";
import { useSignupForm, useSignupFormContext } from "./-components/signup.form";

export const Route = createFileRoute("/signup/")({
    validateSearch: z.object({ redirect: z.string().optional() }),
    loader: () => null,
    pendingComponent: RoutePending,
    errorComponent: RouteError,
    component: SignupPage,
});

function SignupPage() {
    const navigate = useNavigate();
    const { redirect } = Route.useSearch();
    const form = useSignupForm(() => navigate({ to: redirect ?? "/" }));
    return (
        <CenteredScreen>
            <CenteredContainer className="enter-page">
                <Card>
                    <CardHeader>
                        <CardTitle>Create your account</CardTitle>
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
                                <EmailField />
                                <PasswordField />
                                <ConfirmField />
                                <FormError />
                                <form.SubmitButton
                                    label="Sign up"
                                    submittingLabel="Creating account…"
                                />
                            </form>
                        </form.AppForm>
                    </CardContent>
                </Card>
                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/login" search={{ redirect }} className="underline">
                        Log in
                    </Link>
                </p>
            </CenteredContainer>
        </CenteredScreen>
    );
}

function NameField() {
    const form = useSignupFormContext();
    return (
        <form.AppField name="name">
            {(field) => <field.TextField label="Name" autoComplete="name" />}
        </form.AppField>
    );
}
function EmailField() {
    const form = useSignupFormContext();
    return (
        <form.AppField name="email">
            {(field) => <field.TextField label="Email" type="email" autoComplete="email" />}
        </form.AppField>
    );
}
function PasswordField() {
    const form = useSignupFormContext();
    return (
        <form.AppField name="password">
            {(field) => (
                <field.TextField label="Password" type="password" autoComplete="new-password" />
            )}
        </form.AppField>
    );
}
function ConfirmField() {
    const form = useSignupFormContext();
    return (
        <form.AppField name="confirmPassword">
            {(field) => (
                <field.TextField
                    label="Confirm password"
                    type="password"
                    autoComplete="new-password"
                />
            )}
        </form.AppField>
    );
}
