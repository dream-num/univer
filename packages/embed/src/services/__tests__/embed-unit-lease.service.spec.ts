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

import type { IEmbedUnitLeaseRecord } from '../embed-unit-lease.service';
import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { EmbedUnitLeaseService } from '../embed-unit-lease.service';

describe('EmbedUnitLeaseService', () => {
    it('acquires and releases a child unit lease by embed owner', () => {
        const service = new EmbedUnitLeaseService();
        const record = createLeaseRecord();

        const disposable = service.acquire(record);

        expect(service.hasLease({ hostUnitId: 'host-1', embedId: 'embed-1' }, 'child-1')).toBe(true);
        expect(service.getLease('child-1')).toEqual(record);

        disposable.dispose();
        expect(service.hasLease({ hostUnitId: 'host-1', embedId: 'embed-1' }, 'child-1')).toBe(false);
        expect(service.getLease('child-1')).toBeUndefined();
    });

    it('rejects one child unit leased by another embed owner', () => {
        const service = new EmbedUnitLeaseService();
        service.acquire(createLeaseRecord());

        expect(() => service.acquire(createLeaseRecord({ embedId: 'embed-2' })))
            .toThrow('EMBED_CHILD_UNIT_ALREADY_EMBEDDED');
    });

    it('rejects one embed owner leasing a different child unit', () => {
        const service = new EmbedUnitLeaseService();
        service.acquire(createLeaseRecord());

        expect(() => service.acquire(createLeaseRecord({ childUnitId: 'child-2' })))
            .toThrow('EMBED_CHILD_UNIT_ALREADY_EMBEDDED');
    });

    it('keeps an existing lease when the same owner reacquires the same child unit', () => {
        const service = new EmbedUnitLeaseService();
        const first = service.acquire(createLeaseRecord());
        const second = service.acquire(createLeaseRecord());

        second.dispose();
        expect(service.getLease('child-1')).toEqual(createLeaseRecord());

        first.dispose();
        expect(service.getLease('child-1')).toBeUndefined();
    });

    it('releases leases by host unit and child unit lifecycle', () => {
        const service = new EmbedUnitLeaseService();
        service.acquire(createLeaseRecord({ hostUnitId: 'host-1', embedId: 'embed-1', childUnitId: 'child-1' }));
        service.acquire(createLeaseRecord({ hostUnitId: 'host-1', embedId: 'embed-2', childUnitId: 'child-2' }));
        service.acquire(createLeaseRecord({ hostUnitId: 'host-2', embedId: 'embed-3', childUnitId: 'child-3' }));

        service.releaseHost('host-1');
        expect(service.getLease('child-1')).toBeUndefined();
        expect(service.getLease('child-2')).toBeUndefined();
        expect(service.getLease('child-3')).toEqual(createLeaseRecord({ hostUnitId: 'host-2', embedId: 'embed-3', childUnitId: 'child-3' }));

        service.releaseUnit('child-3');
        expect(service.getLease('child-3')).toBeUndefined();
    });
});

function createLeaseRecord(overrides: Partial<IEmbedUnitLeaseRecord> = {}): IEmbedUnitLeaseRecord {
    return {
        hostUnitId: overrides.hostUnitId ?? 'host-1',
        embedId: overrides.embedId ?? 'embed-1',
        childUnitId: overrides.childUnitId ?? 'child-1',
        childType: overrides.childType ?? UniverInstanceType.UNIVER_SHEET,
    };
}
