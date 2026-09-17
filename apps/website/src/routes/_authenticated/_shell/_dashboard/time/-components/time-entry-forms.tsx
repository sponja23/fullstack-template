import { FormError } from "@/components/form/form-error";
import {
    useCreateTimeEntryForm,
    useCreateTimeEntryFormContext,
    useEditTimeEntryForm,
    useEditTimeEntryFormContext,
} from "./time-entry.form";

export function CreateTimeEntryForm({
    projects,
    initialProjectId = "",
    onSuccess,
}: {
    projects: Array<{ id: string; name: string; clientName: string }>;
    initialProjectId?: string;
    onSuccess?: () => void;
}) {
    const form = useCreateTimeEntryForm({ initialProjectId, onSuccess });
    return (
        <form.AppForm>
            <form
                className="space-y-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    void form.handleSubmit();
                }}
            >
                {initialProjectId === "" && <ProjectField projects={projects} />}
                <CreateDateField />
                <CreateMinutesField />
                <CreateNoteField />
                <FormError />
                <form.SubmitButton label="Add time" submittingLabel="Adding…" />
            </form>
        </form.AppForm>
    );
}

export function EditTimeEntryForm({
    entry,
    onSuccess,
}: {
    entry: { id: string; date: string; minutes: number; note: string };
    onSuccess: () => void;
}) {
    const form = useEditTimeEntryForm({ entry, onSuccess });
    return (
        <form.AppForm>
            <form
                className="space-y-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    void form.handleSubmit();
                }}
            >
                <EditDateField />
                <EditMinutesField />
                <EditNoteField />
                <FormError />
                <form.SubmitButton label="Save entry" submittingLabel="Saving…" />
            </form>
        </form.AppForm>
    );
}

function ProjectField({
    projects,
}: {
    projects: Array<{ id: string; name: string; clientName: string }>;
}) {
    const form = useCreateTimeEntryFormContext();
    return (
        <form.AppField name="projectId">
            {(field) => (
                <field.SelectField
                    label="Project"
                    placeholder="Choose a project"
                    options={projects.map((project) => ({
                        value: project.id,
                        label: `${project.clientName} — ${project.name}`,
                    }))}
                />
            )}
        </form.AppField>
    );
}

function CreateDateField() {
    const form = useCreateTimeEntryFormContext();
    return (
        <form.AppField name="date">
            {(field) => <field.TextField label="Date" placeholder="YYYY-MM-DD" />}
        </form.AppField>
    );
}

function CreateMinutesField() {
    const form = useCreateTimeEntryFormContext();
    return (
        <form.AppField name="minutes">
            {(field) => <field.TextField label="Minutes" placeholder="60" />}
        </form.AppField>
    );
}

function CreateNoteField() {
    const form = useCreateTimeEntryFormContext();
    return (
        <form.AppField name="note">{(field) => <field.TextareaField label="Note" />}</form.AppField>
    );
}

function EditDateField() {
    const form = useEditTimeEntryFormContext();
    return (
        <form.AppField name="date">
            {(field) => <field.TextField label="Date" placeholder="YYYY-MM-DD" />}
        </form.AppField>
    );
}

function EditMinutesField() {
    const form = useEditTimeEntryFormContext();
    return (
        <form.AppField name="minutes">
            {(field) => <field.TextField label="Minutes" />}
        </form.AppField>
    );
}

function EditNoteField() {
    const form = useEditTimeEntryFormContext();
    return (
        <form.AppField name="note">{(field) => <field.TextareaField label="Note" />}</form.AppField>
    );
}
