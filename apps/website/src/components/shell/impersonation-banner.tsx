import { useNavigate, useRouter } from "@tanstack/react-router";
import { Button } from "@repo/ui/button";
import { Eye } from "lucide-react";
import { useImpersonation, useStopImpersonating } from "@/lib/queries/superadmin.queries";

export function ImpersonationBanner() {
    const { isImpersonating, viewingAs } = useImpersonation();
    const stop = useStopImpersonating();
    const navigate = useNavigate();
    const router = useRouter();
    if (!isImpersonating) return null;
    return (
        <div className="flex items-center gap-3 border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-sm">
            <Eye className="size-4" />
            <span className="flex-1">
                Viewing as <strong>{viewingAs?.name || viewingAs?.email}</strong>
            </span>
            <Button
                variant="outline"
                size="sm"
                disabled={stop.isPending}
                onClick={() =>
                    stop.mutate(undefined, {
                        onSuccess: async () => {
                            await navigate({ to: "/superadmin/organizations" });
                            await router.invalidate();
                        },
                    })
                }
            >
                {stop.isPending ? "Stopping…" : "Stop"}
            </Button>
        </div>
    );
}
