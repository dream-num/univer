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

import type { ICellData, Injector, IWorkbookData, Nullable, Univer } from '@univerjs/core';
import { LocaleType, ObjectMatrix, RANGE_TYPE } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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
            },
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
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
            it('delete formula with id', () => {
                const unitId = 'test';
                const sheetId = 'sheet1';
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

                expect(formulaDataModel.getArrayFormulaCellData().test?.sheet1).toEqual({
                    0: {
                        0: null,
                        1: null,
                    },
                    1: {
                        0: null,
                        1: null,
                    },
                });
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

            it('should expose calculate data and per-sheet formula data', () => {
                const calculateData = formulaDataModel.getCalculateData();
                expect(calculateData.allUnitData.test?.sheet1.rowCount).toBeGreaterThan(0);
                expect(calculateData.unitSheetNameMap.test?.Sheet1).toBe('sheet1');

                const sheetFormulaData = formulaDataModel.getSheetFormulaData('test', 'sheet1');
                expect(sheetFormulaData?.[0]?.[0]?.f).toBe('=A1');
            });
        });
    });

    describe('function initSheetFormulaData', () => {
        it('init formula data', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';

            const formulaData = {
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
    });
});
