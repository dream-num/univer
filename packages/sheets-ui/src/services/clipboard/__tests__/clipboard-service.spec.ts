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

import { ICommandService, IUniverInstanceService, RANGE_TYPE, Rectangle, RedoCommand, UndoCommand } from '@univerjs/core';
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
import type { ICellData, Injector, IRange, IStyleData, Nullable, Univer } from '@univerjs/core';

import { discreteRangeToRange } from '../../../controllers/utils/range-tools';
import { ISheetClipboardService, PREDEFINED_HOOK_NAME } from '../clipboard.service';
import { COPY_TYPE } from '../type';
import { clipboardTestBed } from './clipboard-test-bed';
import { MockClipboard } from './mock-clipboard';
import type { IClipboardItem } from './mock-clipboard';

describe('Test clipboard', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let sheetClipboardService: ISheetClipboardService;
    let clipboardItem: IClipboardItem;
    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<ICellData>>> | undefined;
    let getMergedCells: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => IRange[] | undefined;

    let getStyles: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<IStyleData>>> | undefined;

    beforeEach(async () => {
        const testBed = clipboardTestBed();
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

        getMergedCells = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): IRange[] | undefined => {
            return get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getMergeData()
                .filter((rect) => Rectangle.intersects({ startRow, startColumn, endRow, endColumn }, rect));
        };

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
        // read use mock
        const clipboardData = {
            'text/html': '<google-sheets-html-origin><table xmlns="http://www.w3.org/1999/xhtml" cellspacing="0" cellpadding="0" dir="ltr" border="1" style="table-layout:fixed;font-size:10pt;font-family:Arial;width:0px;border-collapse:collapse;border:none"><colgroup><col width="73"><col width="73"></colgroup><tbody><tr style="height: 81px;"><td rowspan="1" colspan="2" style="background: rgb(255,0,0); text-align: center; vertical-align: middle; text-decoration:none;">row1col2</td></tr></tbody></table></google-sheets-html-origin>',
        };
        const mockClipboard = new MockClipboard(clipboardData);
        const clipboardItems = await mockClipboard.read();

        if (clipboardItems.length !== 0) {
            clipboardItem = clipboardItems[0];
        }
    });

    afterEach(() => {
        univer?.dispose();
    });

    describe('Test paste, the original data is a merged cell of 1 row and 2 columns, the current selection consists only of ordinary cells', () => {
        it('The current selection is a single cell in 1 row and 1 column', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to A1
            const startRow = 0;
            const startColumn = 0;
            const endRow = 0;
            const endColumn = 0;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);
            const rowManager = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1')?.getRowManager();
            const columnManager = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1')?.getColumnManager();
            const columnWidth = columnManager?.getColumnData()?.[0]?.w;
            expect(columnWidth).toBe(88);
            expect(values && values[0][0]?.v).toBe('row1col2');
            expect(styles && styles[0][0]).toStrictEqual({
                bg: {
                    rgb: 'rgb(255,0,0)',
                },
                bl: 0,
                // cl: {
                //     rgb: '#000',
                // },
                ff: 'Arial',
                fs: 10,
                ht: 2,
                it: 0,
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
                vt: 2,
            });
            expect(mergedCells && mergedCells[0]).toStrictEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 0,
                endColumn: 1,
            });
        });
        it('The current selection is a single cell in 1 row and 2 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to A2:B2
            const startRow = 1;
            const startColumn = 0;
            const endRow = 1;
            const endColumn = 1;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);
            expect(values && values[0][0]?.v).toBe('row1col2');
            expect(styles && styles[0][0]).toStrictEqual({
                bg: {
                    rgb: 'rgb(255,0,0)',
                },
                bl: 0,
                // cl: {
                //     rgb: '#000',
                // },
                ff: 'Arial',
                fs: 10,
                ht: 2,
                it: 0,
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
                vt: 2,
            });
            expect(mergedCells && mergedCells[0]).toStrictEqual({
                startRow,
                startColumn,
                endRow,
                endColumn,
            });
        });
        it('The current selection is a single cell in 1 row and 3 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to A3:C3
            const startRow = 2;
            const startColumn = 0;
            const endRow = 2;
            const endColumn = 2;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);
            expect(values && values[0][0]?.v).toBe('row1col2');
            expect(styles && styles[0][0]).toStrictEqual({
                bg: {
                    rgb: 'rgb(255,0,0)',
                },
                bl: 0,
                // cl: {
                //     rgb: '#000',
                // },
                ff: 'Arial',
                fs: 10,
                ht: 2,
                it: 0,
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
                vt: 2,
            });
            expect(values && values[0][2]?.v).toBe(undefined);
            expect(styles && styles[0][2]).toStrictEqual(undefined);
            expect(mergedCells && mergedCells[0]).toStrictEqual({
                startRow: 2,
                startColumn: 0,
                endRow: 2,
                endColumn: 1,
            });
        });
        it('The current selection is a single cell in 2 rows and 2 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to A4:B5
            const startRow = 3;
            const startColumn = 0;
            const endRow = 4;
            const endColumn = 1;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);
            expect(values && values[0][0]?.v).toBe('row1col2');
            expect(values && values[1][0]?.v).toBe('row1col2');

            expect(styles && styles[0][0]).toStrictEqual({
                bg: {
                    rgb: 'rgb(255,0,0)',
                },
                bl: 0,
                // cl: {
                //     rgb: '#000',
                // },
                ff: 'Arial',
                fs: 10,
                ht: 2,
                it: 0,
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
                vt: 2,
            });
            expect(styles && styles[1][0]).toStrictEqual({
                bg: {
                    rgb: 'rgb(255,0,0)',
                },
                bl: 0,
                // cl: {
                //     rgb: '#000',
                // },
                ff: 'Arial',
                fs: 10,
                ht: 2,
                it: 0,
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
                vt: 2,
            });
            expect(mergedCells).toStrictEqual([
                {
                    startRow: 3,
                    startColumn: 0,
                    endRow: 3,
                    endColumn: 1,
                },
                {
                    startRow: 4,
                    startColumn: 0,
                    endRow: 4,
                    endColumn: 1,
                },
            ]);
        });
        it('The current selection is a single cell in 4 rows and 4 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to A6:D9
            const startRow = 5;
            const startColumn = 0;
            const endRow = 8;
            const endColumn = 3;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            for (let i = 0; i < 4; i++) {
                expect(values && values[i][0]?.v).toBe('row1col2');
                expect(values && values[i][2]?.v).toBe('row1col2');
                expect(styles && styles[i][0]).toStrictEqual({
                    bg: {
                        rgb: 'rgb(255,0,0)',
                    },
                    bl: 0,
                    // cl: {
                    //     rgb: '#000',
                    // },
                    ff: 'Arial',
                    fs: 10,
                    ht: 2,
                    it: 0,
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
                    vt: 2,
                });
                expect(styles && styles[i][2]).toStrictEqual({
                    bg: {
                        rgb: 'rgb(255,0,0)',
                    },
                    bl: 0,
                    // cl: {
                    //     rgb: '#000',
                    // },
                    ff: 'Arial',
                    fs: 10,
                    ht: 2,
                    it: 0,
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
                    vt: 2,
                });
            }
            expect(mergedCells).toStrictEqual([
                {
                    startRow: 5,
                    startColumn: 0,
                    endRow: 5,
                    endColumn: 1,
                },
                {
                    startRow: 5,
                    startColumn: 2,
                    endRow: 5,
                    endColumn: 3,
                },
                {
                    startRow: 6,
                    startColumn: 0,
                    endRow: 6,
                    endColumn: 1,
                },
                {
                    startRow: 6,
                    startColumn: 2,
                    endRow: 6,
                    endColumn: 3,
                },
                {
                    startRow: 7,
                    startColumn: 0,
                    endRow: 7,
                    endColumn: 1,
                },
                {
                    startRow: 7,
                    startColumn: 2,
                    endRow: 7,
                    endColumn: 3,
                },
                {
                    startRow: 8,
                    startColumn: 0,
                    endRow: 8,
                    endColumn: 1,
                },
                {
                    startRow: 8,
                    startColumn: 2,
                    endRow: 8,
                    endColumn: 3,
                },
            ]);
        });
    });

    describe('Test paste, the original data is a merged cell of 1 row and 2 columns, the current selection contains merged cells and no content', () => {
        it('The current selection is a merged cell of 1 row and 2 columns.', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to F1:G2
            const startRow = 0;
            const startColumn = 5;
            const endRow = 0;
            const endColumn = 6;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            expect(values && values[0][0]?.v).toBe('row1col2');
            expect(styles && styles[0][0]).toStrictEqual({
                bg: {
                    rgb: 'rgb(255,0,0)',
                },
                bl: 0,
                // cl: {
                //     rgb: '#000',
                // },
                ff: 'Arial',
                fs: 10,
                ht: 2,
                it: 0,
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
                vt: 2,
            });
            expect(mergedCells && mergedCells[0]).toStrictEqual({
                startRow,
                startColumn,
                endRow,
                endColumn,
            });
        });

        it('The current selection is a merged cell of 1 row and 3 columns.', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to F3:H3
            const startRow = 2;
            const startColumn = 5;
            const endRow = 2;
            const endColumn = 7;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            const res = await sheetClipboardService.paste(clipboardItem);
            expect(res).toBeFalsy();
        });

        it('The current selection is a merged cell of 1 row and 4 columns.', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to F5:I5
            const startRow = 4;
            const startColumn = 5;
            const endRow = 4;
            const endColumn = 8;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            const res = await sheetClipboardService.paste(clipboardItem);
            expect(res).toBeFalsy();
        });

        it('The current selection is a merged cell of 2 rows and 2 columns.', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to F7:G8
            const startRow = 6;
            const startColumn = 5;
            const endRow = 7;
            const endColumn = 6;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            const res = await sheetClipboardService.paste(clipboardItem);
            expect(res).toBeFalsy();
        });

        it('The current selection is a merged cell of 1 row and 2 columns, with 1 ordinary cell', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to F10:H10
            const startRow = 9;
            const startColumn = 5;
            const endRow = 9;
            const endColumn = 7;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            expect(values && values[0][0]?.v).toBe('row1col2');
            expect(styles && styles[0][0]).toStrictEqual({
                bg: {
                    rgb: 'rgb(255,0,0)',
                },
                bl: 0,
                // cl: {
                //     rgb: '#000',
                // },
                ff: 'Arial',
                fs: 10,
                ht: 2,
                it: 0,
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
                vt: 2,
            });
            expect(mergedCells && mergedCells[0]).toStrictEqual({
                startRow: 9,
                startColumn: 5,
                endRow: 9,
                endColumn: 6,
            });
        });

        it('The current selection is a merged cell of 2 rows and 2 columns, with a merged cell of 2 rows and 1 column', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to F12:H13
            const startRow = 11;
            const startColumn = 5;
            const endRow = 12;
            const endColumn = 7;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            // TODO@Dushusir remove after Dialog replacement
            // let alert = false;
            // vi.spyOn(window, 'alert').mockImplementation(() => {
            //     alert = true;
            // });

            const res = await sheetClipboardService.paste(clipboardItem);
            expect(res).toBeFalsy();
            // expect(alert).toBe(true);
        });
    });

    describe('Test paste, the original data is a merged cell of 1 row and 2 columns, the current selection contains merged cells with content and style', () => {
        it('The current selection is a merged cell of 1 row and 3 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to K4:M4
            const startRow = 3;
            const startColumn = 10;
            const endRow = 3;
            const endColumn = 12;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            const res = await sheetClipboardService.paste(clipboardItem);
            expect(res).toBeFalsy();
        });
        it('The current selection is a merged cell of 1 row and 2 columns, with a merged cell of 2 rows and 2 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to K7:M10
            const startRow = 6;
            const startColumn = 10;
            const endRow = 9;
            const endColumn = 12;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);

            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            // first merged cells changed
            expect(values && values[0][0]?.v).toBe('row1col2');
            expect(styles && styles[0][0]).toStrictEqual({
                bg: {
                    rgb: 'rgb(255,0,0)',
                },
                bl: 0,
                // cl: {
                //     rgb: '#000',
                // },
                ff: 'Arial',
                fs: 10,
                ht: 2,
                it: 0,
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
                vt: 2,
            });

            // second merged cells not changed
            expect(values && values[2][1]?.v).toBe('456');
            expect(styles && styles[2][1]).toStrictEqual({ bg: { rgb: '#ccc' }, ht: 2, vt: 2 });

            expect(mergedCells).toStrictEqual([
                {
                    startRow: 8,
                    startColumn: 11,
                    endRow: 9,
                    endColumn: 12,
                },
                {
                    startRow: 6,
                    startColumn: 10,
                    endRow: 6,
                    endColumn: 11,
                },
            ]);
        });
        it('The current selection is a merged cell of 1 row and 3 columns, with a merged cell of 2 rows and 2 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to K12:M15
            const startRow = 11;
            const startColumn = 10;
            const endRow = 14;
            const endColumn = 12;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            // let alert = false;
            // vi.spyOn(window, 'alert').mockImplementation(() => {
            //     alert = true;
            // });

            await sheetClipboardService.paste(clipboardItem);
            // expect(alert).toBe(true);

            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            // first merged cells not changed
            expect(values && values[0][0]?.v).toBe('456');
            expect(styles && styles[0][0]).toStrictEqual({ bg: { rgb: '#ccc' }, ht: 3 });

            // second merged cells not changed
            expect(values && values[2][1]?.v).toBe('456');
            expect(styles && styles[2][1]).toStrictEqual({ bg: { rgb: '#ccc' } });

            expect(mergedCells).toStrictEqual([
                {
                    startRow: 11,
                    startColumn: 10,
                    endRow: 11,
                    endColumn: 12,
                },
                {
                    startRow: 13,
                    startColumn: 11,
                    endRow: 14,
                    endColumn: 12,
                },
            ]);
        });
        it('The current selection is a merged cell of 2 rows and 2 columns, with a merged cell of 1 row and 2 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to K22:M24
            const startRow = 21;
            const startColumn = 10;
            const endRow = 23;
            const endColumn = 12;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            // let alert = false;
            // vi.spyOn(window, 'alert').mockImplementation(() => {
            //     alert = true;
            // });

            await sheetClipboardService.paste(clipboardItem);
            // expect(alert).toBe(true);

            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            // first merged cells not changed
            expect(values && values[0][0]?.v).toBe('456');
            expect(styles && styles[0][0]).toStrictEqual({ bg: { rgb: '#ccc' } });

            // second merged cells not changed
            expect(values && values[2][1]?.v).toBe('456');
            expect(styles && styles[2][1]).toStrictEqual({ bg: { rgb: '#ccc' } });

            expect(mergedCells).toStrictEqual([
                {
                    startRow: 21,
                    startColumn: 10,
                    endRow: 22,
                    endColumn: 11,
                },
                {
                    startRow: 23,
                    startColumn: 11,
                    endRow: 23,
                    endColumn: 12,
                },
            ]);
        });
    });

    describe('Test cut command in single selection', () => {
        it('cut value from A25 to B25', async () => {
            const unitId = 'test';
            const subUnitId = 'sheet1';
            const fromRange = { rows: [24], cols: [0] };
            const toRange = { startRow: 24, startColumn: 1, endRow: 24, endColumn: 1 };
            const copyContentCache = sheetClipboardService.copyContentCache();
            const { matrixFragment, copyId } = (sheetClipboardService as any)._generateCopyContent(unitId, subUnitId, discreteRangeToRange(fromRange), []);

            // cache the copy content for internal paste
            copyContentCache.set(copyId, {
                unitId,
                subUnitId,
                range: fromRange,
                matrix: matrixFragment,
                copyType: COPY_TYPE.CUT,
            });

            const selectionManager = get(SheetsSelectionsService);

            selectionManager.addSelections([
                {
                    range: { ...toRange, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            (sheetClipboardService as any)._pasteInternal(copyId, PREDEFINED_HOOK_NAME.DEFAULT_PASTE);

            expect(getValues(24, 0, 24, 0)![0][0]).toBe(null);
            expect(getValues(24, 1, 24, 1)![0][0]!.v).toBe('A25');

            // undo
            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getValues(24, 0, 24, 0)![0][0]!.v).toStrictEqual('A25');
            expect(getValues(24, 1, 24, 1)![0][0]!.v).toStrictEqual('B25');

            // redo
            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getValues(24, 0, 24, 0)![0][0]).toBe(null);
            expect(getValues(24, 1, 24, 1)![0][0]!.v).toBe('A25');
        });
    });
});
