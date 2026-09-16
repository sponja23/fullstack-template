import type { Database } from "./factory.ts";

export abstract class DatabaseRepository {
    constructor(protected readonly database: Database) {}
}
