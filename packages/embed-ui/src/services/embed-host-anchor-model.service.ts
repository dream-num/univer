/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IEmbedHostAnchorRecord } from '../types/host-anchor';

export class EmbedHostAnchorModelService {
    private readonly _records = new Map<string, Record<string, IEmbedHostAnchorRecord>>();

    clearUnit(hostUnitId: string): void {
        this._records.delete(hostUnitId);
    }

    setAnchor(record: IEmbedHostAnchorRecord): void {
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

    getAnchor(hostUnitId: string, hostAnchorId: string): IEmbedHostAnchorRecord | undefined {
        const record = this._ensureRecords(hostUnitId)[hostAnchorId];
        return record ? { ...record } : undefined;
    }

    listAnchors(hostUnitId: string): IEmbedHostAnchorRecord[] {
        return Object.values(this._ensureRecords(hostUnitId)).map((record) => ({ ...record }));
    }

    private _ensureRecords(hostUnitId: string): Record<string, IEmbedHostAnchorRecord> {
        let records = this._records.get(hostUnitId);
        if (!records) {
            records = {};
            this._records.set(hostUnitId, records);
        }

        return records;
    }
}
