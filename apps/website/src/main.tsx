import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { UserClient } from "@repo/client";
import { Toaster } from "@repo/ui/toast";
import { env } from "@/env";
import { createTRPCProxy, TRPCProvider } from "@/lib/trpc";
import { createAppRouter } from "@/router";
import "@/styles.css";

const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
const applyColorScheme = ({ matches }: Pick<MediaQueryList, "matches">) => {
    document.documentElement.classList.toggle("dark", matches);
};
applyColorScheme(colorScheme);
colorScheme.addEventListener("change", applyColorScheme);

function App() {
    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() => new UserClient({ apiBaseUrl: env.VITE_API_URL }).trpc);
    const [trpc] = useState(() => createTRPCProxy(trpcClient, queryClient));
    const [router] = useState(() => createAppRouter({ queryClient, trpcClient, trpc }));
    return (
        <QueryClientProvider client={queryClient}>
            <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
                <Toaster>
                    <RouterProvider router={router} />
                </Toaster>
            </TRPCProvider>
        </QueryClientProvider>
    );
}

const root = document.getElementById("app");
if (root == null) throw new Error("#app not found");
createRoot(root).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
