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

import type { ICommandService, IRange, IUniverInstanceService, ObjectMatrix } from '@univerjs/core';
import type { DataValidationModel } from '@univerjs/data-validation';
import { RemoveSheetMutation, SetRangeValuesMutation } from '@univerjs/sheets';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DataValidationCacheService } from '../dv-cache.service';

function createRule(ranges: IRange[]) {
    return { uid: 'rule-1', ranges } as any;
}

function createService(ruleRanges: IRange[] = [{ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 }]) {
    const commandCallbacks: Array<(info: { id: string; params: unknown }, options?: { onlyLocal?: boolean }) => void> = [];
    const unitDisposed$ = new Subject<any>();
    const commandService = {
        onCommandExecuted: vi.fn((callback) => {
            commandCallbacks.push(callback);
            return { dispose: vi.fn() };
        }),
    } as unknown as ICommandService;
    const univerInstanceService = {
        unitDisposed$,
    } as unknown as IUniverInstanceService;
    const dataValidationModel = {
        getRules: vi.fn(() => [createRule(ruleRanges)]),
    } as unknown as DataValidationModel;

    return {
        commandCallbacks,
        unitDisposed$,
        service: new DataValidationCacheService(commandService, univerInstanceService, dataValidationModel),
    };
}

describe('DataValidationCacheService', () => {
    it('creates caches, marks dirty ranges, and removes cached values by rule ranges', () => {
        const { service } = createService();
        const dirty: Array<{ unitId: string; subUnitId: string; ranges: IRange[]; isSetRange?: boolean }> = [];
        const sub = service.dirtyRanges$.subscribe((value) => dirty.push(value));
        const cache = service.ensureCache('unit-1', 'sheet-1');

        cache.setValue(1, 1, 2 as never);
        cache.setValue(2, 2, 3 as never);

        service.markRangeDirty('unit-1', 'sheet-1', [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }], true);
        expect(service.getValue('unit-1', 'sheet-1', 1, 1)).toBeUndefined();

        service.addRule('unit-1', 'sheet-1', createRule([{ startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 }]));
        service.removeRule('unit-1', 'sheet-1', createRule([{ startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 }]));

        expect(service.getValue('unit-1', 'sheet-1', 2, 2)).toBeUndefined();
        expect(dirty).toEqual([
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                ranges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }],
                isSetRange: true,
            },
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                ranges: [{ startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 }],
            },
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                ranges: [{ startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 }],
            },
        ]);

        sub.unsubscribe();
        service.dispose();
    });

    it('reacts to set-range, remove-sheet, and unit-dispose events', () => {
        const { service, commandCallbacks, unitDisposed$ } = createService();
        const cache = service.ensureCache('unit-1', 'sheet-1');
        cache.setValue(1, 1, 1 as never);
        cache.setValue(5, 5, 1 as never);

        commandCallbacks[0](
            {
                id: SetRangeValuesMutation.id,
                params: {
                    unitId: 'unit-1',
                    subUnitId: 'sheet-1',
                    cellValue: {
                        0: { 0: { v: 'x' } },
                        1: { 1: { v: 'y' } },
                    },
                },
            },
            undefined
        );

        expect(service.getValue('unit-1', 'sheet-1', 1, 1)).toBeUndefined();
        expect(service.getValue('unit-1', 'sheet-1', 5, 5)).toBe(1);

        commandCallbacks[1]({
            id: RemoveSheetMutation.id,
            params: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
            },
        });

        const recreated = service.ensureCache('unit-1', 'sheet-1');
        expect(recreated).not.toBe(cache);

        const unitCache = service.ensureCache('unit-1', 'sheet-2');
        unitCache.setValue(0, 0, 9 as never);
        unitDisposed$.next({ type: 2, getUnitId: () => 'unit-1' });

        expect(service.ensureCache('unit-1', 'sheet-2')).not.toBe(unitCache as ObjectMatrix<any>);

        service.dispose();
    });
});
