import { useState } from "react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { useApiKeys, useRevokeApiKey } from "@/lib/queries/api-keys.queries";
import { IssueApiKeyForm } from "./issue-api-key-form";

export function ApiKeySettings() {
    const { data } = useApiKeys();
    const revoke = useRevokeApiKey();
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
                                        <p className="text-xs text-muted-foreground">
                                            {key.scopes.join(", ")}
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
                    <IssueApiKeyForm onIssued={setSecret} />
                </CardContent>
            </Card>
        </div>
    );
}
