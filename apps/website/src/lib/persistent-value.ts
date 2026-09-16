export class PersistentValue {
    constructor(private readonly key: string) {}

    read(): string | null {
        try {
            return window.localStorage.getItem(this.key);
        } catch {
            return null;
        }
    }

    write(value: string): void {
        try {
            window.localStorage.setItem(this.key, value);
        } catch {}
    }

    clear(): void {
        try {
            window.localStorage.removeItem(this.key);
        } catch {}
    }
}
