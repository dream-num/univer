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
import { DEFAULT_TEXT_FORMAT_EXCEL } from '@univerjs/engine-numfmt';
import {
    AddWorksheetMergeMutation,
    MoveRangeMutation,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetColWidthMutation,
    SetWorksheetRowHeightMutation,
    SheetsSelectionsService,
} from '@univerjs/sheets';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SheetSkeletonManagerService } from '../../sheet-skeleton-manager.service';
import { ISheetClipboardService } from '../clipboard.service';
import { clipboardTestBed } from './clipboard-test-bed';
import { excelSample, excelSample2 } from './constant';

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

    let getStyles: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<IStyleData>>> | undefined;

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
                            10: { // K1
                                s: {
                                    bg: {
                                        rgb: '#274fee',
                                    },
                                },
                            },
                            11: { // L1
                                s: {
                                    n: {
                                        pattern: DEFAULT_TEXT_FORMAT_EXCEL,
                                    },
                                },
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
        commandService.registerCommand(MoveRangeMutation);

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

        getStyles = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Array<Array<Nullable<IStyleData>>> | undefined => {
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = get(IUniverInstanceService).getUniverSheetInstance('test')?.getStyles();
            if (values && styles) {
                return values.map((row) => row.map((cell) => styles.getStyleByCell(cell)));
            }
        };
    });

    afterEach(() => {
        univer?.dispose();
    });

    describe('Test paste from excel ', () => {
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
        it('test style with paste cell style', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const res = await sheetClipboardService.legacyPaste(excelSample);
            expect(res).toBeTruthy();
            expect(worksheet.getMergeData().length).toBe(3);
            expect(getValues(2, 2, 2, 2)?.[0]?.[0]?.v).toEqual('Univer');
            expect(getStyles(2, 2, 2, 2)?.[0]?.[0]).toStrictEqual({
                bl: 1,
                cl: {
                    rgb: 'rgb(0,0,0)',
                },
                ff: '等线',
                fs: 12,
                ht: 0,
                it: 1,
                ol: {
                    cl: {
                        rgb: 'rgb(0,0,0)',
                    },
                    s: 0,
                },
                pd: {
                    b: 2,
                    l: 2,
                    r: 2,
                    t: 0,
                },
                st: {
                    cl: {
                        rgb: 'rgb(0,0,0)',
                    },
                    s: 0,
                },
                tb: 1,
                td: 0,
                tr: {
                    a: 0,
                    v: 0,
                },
                ul: {
                    cl: {
                        rgb: 'rgb(0,0,0)',
                    },
                    s: 0,
                },
                vt: 2,
            });
        });

        it('test style with paste rich text style', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const res = await sheetClipboardService.legacyPaste(excelSample);
            expect(res).toBeTruthy();
            expect(getValues(2, 3, 2, 3)?.[0]?.[0]?.v).toEqual('Univer');
            const cellStyle = getStyles(2, 3, 2, 3)?.[0]?.[0];
            expect(cellStyle?.vt).toBe(2);
            expect(cellStyle?.bg).toStrictEqual({ rgb: 'rgb(15,158,213)' });
            const richTextStyle = getValues(2, 3, 2, 3)?.[0]?.[0]?.p;
            expect(richTextStyle?.body?.dataStream).toBe('Univer\r\n');
            expect(richTextStyle?.body?.paragraphs).toStrictEqual([{ startIndex: 6 }]);
            expect(richTextStyle?.body?.textRuns).toStrictEqual([
                {
                    st: 1,
                    ed: 4,
                    ts: {
                        cl:
                            { rgb: 'rgb(218,233,248)' },
                        ff: '等线',
                        fs: 28,
                        it: 1,
                        bl: 1,
                    },
                },
                {
                    ed: 6,
                    st: 4,
                    ts: { fs: 12, ff: '等线', cl: { rgb: 'rgb(0,0,0)' } },
                },
            ]);
        });

        it('test numfmt with paste', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const res = await sheetClipboardService.legacyPaste(excelSample);
            expect(res).toBeTruthy();
            const cellValue = getValues(15, 2, 15, 2)?.[0]?.[0];
            expect(cellValue?.v).toEqual(45607);
        });

        it('test formula with paste', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const res = await sheetClipboardService.legacyPaste('', '=SUM(A1');
            expect(res).toBeTruthy();
            const cellValue = getValues(1, 1, 1, 1)?.[0]?.[0];
            expect(cellValue?.f).toEqual('=SUM(A1');
        });

        it('test paste to range K1:L1, K1 has style, L1 has text format', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;

            // set selection to K1:L1
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: {
                        startRow: 0,
                        startColumn: 10,
                        endRow: 0,
                        endColumn: 11,
                        rangeType: RANGE_TYPE.NORMAL,
                    },
                    primary: null,
                    style: null,
                },
            ]);

            // paste data, excelSample2 value is 000123456
            const res = await sheetClipboardService.legacyPaste(excelSample2);
            expect(res).toBeTruthy();

            // check the values
            const K1CellValue = getValues(0, 10, 0, 10)?.[0]?.[0];
            const L1CellValue = getValues(0, 11, 0, 11)?.[0]?.[0];
            expect(K1CellValue?.v).toStrictEqual(123456);
            expect(L1CellValue?.v).toStrictEqual('000123456');

            // check the styles
            const K1CellStyle = getStyles(0, 10, 0, 10)?.[0]?.[0];
            const L1CellStyle = getStyles(0, 11, 0, 11)?.[0]?.[0];
            expect(K1CellStyle).toStrictEqual({
                ff: '等线',
                fs: 11,
                it: 0,
                bl: 0,
                ul: { s: 0, cl: { rgb: 'rgb(0,0,0)' } },
                st: { s: 0, cl: { rgb: 'rgb(0,0,0)' } },
                ol: { s: 0, cl: { rgb: 'rgb(0,0,0)' } },
                tr: { a: 0, v: 0 },
                td: 0,
                cl: { rgb: 'rgb(0,0,0)' },
                ht: 0,
                vt: 2,
                tb: 1,
                pd: { t: 0, b: 2, l: 2, r: 2 },
            });
            expect(L1CellStyle).toStrictEqual({
                n: { pattern: DEFAULT_TEXT_FORMAT_EXCEL },
                ff: '等线',
                fs: 11,
                it: 0,
                bl: 0,
                ul: { s: 0, cl: { rgb: 'rgb(0,0,0)' } },
                st: { s: 0, cl: { rgb: 'rgb(0,0,0)' } },
                ol: { s: 0, cl: { rgb: 'rgb(0,0,0)' } },
                tr: { a: 0, v: 0 },
                td: 0,
                cl: { rgb: 'rgb(0,0,0)' },
                ht: 0,
                vt: 2,
                tb: 1,
                pd: { t: 0, b: 2, l: 2, r: 2 },
            });
        });
    });
});
