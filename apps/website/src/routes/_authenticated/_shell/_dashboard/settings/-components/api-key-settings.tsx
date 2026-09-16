import { useState } from "react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { useApiKeys, useIssueApiKey, useRevokeApiKey } from "@/lib/queries/api-keys.queries";

export function ApiKeySettings() {
    const { data } = useApiKeys();
    const issue = useIssueApiKey();
    const revoke = useRevokeApiKey();
    const [name, setName] = useState("");
    const [secret, setSecret] = useState<string | null>(null);
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>API keys</CardTitle>
                    <CardDescription>
                        Keys authenticate requests made for this organization.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {data.apiKeys.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No API keys have been issued.
                        </p>
                    ) : (
                        <div className="divide-y rounded-lg border">
                            {data.apiKeys.map((key) => (
                                <div key={key.id} className="flex items-center gap-3 p-3">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{key.name}</p>
                                        <p className="font-mono text-xs text-muted-foreground">
                                            {key.start}••••
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={revoke.isPending}
                                        onClick={() => revoke.mutate({ keyId: key.id })}
                                    >
                                        Revoke
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Issue a key</CardTitle>
                    <CardDescription>The full key is shown once.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {secret != null && (
                        <div className="rounded-lg border bg-muted p-3">
                            <p className="mb-1 text-xs text-muted-foreground">Copy this key now</p>
                            <code className="break-all text-xs">{secret}</code>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Input
                            aria-label="Key name"
                            placeholder="Automation"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />
                        <Button
                            disabled={issue.isPending || name.trim() === ""}
                            onClick={() =>
                                issue.mutate(
                                    { name: name.trim() },
                                    {
                                        onSuccess: (minted) => {
                                            setSecret(minted.key);
                                            setName("");
                                        },
                                    },
                                )
                            }
                        >
                            {issue.isPending ? "Issuing…" : "Issue key"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
