import { idSchema, nameSchema, rateMinorSchema, slugSchema } from "@repo/protocol";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import {
    type FormErrorConfig,
    formOptions,
    useMutationForm,
    useTypedAppFormContext,
} from "@/lib/form";
import { nameMessages, slugMessages, withMessages } from "@/lib/form-messages";
import { amountText, toMinor } from "@/lib/number-text";
import { useCreateProject, useUpdateProject } from "@/lib/queries/projects.queries";

const projectOptions = formOptions({
    defaultValues: { clientId: "", name: "", slug: "", hourlyRate: "" },
});
const projectSchema = withMessages(
    z.object({
        clientId: idSchema,
        name: nameSchema,
        slug: slugSchema,
        hourlyRate: amountText(rateMinorSchema),
    }),
    {
        clientId: { invalid_format: "Choose a client" },
        name: nameMessages,
        slug: slugMessages,
        hourlyRate: { invalid_format: "Enter a non-negative amount" },
    },
);
type ProjectValues = (typeof projectOptions)["defaultValues"];
const projectErrors: FormErrorConfig<ProjectValues> = {
    PROJECT_SLUG_TAKEN: { field: "slug", message: "This project slug is already taken." },
};

export function useCreateProjectForm({
    initialClientId,
    onSuccess,
}: {
    initialClientId: string;
    onSuccess: () => void;
}) {
    return useMutationForm({
        ...projectOptions,
        defaultValues: { ...projectOptions.defaultValues, clientId: initialClientId },
        validators: { onChange: projectSchema },
        mutation: useCreateProject(),
        errorConfig: projectErrors,
        toVariables: (values) => ({
            clientId: values.clientId,
            name: values.name,
            slug: values.slug,
            rateMinor: toMinor(values.hourlyRate),
        }),
        onSuccess,
    });
}

export function useEditProjectForm(project: {
    id: string;
    clientId: string;
    name: string;
    slug: string;
    rateMinor: number;
}) {
    const navigate = useNavigate();
    return useMutationForm({
        ...projectOptions,
        defaultValues: {
            clientId: project.clientId,
            name: project.name,
            slug: project.slug,
            hourlyRate: (project.rateMinor / 100).toFixed(2),
        },
        validators: { onChange: projectSchema },
        mutation: useUpdateProject(),
        errorConfig: projectErrors,
        toVariables: (values) => ({
            id: project.id,
            name: values.name,
            slug: values.slug,
            rateMinor: toMinor(values.hourlyRate),
        }),
        onSuccess: (updated) =>
            navigate({
                to: "/projects/$projectSlug",
                params: { projectSlug: updated.slug },
                replace: true,
            }),
    });
}

export function useProjectFormContext() {
    return useTypedAppFormContext(projectOptions);
}
