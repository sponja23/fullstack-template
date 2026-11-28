import { NOTE_MAX_LENGTH, dateSchema, idSchema, minutesSchema, noteSchema } from "@repo/protocol";
import { z } from "zod";
import {
    type FormErrorConfig,
    formOptions,
    useMutationForm,
    useTypedAppFormContext,
} from "@/lib/form";
import { count, withMessages } from "@/lib/form-messages";
import { numberText } from "@/lib/number-text";
import { useCreateTimeEntry, useUpdateTimeEntry } from "@/lib/queries/time-entries.queries";

const createOptions = formOptions({
    defaultValues: { projectId: "", date: "", minutes: "", note: "" },
});
const editOptions = formOptions({ defaultValues: { date: "", minutes: "", note: "" } });
const fields = {
    date: dateSchema,
    minutes: numberText(minutesSchema),
    note: noteSchema,
};
const messages = {
    date: { invalid_format: "Enter a valid date" },
    minutes: {
        invalid_format: "Enter whole minutes",
        invalid_type: "Enter whole minutes",
        too_small: "Minutes must be positive",
    },
    note: { too_big: `Keep the note to ${count(NOTE_MAX_LENGTH)} characters` },
};
const createSchema = withMessages(z.object({ projectId: idSchema, ...fields }), {
    projectId: { invalid_format: "Choose a project" },
    ...messages,
});
const editSchema = withMessages(z.object(fields), messages);
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
        validators: { onChange: editSchema },
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
