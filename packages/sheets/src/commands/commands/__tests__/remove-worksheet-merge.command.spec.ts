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

import type { Injector, IWorkbookData, Univer, Workbook } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LocaleType, RedoCommand, UndoCommand, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AddWorksheetMergeMutation } from '../../mutations/add-worksheet-merge.mutation';
import { RemoveWorksheetMergeMutation } from '../../mutations/remove-worksheet-merge.mutation';
import { SetRangeValuesMutation } from '../../mutations/set-range-values.mutation';
import { SetSelectionsOperation } from '../../operations/selection.operation';
import { RemoveWorksheetMergeCommand } from '../remove-worksheet-merge.command';
import { createCommandTestBed } from './create-command-test-bed';

const TEST_WORKBOOK: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: ['sheet1'],
    styles: {
        s1: {
            ff: 'Arial',
        },
    },
    sheets: {
        sheet1: {
            id: 'sheet1',
            name: 'sheet1',
            rowCount: 20,
            columnCount: 20,
            mergeData: [
                {
                    startRow: 0,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 1,
                },
            ],
            cellData: {
                0: {
                    0: { v: 'A1', s: 's1' },
                    1: {},
                },
                1: {
                    0: {},
                    1: {},
                },
            },
            rowData: {},
            columnData: {},
        },
    },
};

describe('remove-worksheet-merge.command', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed(TEST_WORKBOOK);
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        [
            RemoveWorksheetMergeCommand,
            AddWorksheetMergeMutation,
            RemoveWorksheetMergeMutation,
            SetRangeValuesMutation,
            SetSelectionsOperation,
        ].forEach((command) => commandService.registerCommand(command));
    });

    afterEach(() => {
        univer.dispose();
    });

    function getActiveWorksheet() {
        return get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet();
    }

    it('returns false for empty ranges or no merge intersection', async () => {
        expect(
            await commandService.executeCommand(RemoveWorksheetMergeCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                ranges: [],
            })
        ).toBe(false);

        expect(
            await commandService.executeCommand(RemoveWorksheetMergeCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                ranges: [{ startRow: 10, endRow: 11, startColumn: 10, endColumn: 11 }],
            })
        ).toBe(false);
    });

    it('removes merge and keeps main-cell style after unmerge', async () => {
        const worksheet = getActiveWorksheet();
        expect(worksheet.getMergeData()).toHaveLength(1);

        expect(
            await commandService.executeCommand(RemoveWorksheetMergeCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                ranges: [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }],
            })
        ).toBe(true);

        expect(worksheet.getMergeData()).toHaveLength(0);
        expect(worksheet.getCell(0, 1)?.s).toBe('s1');
        expect(worksheet.getCell(1, 0)?.s).toBe('s1');
        expect(worksheet.getCell(1, 1)?.s).toBe('s1');

        expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        expect(worksheet.getMergeData()).toHaveLength(1);

        expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
        expect(worksheet.getMergeData()).toHaveLength(0);
    });
});
