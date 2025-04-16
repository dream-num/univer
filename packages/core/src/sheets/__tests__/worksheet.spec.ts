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

import type { Univer } from '../../univer';
import type { IRange, IWorkbookData } from '../typedef';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DisposableCollection } from '../../shared/lifecycle';
import { CellValueType } from '../../types/enum';
import { LocaleType } from '../../types/enum/locale-type';
import { RANGE_TYPE } from '../typedef';
import { extractPureTextFromCell, type Worksheet } from '../worksheet';
import { createCoreTestBed } from './create-core-test-bed';

describe('test worksheet', () => {
    let univer: Univer;
    let worksheet: Worksheet;
    let caseDisposable: DisposableCollection;

    function prepare(workbookData?: IWorkbookData) {
        const testBed = createCoreTestBed(workbookData);
        univer = testBed.univer;
        worksheet = testBed.sheet.getActiveSheet()!;
    }

    afterEach(() => {
        univer.dispose();
        caseDisposable.dispose();
    });

    describe('test "worksheet.iterateByRow"', () => {
        const TEST_WORKBOOK_DATA_WITH_MERGED_CELL: IWorkbookData = {
            id: 'test',
            appVersion: '3.0.0-alpha',
            sheets: {
                sheet1: {
                    id: 'sheet1',
                    mergeData: [
                        { startRow: 0, endRow: 0, startColumn: 1, endColumn: 2 },
                    ],
                    cellData: {
                        0: {
                            0: {
                                v: 'A1',
                            },
                            1: {
                                v: 'B1:C1',
                            },
                        },
                        1: {
                            // should skip over empty cells
                            // 0: {
                            //     v: 'A1',
                            // },
                            1: {
                                v: 'B2',
                            },
                            2: {
                                v: 'C2',
                            },
                        },
                    },
                },
            },
            locale: LocaleType.ZH_CN,
            name: 'TEST_WORKBOOK_DATA_WITH_MERGED_CELL',
            sheetOrder: ['sheet1'],
            styles: {},
        };

        beforeEach(() => {
            prepare(TEST_WORKBOOK_DATA_WITH_MERGED_CELL);
            caseDisposable = new DisposableCollection();
        });

        it('should "iteratorByRow" work with merged cells', () => {
            // This interceptor just returns the raw cell data.
            worksheet.__interceptViewModel((viewModel) => {
                const cellInterceptorDisposable = viewModel.registerCellContentInterceptor({
                    getCell(row, col) {
                        return worksheet.getCellRaw(row, col);
                    },
                });

                caseDisposable.add(cellInterceptorDisposable);
            });

            const range: IRange = { startRow: 0, startColumn: 0, endRow: 1, endColumn: 2, rangeType: RANGE_TYPE.NORMAL };
            const iterator1 = worksheet.iterateByRow(range)[Symbol.iterator]();

            const value1 = iterator1.next();
            expect(value1.done).toBeFalsy();
            expect(value1.value.value).toEqual({ v: 'A1' });

            const value2 = iterator1.next();
            expect(value2.done).toBeFalsy();
            expect(value2.value.value).toEqual({ v: 'B1:C1' });

            const value3 = iterator1.next();
            expect(value3.done).toBeFalsy();
            expect(value3.value.value).toEqual({ v: 'B2' });

            const value4 = iterator1.next();
            expect(value4.done).toBeFalsy();
            expect(value4.value.value).toEqual({ v: 'C2' });

            const value5 = iterator1.next();
            expect(value5.done).toBeTruthy();
            expect(value5.value).toBeUndefined();
        });
    });

    describe('test "worksheet.iterateByColumn"', () => {
        const TEST_WORKBOOK_DATA_WITH_MERGED_CELL: IWorkbookData = {
            id: 'test',
            appVersion: '3.0.0-alpha',
            sheets: {
                sheet1: {
                    id: 'sheet1',
                    mergeData: [
                        { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
                    ],
                    cellData: {
                        0: {
                            0: {
                                v: 'A1:B2',
                            },
                            2: {
                                v: 'C1',
                            },
                        },
                        1: {

                            2: {
                                v: 'C2',
                            },
                        },
                        2: {
                            0: {
                                v: 'A3',
                            },
                            1: {
                                v: 'B3',
                            },
                        },
                    },
                },
            },
            locale: LocaleType.ZH_CN,
            name: 'TEST_WORKBOOK_DATA_WITH_MERGED_CELL',
            sheetOrder: ['sheet1'],
            styles: {},
        };

        beforeEach(() => {
            prepare(TEST_WORKBOOK_DATA_WITH_MERGED_CELL);
            caseDisposable = new DisposableCollection();
        });

        it('should "iterateByColumn" work with merged cells', () => {
            // This interceptor just returns the raw cell data.
            worksheet.__interceptViewModel((viewModel) => {
                const cellInterceptorDisposable = viewModel.registerCellContentInterceptor({
                    getCell(row, col) {
                        return worksheet.getCellRaw(row, col);
                    },
                });

                caseDisposable.add(cellInterceptorDisposable);
            });

            const range: IRange = { startRow: 0, startColumn: 0, endRow: 2, endColumn: 2, rangeType: RANGE_TYPE.NORMAL };
            const iterator1 = worksheet.iterateByColumn(range)[Symbol.iterator]();

            const value1 = iterator1.next();
            expect(value1.done).toBeFalsy();
            expect(value1.value.value).toEqual({ v: 'A1:B2' });

            const value2 = iterator1.next();
            expect(value2.done).toBeFalsy();
            expect(value2.value.value).toEqual({ v: 'A3' });

            const value3 = iterator1.next();
            expect(value3.done).toBeFalsy();
            expect(value3.value.value).toEqual({ v: 'B3' });

            const value4 = iterator1.next();
            expect(value4.done).toBeFalsy();
            expect(value4.value.value).toEqual({ v: 'C1' });

            const value5 = iterator1.next();
            expect(value5.done).toBeFalsy();
            expect(value5.value.value).toEqual({ v: 'C2' });

            const value6 = iterator1.next();
            expect(value6.done).toBeTruthy();
            expect(value6.value).toBeUndefined();
        });
    });
});

describe('test "extractPureTextFromCell"', () => {
    it('should extract from rich text', () => {
        expect(extractPureTextFromCell({
            p: {
                id: 'd',
                body: {
                    dataStream: 'Some rich\ntext.',
                    textRuns: [
                        {
                            st: 0,
                            ed: 5,
                            ts: {
                                cl: {
                                    rgb: 'rgb(92,92,92)',
                                },
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
            },
        })).toBe('Some rich\ntext.');
    });

    it('should extract from formula and plain text', () => {
        expect(extractPureTextFromCell({ v: 6, f: '=SUM(3, 3)' })).toBe('6');
    });

    it('should support number and boolean values', () => {
        expect(extractPureTextFromCell({ v: false })).toBe('FALSE');
        expect(extractPureTextFromCell({ v: true })).toBe('TRUE');
        expect(extractPureTextFromCell({ v: 1 })).toBe('1');
    });

    describe('test "CellType"', () => {
        it('should return boolean literal when cell type is boolean', () => {
            expect(extractPureTextFromCell({ t: CellValueType.BOOLEAN, v: 1 })).toBe('TRUE');
            expect(extractPureTextFromCell({ t: CellValueType.BOOLEAN, v: 0 })).toBe('FALSE');
        });
    });
});
