import type { ClientRecord, ClientsPort } from "../clients/clients.port.ts";

export class FakeClients implements ClientsPort {
    constructor(readonly records: ClientRecord[]) {}
    async list() {
        return this.records;
    }
    async get(_organizationId: string, id: string) {
        const record = this.records.find((client) => client.id === id);
        if (!record) throw new Error("client not found");
        return record;
    }
}
