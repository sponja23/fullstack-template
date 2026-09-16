import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
    useAcceptInvitation,
    useRejectInvitation,
    useSetActiveOrganization,
    useUserInvitations,
} from "@/lib/queries/organizations.queries";

export function UserInvitationsCard({ onAccepted }: { onAccepted: () => void | Promise<void> }) {
    const { data } = useUserInvitations();
    if (!data?.length) return null;
    return (
        <Card>
            <CardHeader>
                <CardTitle>Invitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {data.map((invitation) => (
                    <InvitationRow
                        key={invitation.id}
                        invitation={invitation}
                        onAccepted={onAccepted}
                    />
                ))}
            </CardContent>
        </Card>
    );
}

function InvitationRow({
    invitation,
    onAccepted,
}: {
    invitation: { id: string; organizationId: string; organizationName: string; role: string };
    onAccepted: () => void | Promise<void>;
}) {
    const accept = useAcceptInvitation();
    const reject = useRejectInvitation();
    const activate = useSetActiveOrganization();
    const busy = accept.isPending || reject.isPending || activate.isPending;
    return (
        <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{invitation.organizationName}</p>
                <p className="text-xs capitalize text-muted-foreground">
                    Invited as {invitation.role}
                </p>
            </div>
            <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => reject.mutate({ invitationId: invitation.id })}
            >
                Decline
            </Button>
            <Button
                size="sm"
                disabled={busy}
                onClick={async () => {
                    await accept.mutateAsync({ invitationId: invitation.id });
                    await activate.mutateAsync({ organizationId: invitation.organizationId });
                    await onAccepted();
                }}
            >
                Accept
            </Button>
        </div>
    );
}
