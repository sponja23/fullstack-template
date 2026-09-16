import { z } from "zod";
import { FormError } from "@/components/form/form.error";
import { type FormErrorConfig, formOptions, useMutationForm } from "@/lib/form";
import { useCreateTimeEntry, useUpdateTimeEntry } from "@/lib/queries/time-entries.queries";

const createOptions = formOptions({
    defaultValues: { projectId: "", date: "", minutes: "", note: "" },
});
const editOptions = formOptions({ defaultValues: { date: "", minutes: "", note: "" } });
const dateSchema = z.string().date("Enter a valid date");
const minutesSchema = z
    .string()
    .regex(/^\d+$/, "Enter whole minutes")
    .refine((value) => Number(value) > 0, "Minutes must be positive");
const createSchema = z.object({
    projectId: z.string().min(1, "Choose a project"),
    date: dateSchema,
    minutes: minutesSchema,
    note: z.string().trim().max(1_000),
});
const editSchema = createSchema.omit({ projectId: true });
const createErrors: FormErrorConfig<(typeof createOptions)["defaultValues"]> = {
    PROJECT_ARCHIVED: { message: "Archived projects do not accept new time entries." },
};
const editErrors: FormErrorConfig<(typeof editOptions)["defaultValues"]> = {
    TIME_ENTRY_BILLED: { message: "Billed time entries cannot be changed." },
};

export function CreateTimeEntryForm({
    projects,
    initialProjectId = "",
    onSuccess,
}: {
    projects: Array<{ id: string; name: string; clientName: string }>;
    initialProjectId?: string;
    onSuccess?: () => void;
}) {
    const mutation = useCreateTimeEntry();
    const form = useMutationForm({
        ...createOptions,
        defaultValues: {
            projectId: initialProjectId,
            date: new Date().toISOString().slice(0, 10),
            minutes: "",
            note: "",
        },
        validators: { onChange: createSchema },
        mutation,
        errorConfig: createErrors,
        toVariables: (values) => ({
            projectId: values.projectId,
            date: values.date,
            minutes: Number(values.minutes),
            note: values.note,
        }),
        onSuccess: () => onSuccess?.(),
    });
    return (
        <form.AppForm>
            <form
                className="space-y-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    void form.handleSubmit();
                }}
            >
                {initialProjectId === "" && (
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
                )}
                <form.AppField name="date">
                    {(field) => <field.TextField label="Date" placeholder="YYYY-MM-DD" />}
                </form.AppField>
                <form.AppField name="minutes">
                    {(field) => <field.TextField label="Minutes" placeholder="60" />}
                </form.AppField>
                <form.AppField name="note">
                    {(field) => <field.TextareaField label="Note" />}
                </form.AppField>
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
    const mutation = useUpdateTimeEntry();
    const form = useMutationForm({
        ...editOptions,
        defaultValues: { date: entry.date, minutes: String(entry.minutes), note: entry.note },
        validators: { onChange: editSchema },
        mutation,
        errorConfig: editErrors,
        toVariables: (values) => ({
            id: entry.id,
            date: values.date,
            minutes: Number(values.minutes),
            note: values.note,
        }),
        onSuccess,
    });
    return (
        <form.AppForm>
            <form
                className="space-y-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    void form.handleSubmit();
                }}
            >
                <form.AppField name="date">
                    {(field) => <field.TextField label="Date" placeholder="YYYY-MM-DD" />}
                </form.AppField>
                <form.AppField name="minutes">
                    {(field) => <field.TextField label="Minutes" />}
                </form.AppField>
                <form.AppField name="note">
                    {(field) => <field.TextareaField label="Note" />}
                </form.AppField>
                <FormError />
                <form.SubmitButton label="Save entry" submittingLabel="Saving…" />
            </form>
        </form.AppForm>
    );
}
