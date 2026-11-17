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

import { IUniverInstanceService } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCommandTestBed } from '../../../commands/mutations/__tests__/create-command-test-bed';
import { getValueChangedEffectedRange, SheetValueChangeType } from '../command-listener-const';

describe('row and column data change ranges', () => {
    let testBed: ReturnType<typeof createCommandTestBed>;

    beforeEach(() => {
        testBed = createCommandTestBed();
    });

    afterEach(() => testBed.univer.dispose());

    it('handles a bulk row update beyond the function argument limit', () => {
        const worksheet = testBed.sheet.getActiveSheet()!;
        worksheet.setRowCount(200010);
        const rowData = Object.fromEntries(Array.from({ length: 200000 }, (_, index) => [index + 10, { h: 20 }]));
        expect(getValueChangedEffectedRange(testBed.get(IUniverInstanceService), {
            id: SheetValueChangeType.SET_ROW_DATA,
            params: { unitId: testBed.sheet.getUnitId(), subUnitId: worksheet.getSheetId(), rowData },
        })).toEqual([{
            unitId: testBed.sheet.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            range: { startRow: 10, endRow: 200009, startColumn: 0, endColumn: 19 },
        }]);
    });

    it.each([
        { id: SheetValueChangeType.SET_ROW_DATA, field: 'rowData', expected: { startRow: 3, endRow: 17, startColumn: 0, endColumn: 19 } },
        { id: SheetValueChangeType.SET_COL_DATA, field: 'columnData', expected: { startRow: 0, endRow: 999, startColumn: 3, endColumn: 17 } },
    ])('preserves sparse and empty ranges for $field', ({ id, field, expected }) => {
        const params = { unitId: testBed.sheet.getUnitId(), subUnitId: testBed.sheet.getActiveSheet()!.getSheetId() };
        const service = testBed.get(IUniverInstanceService);
        expect(getValueChangedEffectedRange(service, {
            id,
            params: { ...params, [field]: { 17: null, 3: null, 9: null } },
        })).toEqual([{ ...params, range: expected }]);
        expect(getValueChangedEffectedRange(service, { id, params: { ...params, [field]: {} } })).toEqual([]);
    });
});
