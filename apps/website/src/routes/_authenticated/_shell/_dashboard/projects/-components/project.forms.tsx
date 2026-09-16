import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { FormError } from "@/components/form/form.error";
import { type FormErrorConfig, formOptions, useMutationForm } from "@/lib/form";
import { useCreateProject, useUpdateProject } from "@/lib/queries/projects.queries";
import { slugRegex } from "@/lib/slug";

const valuesOptions = formOptions({
    defaultValues: { clientId: "", name: "", slug: "", hourlyRate: "" },
});
const schema = z.object({
    clientId: z.string().min(1, "Choose a client"),
    name: z.string().trim().min(1, "Name is required").max(120),
    slug: z
        .string()
        .min(1, "Slug is required")
        .max(60)
        .regex(slugRegex, "Use lowercase letters, numbers, and hyphens"),
    hourlyRate: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a non-negative amount"),
});
type Values = (typeof valuesOptions)["defaultValues"];
const errors: FormErrorConfig<Values> = {
    PROJECT_SLUG_TAKEN: { field: "slug", message: "This project slug is already taken." },
};

function rateMinor(value: string): number {
    return Math.round(Number(value) * 100);
}

export function CreateProjectForm({
    clients,
    initialClientId = "",
    onSuccess,
}: {
    clients: Array<{ id: string; name: string; currency: string }>;
    initialClientId?: string;
    onSuccess: () => void;
}) {
    const mutation = useCreateProject();
    const form = useMutationForm({
        ...valuesOptions,
        defaultValues: { ...valuesOptions.defaultValues, clientId: initialClientId },
        validators: { onChange: schema },
        mutation,
        errorConfig: errors,
        toVariables: (values) => ({
            clientId: values.clientId,
            name: values.name,
            slug: values.slug,
            rateMinor: rateMinor(values.hourlyRate),
        }),
        onSuccess,
    });
    return <ProjectFields form={form} clients={clients} submitLabel="Create project" />;
}

export function EditProjectForm({
    project,
}: {
    project: { id: string; clientId: string; name: string; slug: string; rateMinor: number };
}) {
    const mutation = useUpdateProject();
    const navigate = useNavigate();
    const form = useMutationForm({
        ...valuesOptions,
        defaultValues: {
            clientId: project.clientId,
            name: project.name,
            slug: project.slug,
            hourlyRate: (project.rateMinor / 100).toFixed(2),
        },
        validators: { onChange: schema },
        mutation,
        errorConfig: errors,
        toVariables: (values) => ({
            id: project.id,
            name: values.name,
            slug: values.slug,
            rateMinor: rateMinor(values.hourlyRate),
        }),
        onSuccess: (updated) =>
            navigate({
                to: "/projects/$projectSlug",
                params: { projectSlug: updated.slug },
                replace: true,
            }),
    });
    return <ProjectFields form={form} clients={[]} submitLabel="Save project" editing />;
}

function ProjectFields({
    form,
    clients,
    submitLabel,
    editing = false,
}: {
    form: ReturnType<typeof useMutationForm<Values, unknown, never>>;
    clients: Array<{ id: string; name: string; currency: string }>;
    submitLabel: string;
    editing?: boolean;
}) {
    return (
        <form.AppForm>
            <form
                className="space-y-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    void form.handleSubmit();
                }}
            >
                {!editing && (
                    <form.AppField name="clientId">
                        {(field) => (
                            <field.SelectField
                                label="Client"
                                placeholder="Choose a client"
                                options={clients.map((client) => ({
                                    value: client.id,
                                    label: `${client.name} (${client.currency})`,
                                }))}
                            />
                        )}
                    </form.AppField>
                )}
                <form.AppField name="name">
                    {(field) => <field.TextField label="Name" />}
                </form.AppField>
                <form.AppField name="slug">
                    {(field) => (
                        <field.TextField label="Slug" description="Used in the project URL." />
                    )}
                </form.AppField>
                <form.AppField name="hourlyRate">
                    {(field) => <field.TextField label="Hourly rate" placeholder="125.00" />}
                </form.AppField>
                <FormError />
                <form.SubmitButton label={submitLabel} submittingLabel="Saving…" />
            </form>
        </form.AppForm>
    );
}
