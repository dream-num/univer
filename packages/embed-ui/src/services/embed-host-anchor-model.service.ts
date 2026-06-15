import type { EmbedHostAnchorRecord } from '../types/host-anchor';

export class EmbedHostAnchorModelService {
    private readonly _records = new Map<string, Record<string, EmbedHostAnchorRecord>>();

    clearUnit(hostUnitId: string): void {
        this._records.delete(hostUnitId);
    }

    setAnchor(record: EmbedHostAnchorRecord): void {
        const records = this._ensureRecords(record.hostUnitId);
        const now = Date.now();
        records[record.hostAnchorId] = {
            ...record,
            lifecycle: 'active',
            createdAt: record.createdAt ?? records[record.hostAnchorId]?.createdAt ?? now,
            updatedAt: now,
        };
    }

    removeAnchor(hostUnitId: string, hostAnchorId: string): void {
        const records = this._ensureRecords(hostUnitId);
        const record = records[hostAnchorId];
        if (!record) {
            return;
        }

        records[hostAnchorId] = {
            ...record,
            lifecycle: 'removed',
            updatedAt: Date.now(),
        };
    }

    getAnchor(hostUnitId: string, hostAnchorId: string): EmbedHostAnchorRecord | undefined {
        const record = this._ensureRecords(hostUnitId)[hostAnchorId];
        return record ? { ...record } : undefined;
    }

    listAnchors(hostUnitId: string): EmbedHostAnchorRecord[] {
        return Object.values(this._ensureRecords(hostUnitId)).map((record) => ({ ...record }));
    }

    private _ensureRecords(hostUnitId: string): Record<string, EmbedHostAnchorRecord> {
        let records = this._records.get(hostUnitId);
        if (!records) {
            records = {};
            this._records.set(hostUnitId, records);
        }

        return records;
    }
}
