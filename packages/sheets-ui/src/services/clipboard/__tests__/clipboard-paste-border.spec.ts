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

import type { IBorderData, ICellData, Injector, IStyleData, Nullable, Univer } from '@univerjs/core';
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
import { borderSampleByExcel, borderSampleByGoogle, borderSampleByUniver } from './constant';

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
            if (color === 'black' || color === '#000000') {
                return 'rgb(0,0,0)';
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
            const res = await sheetClipboardService.legacyPaste(borderSampleByExcel);
            expect(res).toBeTruthy();
            const cellData = worksheet.getCellMatrix();

            const convertBorderColor = (border: Nullable<IBorderData>) => {
                if (!border) return '';
                if (border.b) {
                    border.b.cl.rgb = convertColor(border.b.cl.rgb);
                }
                if (border.l) {
                    border.l.cl.rgb = convertColor(border.l.cl.rgb);
                }
                if (border.r) {
                    border.r.cl.rgb = convertColor(border.r.cl.rgb);
                }
                if (border.t) {
                    border.t.cl.rgb = convertColor(border.t.cl.rgb);
                }
                return border;
            };

            expect(convertBorderColor(getStyles(cellData.getValue(2, 2)?.s)?.bd)).toStrictEqual({
                b: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
                r: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
            });

            expect(worksheet.getMergeData().length).toBe(1);
            // Cells within merged cells inherit the style of the main cell by default.
            expect(convertBorderColor(getStyles(cellData.getValue(9, 2)?.s)?.bd)).toStrictEqual({
                b: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
                r: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
            });
            expect(convertBorderColor(getStyles(cellData.getValue(13, 2)?.s)?.bd)).toStrictEqual({
                b: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
                r: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
            });
            expect(convertBorderColor(getStyles(cellData.getValue(9, 3)?.s)?.bd)).toStrictEqual({
                b: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
                r: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
            });
            expect(convertBorderColor(getStyles(cellData.getValue(13, 3)?.s)?.bd)).toStrictEqual({
                b: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
                r: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
            });
        });

        it('test font style paste from google', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const res = await sheetClipboardService.legacyPaste(borderSampleByGoogle);
            expect(res).toBeTruthy();
            const cellData = worksheet.getCellMatrix();

            const convertBorderColor = (border: Nullable<IBorderData>) => {
                if (!border) return '';
                if (border.b) {
                    border.b.cl.rgb = convertColor(border.b.cl.rgb);
                }
                if (border.l) {
                    border.l.cl.rgb = convertColor(border.l.cl.rgb);
                }
                if (border.r) {
                    border.r.cl.rgb = convertColor(border.r.cl.rgb);
                }
                if (border.t) {
                    border.t.cl.rgb = convertColor(border.t.cl.rgb);
                }
                return border;
            };

            expect(worksheet.getMergeData().length).toBe(1);
            expect(convertBorderColor(getStyles(cellData.getValue(9, 2)?.s)?.bd)).toStrictEqual({
                r: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
                b: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
            });
            expect(convertBorderColor(getStyles(cellData.getValue(13, 2)?.s)?.bd)).toStrictEqual({
                r: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
                b: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
            });
            expect(convertBorderColor(getStyles(cellData.getValue(9, 3)?.s)?.bd)).toStrictEqual({
                r: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
                b: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
            });
            expect(convertBorderColor(getStyles(cellData.getValue(13, 3)?.s)?.bd)).toStrictEqual({
                r: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
                b: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
            });
        });

        it('test font style paste from univer', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const res = await sheetClipboardService.legacyPaste(borderSampleByUniver);
            expect(res).toBeTruthy();
            const cellData = worksheet.getCellMatrix();

            const convertBorderColor = (border: Nullable<IBorderData>) => {
                if (!border) return '';
                if (border.b) {
                    border.b.cl.rgb = convertColor(border.b.cl.rgb);
                }
                if (border.l) {
                    border.l.cl.rgb = convertColor(border.l.cl.rgb);
                }
                if (border.r) {
                    border.r.cl.rgb = convertColor(border.r.cl.rgb);
                }
                if (border.t) {
                    border.t.cl.rgb = convertColor(border.t.cl.rgb);
                }
                return border;
            };

            expect(convertBorderColor(getStyles(cellData.getValue(2, 2)?.s)?.bd)).toStrictEqual({
                b: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
                r: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
            });

            expect(worksheet.getMergeData().length).toBe(1);
            expect(convertBorderColor(getStyles(cellData.getValue(9, 2)?.s)?.bd)).toStrictEqual({
                b: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
                r: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
            });
            expect(convertBorderColor(getStyles(cellData.getValue(13, 2)?.s)?.bd)).toStrictEqual({
                b: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
                r: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
            });
            expect(convertBorderColor(getStyles(cellData.getValue(9, 3)?.s)?.bd)).toStrictEqual({
                b: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
                r: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
            });
            expect(convertBorderColor(getStyles(cellData.getValue(13, 3)?.s)?.bd)).toStrictEqual({
                b: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
                r: { cl: { rgb: 'rgb(0,0,0)' }, s: 1 },
            });
        });
    });
});
