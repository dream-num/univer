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

import type { Injector, IWorkbookData } from '@univerjs/core';
import {
    ICommandService,
    IConfirmService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RANGE_TYPE,
    TestConfirmService,
} from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import enUS from '../../../locale/en-US';
import zhCN from '../../../locale/zh-CN';
import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import { AddWorksheetMergeMutation } from '../../mutations/add-worksheet-merge.mutation';
import { RemoveWorksheetMergeMutation } from '../../mutations/remove-worksheet-merge.mutation';
import { SetRangeValuesMutation } from '../../mutations/set-range-values.mutation';
import { SetSelectionsOperation } from '../../operations/selection.operation';
import {
    addMergeCellsUtil,
    AddWorksheetMergeAllCommand,
    AddWorksheetMergeCommand,
    AddWorksheetMergeHorizontalCommand,
    AddWorksheetMergeVerticalCommand,
    getMergeableSelectionsByType,
    MergeType,
} from '../add-worksheet-merge.command';
import { RemoveWorksheetMergeCommand } from '../remove-worksheet-merge.command';
import { createCommandTestBed } from './create-command-test-bed';

class DeclineConfirmService extends TestConfirmService<unknown> {
    override confirm(): Promise<boolean> {
        return Promise.resolve(false);
    }
}

const WORKBOOK_DATA_DEMO: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheetOrder: [
        'sheet1',
    ],
    sheets: {
        sheet1: {
            name: '工作表1',
            id: 'sheet1',
            tabColor: '',
            hidden: 0,
            rowCount: 1000,
            columnCount: 20,
            zoomRatio: 1,
            freeze: {
                xSplit: 0,
                ySplit: 0,
                startRow: -1,
                startColumn: -1,
            },
            scrollTop: 0,
            scrollLeft: 0,
            defaultColumnWidth: 88,
            defaultRowHeight: 24,
            mergeData: [
                {
                    startRow: 0,
                    startColumn: 0,
                    endRow: 0,
                    endColumn: 8,
                    rangeType: 0,
                    unitId: 'test',
                    sheetId: 'sheet1',
                },
                {
                    startRow: 2,
                    startColumn: 5,
                    endRow: 3,
                    endColumn: 5,
                    rangeType: 0,
                    unitId: 'test',
                    sheetId: 'sheet1',
                },
            ],
            cellData: {
                1: {
                    5: {
                        v: 3,
                        t: 2,
                    },
                },
                2: {
                    5: {
                        v: 1,
                        t: 2,
                    },
                },
                3: {
                    5: {},
                },
            },
            rowData: {
                1: {
                    hd: 0,
                    h: 24,
                    ah: 24,
                },
                2: {
                    hd: 0,
                    h: 24,
                    ah: 24,
                },
                3: {
                    hd: 0,
                    h: 24,
                    ah: 24,
                },
            },
            columnData: {},
            showGridlines: 1,
            rowHeader: {
                width: 46,
                hidden: 0,
            },
            columnHeader: {
                height: 20,
                hidden: 0,
            },
            rightToLeft: 0,
        },
    },

    locale: LocaleType.ZH_CN,
    name: '',
    styles: {},
};

