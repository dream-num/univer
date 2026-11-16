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

import type { ICellData, Injector, IWorkbookData, Univer, Workbook } from '@univerjs/core';
import { CellValueType, ICommandService, IUniverInstanceService, LocaleType } from '@univerjs/core';
import { ReorderRangeCommand, ReorderRangeMutation, SetSelectionsOperation } from '@univerjs/sheets';
import { afterEach, describe, expect, it } from 'vitest';
import type { ISortRangeCommandParams } from '../../commands/commands/sheets-sort.command';
import { createCommandTestBed } from '../../commands/commands/__tests__/create-command-test-bed';
import { SortRangeCommand } from '../../commands/commands/sheets-sort.command';
import { SortType } from '../../services/interface';

function workbookWithColumn(cells: ICellData[]): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'sheet1',
                cellData: Object.fromEntries(cells.map((cell, row) => [row, { 0: cell }])),
            },
        },
        locale: LocaleType.EN_US,
        name: '',
        sheetOrder: ['sheet1'],
        styles: {},
    };
}

// The controller's compare function is exercised through SortRangeCommand, with the controller
// resolved by dependency injection, so these cases do not depend on its constructor.
describe('SheetsSortController compare function', () => {
    let univer: Univer | undefined;
    let get: Injector['get'];

    afterEach(() => {
        univer?.dispose();
        univer = undefined;
    });

    async function sortColumn(cells: ICellData[], type = SortType.ASC) {
        univer?.dispose();
        const testBed = createCommandTestBed(workbookWithColumn(cells));
        univer = testBed.univer;
        get = testBed.get;

        const commandService = get(ICommandService);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(ReorderRangeMutation);
        commandService.registerCommand(ReorderRangeCommand);

        const params: ISortRangeCommandParams = {
            unitId: 'test',
            subUnitId: 'sheet1',
            hasTitle: false,
            orderRules: [{ colIndex: 0, type }],
            range: { startRow: 0, endRow: cells.length - 1, startColumn: 0, endColumn: 0 },
        };
        expect(await commandService.executeCommand(SortRangeCommand.id, params)).toBeTruthy();

        const worksheet = (get(IUniverInstanceService).getUnit('test') as Workbook).getSheetBySheetId('sheet1')!;
        return cells.map((_, row) => worksheet.getCellMatrix().getValue(row, 0)?.v);
    }

    const numbers: ICellData[] = [5, 1, 3].map((v) => ({ v, t: CellValueType.NUMBER }));

    it('sorts numbers around forced text that is not a number', async () => {
        const forced: ICellData = { v: 'n/a', t: CellValueType.FORCE_STRING };
        expect(await sortColumn([...numbers, forced])).toEqual([1, 3, 5, 'n/a']);
        expect(await sortColumn([forced, ...numbers].reverse())).toEqual([1, 3, 5, 'n/a']);
        expect(await sortColumn([numbers[0], forced, numbers[1], numbers[2]])).toEqual([1, 3, 5, 'n/a']);
    });

    it('still sorts forced numeric text as a number', async () => {
        expect(await sortColumn([...numbers, { v: '002', t: CellValueType.FORCE_STRING }])).toEqual([1, '002', 3, 5]);
    });
});
