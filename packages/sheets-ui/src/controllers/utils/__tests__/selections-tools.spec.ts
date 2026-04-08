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

import { IUniverInstanceService, RANGE_TYPE } from '@univerjs/core';
import { MergeCellController, RangeProtectionRuleModel, SheetsSelectionsService } from '@univerjs/sheets';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { getSheetSelectionsDisabled$, isThisColSelected, isThisRowSelected, matchedSelectionByRowColIndex } from '../selections-tools';

function createAccessor(pairs: Array<[unknown, unknown]>) {
    const map = new Map<unknown, unknown>(pairs);
    return {
        get(token: unknown) {
            const result = map.get(token);
            if (result == null) {
                throw new Error(`Missing token: ${String(token)}`);
            }
            return result;
        },
    } as any;
}

describe('selections tools', () => {
    it('detects selected rows/columns by range type and index', () => {
        const selections = [
            {
                range: {
                    startRow: 1,
                    endRow: 3,
                    startColumn: 0,
                    endColumn: 999,
                    rangeType: RANGE_TYPE.ROW,
                },
            },
            {
                range: {
                    startRow: 0,
                    endRow: 999,
                    startColumn: 4,
                    endColumn: 6,
                    rangeType: RANGE_TYPE.COLUMN,
                },
            },
            {
                range: {
                    startRow: 0,
                    endRow: 2,
                    startColumn: 0,
                    endColumn: 2,
                    rangeType: RANGE_TYPE.NORMAL,
                },
            },
            {
                range: {
                    startRow: 0,
                    endRow: 999,
                    startColumn: 0,
                    endColumn: 999,
                    rangeType: RANGE_TYPE.ALL,
                },
            },
        ] as any;

        expect(isThisRowSelected(selections, 2)).toBe(true);
        expect(isThisRowSelected(selections, 6)).toBe(false);
        expect(isThisColSelected(selections, 5)).toBe(true);
        expect(isThisColSelected(selections, 8)).toBe(false);

        expect(matchedSelectionByRowColIndex(selections, 2, RANGE_TYPE.ROW)).toBe(selections[0]);
        expect(matchedSelectionByRowColIndex(selections, 5, RANGE_TYPE.COLUMN)).toBe(selections[1]);
        expect(matchedSelectionByRowColIndex(selections, 1, RANGE_TYPE.COLUMN)).toBeUndefined();
    });

    it('computes disabled state from sheet/range/interceptor situations', () => {
        const workbook$ = new BehaviorSubject<any>(null);
        const selectionMoveEnd$ = new BehaviorSubject<any>(null);
        const activeSheet$ = new BehaviorSubject<any>(null);

        const workbook = {
            getUnitId: () => 'unit-1',
            activeSheet$,
        };
        const sheet = {
            getSheetId: () => 'sheet-1',
        };

        let interceptorDisabled = false;
        let protectedRanges: any[] = [];

        const mergeCellController = {
            interceptor: {
                fetchThroughInterceptors: vi.fn(() => vi.fn(() => interceptorDisabled)),
            },
        };

        const accessor = createAccessor([
            [SheetsSelectionsService, { selectionMoveEnd$ }],
            [RangeProtectionRuleModel, { getSubunitRuleList: vi.fn(() => [{ ranges: protectedRanges }]) }],
            [IUniverInstanceService, { getCurrentTypeOfUnit$: vi.fn(() => workbook$) }],
            [MergeCellController, mergeCellController],
        ]);

        const values: boolean[] = [];
        const subscription = getSheetSelectionsDisabled$(accessor).subscribe((v) => values.push(v));

        expect(values.at(-1)).toBe(false);

        workbook$.next(workbook);
        expect(values.at(-1)).toBe(false);

        activeSheet$.next(sheet);
        expect(values.at(-1)).toBe(false);

        selectionMoveEnd$.next([]);
        expect(values.at(-1)).toBe(false);

        interceptorDisabled = true;
        selectionMoveEnd$.next([
            {
                range: { startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 },
            },
        ]);
        expect(values.at(-1)).toBe(true);

        interceptorDisabled = false;
        protectedRanges = [{ startRow: 2, endRow: 3, startColumn: 2, endColumn: 3 }];
        selectionMoveEnd$.next([
            {
                range: { startRow: 2, endRow: 4, startColumn: 2, endColumn: 4 },
            },
        ]);
        expect(values.at(-1)).toBe(true);

        protectedRanges = [{ startRow: 1, endRow: 9, startColumn: 1, endColumn: 9 }];
        selectionMoveEnd$.next([
            {
                range: { startRow: 2, endRow: 4, startColumn: 2, endColumn: 4 },
            },
        ]);
        expect(values.at(-1)).toBe(false);

        selectionMoveEnd$.next([
            {
                range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
            {
                range: { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 },
            },
        ]);
        expect(values.at(-1)).toBe(true);

        selectionMoveEnd$.next([
            {
                range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            },
            {
                range: { startRow: 3, endRow: 3, startColumn: 3, endColumn: 3 },
            },
        ]);
        expect(values.at(-1)).toBe(false);

        subscription.unsubscribe();
    });
});
