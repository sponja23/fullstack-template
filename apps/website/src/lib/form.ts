import { createFormHook, createFormHookContexts, formOptions } from "@tanstack/react-form";
import type { UseMutationResult } from "@tanstack/react-query";
import { isTRPCClientError } from "@trpc/client";
import type { BackendErrorCode, UserAppRouter } from "@repo/client";
import { SelectField } from "@/components/form/select.field";
import { SubmitButton } from "@/components/form/submit-button";
import { TextField } from "@/components/form/text.field";
import { TextareaField } from "@/components/form/textarea.field";
import type { authClient } from "@/lib/auth";
import { BetterAuthActionError } from "@/lib/better-auth";

export type BetterAuthErrorCode = keyof typeof authClient.$ERROR_CODES;

const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

export const { useAppForm, withForm, useTypedAppFormContext } = createFormHook({
    fieldContext,
    formContext,
    fieldComponents: { TextField, TextareaField, SelectField },
    formComponents: { SubmitButton },
});

export { useFieldContext, useFormContext, formOptions };

export interface ErrorConfigEntry<TValues> {
    field?: keyof TValues & string;
    message?: string;
}

export type FormErrorConfig<TValues> = Partial<
    Record<
        BackendErrorCode | BetterAuthErrorCode,
        ErrorConfigEntry<TValues> | ((error: unknown) => ErrorConfigEntry<TValues>)
    >
>;

interface MutationFormBase<TValues, TResult, TVariables> {
    defaultValues: TValues;
    // biome-ignore lint/suspicious/noExplicitAny: TanStack Form's validator graph is intentionally inferred at the call site.
    validators?: any;
    mutation: UseMutationResult<TResult, unknown, TVariables, unknown>;
    errorConfig?: FormErrorConfig<TValues>;
    onSuccess?: (result: TResult, value: TValues) => void | Promise<void>;
    onFailure?: (error: unknown, value: TValues) => void;
}

export type UseMutationFormOptions<TValues, TResult, TVariables> = MutationFormBase<
    TValues,
    TResult,
    TVariables
> &
    (TValues extends TVariables
        ? { toVariables?: (values: TValues) => TVariables }
        : { toVariables: (values: TValues) => TVariables });

const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

export function useMutationForm<TValues, TResult, TVariables>(
    options: UseMutationFormOptions<TValues, TResult, TVariables>,
) {
    const { defaultValues, validators, mutation, errorConfig, onSuccess, onFailure } = options;
    const toVariables = (options as { toVariables?: (values: TValues) => TVariables }).toVariables;

    return useAppForm({
        defaultValues: defaultValues as TValues & object,
        validators,
        onSubmit: async ({ value, formApi }) => {
            formApi.setErrorMap({ onSubmit: undefined });
            try {
                const values = value as TValues;
                const result = await mutation.mutateAsync(
                    toVariables ? toVariables(values) : (values as unknown as TVariables),
                    { disableErrorToast: true } as never,
                );
                await onSuccess?.(result, values);
            } catch (error) {
                applyFormError(formApi, error, errorConfig);
                onFailure?.(error, value as TValues);
            }
        },
    });
}

interface FormApiLike<TValues> {
    setErrorMap: (errorMap: { onSubmit?: unknown }) => void;
    setFieldMeta: (
        field: keyof TValues & string,
        updater: (meta: { errors: unknown[] }) => { errors: unknown[] },
    ) => void;
}

function applyFormError<TValues>(
    formApi: unknown,
    error: unknown,
    errorConfig: FormErrorConfig<TValues> | undefined,
): void {
    const api = formApi as FormApiLike<TValues>;
    const entry = resolveErrorEntry(error, errorConfig);
    const message = entry?.message ?? GENERIC_ERROR_MESSAGE;
    if (entry?.field !== undefined) {
        api.setFieldMeta(entry.field, (meta) => ({ ...meta, errors: [...meta.errors, message] }));
        return;
    }
    api.setErrorMap({ onSubmit: message });
}

function errorCodeOf(error: unknown): string | undefined {
    if (error instanceof BetterAuthActionError) return error.code;
    if (isTRPCClientError<UserAppRouter>(error)) {
        return error.data?.errorCode as string | undefined;
    }
    return undefined;
}

export function resolveErrorEntry<TValues>(
    error: unknown,
    errorConfig: FormErrorConfig<TValues> | undefined,
): ErrorConfigEntry<TValues> | undefined {
    if (errorConfig === undefined) return undefined;
    const code = errorCodeOf(error);
    if (code === undefined) return undefined;
    const handler = errorConfig[code as BackendErrorCode | BetterAuthErrorCode];
    return typeof handler === "function" ? handler(error) : handler;
}
