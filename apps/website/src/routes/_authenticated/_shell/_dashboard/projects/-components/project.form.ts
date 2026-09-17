import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import {
    type FormErrorConfig,
    formOptions,
    useMutationForm,
    useTypedAppFormContext,
} from "@/lib/form";
import { useCreateProject, useUpdateProject } from "@/lib/queries/projects.queries";
import { slugRegex } from "@/lib/slug";

const projectOptions = formOptions({
    defaultValues: { clientId: "", name: "", slug: "", hourlyRate: "" },
});
const projectSchema = z.object({
    clientId: z.string().min(1, "Choose a client"),
    name: z.string().trim().min(1, "Name is required").max(120),
    slug: z
        .string()
        .min(1, "Slug is required")
        .max(60)
        .regex(slugRegex, "Use lowercase letters, numbers, and hyphens"),
    hourlyRate: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a non-negative amount"),
});
type ProjectValues = (typeof projectOptions)["defaultValues"];
const projectErrors: FormErrorConfig<ProjectValues> = {
    PROJECT_SLUG_TAKEN: { field: "slug", message: "This project slug is already taken." },
};

function rateMinor(value: string): number {
    return Math.round(Number(value) * 100);
}

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
            rateMinor: rateMinor(values.hourlyRate),
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
            rateMinor: rateMinor(values.hourlyRate),
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
