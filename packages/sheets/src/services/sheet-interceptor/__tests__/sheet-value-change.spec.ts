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

import type { ICellData, IObjectMatrixPrimitiveType, Nullable } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RemoveNumfmtMutation, SetNumfmtMutation } from '../../../commands/mutations/numfmt.mutation';
import { SetRangeValuesMutation } from '../../../commands/mutations/set-range-values.mutation';
import { SheetInterceptorService } from '../sheet-interceptor.service';
import { createSheetValueChangeContext } from '../sheet-value-change';
import { createSheetTestBed } from './create-core-test-bed';

describe('sheet value change context', () => {
    let bed: ReturnType<typeof createSheetTestBed>;
    beforeEach(() => {
        bed = createSheetTestBed(undefined, [[SheetInterceptorService]]);
    });
    afterEach(() => bed.univer.dispose());
    function prepare(cellValue: IObjectMatrixPrimitiveType<Nullable<ICellData>>, source: 'editor' | 'paste' | 'fill' = 'paste') {
        const sheet = bed.sheet.getActiveSheet()!;
        return createSheetValueChangeContext(bed.sheet.getUnitId(), sheet.getSheetId(), source, sheet, [{ id: SetRangeValuesMutation.id, params: { unitId: bed.sheet.getUnitId(), subUnitId: sheet.getSheetId(), cellValue } }], [{ startRow: 6, endRow: 8, startColumn: 2, endColumn: 4 }]);
    }
    it('keeps explicit blank rectangles including trailing rows', () => {
        const context = prepare({ 6: { 2: null, 3: null }, 7: { 2: null, 3: null }, 8: { 2: null, 3: null } });
        expect(context?.ranges).toMatchObject([{ startRow: 6, endRow: 8, startColumn: 2, endColumn: 3 }]);
        expect(Object.prototype.hasOwnProperty.call(context?.contentWrites[8], 3)).toBe(true);
    });

    it('initializes optional providers before preparing effects regardless of registration order', () => {
        const service = bed.get(SheetInterceptorService);
        const calls: number[] = [];
        service.interceptValueChange(() => {
            calls.push(0);
            return [];
        });
        service.interceptValueChange(() => {
            calls.push(1);
            return [];
        }, 1);
        service.onValueChange(prepare({ 6: { 2: { v: 'Input' } } })!);
        expect(calls).toEqual([1, 0]);
    });
    it('does not bridge skipped blanks or filtered physical gaps', () => {
        expect(prepare({ 6: { 2: { v: 'First' } }, 8: { 2: { v: 'Last' } } })?.ranges).toMatchObject([
            { startRow: 6, endRow: 6, startColumn: 2, endColumn: 2 },
            { startRow: 8, endRow: 8, startColumn: 2, endColumn: 2 },
        ]);
    });
    it('excludes pure formatting and editor clearing but keeps zero and false input', () => {
        expect(prepare({ 6: { 2: { s: { bl: 1 } } } })).toBeUndefined();
        expect(prepare({ 6: { 2: null } }, 'editor')).toBeUndefined();
        expect(prepare({ 6: { 2: { v: 0 } } }, 'editor')).toBeDefined();
        expect(prepare({ 6: { 2: { v: false } } }, 'editor')).toBeDefined();
    });

    it('tracks actual numeric format intent instead of font-only or inherited editor styles', () => {
        expect(prepare({ 6: { 2: { v: 1, s: { bl: 1 } } } })?.explicitStyleRanges).toEqual([]);
        expect(prepare({ 6: { 2: { v: 1, s: { n: { pattern: '0%' } } } } }, 'editor')?.explicitStyleRanges).toEqual([]);
        const sheet = bed.sheet.getActiveSheet()!;
        const location = { unitId: bed.sheet.getUnitId(), subUnitId: sheet.getSheetId() };
        const range = { startRow: 6, endRow: 6, startColumn: 2, endColumn: 2 };
        const base = { id: SetRangeValuesMutation.id, params: { ...location, cellValue: { 6: { 2: { v: 1 } } } } };
        for (const mutation of [
            { id: SetNumfmtMutation.id, params: { ...location, values: { 0: { ranges: [range] } }, refMap: { 0: { pattern: '0%' } } } },
            { id: RemoveNumfmtMutation.id, params: { ...location, ranges: [range] } },
        ]) {
            expect(createSheetValueChangeContext(location.unitId, location.subUnitId, 'editor', sheet, [base, mutation])?.explicitStyleRanges).toEqual([range]);
        }
    });
});
