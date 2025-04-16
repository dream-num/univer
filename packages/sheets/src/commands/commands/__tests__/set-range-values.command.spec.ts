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

import type { ICellData, IDocumentData, Injector, IStyleData, IWorkbookData, Nullable, Univer, Workbook } from '@univerjs/core';
import type { ISetRangeValuesCommandParams } from '../set-range-values.command';
import {
    BooleanNumber,
    CellValueType,
    ICommandService,
    IUniverInstanceService,
    LocaleType,
    RANGE_TYPE,
    RedoCommand,
    Tools,
    UndoCommand,
    UniverInstanceType,
} from '@univerjs/core';
import { DEFAULT_TEXT_FORMAT_EXCEL } from '@univerjs/engine-numfmt';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import { SetRangeValuesMutation } from '../../mutations/set-range-values.mutation';
import { SetRangeValuesCommand } from '../set-range-values.command';
import { createCommandTestBed } from './create-command-test-bed';

const getTestWorkbookDataDemo = (): IWorkbookData => ({
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            name: 'sheet1',
            cellData: {
                0: {
                    0: {
                        v: 'A1',
                    },
                    1: {
                        v: 'A2',
                    },
                    2: {
                        s: 's5',
                    },
                    3: {
                        s: 's5',
                    },
                    5: {
                        v: 1,
                        t: CellValueType.NUMBER,
                    },
                    6: {
                        v: '001',
                        t: CellValueType.STRING,
                        s: 's5',
                    },
                    7: {
                        v: 'text',
                        t: CellValueType.STRING,
                    },
                    8: {
                        v: '001',
                        t: CellValueType.FORCE_STRING,
                    },
                    9: {
                        v: '001',
                        t: CellValueType.FORCE_STRING,
                        s: 's5',
                    },
                },
                1: {},
                2: {
                    1: { v: 'B2', s: 's2' },
                    4: { v: 'E2', s: 's3' },
                },
                3: {
                    1: { v: 'B3', s: 's4' },
                },
            },
            columnData: {
                1: {
                    hd: BooleanNumber.FALSE,
                },
            },
            rowData: {
                1: {
                    hd: BooleanNumber.FALSE,
                },
            },
        },
        sheet2: {
            id: 'sheet2',
            name: 'sheet2',
            cellData: {
                0: {
                    0: {
                        v: 'A1',
                    },
                    1: {
                        v: 'A2',
                    },
                },
            },
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {
        s2: { bl: 0 },
        s3: { bl: 1 },
        s4: { fs: 12 },
        s5: {
            n: {
                pattern: DEFAULT_TEXT_FORMAT_EXCEL, // text
            },
        },
    },
});

