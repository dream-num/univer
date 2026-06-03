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
import type { Worksheet } from '../worksheet';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DisposableCollection } from '../../shared/lifecycle';
import { CellValueType, TextDirection } from '../../types/enum';
import { LocaleType } from '../../types/enum/locale-type';
import { RANGE_TYPE } from '../typedef';
import { extractPureTextFromCell } from '../worksheet';
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

    describe('test "worksheet.getComposedCellStyle"', () => {
        const TEST_WORKBOOK_DATA_WITH_DEFAULT_STYLE: IWorkbookData = {
            id: 'test',
            appVersion: '3.0.0-alpha',
            sheets: {
                sheet1: {
                    id: 'sheet1',
                    defaultStyle: {
                        fs: 20,
                        cl: {
                            rgb: 'red',
                        },
                        bd: {
                            t: {
                                s: 1,
                                cl: {
                                    rgb: '#000',
                                },
                            },
                            b: {
                                s: 1,
                                cl: {
                                    rgb: '#000',
                                },
                            },
                            l: {
                                s: 1,
                                cl: {
                                    rgb: '#000',
                                },
                            },
                            r: {
                                s: 1,
                                cl: {
                                    rgb: '#000',
                                },
                            },
                        },
                    },
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
            name: 'TEST_WORKBOOK_DATA_WITH_DEFAULT_STYLE',
            sheetOrder: ['sheet1'],
            styles: {},
        };

        beforeEach(() => {
            prepare(TEST_WORKBOOK_DATA_WITH_DEFAULT_STYLE);
            caseDisposable = new DisposableCollection();
        });

        it('test style', () => {
            const style = worksheet.getComposedCellStyle(0, 0);
            expect(style).toEqual({
                fs: 20,
                cl: {
                    rgb: 'red',
                },
                bd: {
                    t: {
                        s: 1,
                        cl: {
                            rgb: '#000',
                        },
                    },
                    b: {
                        s: 1,
                        cl: {
                            rgb: '#000',
                        },
                    },
                    l: {
                        s: 1,
                        cl: {
                            rgb: '#000',
                        },
                    },
                    r: {
                        s: 1,
                        cl: {
                            rgb: '#000',
                        },
                    },
                },
            });
        });
    });

    describe('per-paragraph RTL auto-detection in rich-text cells', () => {
        // The fixture below mimics a multi-line / list cell so we can
        // verify each paragraph gets its own direction based on its first-
        // strong character. The actual paragraph break character (`\r`)
        // sits at each `startIndex`; the slice between previous break and
        // current `startIndex` is the paragraph's content.
        beforeEach(() => {
            prepare();
            caseDisposable = new DisposableCollection();
        });

        function makeRichTextCellWithThreeLines() {
            const lines = ['كتاب', 'مرحبا', 'Hello'];
            let cursor = 0;
            const paragraphs = lines.map((line) => {
                cursor += line.length;
                const entry = { startIndex: cursor, paragraphStyle: {} };
                cursor += 1;
                return entry;
            });
            return {
                p: {
                    id: '__paragraph_test__',
                    body: {
                        dataStream: `${lines.join('\r')}\r\n`,
                        paragraphs,
                    },
                    documentStyle: {},
                },
            } as any;
        }

        it('flips each paragraph independently from its own first-strong char', () => {
            const cell = makeRichTextCellWithThreeLines();
            const model = worksheet.getCellDocumentModel(cell, {});
            const paragraphs = model?.documentModel?.getBody()?.paragraphs ?? [];
            expect(paragraphs[0]?.paragraphStyle?.direction).toBe(TextDirection.RIGHT_TO_LEFT);
            expect(paragraphs[1]?.paragraphStyle?.direction).toBe(TextDirection.RIGHT_TO_LEFT);
            expect(paragraphs[2]?.paragraphStyle?.direction).toBe(TextDirection.LEFT_TO_RIGHT);
        });

        it('does not mutate the source `cell.p` snapshot when injecting direction', () => {
            const cell = makeRichTextCellWithThreeLines();
            worksheet.getCellDocumentModel(cell, {});
            // The snapshot the renderer was given must stay clean so the
            // next render (potentially with different content) can re-run
            // first-strong detection.
            for (const p of cell.p.body.paragraphs) {
                expect(p.paragraphStyle).toEqual({});
            }
        });

        it('lets explicit cell-level `style.td` override per-paragraph auto-detection', () => {
            const cell = makeRichTextCellWithThreeLines();
            const model = worksheet.getCellDocumentModel(cell, { td: TextDirection.LEFT_TO_RIGHT });
            const paragraphs = model?.documentModel?.getBody()?.paragraphs ?? [];
            for (const p of paragraphs) {
                expect(p.paragraphStyle?.direction).toBe(TextDirection.LEFT_TO_RIGHT);
            }
        });

        it('lets an empty paragraph inherit the previous paragraph\'s direction', () => {
            // Two paragraphs: a non-empty RTL one and a freshly-split
            // empty one (what BreakLine creates when the user presses
            // Enter at the end of an Arabic line). Without inheritance,
            // the empty paragraph would silently fall back to LTR and
            // the caret would jump to the wrong visual edge.
            const lines = ['كتاب', ''];
            let cursor = 0;
            const paragraphs = lines.map((line) => {
                cursor += line.length;
                const entry = { startIndex: cursor, paragraphStyle: {} };
                cursor += 1;
                return entry;
            });
            const cell = {
                p: {
                    id: '__paragraph_test__',
                    body: {
                        dataStream: `${lines.join('\r')}\r\n`,
                        paragraphs,
                    },
                    documentStyle: {},
                },
            } as any;
            const model = worksheet.getCellDocumentModel(cell, {});
            const resolved = model?.documentModel?.getBody()?.paragraphs ?? [];
            expect(resolved[0]?.paragraphStyle?.direction).toBe(TextDirection.RIGHT_TO_LEFT);
            expect(resolved[1]?.paragraphStyle?.direction).toBe(TextDirection.RIGHT_TO_LEFT);
        });

        it('preserves an already-declared paragraph direction from the model', () => {
            // An author / clipboard paste might pin a specific paragraph
            // to a direction. That declaration should always win, even
            // when the paragraph's first-strong character disagrees.
            const cell = {
                p: {
                    id: '__paragraph_test__',
                    body: {
                        dataStream: 'Hello\r\n',
                        paragraphs: [{
                            startIndex: 5,
                            paragraphStyle: { direction: TextDirection.RIGHT_TO_LEFT },
                        }],
                    },
                    documentStyle: {},
                },
            } as any;
            const model = worksheet.getCellDocumentModel(cell, {});
            const paragraphs = model?.documentModel?.getBody()?.paragraphs ?? [];
            expect(paragraphs[0]?.paragraphStyle?.direction).toBe(TextDirection.RIGHT_TO_LEFT);
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
