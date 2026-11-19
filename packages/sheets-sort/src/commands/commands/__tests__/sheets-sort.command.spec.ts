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
import type { IOrderRule } from '../../../services/interface';
import type { ISortRangeCommandParams } from '../sheets-sort.command';
import { SortType } from '../../../services/interface';
import { SortRangeCommand } from '../sheets-sort.command';
import { createCommandTestBed } from './create-command-test-bed';

interface ISortFixture {
    cells: Array<ICellData | null>;
    secondary?: number[];
}

/**
 * Sort the fixture's rows by column B and return the original row index of every row in the
 * resulting order, which makes the row identity of the reorder visible.
 */
async function sortRows(fixture: ISortFixture, type: SortType, secondaryType?: SortType) {
    const { univer, get } = createCommandTestBed();
    try {
        const commands = get(ICommandService);
        commands.registerCommand(SetSelectionsOperation);
        commands.registerCommand(ReorderRangeMutation);
        commands.registerCommand(ReorderRangeCommand);

        const workbook = get(IUniverInstanceService).getUnit('test') as Workbook;
        const worksheet = workbook.getSheetBySheetId('sheet1')!;
        const matrix = worksheet.getCellMatrix();
        fixture.cells.forEach((value, row) => {
            matrix.setValue(row, 0, { v: row, t: CellValueType.NUMBER });
            matrix.setValue(row, 1, value ?? {});
            matrix.setValue(row, 2, { v: fixture.secondary?.[row] ?? 0, t: CellValueType.NUMBER });
        });

        const orderRules: IOrderRule[] = [{ colIndex: 1, type }];
        if (secondaryType) {
            orderRules.push({ colIndex: 2, type: secondaryType });
        }

        const params: ISortRangeCommandParams = {
            unitId: 'test',
            subUnitId: 'sheet1',
            hasTitle: false,
            range: { startRow: 0, endRow: fixture.cells.length - 1, startColumn: 0, endColumn: 2 },
            orderRules,
        };
        expect(await commands.executeCommand(SortRangeCommand.id, params)).toBeTruthy();

        return fixture.cells.map((_, row) => matrix.getValue(row, 0)?.v);
    } finally {
        univer.dispose();
    }
}

describe('SortRangeCommand with mixed cell types', () => {
    const mixed: Array<ICellData | null> = [
        { v: 'zoe', t: CellValueType.STRING },
        { v: 1, t: CellValueType.BOOLEAN },
        { v: 0, t: CellValueType.BOOLEAN },
        { v: '#N/A', t: CellValueType.STRING },
        { v: 10, t: CellValueType.NUMBER },
        { v: 'apple', t: CellValueType.STRING },
        null,
    ];

    it('orders numbers, text, logical values, errors, and blanks like Excel', async () => {
        expect(await sortRows({ cells: mixed }, SortType.ASC)).toEqual([4, 5, 0, 2, 1, 3, 6]);
        expect(await sortRows({ cells: mixed }, SortType.DESC)).toEqual([3, 1, 2, 0, 5, 4, 6]);
    });

    it('sorts every Boolean encoding in the logical group', async () => {
        const booleans: Array<ICellData | null> = [
            { v: 'TRUE', t: CellValueType.BOOLEAN },
            { v: 0, t: CellValueType.BOOLEAN },
            { v: true, t: CellValueType.BOOLEAN },
            { v: 'false', t: CellValueType.BOOLEAN },
            { v: '1', t: CellValueType.BOOLEAN },
        ];

        expect(await sortRows({ cells: booleans }, SortType.ASC)).toEqual([1, 3, 0, 2, 4]);
        expect(await sortRows({ cells: booleans }, SortType.DESC)).toEqual([0, 2, 4, 1, 3]);
    });

    it('uses the secondary key rather than the error token for distinct errors', async () => {
        const errors: Array<ICellData | null> = [
            { v: '#N/A', t: CellValueType.STRING },
            { v: '#DIV/0!', t: CellValueType.STRING },
            { v: 10, t: CellValueType.NUMBER },
            null,
        ];

        expect(await sortRows({ cells: errors, secondary: [2, 1, 0, 0] }, SortType.ASC, SortType.ASC))
            .toEqual([2, 1, 0, 3]);
    });

    it('keeps error-looking text and numbers stored as text in the text group', async () => {
        const cells: Array<ICellData | null> = [
            { v: '#N/A', t: CellValueType.STRING },
            { v: '#N/A', t: CellValueType.FORCE_STRING },
            { v: 'apple', t: CellValueType.STRING },
            { v: 10, t: CellValueType.NUMBER },
            { v: '9', t: CellValueType.FORCE_STRING },
            { v: '10', t: CellValueType.FORCE_STRING },
        ];

        // Numbers stored as text sort as text, not as numbers: '10' comes before '9'.
        expect(await sortRows({ cells }, SortType.ASC)).toEqual([3, 1, 5, 4, 2, 0]);
    });

    it('falls back to the value kind of cells without a type', async () => {
        const cells: Array<ICellData | null> = [
            { v: 10 },
            { v: 2 },
            { v: '002', t: CellValueType.FORCE_STRING },
            { v: 'apple', t: CellValueType.STRING },
            { v: true },
        ];

        expect(await sortRows({ cells }, SortType.ASC)).toEqual([1, 0, 2, 3, 4]);
    });
});
