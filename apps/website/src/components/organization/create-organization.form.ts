import { z } from "zod";
import {
    type FormErrorConfig,
    formOptions,
    useMutationForm,
    useTypedAppFormContext,
} from "@/lib/form";
import {
    useCreateOrganization,
    useSetActiveOrganization,
} from "@/lib/queries/organizations.queries";
import { slugRegex } from "@/lib/slug";

const schema = z.object({
    name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
    slug: z
        .string()
        .min(1, "Slug is required")
        .max(60, "Slug is too long")
        .regex(slugRegex, "Lowercase letters, numbers, and hyphens only"),
});

const options = formOptions({ defaultValues: { name: "", slug: "" } });
type Values = (typeof options)["defaultValues"];

const errorConfig: FormErrorConfig<Values> = {
    ORGANIZATION_ALREADY_EXISTS: { field: "slug", message: "This slug is already taken." },
    ORGANIZATION_SLUG_ALREADY_TAKEN: { field: "slug", message: "This slug is already taken." },
};

export function useCreateOrganizationForm({
    onSuccess,
}: {
    onSuccess: () => void | Promise<void>;
}) {
    const create = useCreateOrganization();
    const activate = useSetActiveOrganization();
    return useMutationForm({
        ...options,
        validators: { onChange: schema },
        mutation: create,
        errorConfig,
        onSuccess: async (organization) => {
            await activate.mutateAsync(
                { organizationId: organization.id },
                { disableErrorToast: true },
            );
            await onSuccess();
        },
    });
}

export function useCreateOrganizationFormContext() {
    return useTypedAppFormContext(options);
}