describe('Test set range values commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let selectionManager: SheetsSelectionsService;
    let getValue: (sheetId?: string) => Nullable<ICellData>;
    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<Array<Array<Nullable<ICellData>>>>;
    let getStyle: () => any;
    let getStyles: (startRow: number, startColumn: number, endRow: number, endColumn: number) => Nullable<Nullable<IStyleData>[][]>;

    beforeEach(() => {
        const testBed = createCommandTestBed(getTestWorkbookDataDemo());
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);

        selectionManager = get(SheetsSelectionsService);
        selectionManager.addSelections([
            {
                range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ]);

        getValue = (sheetId?: string): Nullable<ICellData> =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId(sheetId || 'sheet1')
                ?.getRange(0, 0, 0, 0)
                .getValue();

        getValues = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<Array<Array<Nullable<ICellData>>>> =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValues();

        getStyle = (): Nullable<IStyleData> => {
            const value = getValue();
            const styles = get(IUniverInstanceService).getUniverSheetInstance('test')?.getStyles();
            if (value && styles) {
                return styles.getStyleByCell(value);
            }
        };

        getStyles = (startRow: number, startColumn: number, endRow: number, endColumn: number): Nullable<Nullable<IStyleData>[][]> => {
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = get(IUniverInstanceService).getUniverSheetInstance('test')?.getStyles();

            return values?.map((row, rowIndex) => {
                return row?.map((cell, columnIndex) => {
                    return cell && styles?.getStyleByCell(cell);
                });
            });
        };
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('set range values', () => {
        describe('correct situations', () => {
            it('will set range values when there is a selected range', async () => {
                function getParams() {
                    const richTextDemo: IDocumentData = {
                        id: 'd',
                        body: {
                            dataStream: 'Instructions: ①Project division - Fill in the specific division of labor after the project is disassembled: ②Responsible Person - Enter the responsible person\'s name here: ③Date-The specific execution time of the project (detailed to the date of a certain month), and the gray color block marks the planned real-time time of the division of labor of the project (for example, the specific execution time of [regional scene model arrangement and construction] is the 2 days marked in gray. \r\n',
                            textRuns: [
                                {
                                    st: 0,
                                    ed: 488,
                                    ts: {
                                        cl: {
                                            rgb: 'rgb(92,92,92)',
                                        },
                                    },
                                },
                            ],
                            paragraphs: [
                                {
                                    startIndex: 489,
                                    paragraphStyle: {
                                        spaceAbove: { v: 10 },
                                        lineSpacing: 1.2,
                                    },
                                },
                            ],
                        },
                        documentStyle: {
                            pageSize: {
                                width: Number.POSITIVE_INFINITY,
                                height: Number.POSITIVE_INFINITY,
                            },
                            marginTop: 0,
                            marginBottom: 0,
                            marginRight: 2,
                            marginLeft: 2,
                        },
                    };

                    const params: ISetRangeValuesCommandParams = {
                        value: {
                            p: richTextDemo,
                            v: 'a1',
                            t: CellValueType.STRING,
                        },
                    };

                    return params;
                }

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, getParams())).toBeTruthy();
                expect(getValue()).toStrictEqual(getParams().value);
                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({
                    v: 'A1',
                    t: CellValueType.STRING,
                });

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual(getParams().value);

                // reset
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            });

            it('will set range values when there is a selected range, includes custom property', async () => {
                function getParams() {
                    const params: ISetRangeValuesCommandParams = {
                        value: {
                            v: 'a1',
                            custom: {
                                id: 1,
                            },
                        },
                    };

                    return params;
                }

                function getParamsMore() {
                    const params: ISetRangeValuesCommandParams = {
                        value: {
                            v: 'a1',
                            custom: {
                                name: 'test',
                            },
                        },
                    };

                    return params;
                }

                function getResultParams() {
                    const params: ISetRangeValuesCommandParams = {
                        value: {
                            v: 'a1',
                            t: CellValueType.STRING,
                            custom: {
                                id: 1,
                            },
                        },
                    };

                    return params;
                }

                function getResultParamsMore() {
                    const params: ISetRangeValuesCommandParams = {
                        value: {
                            v: 'a1',
                            t: CellValueType.STRING,
                            custom: {
                                // id: 1,
                                name: 'test',
                            },
                        },
                    };

                    return params;
                }

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, getParams())).toBeTruthy();
                expect(getValue()).toStrictEqual(getResultParams().value);

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, getParamsMore())).toBeTruthy();
                expect(getValue()).toStrictEqual(getResultParamsMore().value);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual(getResultParams().value);

                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({
                    v: 'A1',
                    t: CellValueType.STRING,
                });

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual(getResultParams().value);

                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual(getResultParamsMore().value);
            });

            it('will set range values when there is a selected range, includes custom property blank object and undefined', async () => {
                function getParams() {
                    const params: ISetRangeValuesCommandParams = {
                        value: {
                            v: 'a1',
                            custom: { },
                        },
                    };

                    return params;
                }

                function getParamsMore() {
                    const params: ISetRangeValuesCommandParams = {
                        value: {
                            v: 'a1',
                            custom: undefined,
                        },
                    };

                    return params;
                }

                function getResultParams() {
                    const params: ISetRangeValuesCommandParams = {
                        value: {
                            v: 'a1',
                            t: CellValueType.STRING,
                            custom: { },
                        },
                    };

                    return params;
                }

                function getResultParamsMore() {
                    const params: ISetRangeValuesCommandParams = {
                        value: {
                            v: 'a1',
                            t: CellValueType.STRING,
                            custom: { },
                        },
                    };

                    return params;
                }

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, getParams())).toBeTruthy();
                expect(getValue()).toStrictEqual(getResultParams().value);

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, getParamsMore())).toBeTruthy();
                expect(getValue()).toStrictEqual(getResultParamsMore().value);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual(getResultParams().value);

                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({
                    v: 'A1',
                    t: CellValueType.STRING,
                });

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual(getResultParams().value);

                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual(getResultParamsMore().value);
            });

            it('will set range values when there is a selected range, includes custom property null', async () => {
                function getParams() {
                    const params: ISetRangeValuesCommandParams = {
                        value: {
                            v: 'a1',
                            custom: null,
                        },
                    };

                    return params;
                }

                function getResultParams() {
                    const params: ISetRangeValuesCommandParams = {
                        value: {
                            v: 'a1',
                            t: CellValueType.STRING,
                        },
                    };

                    return params;
                }

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, getParams())).toBeTruthy();
                expect(getValue()).toStrictEqual(getResultParams().value);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({
                    v: 'A1',
                    t: CellValueType.STRING,
                });

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual(getResultParams().value);
            });

            it('set value in other worksheet', async () => {
                function getParams() {
                    const params: ISetRangeValuesCommandParams = {
                        value: {
                            0: {
                                0: {
                                    v: 'a1',
                                },
                            },
                        },
                        subUnitId: 'sheet2', // set value to sheet2
                    };

                    return params;
                }

                const unit = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                const subUnitId = unit?.getActiveSheet()?.getSheetId();

                // current sheet is sheet1
                expect(subUnitId).toBe('sheet1');

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, getParams())).toBeTruthy();

                // check sheet1's value
                expect(getValue('sheet1')).toStrictEqual({
                    v: 'A1',
                });

                // check sheet2's value
                expect(getValue('sheet2')).toStrictEqual({
                    v: 'a1',
                    t: CellValueType.STRING,
                });

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();

                expect(getValue('sheet1')).toStrictEqual({
                    v: 'A1',
                });

                expect(getValue('sheet2')).toStrictEqual({
                    v: 'A1',
                    t: CellValueType.STRING,
                });

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();

                expect(getValue('sheet1')).toStrictEqual({
                    v: 'A1',
                });

                expect(getValue('sheet2')).toStrictEqual({
                    v: 'a1',
                    t: CellValueType.STRING,
                });

                // reset
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            });

            it('will tile all values when there is a selected range', async () => {
                function getParams() {
                    const params: ISetRangeValuesCommandParams = {
                        range: {
                            startRow: 0,
                            startColumn: 0,
                            endRow: 1,
                            endColumn: 1,
                        },
                        value: {
                            v: 'a1',
                            t: CellValueType.STRING,
                        },
                    };

                    return params;
                }

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, getParams())).toBeTruthy();
                expect(getValues(0, 0, 1, 1)).toStrictEqual([
                    [
                        {
                            v: 'a1',
                            t: CellValueType.STRING,
                        },
                        {
                            v: 'a1',
                            t: CellValueType.STRING,
                        },
                    ],
                    [
                        {
                            v: 'a1',
                            t: CellValueType.STRING,
                        },
                        {
                            v: 'a1',
                            t: CellValueType.STRING,
                        },
                    ],
                ]);
                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({
                    v: 'A1',
                    t: CellValueType.STRING,
                });

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValues(0, 0, 1, 1)).toStrictEqual([
                    [
                        {
                            v: 'a1',
                            t: CellValueType.STRING,
                        },
                        {
                            v: 'a1',
                            t: CellValueType.STRING,
                        },
                    ],
                    [
                        {
                            v: 'a1',
                            t: CellValueType.STRING,
                        },
                        {
                            v: 'a1',
                            t: CellValueType.STRING,
                        },
                    ],
                ]);

                // reset
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            });

            it('set formats', async () => {
                // set IStyleBase, the original cell has no style information
                function getParamsStyleBase() {
                    const paramsStyleBase: ISetRangeValuesCommandParams = {
                        value: {
                            s: {
                                ff: 'Arial',
                                fs: 12,
                                it: 1,
                                bl: 1,
                                ul: {
                                    s: 1,
                                    cl: {
                                        rgb: 'rgb(0,0,0)',
                                    },
                                    t: 1,
                                },
                                st: {
                                    s: 1,
                                    cl: {
                                        rgb: 'rgb(0,0,0)',
                                    },
                                    t: 1,
                                },
                                ol: {
                                    s: 1,
                                    cl: {
                                        rgb: 'rgb(0,0,0)',
                                    },
                                    t: 1,
                                },
                                bg: {
                                    rgb: 'rgb(0,0,0)',
                                },
                                bd: {
                                    t: {
                                        s: 1,
                                        cl: {
                                            rgb: 'rgb(0,0,0)',
                                        },
                                    },
                                    r: {
                                        s: 1,
                                        cl: {
                                            rgb: 'rgb(0,0,0)',
                                        },
                                    },
                                    b: {
                                        s: 1,
                                        cl: {
                                            rgb: 'rgb(0,0,0)',
                                        },
                                    },
                                    l: {
                                        s: 1,
                                        cl: {
                                            rgb: 'rgb(0,0,0)',
                                        },
                                    },
                                },
                                cl: {
                                    rgb: 'rgb(0,0,0)',
                                },
                                va: 1,
                            },
                        },
                    };

                    return paramsStyleBase;
                }

                function getParamsStyleBaseObject() {
                    const paramsStyleBase = getParamsStyleBase();
                    return (paramsStyleBase.value as ICellData).s as IStyleData;
                }

                expect(
                    await commandService.executeCommand(SetRangeValuesCommand.id, getParamsStyleBase())
                ).toBeTruthy();
                expect(getStyle()).toStrictEqual(getParamsStyleBaseObject());

                // set IStyleData, the original cell has style information
                function getParamsStyleData() {
                    const paramsStyleData: ISetRangeValuesCommandParams = {
                        value: {
                            s: {
                                tr: {
                                    a: 45,
                                    v: 0,
                                },
                                td: 1,
                                ht: 1,
                                vt: 1,
                                tb: 1,
                                pd: {
                                    t: 4,
                                    r: 4,
                                    b: 4,
                                    l: 4,
                                },
                            },
                        },
                    };

                    return paramsStyleData;
                }

                const allStyle = Tools.deepMerge({}, getParamsStyleBase(), getParamsStyleData());
                expect(
                    await commandService.executeCommand(SetRangeValuesCommand.id, getParamsStyleData())
                ).toBeTruthy();
                expect(getStyle()).toStrictEqual((allStyle.value as ICellData).s);

                /**
                 * todo: @Dushusir null attribute
                 */
                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(Tools.removeNull(getStyle())).toStrictEqual(getParamsStyleBaseObject());

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getStyle()).toStrictEqual((allStyle.value as ICellData).s);
            });

            it('set formats for blank cell', async () => {
                function getParams() {
                    const params: ISetRangeValuesCommandParams = {
                        value: { 1: { 1: { s: 's2' }, 4: { s: 's3' } } },
                    };

                    return params;
                }

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, getParams())).toBeTruthy();
                expect(getValues(1, 1, 1, 4)).toStrictEqual([[{ s: 's2' }, null, null, { s: 's3' }]]);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValues(1, 1, 1, 4)).toStrictEqual([[null, null, null, null]]);

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValues(1, 1, 1, 4)).toStrictEqual([[{ s: 's2' }, null, null, { s: 's3' }]]);
            });

            it('paste value when origin cell has rich text', async () => {
                function getParams() {
                    const richTextDemo: IDocumentData = {
                        id: 'd',
                        body: {
                            dataStream: 'Instructions: ①Project division - Fill in the specific division of labor after the project is disassembled: ②Responsible Person - Enter the responsible person\'s name here: ③Date-The specific execution time of the project (detailed to the date of a certain month), and the gray color block marks the planned real-time time of the division of labor of the project (for example, the specific execution time of [regional scene model arrangement and construction] is the 2 days marked in gray. \r\n',
                            textRuns: [
                                {
                                    st: 0,
                                    ed: 488,
                                    ts: {
                                        cl: {
                                            rgb: 'rgb(92,92,92)',
                                        },
                                    },
                                },
                            ],
                            paragraphs: [
                                {
                                    startIndex: 489,
                                    paragraphStyle: {
                                        spaceAbove: { v: 10 },
                                        lineSpacing: 1.2,
                                    },
                                },
                            ],
                        },
                        documentStyle: {
                            pageSize: {
                                width: Number.POSITIVE_INFINITY,
                                height: Number.POSITIVE_INFINITY,
                            },
                            marginTop: 0,
                            marginBottom: 0,
                            marginRight: 2,
                            marginLeft: 2,
                        },
                    };

                    const params: ISetRangeValuesCommandParams = {
                        value: {
                            p: richTextDemo,
                            v: 'a1',
                            t: CellValueType.STRING,
                        },
                    };

                    return params;
                }

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, getParams())).toBeTruthy();
                expect(getValue()).toStrictEqual(getParams().value);
                expect(await commandService.executeCommand(SetRangeValuesMutation.id, {
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    cellValue: {
                        0: {
                            0: {
                                v: 'hello',
                                s: null,
                            },
                        },
                    },
                })).toBeTruthy();
                expect(getValue()?.p).toBeFalsy();
            });

            it('set styles when origin cell has rich text', async () => {
                function getParams() {
                    const richTextDemo: IDocumentData = {
                        id: 'd',
                        body: {
                            dataStream: 'Instructions: ①Project division - Fill in the specific division of labor after the project is disassembled: ②Responsible Person - Enter the responsible person\'s name here: ③Date-The specific execution time of the project (detailed to the date of a certain month), and the gray color block marks the planned real-time time of the division of labor of the project (for example, the specific execution time of [regional scene model arrangement and construction] is the 2 days marked in gray. \r\n',
                            textRuns: [
                                {
                                    st: 0,
                                    ed: 488,
                                    ts: {
                                        cl: {
                                            rgb: 'rgb(92,92,92)',
                                        },
                                    },
                                },
                            ],
                            paragraphs: [
                                {
                                    startIndex: 489,
                                    paragraphStyle: {
                                        spaceAbove: { v: 10 },
                                        lineSpacing: 1.2,
                                    },
                                },
                            ],
                        },
                        documentStyle: {
                            pageSize: {
                                width: Number.POSITIVE_INFINITY,
                                height: Number.POSITIVE_INFINITY,
                            },
                            marginTop: 0,
                            marginBottom: 0,
                            marginRight: 2,
                            marginLeft: 2,
                        },
                    };

                    const params: ISetRangeValuesCommandParams = {
                        value: {
                            p: richTextDemo,
                            v: 'a1',
                            t: CellValueType.STRING,
                        },
                    };

                    return params;
                }

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, getParams())).toBeTruthy();
                expect(getValue()).toStrictEqual(getParams().value);
                expect(await commandService.executeCommand(SetRangeValuesMutation.id, {
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    cellValue: {
                        0: {
                            0: {
                                s: {
                                    bg: {
                                        rgb: '#232323',
                                    },
                                },
                            },
                        },
                    },
                })).toBeTruthy();
                expect(getValue()?.p).toBeTruthy();
            });

            it('set value when origin cell has text number format', async () => {
                function getParams() {
                    const params: ISetRangeValuesCommandParams = {
                        value: { 0: { 2: { v: '01' }, 3: { v: '0.20' }, 4: { v: '001', t: CellValueType.FORCE_STRING }, 5: { s: { n: { pattern: DEFAULT_TEXT_FORMAT_EXCEL } } } } },
                    };

                    return params;
                }

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, getParams())).toBeTruthy();
                expect(getValues(0, 2, 0, 5)).toStrictEqual([[{ s: 's5', v: '01', t: CellValueType.STRING }, { s: 's5', v: '0.20', t: CellValueType.STRING }, { v: '001', t: CellValueType.FORCE_STRING }, { s: 's5', v: '1', t: CellValueType.STRING }]]);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValues(0, 2, 0, 5)).toStrictEqual([[{ s: 's5' }, { s: 's5' }, null, { v: 1, t: CellValueType.NUMBER }]]);

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValues(0, 2, 0, 5)).toStrictEqual([[{ s: 's5', v: '01', t: CellValueType.STRING }, { s: 's5', v: '0.20', t: CellValueType.STRING }, { v: '001', t: CellValueType.FORCE_STRING }, { s: 's5', v: '1', t: CellValueType.STRING }]]);
            });

            it('set value when origin cell has number in text format, set new number format', async () => {
                function getParams() {
                    const params: ISetRangeValuesCommandParams = {
                        value: { 0: { 6: { s: { n: { pattern: '0%' } } } } },
                    };

                    return params;
                }

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, getParams())).toBeTruthy();

                const newValue = getValues(0, 6, 0, 6);
                const styles = getStyles(0, 6, 0, 6);

                expect(styles).toStrictEqual([[{ n: { pattern: '0%' } }]]);

                delete newValue?.[0][0]?.s;
                expect(newValue).toStrictEqual([[{
                    v: 1,
                    t: CellValueType.NUMBER,
                }]]);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValues(0, 6, 0, 6)).toStrictEqual([[{ v: '001', t: CellValueType.STRING, s: 's5' }]]);

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();

                const redoNewValue = getValues(0, 6, 0, 6);
                const redoStyles = getStyles(0, 6, 0, 6);

                expect(redoStyles).toStrictEqual([[{ n: { pattern: '0%' } }]]);

                delete redoNewValue?.[0][0]?.s;
                expect(redoNewValue).toStrictEqual([[{
                    v: 1,
                    t: CellValueType.NUMBER,
                }]]);
            });

            it('set value when origin cell has text in text format, set new number format', async () => {
                function getParams() {
                    const params: ISetRangeValuesCommandParams = {
                        value: { 0: { 7: { s: { n: { pattern: '0%' } } } } },
                    };

                    return params;
                }

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, getParams())).toBeTruthy();

                const newValue = getValues(0, 7, 0, 7);
                const styles = getStyles(0, 7, 0, 7);

                expect(styles).toStrictEqual([[{ n: { pattern: '0%' } }]]);

                delete newValue?.[0][0]?.s;
                expect(newValue).toStrictEqual([[{
                    v: 'text',
                    t: CellValueType.STRING,
                }]]);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValues(0, 7, 0, 7)).toStrictEqual([[{
                    v: 'text',
                    t: CellValueType.STRING,
                }]]);

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();

                const redoNewValue = getValues(0, 7, 0, 7);
                const redoStyles = getStyles(0, 7, 0, 7);

                expect(redoStyles).toStrictEqual([[{ n: { pattern: '0%' } }]]);

                delete redoNewValue?.[0][0]?.s;
                expect(redoNewValue).toStrictEqual([[{
                    v: 'text',
                    t: CellValueType.STRING,
                }]]);
            });

            it('set value when origin cell has force string, set new number format', async () => {
                function getParams() {
                    const params: ISetRangeValuesCommandParams = {
                        value: { 0: { 8: { s: { n: { pattern: '0%' } } } } },
                    };

                    return params;
                }

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, getParams())).toBeTruthy();

                const newValue = getValues(0, 8, 0, 8);
                const styles = getStyles(0, 8, 0, 8);

                expect(styles).toStrictEqual([[{ n: { pattern: '0%' } }]]);

                delete newValue?.[0][0]?.s;
                expect(newValue).toStrictEqual([[{
                    v: '001',
                    t: CellValueType.FORCE_STRING,
                }]]);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValues(0, 8, 0, 8)).toStrictEqual([[{ v: '001', t: CellValueType.FORCE_STRING }]]);

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();

                const redoNewValue = getValues(0, 8, 0, 8);
                const redoStyles = getStyles(0, 8, 0, 8);

                expect(redoStyles).toStrictEqual([[{ n: { pattern: '0%' } }]]);

                delete redoNewValue?.[0][0]?.s;
                expect(redoNewValue).toStrictEqual([[{
                    v: '001',
                    t: CellValueType.FORCE_STRING,
                }]]);
            });

            it('set value when origin cell has force string, set new number value', async () => {
                function getParams() {
                    const params: ISetRangeValuesCommandParams = {
                        value: { 0: { 8: { v: '2' } } },
                    };

                    return params;
                }

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, getParams())).toBeTruthy();

                const newValue = getValues(0, 8, 0, 8);
                expect(newValue).toStrictEqual([[{
                    v: 2,
                    t: CellValueType.NUMBER,
                }]]);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValues(0, 8, 0, 8)).toStrictEqual([[{ v: '001', t: CellValueType.FORCE_STRING }]]);

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();

                const redoNewValue = getValues(0, 8, 0, 8);
                expect(redoNewValue).toStrictEqual([[{
                    v: 2,
                    t: CellValueType.NUMBER,
                }]]);
            });

            it('set value when origin cell has force string, set new boolean value', async () => {
                function getParams() {
                    const params: ISetRangeValuesCommandParams = {
                        value: { 0: { 8: { v: 'true' } } },
                    };

                    return params;
                }

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, getParams())).toBeTruthy();

                const newValue = getValues(0, 8, 0, 8);
                expect(newValue).toStrictEqual([[{
                    v: 1,
                    t: CellValueType.BOOLEAN,
                }]]);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValues(0, 8, 0, 8)).toStrictEqual([[{ v: '001', t: CellValueType.FORCE_STRING }]]);

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();

                const redoNewValue = getValues(0, 8, 0, 8);
                expect(redoNewValue).toStrictEqual([[{
                    v: 1,
                    t: CellValueType.BOOLEAN,
                }]]);
            });

            it('set value when origin cell has force string and text number format, set new number value', async () => {
                function getParams() {
                    const params: ISetRangeValuesCommandParams = {
                        value: { 0: { 9: { v: '2' } } },
                    };

                    return params;
                }

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, getParams())).toBeTruthy();

                const newValue = getValues(0, 9, 0, 9);
                expect(newValue).toStrictEqual([[{ v: '2', t: CellValueType.FORCE_STRING, s: 's5' }]]);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValues(0, 9, 0, 9)).toStrictEqual([[{ v: '001', t: CellValueType.FORCE_STRING, s: 's5' }]]);

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();

                const redoNewValue = getValues(0, 9, 0, 9);
                expect(redoNewValue).toStrictEqual([[{ v: '2', t: CellValueType.FORCE_STRING, s: 's5' }]]);
            });

            it('set value when origin cell has force string and text number format, set new boolean value', async () => {
                function getFirstParams() {
                    const params: ISetRangeValuesCommandParams = {
                        value: { 0: { 9: { v: 'false' } } },
                    };

                    return params;
                }

                function getSecondParams() {
                    const params: ISetRangeValuesCommandParams = {
                        value: { 0: { 9: { v: 'true' } } },
                    };

                    return params;
                }

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, getFirstParams())).toBeTruthy();

                let newValue = getValues(0, 9, 0, 9);
                expect(newValue).toStrictEqual([[{ v: 'false', t: CellValueType.FORCE_STRING, s: 's5' }]]);

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, getSecondParams())).toBeTruthy();

                newValue = getValues(0, 9, 0, 9);
                expect(newValue).toStrictEqual([[{ v: 'true', t: CellValueType.FORCE_STRING, s: 's5' }]]);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValues(0, 9, 0, 9)).toStrictEqual([[{ v: 'false', t: CellValueType.FORCE_STRING, s: 's5' }]]);

                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValues(0, 9, 0, 9)).toStrictEqual([[{ v: '001', t: CellValueType.FORCE_STRING, s: 's5' }]]);

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValues(0, 9, 0, 9)).toStrictEqual([[{ v: 'false', t: CellValueType.FORCE_STRING, s: 's5' }]]);

                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValues(0, 9, 0, 9)).toStrictEqual([[{ v: 'true', t: CellValueType.FORCE_STRING, s: 's5' }]]);
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                selectionManager.clearCurrentSelections();
                const params: ISetRangeValuesCommandParams = {
                    value: {
                        v: 'a1',
                    },
                };
                const result = await commandService.executeCommand(SetRangeValuesCommand.id, params);
                expect(result).toBeFalsy();
            });
        });
    });
});
