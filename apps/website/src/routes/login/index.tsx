import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { z } from "zod";
import { FormError } from "@/components/form/form.error";
import { CenteredContainer } from "@/components/layout/centered.container";
import { CenteredScreen } from "@/components/layout/centered.screen";
import { RouteError, RoutePending } from "@/components/layout/route-state";
import { useLoginForm, useLoginFormContext } from "./-components/login.form";

export const Route = createFileRoute("/login/")({
    validateSearch: z.object({ redirect: z.string().optional() }),
    loader: () => null,
    pendingComponent: RoutePending,
    errorComponent: RouteError,
    component: LoginPage,
});

function LoginPage() {
    const navigate = useNavigate();
    const { redirect } = Route.useSearch();
    const form = useLoginForm(() => navigate({ to: redirect ?? "/" }));
    return (
        <CenteredScreen>
            <CenteredContainer className="enter-page">
                <Card>
                    <CardHeader>
                        <CardTitle>Log in</CardTitle>
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
                                <EmailField />
                                <PasswordField />
                                <FormError />
                                <form.SubmitButton label="Log in" submittingLabel="Signing in…" />
                            </form>
                        </form.AppForm>
                    </CardContent>
                </Card>
                <p className="text-center text-sm text-muted-foreground">
                    New to Acme?{" "}
                    <Link to="/signup" search={{ redirect }} className="underline">
                        Create an account
                    </Link>
                </p>
            </CenteredContainer>
        </CenteredScreen>
    );
}

function EmailField() {
    const form = useLoginFormContext();
    return (
        <form.AppField name="email">
            {(field) => <field.TextField label="Email" type="email" autoComplete="email" />}
        </form.AppField>
    );
}
function PasswordField() {
    const form = useLoginFormContext();
    return (
        <form.AppField name="password">
            {(field) => (
                <field.TextField label="Password" type="password" autoComplete="current-password" />
            )}
        </form.AppField>
    );
}
