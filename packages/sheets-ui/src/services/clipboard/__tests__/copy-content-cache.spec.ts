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

import { describe, expect, it } from 'vitest';
import { CopyContentCache, extractId, genId } from '../copy-content-cache';

describe('copy-content-cache', () => {
    it('should generate id with expected length and extract id from html', () => {
        const id = genId();
        expect(typeof id).toBe('string');
        expect(id.length).toBe(6);

        expect(extractId('<div data-copy-id="abc123"></div>')).toBe('abc123');
        expect(extractId('<div></div>')).toBeNull();
    });

    it('should support set/get/delete/clear and lastCopyId tracking', () => {
        const cache = new CopyContentCache();
        const events: Array<string | null> = [];
        const sub = cache.lastCopyId$.subscribe((value) => events.push(value));

        cache.set('id-1', { unitId: 'u1', subUnitId: 's1', range: { rows: [1], cols: [1] } as any, copyType: 'normal' as any, matrix: null });
        expect(cache.get('id-1')?.unitId).toBe('u1');
        expect(cache.getLastCopyId()).toBe('id-1');

        cache.del('id-1');
        expect(cache.get('id-1')).toBeUndefined();
        expect(cache.getLastCopyId()).toBeNull();

        cache.set('id-2', { unitId: 'u2', subUnitId: 's1', range: { rows: [2], cols: [2] } as any, copyType: 'normal' as any, matrix: null });
        cache.clear();
        expect(cache.get('id-2')).toBeUndefined();
        expect(cache.getLastCopyId()).toBeNull();

        expect(events[0]).toBeNull();
        expect(events).toContain('id-1');
        expect(events.at(-1)).toBeNull();

        sub.unsubscribe();
    });

    it('should clear cache entries by unit id', () => {
        const cache = new CopyContentCache();
        cache.set('id-u1', { unitId: 'u1', subUnitId: 's1', range: { rows: [1], cols: [1] } as any, copyType: 'normal' as any, matrix: null });
        cache.set('id-u2', { unitId: 'u2', subUnitId: 's1', range: { rows: [1], cols: [1] } as any, copyType: 'normal' as any, matrix: null });

        cache.clearWithUnitId('u1');

        expect(cache.get('id-u1')).toBeUndefined();
        expect(cache.get('id-u2')).toBeDefined();
    });
});
