import type {
    DefaultError,
    EnsureQueryDataOptions,
    MutateOptions,
    QueryClient,
    QueryKey,
    UseMutationOptions,
} from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";
import { isTRPCClientError } from "@trpc/client";
import { toast } from "@repo/ui/toast";

export interface APIToastProps {
    title?: string;
    description?: string;
}

export interface APIMutationOptions<
    TData,
    TError,
    TVariables,
    TOnMutateResult,
> extends UseMutationOptions<TData, TError, TVariables, TOnMutateResult> {
    successToast?: APIToastProps | ((data: TData, variables: TVariables) => APIToastProps);
    errorToast?: APIToastProps | ((error: TError, variables: TVariables) => APIToastProps);
}

const INTERNAL_ERROR_PATTERNS = [/drizzle/i, /postgres/i, /constraint/i, /\.ts:\d+/];
const GENERIC_ERROR = "Something went wrong. Please try again.";

function errorMessage(error: unknown): string {
    const message = isTRPCClientError(error)
        ? error.message
        : error instanceof Error
          ? error.message
          : undefined;
    return message == null || INTERNAL_ERROR_PATTERNS.some((pattern) => pattern.test(message))
        ? GENERIC_ERROR
        : message;
}

export interface APIMutateOptions {
    disableErrorToast?: boolean;
}

export function useAPIMutation<
    TData = unknown,
    TError = DefaultError,
    TVariables = void,
    TOnMutateResult = unknown,
>(options: APIMutationOptions<TData, TError, TVariables, TOnMutateResult>) {
    const { successToast, errorToast, ...mutationOptions } = options;
    const mutation = useMutation(mutationOptions);
    type StandardOptions = MutateOptions<TData, TError, TVariables, TOnMutateResult>;
    type CombinedOptions = StandardOptions & APIMutateOptions;

    function callbacks(callOptions?: CombinedOptions): StandardOptions {
        const {
            disableErrorToast = false,
            onSuccess: callerSuccess,
            onError: callerError,
            ...rest
        } = callOptions ?? {};
        return {
            ...rest,
            onSuccess: (...args) => {
                const [data, variables] = args;
                const content =
                    typeof successToast === "function"
                        ? successToast(data, variables)
                        : successToast;
                if (content !== undefined) toast.add({ ...content, type: "success" });
                callerSuccess?.(...args);
            },
            onError: (...args) => {
                const [error, variables] = args;
                if (!disableErrorToast) {
                    const content =
                        typeof errorToast === "function"
                            ? errorToast(error, variables)
                            : errorToast;
                    toast.add({
                        title: content?.title ?? "An unexpected error occurred",
                        description: content?.description ?? errorMessage(error),
                        type: "error",
                    });
                }
                callerError?.(...args);
            },
        };
    }

    return {
        ...mutation,
        mutate: (variables: TVariables, callOptions?: CombinedOptions) =>
            mutation.mutate(variables, callbacks(callOptions)),
        mutateAsync: (variables: TVariables, callOptions?: CombinedOptions) =>
            mutation.mutateAsync(variables, callbacks(callOptions)),
    };
}

export async function ensureAPIQueryData<
    TQueryFnData,
    TError = DefaultError,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
>(
    queryClient: QueryClient,
    options: EnsureQueryDataOptions<TQueryFnData, TError, TData, TQueryKey>,
): Promise<TData> {
    try {
        return await queryClient.ensureQueryData(options);
    } catch (error) {
        if (isTRPCClientError(error) && error.data?.httpStatus === 404) throw notFound();
        throw error;
    }
}
