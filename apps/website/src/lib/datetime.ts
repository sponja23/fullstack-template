/** Generic date and duration formatting for display. */
export function formatRelative(value: Date): string {
    const minutes = Math.round((Date.now() - value.getTime()) / 60_000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.round(hours / 24)}d ago`;
}

export function formatDuration(start: Date | null, end: Date | null): string | null {
    if (start == null || end == null) return null;
    const seconds = Math.round((end.getTime() - start.getTime()) / 1000);
    if (seconds < 1) return "<1s";
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return remainder === 0 ? `${minutes}m` : `${minutes}m ${remainder}s`;
}