describe('add-merge-command', () => {
    let get: Injector['get'];
    let injector: Injector;
    let commandService: ICommandService;

    function getWorksheet(getter: Injector['get'] = get) {
        const workbook = getter(IUniverInstanceService).getUniverSheetInstance('test');
        if (!workbook) {
            throw new Error('Expected workbook test to exist.');
        }

        const worksheet = workbook.getSheetBySheetId('sheet1');
        if (!worksheet) {
            throw new Error('Expected worksheet sheet1 to exist.');
        }

        return worksheet;
    }

    beforeEach(() => {
        const testBed = createCommandTestBed(WORKBOOK_DATA_DEMO, [
            [IConfirmService, { useClass: TestConfirmService }],
        ]);
        get = testBed.get;
        injector = testBed.injector;

        commandService = get(ICommandService);
        commandService.registerCommand(AddWorksheetMergeCommand);
        commandService.registerCommand(AddWorksheetMergeAllCommand);
        commandService.registerCommand(AddWorksheetMergeVerticalCommand);
        commandService.registerCommand(AddWorksheetMergeHorizontalCommand);
        commandService.registerCommand(RemoveWorksheetMergeCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(SetSelectionsOperation);

        get(LocaleService).load({ zhCN, enUS });
    });
    it('test merge cell contain merge cell', async () => {
        await commandService.executeCommand(SetSelectionsOperation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            selections: [
                {
                    range: {
                        rangeType: RANGE_TYPE.NORMAL,
                        startRow: 1,
                        endRow: 3,
                        startColumn: 5,
                        endColumn: 5,
                    },
                },
            ],
        });
        expect(
            await commandService.executeCommand(AddWorksheetMergeCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                selections: [{ startRow: 1, startColumn: 5, endRow: 3, endColumn: 5 }],
            })
        ).toBeTruthy();

        const worksheet = getWorksheet();
        const mergeData = worksheet.getConfig().mergeData;
        const { startRow, startColumn, endColumn, endRow } = mergeData![0];
        expect({
            startRow,
            startColumn,
            endColumn,
            endRow,
        }).toEqual({
            startRow: 0,
            startColumn: 0,
            endRow: 0,
            endColumn: 8,
        });
        const { startRow: startRow2, startColumn: startColumn2, endColumn: endColumn2, endRow: endRow2 } = mergeData![1];
        expect({
            startRow: startRow2,
            startColumn: startColumn2,
            endColumn: endColumn2,
            endRow: endRow2,
        }).toEqual({
            startRow: 1,
            startColumn: 5,
            endRow: 3,
            endColumn: 5,
        });
        const keptCell = worksheet.getCell(1, 5);
        const clearedCell = worksheet.getCell(2, 5);
        expect(keptCell && keptCell.v).toBe(3);
        expect(clearedCell && clearedCell.v ? clearedCell.v : null).toBeNull();
    });

    it('keeps existing cells unchanged when the user cancels merging cells with content', async () => {
        const testBed = createCommandTestBed(WORKBOOK_DATA_DEMO, [
            [IConfirmService, { useClass: DeclineConfirmService }],
        ]);
        const localGet = testBed.get;
        const localCommandService = localGet(ICommandService);
        localCommandService.registerCommand(AddWorksheetMergeCommand);
        localCommandService.registerCommand(SetRangeValuesMutation);
        localCommandService.registerCommand(RemoveWorksheetMergeMutation);
        localCommandService.registerCommand(AddWorksheetMergeMutation);
        localCommandService.registerCommand(SetSelectionsOperation);
        localGet(LocaleService).load({ zhCN, enUS });

        await expect(localCommandService.executeCommand(AddWorksheetMergeCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            selections: [{ startRow: 1, startColumn: 5, endRow: 2, endColumn: 5 }],
            defaultMerge: false,
        })).resolves.toBe(false);

        const worksheet = getWorksheet(localGet);
        const firstCell = worksheet.getCell(1, 5);
        const secondCell = worksheet.getCell(2, 5);
        expect(firstCell && firstCell.v).toBe(3);
        expect(secondCell && secondCell.v).toBe(1);

        testBed.univer.dispose();
    });

    it('filters mergeable selections by requested merge type', () => {
        const singleCell = { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 };
        const oneRow = { startRow: 1, endRow: 1, startColumn: 1, endColumn: 3 };
        const oneColumn = { startRow: 2, endRow: 4, startColumn: 2, endColumn: 2 };
        const block = { startRow: 5, endRow: 6, startColumn: 5, endColumn: 6 };

        expect(getMergeableSelectionsByType(MergeType.MergeAll, null)).toBeNull();
        expect(getMergeableSelectionsByType(MergeType.MergeAll, [singleCell, oneRow, oneColumn, block])).toEqual([oneRow, oneColumn, block]);
        expect(getMergeableSelectionsByType(MergeType.MergeVertical, [singleCell, oneRow, oneColumn, block])).toEqual([oneColumn, block]);
        expect(getMergeableSelectionsByType(MergeType.MergeHorizontal, [singleCell, oneRow, oneColumn, block])).toEqual([oneRow, block]);
    });

    it('merges current selections through all, vertical, and horizontal commands', async () => {
        const selectionManagerService = get(SheetsSelectionsService);
        const worksheet = getWorksheet();

        selectionManagerService.setSelections([
            {
                range: { startRow: 5, endRow: 6, startColumn: 0, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ]);
        await expect(commandService.executeCommand(AddWorksheetMergeAllCommand.id)).resolves.toBe(true);
        expect(worksheet.getMergeData().some((range) => range.startRow === 5 && range.endRow === 6 && range.startColumn === 0 && range.endColumn === 1)).toBe(true);

        selectionManagerService.setSelections([
            {
                range: { startRow: 7, endRow: 8, startColumn: 2, endColumn: 3, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ]);
        await expect(commandService.executeCommand(AddWorksheetMergeVerticalCommand.id)).resolves.toBe(true);
        expect(worksheet.getMergeData().some((range) => range.startRow === 7 && range.endRow === 8 && range.startColumn === 2 && range.endColumn === 2)).toBe(true);
        expect(worksheet.getMergeData().some((range) => range.startRow === 7 && range.endRow === 8 && range.startColumn === 3 && range.endColumn === 3)).toBe(true);

        selectionManagerService.setSelections([
            {
                range: { startRow: 9, endRow: 10, startColumn: 4, endColumn: 5, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ]);
        await expect(commandService.executeCommand(AddWorksheetMergeHorizontalCommand.id)).resolves.toBe(true);
        expect(worksheet.getMergeData().some((range) => range.startRow === 9 && range.endRow === 9 && range.startColumn === 4 && range.endColumn === 5)).toBe(true);
        expect(worksheet.getMergeData().some((range) => range.startRow === 10 && range.endRow === 10 && range.startColumn === 4 && range.endColumn === 5)).toBe(true);
    });

    it('force merges through facade utility after removing overlapping merged cells', async () => {
        const worksheet = getWorksheet();
        const ranges = [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 8 }];

        expect(() => addMergeCellsUtil(injector, 'test', 'sheet1', ranges)).toThrow(/overlap/);

        addMergeCellsUtil(injector, 'test', 'sheet1', ranges, { isForceMerge: true });
        await Promise.resolve();

        expect(worksheet.getMergeData().some((range) => range.startRow === 0 && range.endRow === 1 && range.startColumn === 0 && range.endColumn === 8)).toBe(true);
    });
});
