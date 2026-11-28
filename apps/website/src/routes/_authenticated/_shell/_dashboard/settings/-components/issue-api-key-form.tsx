import { API_SCOPES } from "@repo/protocol";
import { FormError } from "@/components/form/form-error";
import { SCOPE_CATALOG } from "@/lib/api-scopes";
import { useIssueApiKeyForm, useIssueApiKeyFormContext } from "./issue-api-key.form";

const scopeOptions = API_SCOPES.map((value) => ({ value, label: SCOPE_CATALOG[value] }));

export function IssueApiKeyForm({ onIssued }: { onIssued: (key: string) => void }) {
    const form = useIssueApiKeyForm(onIssued);
    return (
        <form.AppForm>
            <form
                className="space-y-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    void form.handleSubmit();
                }}
            >
                <NameField />
                <ScopesField />
                <FormError />
                <form.SubmitButton label="Issue key" submittingLabel="Issuing…" />
            </form>
        </form.AppForm>
    );
}

function NameField() {
    const form = useIssueApiKeyFormContext();
    return (
        <form.AppField name="name">
            {(field) => <field.TextField label="Key name" placeholder="Automation" />}
        </form.AppField>
    );
}

function ScopesField() {
    const form = useIssueApiKeyFormContext();
    return (
        <form.AppField name="scopes">
            {(field) => <field.CheckboxGroupField label="Scopes" options={scopeOptions} />}
        </form.AppField>
    );
}
