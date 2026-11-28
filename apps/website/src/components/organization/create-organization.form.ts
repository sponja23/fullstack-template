import { nameSchema, slugSchema } from "@repo/protocol";
import { z } from "zod";
import {
    type FormErrorConfig,
    formOptions,
    useMutationForm,
    useTypedAppFormContext,
} from "@/lib/form";
import { nameMessages, slugMessages, withMessages } from "@/lib/form-messages";
import {
    useCreateOrganization,
    useSetActiveOrganization,
} from "@/lib/queries/organizations.queries";

const schema = withMessages(z.object({ name: nameSchema, slug: slugSchema }), {
    name: nameMessages,
    slug: slugMessages,
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
