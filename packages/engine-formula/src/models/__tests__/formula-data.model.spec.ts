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

import type { IBaseSnapshot, ICellData, Injector, IWorkbookData, Nullable, Univer, Workbook } from '@univerjs/core';
import type { IFormulaData } from '../../basics/common';
import {
    BaseDataModel,
    BaseFieldType,
    BooleanNumber,
    CellValueType,
    IUniverInstanceService,
    LocaleType,
    ObjectMatrix,
    RANGE_TYPE,
    UniverInstanceType,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FormulaDataModel, initSheetFormulaData } from '../formula-data.model';
import { createCommandTestBed } from './create-command-test-bed';

const TEST_WORKBOOK_DATA_DEMO: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    3: {
                        f: '=SUM(A1)',
                        si: '3e4r5t',
                    },
                },
                1: {
                    3: {
                        f: '=SUM(A2)',
                        si: 'OSPtzm',
                    },
                },
                2: {
                    3: {
                        si: 'OSPtzm',
                    },
                },
                3: {
                    3: {
                        si: 'OSPtzm',
                    },
                },
            },
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

const TEST_WORKBOOK_DATA_EXTRA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            name: 'Sheet1',
            rowCount: 5,
            rowData: {
                2: { hd: BooleanNumber.TRUE },
            },
            cellData: {
                0: {
                    0: { f: '=A1' },
                },
                1: {
                    0: { f: '=A2' },
                },
                2: {
                    0: { f: '=A3', v: 1 },
                },
                3: {
                    0: { f: '=A4' },
                },
                4: {
                    0: { f: '=A5', v: '' },
                    1: { f: '=B5', v: 0 },
                    2: { f: '=C5', v: '0' },
                },
            },
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

const TEST_BASE_DATA: Partial<IBaseSnapshot> = {
    id: 'base-test',
    name: 'Base',
    schemaVersion: 1,
    tableOrder: ['table-main', 'tableOther'],
    createdAt: 0,
    updatedAt: 0,
    tables: {
        'table-main': {
            id: 'table-main',
            name: 'Sales',
            primaryFieldId: 'name',
            fieldOrder: ['name', 'amount', 'qty', 'tags', 'link', 'attachment', 'total'],
            fields: {
                name: { id: 'name', name: 'Name', type: BaseFieldType.Text, config: {} },
                amount: { id: 'amount', name: 'Amount', type: BaseFieldType.Number, config: {} },
                qty: { id: 'qty', name: 'Qty', type: BaseFieldType.Number, config: {} },
                tags: { id: 'tags', name: 'Tags', type: BaseFieldType.Text, config: {} },
                link: { id: 'link', name: 'Link', type: BaseFieldType.Link, config: {} },
                attachment: { id: 'attachment', name: 'Files', type: BaseFieldType.Attachment, config: {} },
                total: {
                    id: 'total',
                    name: 'Total',
                    type: BaseFieldType.Formula,
                    config: {
                        formula: '=SUM({Amount}, [Qty], tableOther[External])',
                    },
                },
            },
            records: {
                'record-1': {
                    id: 'record-1',
                    orderKey: 'a',
                    createdAt: 0,
                    updatedAt: 0,
                    values: {
                        name: 'Order 1',
                        amount: 10,
                        qty: 2,
                        tags: ['paid', 'online'],
                        link: { text: 'Invoice', url: 'https://example.com/invoice' },
                        attachment: ['file-1'],
                    },
                },
            },
            recordOrder: ['record-1'],
            views: {},
            viewOrder: [],
        },
        tableOther: {
            id: 'tableOther',
            name: 'Sales',
            primaryFieldId: 'external',
            fieldOrder: ['external'],
            fields: {
                external: { id: 'external', name: 'External', type: BaseFieldType.Number, config: {} },
            },
            records: {
                'record-2': {
                    id: 'record-2',
                    orderKey: 'a',
                    createdAt: 0,
                    updatedAt: 0,
                    values: { external: 8 },
                },
            },
            recordOrder: ['record-2'],
            views: {},
            viewOrder: [],
        },
    },
};

