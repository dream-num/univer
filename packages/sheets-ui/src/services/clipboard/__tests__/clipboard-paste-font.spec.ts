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
import { fontSampleByExcel, fontSampleByGoogle, fontSampleByUniver } from './constant';

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
    let convertColor: (color: Nullable<string>) => string;

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

        convertColor = (color) => {
            if (!color) return '';
            if (color === 'yellow' || color === '#ffff00') {
                return 'rgb(255,255,0)';
            }
            return color;
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
            const res = await sheetClipboardService.legacyPaste(fontSampleByExcel);
            expect(res).toBeTruthy();
            const cellData = worksheet.getCellMatrix();
            // font bold
            expect(cellData.getValue(1, 1)?.v).toBe('B');
            expect(getStyles(cellData.getValue(1, 1)?.s)?.bl).toBe(1);
            // font italic
            expect(cellData.getValue(2, 1)?.v).toBe('I');
            expect(getStyles(cellData.getValue(2, 1)?.s)?.it).toBe(1);
            // font underline
            expect(cellData.getValue(3, 1)?.v).toBe('U');
            expect(getStyles(cellData.getValue(3, 1)?.s)?.ul?.s).toBe(1);
            // font line-through
            expect(cellData.getValue(4, 1)?.v).toBe('S');
            expect(getStyles(cellData.getValue(4, 1)?.s)?.st?.s).toBe(1);

            // font-size
            expect(cellData.getValue(6, 1)?.v).toBe('font-size:12');
            expect(cellData.getValue(7, 1)?.v).toBe('font-size:18');
            expect(getStyles(cellData.getValue(7, 1)?.s)?.fs).toBe(18);
            // font-color
            expect(cellData.getValue(8, 1)?.v).toBe('color');
            expect(convertColor(getStyles(cellData.getValue(8, 1)?.s)?.cl?.rgb)).toBe('rgb(255,255,0)');
            // background
            expect(cellData.getValue(9, 1)?.v).toBe('background');
            // todo@yuanbin Why is the color format obtained in the test not rgb?
            // font-family
            expect(cellData.getValue(10, 1)?.v).toBe('font-family');
            expect(getStyles(cellData.getValue(10, 1)?.s)?.ff).toBe('仿宋');
        });

        it('test font style paste from google', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const res = await sheetClipboardService.legacyPaste(fontSampleByGoogle);
            expect(res).toBeTruthy();
            const cellData = worksheet.getCellMatrix();
            // font bold
            expect(cellData.getValue(1, 1)?.v).toBe('B');
            expect(getStyles(cellData.getValue(1, 1)?.s)?.bl).toBe(1);
            // font italic
            expect(cellData.getValue(2, 1)?.v).toBe('I');
            expect(getStyles(cellData.getValue(2, 1)?.s)?.it).toBe(1);
            // font underline
            expect(cellData.getValue(3, 1)?.v).toBe('U');
            expect(getStyles(cellData.getValue(3, 1)?.s)?.ul?.s).toBe(1);
            // font line-through
            expect(cellData.getValue(4, 1)?.v).toBe('S');
            expect(getStyles(cellData.getValue(4, 1)?.s)?.st?.s).toBe(1);

            // font-size
            expect(cellData.getValue(5, 1)?.v).toBe('font-size:12');
            expect(cellData.getValue(6, 1)?.v).toBe('font-size:18');
            expect(getStyles(cellData.getValue(6, 1)?.s)?.fs).toBe(18);
            // font-color
            expect(cellData.getValue(7, 1)?.v).toBe('color');
            expect(convertColor(getStyles(cellData.getValue(7, 1)?.s)?.cl?.rgb)).toBe('rgb(255,255,0)');
            // background
            expect(cellData.getValue(8, 1)?.v).toBe('background');
            expect(convertColor(getStyles(cellData.getValue(8, 1)?.s)?.bg?.rgb)).toBe('rgb(255,255,0)');
            // font-family
            expect(cellData.getValue(9, 1)?.v).toBe('font-family');
            expect(getStyles(cellData.getValue(9, 1)?.s)?.ff).toBe('Hei');
        });

        it('test font style paste from univer', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const res = await sheetClipboardService.legacyPaste(fontSampleByUniver);
            expect(res).toBeTruthy();
            const cellData = worksheet.getCellMatrix();
            // font bold
            expect(cellData.getValue(1, 1)?.v).toBe('B');
            expect(getStyles(cellData.getValue(1, 1)?.s)?.bl).toBe(1);
            // font italic
            expect(cellData.getValue(2, 1)?.v).toBe('I');
            expect(getStyles(cellData.getValue(2, 1)?.s)?.it).toBe(1);
            // font underline
            expect(cellData.getValue(3, 1)?.v).toBe('U');
            expect(getStyles(cellData.getValue(3, 1)?.s)?.ul?.s).toBe(1);
            // font line-through
            expect(cellData.getValue(4, 1)?.v).toBe('S');
            expect(getStyles(cellData.getValue(4, 1)?.s)?.st?.s).toBe(1);

            // font-size
            expect(cellData.getValue(5, 1)?.v).toBe('font-size:12');
            expect(cellData.getValue(6, 1)?.v).toBe('font-size:18');
            expect(getStyles(cellData.getValue(6, 1)?.s)?.fs).toBe(18);
            // font-color
            expect(cellData.getValue(7, 1)?.v).toBe('color');
            expect(convertColor(getStyles(cellData.getValue(7, 1)?.s)?.cl?.rgb)).toBe('rgb(255,255,0)');
            // background
            expect(cellData.getValue(8, 1)?.v).toBe('background');
            expect(convertColor(getStyles(cellData.getValue(8, 1)?.s)?.bg?.rgb)).toBe('rgb(255,255,0)');
            // font-family
            expect(cellData.getValue(9, 1)?.v).toBe('font-family');
            expect(getStyles(cellData.getValue(9, 1)?.s)?.ff).toBe('SimSun');
        });
    });
});
