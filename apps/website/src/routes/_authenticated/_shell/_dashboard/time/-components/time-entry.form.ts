import { z } from "zod";
import {
    type FormErrorConfig,
    formOptions,
    useMutationForm,
    useTypedAppFormContext,
} from "@/lib/form";
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
const createErrors: FormErrorConfig<(typeof createOptions)["defaultValues"]> = {
    PROJECT_ARCHIVED: { message: "Archived projects do not accept new time entries." },
};
const editErrors: FormErrorConfig<(typeof editOptions)["defaultValues"]> = {
    TIME_ENTRY_BILLED: { message: "Billed time entries cannot be changed." },
};

export function useCreateTimeEntryForm({
    initialProjectId,
    onSuccess,
}: {
    initialProjectId: string;
    onSuccess?: () => void;
}) {
    return useMutationForm({
        ...createOptions,
        defaultValues: {
            projectId: initialProjectId,
            date: new Date().toISOString().slice(0, 10),
            minutes: "",
            note: "",
        },
        validators: { onChange: createSchema },
        mutation: useCreateTimeEntry(),
        errorConfig: createErrors,
        toVariables: (values) => ({
            projectId: values.projectId,
            date: values.date,
            minutes: Number(values.minutes),
            note: values.note,
        }),
        onSuccess: () => onSuccess?.(),
    });
}

export function useCreateTimeEntryFormContext() {
    return useTypedAppFormContext(createOptions);
}

export function useEditTimeEntryForm({
    entry,
    onSuccess,
}: {
    entry: { id: string; date: string; minutes: number; note: string };
    onSuccess: () => void;
}) {
    return useMutationForm({
        ...editOptions,
        defaultValues: { date: entry.date, minutes: String(entry.minutes), note: entry.note },
        validators: { onChange: createSchema.omit({ projectId: true }) },
        mutation: useUpdateTimeEntry(),
        errorConfig: editErrors,
        toVariables: (values) => ({
            id: entry.id,
            date: values.date,
            minutes: Number(values.minutes),
            note: values.note,
        }),
        onSuccess,
    });
}

export function useEditTimeEntryFormContext() {
    return useTypedAppFormContext(editOptions);
}
