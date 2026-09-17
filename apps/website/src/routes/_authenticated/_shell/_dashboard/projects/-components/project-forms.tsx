import { FormError } from "@/components/form/form-error";
import { useCreateProjectForm, useEditProjectForm, useProjectFormContext } from "./project.form";

export function CreateProjectForm({
    clients,
    initialClientId = "",
    onSuccess,
}: {
    clients: Array<{ id: string; name: string; currency: string }>;
    initialClientId?: string;
    onSuccess: () => void;
}) {
    const form = useCreateProjectForm({ initialClientId, onSuccess });
    return <ProjectFields form={form} clients={clients} submitLabel="Create project" />;
}

export function EditProjectForm({
    project,
}: {
    project: { id: string; clientId: string; name: string; slug: string; rateMinor: number };
}) {
    const form = useEditProjectForm(project);
    return <ProjectFields form={form} clients={[]} submitLabel="Save project" editing />;
}

function ProjectFields({
    form,
    clients,
    submitLabel,
    editing = false,
}: {
    form: ReturnType<typeof useCreateProjectForm>;
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
                {!editing && <ClientField clients={clients} />}
                <NameField />
                <SlugField />
                <HourlyRateField />
                <FormError />
                <form.SubmitButton label={submitLabel} submittingLabel="Saving…" />
            </form>
        </form.AppForm>
    );
}

function ClientField({
    clients,
}: {
    clients: Array<{ id: string; name: string; currency: string }>;
}) {
    const form = useProjectFormContext();
    return (
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
    );
}

function NameField() {
    const form = useProjectFormContext();
    return <form.AppField name="name">{(field) => <field.TextField label="Name" />}</form.AppField>;
}

function SlugField() {
    const form = useProjectFormContext();
    return (
        <form.AppField name="slug">
            {(field) => <field.TextField label="Slug" description="Used in the project URL." />}
        </form.AppField>
    );
}

function HourlyRateField() {
    const form = useProjectFormContext();
    return (
        <form.AppField name="hourlyRate">
            {(field) => <field.TextField label="Hourly rate" placeholder="125.00" />}
        </form.AppField>
    );
}
