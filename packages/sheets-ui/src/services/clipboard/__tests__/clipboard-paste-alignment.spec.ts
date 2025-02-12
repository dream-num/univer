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

import type { ICellData, Injector, IStyleData, Nullable, Univer } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LocaleType, RANGE_TYPE } from '@univerjs/core';
import {
    AddWorksheetMergeMutation,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetColWidthMutation,
    SetWorksheetRowHeightMutation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ISheetClipboardService } from '../clipboard.service';
import { SheetSkeletonManagerService } from '../../sheet-skeleton-manager.service';
import { clipboardTestBed } from './clipboard-test-bed';
import { alignmentSampleByExcel, alignmentSampleByGoogle, alignmentSampleByUniver } from './constant';

describe('Test clipboard', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let sheetClipboardService: ISheetClipboardService;
    let sheetSkeletonManagerService: SheetSkeletonManagerService;

    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<ICellData>>> | undefined;

    let getStyles: (key: Nullable<string | IStyleData>) => Nullable<IStyleData>;

    beforeEach(async () => {
        const testBed = clipboardTestBed({
            id: 'test',
            appVersion: '3.0.0-alpha',
            sheets: {
                sheet1: {
                    id: 'sheet1',
                    cellData: {
                        0: {
                            0: {
                                v: 1,
                            },
                        },
                    },
                },
            },
            locale: LocaleType.ZH_CN,
            name: '',
            sheetOrder: [],
            styles: {},
        });
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetWorksheetRowHeightMutation);
        commandService.registerCommand(SetWorksheetColWidthMutation);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
        commandService.registerCommand(SetSelectionsOperation);
        sheetSkeletonManagerService = get(SheetSkeletonManagerService);
        sheetClipboardService = get(ISheetClipboardService);

        getValues = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Array<Array<Nullable<ICellData>>> | undefined =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValues();

        getStyles = (key) => {
            if (!key) return;
            const styles = get(IUniverInstanceService).getUniverSheetInstance('test')?.getStyles();
            return styles?.get(key);
        };
    });

    afterEach(() => {
        univer?.dispose();
    });

    describe('Test paste from external ', () => {
        beforeEach(() => {
            const selectionManager = get(SheetsSelectionsService);

            const startRow = 1;
            const startColumn = 1;
            const endRow = 1;
            const endColumn = 1;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            sheetSkeletonManagerService.setCurrent({
                sheetId: 'sheet1',
            });
        });
        it('test font style paste from excel', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const res = await sheetClipboardService.legacyPaste(alignmentSampleByExcel);
            expect(res).toBeTruthy();
            const cellData = worksheet.getCellMatrix();
            expect(getStyles(cellData.getValue(1, 1)?.s)?.ht).toBe(1);
            expect(getStyles(cellData.getValue(1, 2)?.s)?.ht).toBe(3);
            expect(getStyles(cellData.getValue(1, 3)?.s)?.ht).toBe(2);
            expect(getStyles(cellData.getValue(1, 4)?.s)?.vt).toBe(1);
            expect(getStyles(cellData.getValue(1, 5)?.s)?.vt).toBe(3);
            expect(getStyles(cellData.getValue(1, 6)?.s)?.vt).toBe(2);
        });

        it('test font style paste from google', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const res = await sheetClipboardService.legacyPaste(alignmentSampleByGoogle);
            expect(res).toBeTruthy();
            const cellData = worksheet.getCellMatrix();
            expect(getStyles(cellData.getValue(1, 2)?.s)?.ht).toBe(3);
            expect(getStyles(cellData.getValue(1, 3)?.s)?.ht).toBe(2);
            expect(getStyles(cellData.getValue(1, 4)?.s)?.vt).toBe(1);
            expect(getStyles(cellData.getValue(1, 5)?.s)?.vt).toBe(3);
            expect(getStyles(cellData.getValue(1, 6)?.s)?.vt).toBe(2);
        });

        it('test font style paste from univer', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const res = await sheetClipboardService.legacyPaste(alignmentSampleByUniver);
            expect(res).toBeTruthy();
            const cellData = worksheet.getCellMatrix();
            expect(getStyles(cellData.getValue(1, 2)?.s)?.ht).toBe(3);
            expect(getStyles(cellData.getValue(1, 3)?.s)?.ht).toBe(2);
            expect(getStyles(cellData.getValue(1, 4)?.s)?.vt).toBe(1);
            expect(getStyles(cellData.getValue(1, 5)?.s)?.vt).toBe(3);
            expect(getStyles(cellData.getValue(1, 6)?.s)?.vt).toBe(2);
        });
    });
});
