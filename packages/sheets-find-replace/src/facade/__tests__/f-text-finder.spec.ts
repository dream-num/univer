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

import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { FTextFinder } from '../f-text-finder';

describe('FTextFinder', () => {
    it('should return matches after ensureCompleteAsync and navigate next/previous', async () => {
        const matches = [
            { provider: 'p', unitId: 'u1', range: { subUnitId: 's1', range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 } }, replaceable: true },
            { provider: 'p', unitId: 'u1', range: { subUnitId: 's1', range: { startRow: 1, startColumn: 0, endRow: 1, endColumn: 0 } }, replaceable: true },
        ];

        const model = {
            currentMatch$: new BehaviorSubject<any>(matches[0]),
            start: vi.fn(async () => ({ results: matches })),
            moveToNextMatch: vi.fn(() => matches[1]),
            moveToPreviousMatch: vi.fn(() => matches[0]),
            replaceAll: vi.fn(async () => ({ success: 2, failure: 0 })),
            replace: vi.fn(async () => true),
        };

        const workbook = {
            getSheetBySheetId: vi.fn(() => ({})),
        };

        const injector = {
            createInstance: vi.fn((cls: any, ...args: any[]) => {
                if (cls.name === 'FindReplaceModel') return model;
                // FRange
                return { cls, args };
            }),
        };

        const univerInstanceService = {
            getUnit: vi.fn(() => workbook),
        };

        const findReplaceService = {
            getProviders: vi.fn(() => new Set()),
        };

        const finder = new FTextFinder({ findString: 'a' }, injector as any, univerInstanceService as any, findReplaceService as any);
        await finder.ensureCompleteAsync();

        // ensure internal state is marked completed
        (finder as any)._state.changeState({ findCompleted: true });

        expect(finder.findAll()).toHaveLength(2);
        expect(finder.findNext()).toBeTruthy();
        expect(finder.findPrevious()).toBeTruthy();
        expect(finder.getCurrentMatch()).toBeTruthy();

        const count = await finder.replaceAllWithAsync('b');
        expect(count).toBe(2);

        const ok = await finder.replaceWithAsync('c');
        expect(ok).toBe(true);

        const p1 = finder.matchCaseAsync(true);
        (finder as any)._state.changeState({ findCompleted: true });
        await p1;

        const p2 = finder.matchEntireCellAsync(true);
        (finder as any)._state.changeState({ findCompleted: true });
        await p2;

        const p3 = finder.matchFormulaTextAsync(true);
        (finder as any)._state.changeState({ findCompleted: true });
        await p3;
    });
});
