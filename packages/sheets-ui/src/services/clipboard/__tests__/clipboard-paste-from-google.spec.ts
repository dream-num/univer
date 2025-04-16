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

import { googleSample } from './constant';

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
                            0: { v: 1 },
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

    describe('Test paste from Google Sheet ', () => {
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
            const res = await sheetClipboardService.legacyPaste(googleSample);
            expect(res).toBeTruthy();
            expect(worksheet.getMergeData().length).toBe(3);
            expect(getValues(2, 2, 2, 2)?.[0]?.[0]?.v).toEqual('Univer');
            expect(getStyles(2, 2, 2, 2)?.[0]?.[0]).toStrictEqual({
                bl: 1,
                // cl: {
                //     rgb: '#000',
                // },
                ff: 'Arial',
                fs: 10,
                ht: 0,
                it: 1,
                ol: {
                    // cl: {
                    //     rgb: '#000',
                    // },
                    s: 0,
                },
                pd: {
                    b: 2,
                    l: 2,
                    r: 2,
                    t: 0,
                },
                st: {
                    // cl: {
                    //     rgb: '#000',
                    // },
                    s: 0,
                },
                tb: 0,
                td: 0,
                tr: {
                    a: 0,
                    v: 0,
                },
                ul: {
                    // cl: {
                    //     rgb: '#000',
                    // },
                    s: 0,
                },
                vt: 3,
            });
        });

        it('test style with paste rich text style', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const res = await sheetClipboardService.legacyPaste(googleSample);
            expect(res).toBeTruthy();
            expect(getValues(2, 3, 2, 3)?.[0]?.[0]?.v).toEqual('univer');
            const cellStyle = getStyles(2, 3, 2, 3)?.[0]?.[0];
            expect(cellStyle?.vt).toBe(3);
            expect(cellStyle?.bg).toStrictEqual({ rgb: 'rgb(255,0,0)' });
            const richTextStyle = getValues(2, 3, 2, 3)?.[0]?.[0]?.p;
            expect(richTextStyle?.body?.dataStream).toBe('univer\r\n');
            expect(richTextStyle?.body?.paragraphs).toStrictEqual([{ startIndex: 6 }]);
            expect(richTextStyle?.body?.textRuns).toStrictEqual([
                { ed: 1, st: 0, ts: { fs: 10, ff: 'Arial' } },
                {
                    st: 1,
                    ed: 4,
                    ts: {
                        bl: 1,
                        cl:
                            { rgb: 'rgb(217,210,233)' },
                        ff: 'Arial',
                        fs: 18,
                        it: 1,
                    },
                },
                {
                    ed: 6,
                    st: 4,
                    ts: { fs: 10, ff: 'Arial' },
                },
            ]);
        });

        it('test numfmt with paste', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const res = await sheetClipboardService.legacyPaste(googleSample);
            expect(res).toBeTruthy();
            const cellValue = getValues(14, 2, 14, 2)?.[0]?.[0];
            expect(cellValue?.v).toEqual(45607);
        });

        it('test merge style with paste', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const res = await sheetClipboardService.legacyPaste(googleSample);
            expect(res).toBeTruthy();
            expect(worksheet.getMergeData().length).toBe(3);
            expect(worksheet.getMergedCell(9, 2)).toStrictEqual({ startRow: 9, endRow: 12, startColumn: 2, endColumn: 2 });
            expect(getStyles(8, 2, 8, 2)?.[0]?.[0]?.bd?.b).toStrictEqual({ cl: { rgb: '#000000' }, s: 1 });
            expect(getStyles(9, 2, 9, 2)?.[0]?.[0]?.bd?.r).toStrictEqual({ cl: { rgb: '#000000' }, s: 1 });
            expect(getStyles(9, 1, 9, 1)?.[0]?.[0]?.bd?.r).toStrictEqual({ cl: { rgb: '#000000' }, s: 1 });
            expect(getStyles(12, 2, 12, 2)?.[0]?.[0]?.bd?.r).toStrictEqual({ cl: { rgb: '#000000' }, s: 1 });
            expect(getStyles(12, 2, 12, 2)?.[0]?.[0]?.bd?.b).toStrictEqual({ cl: { rgb: '#000000' }, s: 1 });
        });
    });
});
