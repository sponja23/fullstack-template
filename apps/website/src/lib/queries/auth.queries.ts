import { type QueryClient, queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth";
import { unwrapAuthResult } from "@/lib/better-auth";
import { isSuperadmin } from "@/lib/role";
import { useAPIMutation } from "./api-queries";

export function sessionQueryOptions() {
    return queryOptions({
        queryKey: ["auth", "session"] as const,
        queryFn: async () => (await authClient.getSession()).data,
    });
}

export function useSession() {
    return useQuery(sessionQueryOptions());
}

export function ensureSessionData(queryClient: QueryClient) {
    return queryClient.ensureQueryData(sessionQueryOptions());
}

export async function ensureActiveOrganizationId(queryClient: QueryClient): Promise<string> {
    const session = await ensureSessionData(queryClient);
    const organizationId = session?.session.activeOrganizationId;
    if (organizationId == null) throw new Error("An active organization is required");
    return organizationId;
}

export type User = typeof authClient.$Infer.Session.user;

export function useAuth() {
    const { data } = useSession();
    return {
        user: data?.user ?? null,
        isLoggedIn: data?.session != null,
        activeOrganizationId: data?.session.activeOrganizationId ?? null,
        isSuperadmin: isSuperadmin(data?.user.role),
    };
}

export function useUser() {
    const auth = useAuth();
    if (auth.user == null) throw new Error("useUser requires an authenticated route");
    return { ...auth, user: auth.user };
}

export interface SignInVars {
    email: string;
    password: string;
}

export function useSignIn() {
    const queryClient = useQueryClient();
    return useAPIMutation({
        mutationFn: (vars: SignInVars) =>
            unwrapAuthResult(authClient.signIn.email(vars), "Sign in failed"),
        successToast: { title: "Signed in" },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth", "session"] }),
    });
}

export interface SignUpVars extends SignInVars {
    name: string;
}

export function useSignUp() {
    const queryClient = useQueryClient();
    return useAPIMutation({
        mutationFn: (vars: SignUpVars) =>
            unwrapAuthResult(authClient.signUp.email(vars), "Sign up failed"),
        successToast: { title: "Account created" },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth", "session"] }),
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();
    return useAPIMutation({
        mutationFn: (vars: { name: string }) =>
            unwrapAuthResult(authClient.updateUser(vars), "Update failed"),
        successToast: { title: "Profile updated" },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth", "session"] }),
    });
}

export function useChangePassword() {
    return useAPIMutation({
        mutationFn: (vars: { currentPassword: string; newPassword: string }) =>
            unwrapAuthResult(authClient.changePassword(vars), "Password change failed"),
        successToast: { title: "Password changed" },
    });
}

export function useSignOut() {
    const queryClient = useQueryClient();
    return useAPIMutation({
        mutationFn: () => unwrapAuthResult(authClient.signOut(), "Sign out failed"),
        successToast: { title: "Signed out" },
        onSuccess: () => queryClient.clear(),
    });
}
