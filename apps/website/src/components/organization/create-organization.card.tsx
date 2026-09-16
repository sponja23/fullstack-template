import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { FormError } from "@/components/form/form.error";
import { slugify } from "@/lib/slug";
import {
    useCreateOrganizationForm,
    useCreateOrganizationFormContext,
} from "./create-organization.form";

export function CreateOrganizationCard({
    heading,
    onSuccess,
}: {
    heading: string;
    onSuccess: () => void | Promise<void>;
}) {
    const form = useCreateOrganizationForm({ onSuccess });
    return (
        <Card>
            <CardHeader>
                <CardTitle>{heading}</CardTitle>
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
                        <SlugField />
                        <FormError />
                        <form.SubmitButton
                            label="Create organization"
                            submittingLabel="Creating…"
                        />
                    </form>
                </form.AppForm>
            </CardContent>
        </Card>
    );
}

function NameField() {
    const form = useCreateOrganizationFormContext();
    return (
        <form.AppField
            name="name"
            listeners={{
                onChange: ({ value }) => {
                    if (form.getFieldMeta("slug")?.isDirty === true) return;
                    form.setFieldValue("slug", slugify(value), { dontUpdateMeta: true });
                },
            }}
        >
            {(field) => <field.TextField label="Organization name" autoComplete="organization" />}
        </form.AppField>
    );
}

function SlugField() {
    const form = useCreateOrganizationFormContext();
    return (
        <form.AppField name="slug">
            {(field) => (
                <field.TextField
                    label="Slug"
                    description="Lowercase letters, numbers, and hyphens."
                />
            )}
        </form.AppField>
    );
}
