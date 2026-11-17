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

import type { ICellData, Workbook } from '@univerjs/core';
import { CellValueType, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { ReorderRangeCommand, ReorderRangeMutation, SetSelectionsOperation } from '@univerjs/sheets';
import { describe, expect, it } from 'vitest';
import type { ISortRangeCommandParams } from '../sheets-sort.command';
import { SortType } from '../../../services/interface';
import { SortRangeCommand } from '../sheets-sort.command';
import { createCommandTestBed } from './create-command-test-bed';

const values: Array<ICellData | null> = [
    { v: 'zoe', t: CellValueType.STRING },
    { v: 1, t: CellValueType.BOOLEAN },
    { v: 0, t: CellValueType.BOOLEAN },
    { v: '#N/A', t: CellValueType.STRING },
    { v: 10, t: CellValueType.NUMBER },
    { v: 'apple', t: CellValueType.STRING },
    null,
    { v: '#N/A', t: CellValueType.FORCE_STRING },
];

async function sortRows(type: SortType, secondary = false, sortValues = values) {
    const { univer, get } = createCommandTestBed();
    try {
        const commands = get(ICommandService);
        commands.registerCommand(SetSelectionsOperation);
        commands.registerCommand(ReorderRangeMutation);
        commands.registerCommand(ReorderRangeCommand);
        const workbook = get(IUniverInstanceService).getUnit('test') as Workbook;
        const sheet = workbook.getSheetBySheetId('sheet1')!;
        const matrix = sheet.getCellMatrix();
        sortValues.forEach((value, row) => {
            matrix.setValue(row, 0, { v: row, t: CellValueType.NUMBER });
            matrix.setValue(row, 1, value || {});
            matrix.setValue(row, 2, { v: row === 1 ? 2 : row === 2 ? 1 : 0, t: CellValueType.NUMBER });
        });
        const params: ISortRangeCommandParams = {
            unitId: 'test',
            subUnitId: 'sheet1',
            hasTitle: false,
            range: { startRow: 0, endRow: sortValues.length - 1, startColumn: 0, endColumn: 2 },
            orderRules: [{ colIndex: 1, type }, ...(secondary ? [{ colIndex: 2, type: SortType.ASC }] : [])],
        };
        expect(await commands.executeCommand(SortRangeCommand.id, params)).toBeTruthy();
        return sortValues.map((_, row) => matrix.getValue(row, 0)?.v);
    } finally {
        univer.dispose();
    }
}

describe('SortRangeCommand mixed cell types', () => {
    it('sorts uppercase logical values in both directions', async () => {
        const logicalValues = [
            { v: 'TRUE', t: CellValueType.BOOLEAN },
            { v: 'FALSE', t: CellValueType.BOOLEAN },
            { v: 'TRUE', t: CellValueType.BOOLEAN },
            { v: 'FALSE', t: CellValueType.BOOLEAN },
        ];
        expect(await sortRows(SortType.ASC, false, logicalValues)).toEqual([1, 3, 0, 2]);
        expect(await sortRows(SortType.DESC, false, logicalValues)).toEqual([0, 2, 1, 3]);
    });

    it('keeps row identity while sorting type groups and blanks last', async () => {
        expect(await sortRows(SortType.ASC)).toEqual([4, 7, 5, 0, 2, 1, 3, 6]);
        expect(await sortRows(SortType.DESC)).toEqual([3, 1, 2, 0, 5, 7, 4, 6]);
    });

    it('uses the secondary key rather than error-token spelling for distinct errors', async () => {
        const errorValues = [
            { v: 10, t: CellValueType.NUMBER },
            { v: '#DIV/0!', t: CellValueType.STRING },
            { v: '#N/A', t: CellValueType.STRING },
            null,
        ];
        expect(await sortRows(SortType.ASC, true, errorValues)).toEqual([0, 2, 1, 3]);
    });

    it('uses a secondary key and preserves row order on equal ties', async () => {
        const tiedValues = [...values, { v: 0, t: CellValueType.BOOLEAN }, { v: 0, t: CellValueType.BOOLEAN }];
        expect(await sortRows(SortType.ASC, true, tiedValues)).toEqual([4, 7, 5, 0, 8, 9, 2, 1, 3, 6]);
    });
});