describe('Test formula data model', () => {
    describe('formulaDataModel function', () => {
        let univer: Univer;
        let get: Injector['get'];
        let formulaDataModel: FormulaDataModel;

        beforeEach(() => {
            const testBed = createCommandTestBed(TEST_WORKBOOK_DATA_DEMO);
            univer = testBed.univer;
            get = testBed.get;

            formulaDataModel = get(FormulaDataModel);
        });

        afterEach(() => {
            univer.dispose();
        });

        describe('updateFormulaData', () => {
            it('skips formula reconstruction for value updates', () => {
                const worksheet = get(IUniverInstanceService)
                    .getUnit<Workbook>('test')
                    ?.getSheetBySheetId('sheet1');
                const worksheetCellMatrix = worksheet!.getCellMatrix();
                worksheetCellMatrix.setValue(10, 10, { v: 1 });
                const getFormulaData = vi.spyOn(formulaDataModel, 'getFormulaData');
                const getSheetFormulaData = vi.spyOn(formulaDataModel, 'getSheetFormulaData');
                const scanWorksheet = vi.spyOn(worksheetCellMatrix, 'forValue');

                expect(formulaDataModel.updateFormulaData('test', 'sheet1', {
                    10: {
                        10: { v: 2 },
                    },
                })).toEqual({});
                expect(getFormulaData).not.toHaveBeenCalled();
                expect(getSheetFormulaData).not.toHaveBeenCalled();
                expect(scanWorksheet).not.toHaveBeenCalled();
            });

            it('updates formulas without ids incrementally', () => {
                const worksheet = get(IUniverInstanceService)
                    .getUnit<Workbook>('test')
                    ?.getSheetBySheetId('sheet1');
                const worksheetCellMatrix = worksheet!.getCellMatrix();
                worksheetCellMatrix.setValue(10, 11, { f: '=A1' });
                const getFormulaData = vi.spyOn(formulaDataModel, 'getFormulaData');
                const getSheetFormulaData = vi.spyOn(formulaDataModel, 'getSheetFormulaData');
                const scanWorksheet = vi.spyOn(worksheetCellMatrix, 'forValue');

                expect(formulaDataModel.updateFormulaData('test', 'sheet1', {
                    10: {
                        10: { f: '=A1' },
                        11: { f: '=B1' },
                    },
                })).toEqual({
                    10: {
                        10: { f: '=A1' },
                        11: { f: '=B1' },
                    },
                });
                expect(getFormulaData).not.toHaveBeenCalled();
                expect(getSheetFormulaData).not.toHaveBeenCalled();
                expect(scanWorksheet).not.toHaveBeenCalled();
            });

            it('deletes formulas without ids incrementally', () => {
                const worksheet = get(IUniverInstanceService)
                    .getUnit<Workbook>('test')
                    ?.getSheetBySheetId('sheet1');
                worksheet?.getCellMatrix().setValue(10, 10, { f: '=A1' });
                const getFormulaData = vi.spyOn(formulaDataModel, 'getFormulaData');
                const getSheetFormulaData = vi.spyOn(formulaDataModel, 'getSheetFormulaData');

                expect(formulaDataModel.updateFormulaData('test', 'sheet1', {
                    10: {
                        10: { v: 1, f: null },
                    },
                })).toEqual({
                    10: {
                        10: null,
                    },
                });
                expect(getFormulaData).not.toHaveBeenCalled();
                expect(getSheetFormulaData).not.toHaveBeenCalled();
            });

            it('processes mixed updates containing shared formulas incrementally', () => {
                const getSheetFormulaData = vi.spyOn(formulaDataModel, 'getSheetFormulaData');

                const result = formulaDataModel.updateFormulaData('test', 'sheet1', {
                    0: {
                        0: { f: '=B1' },
                    },
                    1: {
                        3: { v: null, f: null, si: null },
                    },
                });

                expect(result[0]?.[0]).toEqual({ f: '=B1' });
                expect(result[1]?.[3]).toBeNull();
                expect(result[2]?.[3]).toEqual({ f: '=SUM(A3)', si: 'OSPtzm' });
                expect(getSheetFormulaData).not.toHaveBeenCalled();
            });

            it('updates both old and new shared formula groups', () => {
                expect(formulaDataModel.updateFormulaData('test', 'sheet1', {
                    1: {
                        3: { f: '=SUM(B2)', si: 'new-group' },
                    },
                })).toEqual({
                    1: {
                        3: { f: '=SUM(B2)', si: 'new-group' },
                    },
                    2: {
                        3: { f: '=SUM(A3)', si: 'OSPtzm' },
                    },
                    3: {
                        3: { f: '=SUM(A3)', si: 'OSPtzm', x: 0, y: 1 },
                    },
                });
            });

            it('detaches a shared formula anchor into a normal formula', () => {
                expect(formulaDataModel.updateFormulaData('test', 'sheet1', {
                    1: {
                        3: { f: '=SUM(B2)', si: null },
                    },
                })).toEqual({
                    1: {
                        3: { f: '=SUM(B2)' },
                    },
                    2: {
                        3: { f: '=SUM(A3)', si: 'OSPtzm' },
                    },
                    3: {
                        3: { f: '=SUM(A3)', si: 'OSPtzm', x: 0, y: 1 },
                    },
                });
            });

            it('creates a shared formula group when a follower precedes its anchor', () => {
                expect(formulaDataModel.updateFormulaData('test', 'sheet1', {
                    10: {
                        3: { si: 'new-group' },
                    },
                    11: {
                        3: { f: '=SUM(A12)', si: 'new-group' },
                    },
                })).toEqual({
                    10: {
                        3: { f: '=SUM(A12)', si: 'new-group', x: 0, y: -1 },
                    },
                    11: {
                        3: { f: '=SUM(A12)', si: 'new-group' },
                    },
                });
            });

            it('delete formula with id', () => {
                const unitId = 'test';
                const sheetId = 'sheet1';
                const getFormulaData = vi.spyOn(formulaDataModel, 'getFormulaData');
                const getSheetFormulaData = vi.spyOn(formulaDataModel, 'getSheetFormulaData');
                const worksheetCellMatrix = get(IUniverInstanceService)
                    .getUnit<Workbook>(unitId)
                    ?.getSheetBySheetId(sheetId)
                    ?.getCellMatrix();
                const scanWorksheet = vi.spyOn(worksheetCellMatrix!, 'forValue');
                const cellValue = {
                    1: {
                        3: {
                            v: null,
                            p: null,
                            f: null,
                            si: null,
                        },
                    },
                };

                const result = {
                    1: {
                        3: null,
                    },
                    2: {
                        3: {
                            f: '=SUM(A3)',
                            si: 'OSPtzm',
                        },
                    },
                    3: {
                        3: {
                            f: '=SUM(A3)',
                            si: 'OSPtzm',
                            x: 0,
                            y: 1,
                        },
                    },
                };

                const newFormulaData = formulaDataModel.updateFormulaData(unitId, sheetId, cellValue);
                expect(newFormulaData).toStrictEqual(result);
                expect(getFormulaData).not.toHaveBeenCalled();
                expect(getSheetFormulaData).not.toHaveBeenCalled();
                expect(scanWorksheet).toHaveBeenCalledOnce();
            });

            it('delete formulas with ids and formulas with only ids', () => {
                const unitId = 'test';
                const sheetId = 'sheet1';
                const cellValue = {
                    0: {
                        3: {
                            v: null,
                            p: null,
                            f: null,
                            si: null,
                        },
                    },
                    1: {
                        3: {
                            v: null,
                            p: null,
                            f: null,
                            si: null,
                        },
                    },
                    2: {
                        3: {
                            v: null,
                            p: null,
                            f: null,
                            si: null,
                        },
                    },
                };

                const result = {
                    0: {
                        3: null,
                    },
                    1: {
                        3: null,
                    },
                    2: {
                        3: null,
                    },
                    3: {
                        3: {
                            f: '=SUM(A4)',
                            si: 'OSPtzm',
                        },
                    },
                };

                const newFormulaData = formulaDataModel.updateFormulaData(unitId, sheetId, cellValue);
                expect(newFormulaData).toStrictEqual(result);
            });

            it('delete the formula with only id', () => {
                const unitId = 'test';
                const sheetId = 'sheet1';
                const cellValue = {
                    3: {
                        3: {
                            v: null,
                            p: null,
                            f: null,
                            si: null,
                        },
                    },
                };

                const result = {
                    3: {
                        3: null,
                    },
                };

                const newFormulaData = formulaDataModel.updateFormulaData(unitId, sheetId, cellValue);
                expect(newFormulaData).toStrictEqual(result);
            });
        });

        describe('updateArrayFormulaRange', () => {
            it('update array formula range', () => {
                const unitId = 'test';
                const sheetId = 'sheet1';

                formulaDataModel.setArrayFormulaRange({
                    [unitId]: {
                        [sheetId]: {
                            0: {
                                3: {
                                    startRow: 0,
                                    startColumn: 3,
                                    endRow: 1,
                                    endColumn: 3,
                                },
                            },
                        },
                    },
                });

                const cellValue = {
                    0: {
                        3: {
                            v: null,
                            p: null,
                            f: null,
                            si: null,
                        },
                    },
                };

                const result = {
                    [unitId]: {
                        [sheetId]: {},
                    },
                };

                formulaDataModel.updateArrayFormulaRange(unitId, sheetId, cellValue);

                const formulaData = formulaDataModel.getArrayFormulaRange();
                expect(formulaData).toStrictEqual(result);
            });
        });
        describe('updateArrayFormulaCellData', () => {
            it('update array formula cell data', () => {
                const unitId = 'test';
                const sheetId = 'sheet1';

                formulaDataModel.setArrayFormulaRange({
                    [unitId]: {
                        [sheetId]: {
                            0: {
                                3: {
                                    startRow: 0,
                                    startColumn: 3,
                                    endRow: 1,
                                    endColumn: 3,
                                },
                            },
                        },
                    },
                });

                formulaDataModel.setArrayFormulaCellData({
                    [unitId]: {
                        [sheetId]: {
                            0: {
                                3: {
                                    v: 1,
                                },
                            },
                            1: {
                                3: {
                                    v: 2,
                                },
                            },
                        },
                    },
                });

                const cellValue = {
                    0: {
                        3: {
                            v: null,
                            p: null,
                            f: null,
                            si: null,
                        },
                    },
                };

                const result = {
                    [unitId]: {
                        [sheetId]: {},
                    },
                };

                formulaDataModel.updateArrayFormulaCellData(unitId, sheetId, cellValue);

                const formulaData = formulaDataModel.getArrayFormulaCellData();
                expect(formulaData).toStrictEqual(result);
            });

            it('should clear only edited array formula cell data when editing a spill cell', () => {
                const unitId = 'test';
                const sheetId = 'sheet1';

                formulaDataModel.setArrayFormulaRange({
                    [unitId]: {
                        [sheetId]: {
                            0: {
                                3: {
                                    startRow: 0,
                                    startColumn: 3,
                                    endRow: 1,
                                    endColumn: 3,
                                },
                            },
                        },
                    },
                });

                formulaDataModel.setArrayFormulaCellData({
                    [unitId]: {
                        [sheetId]: {
                            0: {
                                3: {
                                    v: 1,
                                },
                            },
                            1: {
                                3: {
                                    v: 2,
                                },
                            },
                        },
                    },
                });

                formulaDataModel.updateArrayFormulaCellData(unitId, sheetId, {
                    1: {
                        3: {
                            v: 111,
                        },
                    },
                });

                expect(formulaDataModel.getArrayFormulaCellData()).toStrictEqual({
                    [unitId]: {
                        [sheetId]: {
                            0: {
                                3: {
                                    v: 1,
                                },
                            },
                        },
                    },
                });
            });
        });

        describe('getFormulaStringByCell', () => {
            it('get formula string by cell', () => {
                const unitId = 'test';
                const sheetId = 'sheet1';

                const result = [
                    ['=SUM(A1)'],
                    ['=SUM(A2)'],
                    ['=SUM(A3)'],
                    ['=SUM(A4)'],
                ];

                for (let i = 0; i < 4; i++) {
                    const formulaString = formulaDataModel.getFormulaStringByCell(i, 3, sheetId, unitId);
                    expect(formulaString).toBe(result[i][0]);
                }
            });

            it('should return null when formula string source cell cannot be found', () => {
                expect(formulaDataModel.getFormulaStringByCell(0, 0, 'missing-sheet', 'test')).toBeNull();
                expect(formulaDataModel.getFormulaStringByCell(0, 0, 'sheet1', 'missing-unit')).toBeNull();
            });
        });

        describe('extra formula data branches', () => {
            beforeEach(() => {
                univer.dispose();
                const testBed = createCommandTestBed(TEST_WORKBOOK_DATA_EXTRA);
                univer = testBed.univer;
                get = testBed.get;
                formulaDataModel = get(FormulaDataModel);
            });

            it('should clear previous array formula cell data and remove range', () => {
                formulaDataModel.setArrayFormulaRange({
                    test: {
                        sheet1: {
                            0: {
                                0: {
                                    startRow: 0,
                                    startColumn: 0,
                                    endRow: 1,
                                    endColumn: 1,
                                },
                            },
                        },
                    },
                });
                formulaDataModel.setArrayFormulaCellData({
                    test: {
                        sheet1: {
                            0: {
                                0: { v: 1 },
                            },
                            1: {
                                1: { v: 2 },
                            },
                        },
                    },
                });

                const clearMatrix = new ObjectMatrix<Nullable<ICellData>>({
                    0: {
                        0: { v: null },
                    },
                });
                formulaDataModel.clearPreviousArrayFormulaCellData({
                    test: {
                        sheet1: clearMatrix,
                    },
                });

                expect(formulaDataModel.getArrayFormulaCellData().test?.sheet1).toEqual({});
            });

            it('should merge array formula range and cell data', () => {
                formulaDataModel.mergeArrayFormulaRange({
                    test: {
                        sheet1: {
                            2: {
                                2: {
                                    startRow: 2,
                                    startColumn: 2,
                                    endRow: 3,
                                    endColumn: 3,
                                },
                            },
                        },
                    },
                });

                const runtimeCellData = new ObjectMatrix<Nullable<ICellData>>({
                    2: {
                        2: { v: 10 },
                    },
                    3: {
                        3: { v: 11 },
                    },
                });
                formulaDataModel.mergeArrayFormulaCellData({
                    test: {
                        sheet1: runtimeCellData,
                    },
                });

                expect(formulaDataModel.getArrayFormulaRange().test?.sheet1?.[2]?.[2]).toEqual({
                    startRow: 2,
                    startColumn: 2,
                    endRow: 3,
                    endColumn: 3,
                });
                expect(formulaDataModel.getArrayFormulaCellData().test?.sheet1?.[3]?.[3]?.v).toBe(11);
            });

            it('should initialize array formula range and cached cells from snapshot refs', () => {
                univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                    id: 'array-test',
                    appVersion: '3.0.0-alpha',
                    sheets: {
                        sheet1: {
                            id: 'sheet1',
                            name: 'Sheet1',
                            rowCount: 20,
                            columnCount: 20,
                            cellData: {
                                5: {
                                    10: {
                                        f: '=IF(A1:A6,B1,0)',
                                        ref: 'K6:K11',
                                        v: 0,
                                        t: CellValueType.NUMBER,
                                    } as ICellData & { ref: string },
                                },
                                6: {
                                    10: {
                                        ref: 'K6:K11',
                                        v: -5300,
                                        t: CellValueType.NUMBER,
                                    } as ICellData & { ref: string },
                                },
                            },
                        },
                    },
                    locale: LocaleType.ZH_CN,
                    name: '',
                    sheetOrder: ['sheet1'],
                    styles: {},
                });

                formulaDataModel.getFormulaData();

                expect(formulaDataModel.getArrayFormulaRange()['array-test']?.sheet1?.[5]?.[10]).toEqual({
                    startRow: 5,
                    startColumn: 10,
                    endRow: 10,
                    endColumn: 10,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: RANGE_TYPE.NORMAL,
                });
                expect(formulaDataModel.getArrayFormulaCellData()['array-test']?.sheet1?.[6]?.[10]?.v).toBe(-5300);
            });

            it('should not initialize a single-cell ref as an array formula range', () => {
                univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                    id: 'single-ref-test',
                    appVersion: '3.0.0-alpha',
                    sheets: {
                        sheet1: {
                            id: 'sheet1',
                            name: 'Sheet1',
                            rowCount: 20,
                            columnCount: 20,
                            cellData: {
                                11: {
                                    5: {
                                        f: '=IFERROR(1/0,"")',
                                        ref: 'F12',
                                    } as ICellData & { ref: string },
                                },
                            },
                        },
                    },
                    locale: LocaleType.ZH_CN,
                    name: '',
                    sheetOrder: ['sheet1'],
                    styles: {},
                });

                formulaDataModel.getFormulaData();

                expect(formulaDataModel.getArrayFormulaRange()['single-ref-test']?.sheet1?.[11]?.[5]).toBeUndefined();
                expect(formulaDataModel.getArrayFormulaCellData()['single-ref-test']?.sheet1?.[11]?.[5]).toBeUndefined();
            });

            it('should preserve a single-cell ref for array constant formulas', () => {
                univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                    id: 'single-array-constant-test',
                    appVersion: '3.0.0-alpha',
                    sheets: {
                        sheet1: {
                            id: 'sheet1',
                            name: 'Sheet1',
                            rowCount: 20,
                            columnCount: 20,
                            cellData: {
                                0: {
                                    1: {
                                        f: '={1,2;3,4}',
                                        ref: 'B1',
                                    } as ICellData & { ref: string },
                                },
                            },
                        },
                    },
                    locale: LocaleType.ZH_CN,
                    name: '',
                    sheetOrder: ['sheet1'],
                    styles: {},
                });

                formulaDataModel.getFormulaData();

                expect(formulaDataModel.getArrayFormulaRange()['single-array-constant-test']?.sheet1?.[0]?.[1]).toEqual({
                    startRow: 0,
                    startColumn: 1,
                    endRow: 0,
                    endColumn: 1,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                });
            });

            it('should initialize array formula range for shared formula followers with refs', () => {
                univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                    id: 'shared-array-test',
                    appVersion: '3.0.0-alpha',
                    sheets: {
                        sheet1: {
                            id: 'sheet1',
                            name: 'Sheet1',
                            rowCount: 20,
                            columnCount: 20,
                            cellData: {
                                5: {
                                    6: {
                                        f: '=SUMIFS($D$6:$D$13,$B$6:$B$13,G5,$C$6:$C$13,$F$10:$F$14)',
                                        si: '0',
                                        ref: 'G6:G10',
                                        v: 0,
                                        t: CellValueType.NUMBER,
                                    } as ICellData & { ref: string },
                                    7: {
                                        si: '0',
                                        ref: 'H6:H10',
                                        v: 0,
                                        t: CellValueType.NUMBER,
                                    } as ICellData & { ref: string },
                                },
                                6: {
                                    7: {
                                        ref: 'H6:H10',
                                        v: 12,
                                        t: CellValueType.NUMBER,
                                    } as ICellData & { ref: string },
                                },
                            },
                        },
                    },
                    locale: LocaleType.ZH_CN,
                    name: '',
                    sheetOrder: ['sheet1'],
                    styles: {},
                });

                formulaDataModel.getFormulaData();

                expect(formulaDataModel.getArrayFormulaRange()['shared-array-test']?.sheet1?.[5]?.[7]).toEqual({
                    startRow: 5,
                    startColumn: 7,
                    endRow: 9,
                    endColumn: 7,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: RANGE_TYPE.NORMAL,
                });
                expect(formulaDataModel.getArrayFormulaCellData()['shared-array-test']?.sheet1?.[6]?.[7]?.v).toBe(12);
            });

            it('should merge and update image formula data', () => {
                const imageMatrix = new ObjectMatrix({
                    1: {
                        1: {
                            source: 'https://img',
                            altText: 'demo',
                            sizing: 1,
                            height: 10,
                            width: 20,
                        },
                    },
                });
                formulaDataModel.mergeUnitImageFormulaData({
                    test: {
                        sheet1: imageMatrix,
                    },
                });

                expect(formulaDataModel.getUnitImageFormulaData().test?.sheet1.getValue(1, 1)?.source).toBe('https://img');

                formulaDataModel.updateImageFormulaData('test', 'sheet1', {
                    1: {
                        1: { v: null },
                    },
                });
                expect(formulaDataModel.getUnitImageFormulaData().test?.sheet1.getValue(1, 1)).toBeUndefined();
            });

            it('should delete array formula range by anchor cell', () => {
                formulaDataModel.setArrayFormulaRange({
                    test: {
                        sheet1: {
                            5: {
                                6: {
                                    startRow: 5,
                                    startColumn: 6,
                                    endRow: 6,
                                    endColumn: 7,
                                },
                            },
                        },
                    },
                });

                formulaDataModel.deleteArrayFormulaRange('test', 'sheet1', 5, 6);
                expect(formulaDataModel.getArrayFormulaRange().test?.sheet1).toEqual({});
            });

            it('should calculate dirty ranges for empty formula cells by continuous rows', () => {
                const dirtyRanges = formulaDataModel.getFormulaDirtyRanges();

                expect(dirtyRanges).toEqual([
                    {
                        unitId: 'test',
                        sheetId: 'sheet1',
                        range: {
                            rangeType: RANGE_TYPE.NORMAL,
                            startRow: 0,
                            endRow: 1,
                            startColumn: 0,
                            endColumn: 0,
                        },
                    },
                    {
                        unitId: 'test',
                        sheetId: 'sheet1',
                        range: {
                            rangeType: RANGE_TYPE.NORMAL,
                            startRow: 3,
                            endRow: 3,
                            startColumn: 0,
                            endColumn: 0,
                        },
                    },
                ]);
            });

            it('should ignore non-sheet formula units when calculating sheet dirty ranges', () => {
                const univerInstanceService = get(IUniverInstanceService);
                univerInstanceService.registerCtorForType(UniverInstanceType.UNIVER_BASE, BaseDataModel);
                univer.createUnit(UniverInstanceType.UNIVER_BASE, TEST_BASE_DATA);

                const dirtyRanges = formulaDataModel.getFormulaDirtyRanges();

                expect(dirtyRanges).toEqual([
                    {
                        unitId: 'test',
                        sheetId: 'sheet1',
                        range: {
                            rangeType: RANGE_TYPE.NORMAL,
                            startRow: 0,
                            endRow: 1,
                            startColumn: 0,
                            endColumn: 0,
                        },
                    },
                    {
                        unitId: 'test',
                        sheetId: 'sheet1',
                        range: {
                            rangeType: RANGE_TYPE.NORMAL,
                            startRow: 3,
                            endRow: 3,
                            startColumn: 0,
                            endColumn: 0,
                        },
                    },
                ]);
            });

            it('should expose calculate data and per-sheet formula data', () => {
                const calculateData = formulaDataModel.getCalculateData();
                expect(calculateData.allUnitData.test?.sheet1.rowCount).toBeGreaterThan(0);
                expect(calculateData.unitSheetNameMap.test?.Sheet1).toBe('sheet1');

                const sheetFormulaData = formulaDataModel.getSheetFormulaData('test', 'sheet1');
                expect(sheetFormulaData?.[0]?.[0]?.f).toBe('=A1');
            });

            it('should expose manually hidden sheet rows for subtotal-style formulas', () => {
                expect(formulaDataModel.getHiddenRowsFiltered()).toEqual({
                    test: {
                        sheet1: {
                            2: { hd: BooleanNumber.TRUE },
                        },
                    },
                });
            });

            it('should build formula and runtime data for base tables', () => {
                const univerInstanceService = get(IUniverInstanceService);
                univerInstanceService.registerCtorForType(UniverInstanceType.UNIVER_BASE, BaseDataModel);
                univer.createUnit(UniverInstanceType.UNIVER_BASE, TEST_BASE_DATA);

                const formulaData = formulaDataModel.getFormulaData();
                expect(formulaData['base-test']?.['table-main']).toEqual({
                    0: {
                        6: {
                            f: '=SUM(table-main[[#This Row],[Amount]], table-main[[#This Row],[Qty]], tableOther[[#This Row],[External]])',
                            si: 'total',
                        },
                    },
                });

                const calculateData = formulaDataModel.getCalculateData();
                const tableData = calculateData.allUnitData['base-test']?.['table-main'];

                expect(calculateData.unitSheetNameMap['base-test']?.Sales).toBe('tableOther');
                expect(tableData?.rowCount).toBe(1);
                expect(tableData?.columnCount).toBe(7);
                expect(tableData?.cellData.getValue(0, 0)).toEqual({ v: 'Order 1', t: CellValueType.STRING });
                expect(tableData?.cellData.getValue(0, 1)).toEqual({ v: 10, t: CellValueType.NUMBER });
                expect(tableData?.cellData.getValue(0, 3)).toEqual({ v: 'paid, online', t: CellValueType.STRING });
                expect(tableData?.cellData.getValue(0, 4)).toEqual({ v: 'Invoice', t: CellValueType.STRING });
                expect(tableData?.cellData.getValue(0, 5)).toEqual({ v: '', t: CellValueType.STRING });
            });
        });
    });

    describe('function initSheetFormulaData', () => {
        it('init formula data', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';

            const formulaData: IFormulaData = {
                [unitId]: {},
            };

            const cellValue = {
                0: {
                    0: {
                        v: 1,
                    },
                    1: {
                        v: 2,
                    },
                    2: {
                        v: 3,
                    },
                    3: {
                        v: 2,
                        f: '=SUM(A1)',
                        si: '3e4r5t',
                    },
                },
                1: {
                    0: {
                        v: 4,
                    },
                },
                2: {
                    0: {
                        v: 44,
                    },
                },
                3: {
                    0: {
                        v: 444,
                    },
                },
            };

            const cellMatrix = new ObjectMatrix<Nullable<ICellData>>(cellValue);

            const result = {
                [unitId]: {
                    [sheetId]: {
                        0: {
                            3: {
                                f: '=SUM(A1)',
                                si: '3e4r5t',
                            },
                        },
                    },
                },
            };

            initSheetFormulaData(formulaData, unitId, sheetId, cellMatrix);
            expect(formulaData).toStrictEqual(result);
        });

        it('preserves Excel shared formula ids with relative offsets', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';

            const formulaData: IFormulaData = {
                [unitId]: {},
            };

            const cellValue = {
                5: {
                    4: {
                        v: 0,
                        f: '=E$4+$D6',
                        si: '0',
                    },
                    5: {
                        v: 1,
                        si: '0',
                    },
                },
                8: {
                    5: {
                        v: 2,
                        si: '0',
                    },
                },
            };

            const cellMatrix = new ObjectMatrix<Nullable<ICellData>>(cellValue);

            initSheetFormulaData(formulaData, unitId, sheetId, cellMatrix);

            expect(formulaData[unitId]?.[sheetId]).toEqual({
                5: {
                    4: {
                        f: '=E$4+$D6',
                        si: '0',
                    },
                    5: {
                        f: '=E$4+$D6',
                        si: '0',
                        x: 1,
                        y: 0,
                    },
                },
                8: {
                    5: {
                        f: '=E$4+$D6',
                        si: '0',
                        x: 1,
                        y: 3,
                    },
                },
            });
        });
    });
});
