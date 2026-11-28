import { type ApiScope, issueApiKeyInputSchema } from "@repo/protocol";
import {
    type FormErrorConfig,
    formOptions,
    useMutationForm,
    useTypedAppFormContext,
} from "@/lib/form";
import { nameMessages, withMessages } from "@/lib/form-messages";
import { useIssueApiKey } from "@/lib/queries/api-keys.queries";

const options = formOptions({ defaultValues: { name: "", scopes: [] as ApiScope[] } });
type Values = (typeof options)["defaultValues"];
const schema = withMessages(issueApiKeyInputSchema.omit({ expiresInSeconds: true }), {
    name: nameMessages,
    scopes: { too_small: "Grant at least one scope" },
});
const errorConfig: FormErrorConfig<Values> = {
    NOT_ORGANIZATION_OWNER: { message: "Only an owner can issue API keys." },
};

export function useIssueApiKeyForm(onIssued: (key: string) => void) {
    const form = useMutationForm({
        ...options,
        validators: { onChange: schema },
        mutation: useIssueApiKey(),
        errorConfig,
        onSuccess: (issued): void => {
            onIssued(issued.key);
            form.reset();
        },
    });
    return form;
}

export function useIssueApiKeyFormContext() {
    return useTypedAppFormContext(options);
}
