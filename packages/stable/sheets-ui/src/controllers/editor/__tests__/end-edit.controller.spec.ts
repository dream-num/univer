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

import type { ICellData, IDocumentData, Univer, Workbook } from '@univerjs/core';
import type { IFunctionService } from '@univerjs/engine-formula';
import { CellValueType, IConfigService, IContextService, Injector, LocaleService, LocaleType, Tools } from '@univerjs/core';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { DEFAULT_TEXT_FORMAT_EXCEL } from '@univerjs/engine-numfmt';
import { SpreadsheetSkeleton } from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { normalizeString } from '../../utils/char-tools';
import { getCellDataByInput, isRichText } from '../editing.render-controller';
import { createTestBed } from './create-test-bed';
import { IMockFunctionService, MockFunctionService } from './mock-function.service';

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
                    horizontalAlign: 0,
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
        renderConfig: {
            centerAngle: 0,
            horizontalAlign: 0,
            vertexAngle: 0,
            verticalAlign: 0,
            wrapStrategy: 0,
            zeroWidthParagraphBreak: 1,
        },
        marginTop: 0,
        marginBottom: 2,
        marginRight: 2,
        marginLeft: 2,
    },
};

vi.mock('@univerjs/engine-formula', async () => {
    const actual = await vi.importActual('@univerjs/engine-formula');
    const { IMockFunctionService, MockFunctionService } = await import(
        './mock-function.service'
    );

    return {
        ...actual,
        IMockFunctionService,
        MockFunctionService,
    };
});

describe('Test EndEditController', () => {
    let univer: Univer;
    let workbook: Workbook;
    let get: Injector['get'];
    let localeService: LocaleService;
    let contextService: IContextService;
    let lexerTreeBuilder: LexerTreeBuilder;
    let spreadsheetSkeleton: SpreadsheetSkeleton;
    let configService: IConfigService;
    let getCellDataByInputCell: (cell: ICellData, inputCell: ICellData) => ICellData | null;
    let normalizeStringByLexer: (str: string) => string;

    beforeEach(() => {
        const testBed = createTestBed(undefined, [
            [IMockFunctionService, { useClass: MockFunctionService }],
        ]);

        univer = testBed.univer;
        workbook = testBed.sheet;
        get = testBed.get;

        localeService = get(LocaleService);
        contextService = get(IContextService);
        lexerTreeBuilder = new LexerTreeBuilder();
        configService = get(IConfigService);
        const injector = get(Injector);

        const worksheet = workbook.getActiveSheet()!;
        spreadsheetSkeleton = new SpreadsheetSkeleton(
            worksheet,
            workbook.getStyles(),
            localeService,
            contextService,
            configService,
            injector
        );

        getCellDataByInputCell = (cell: ICellData, inputCell: ICellData) => {
            const documentLayoutObject = spreadsheetSkeleton.getCellDocumentModelWithFormula(inputCell);
            if (!documentLayoutObject) {
                throw new Error('documentLayoutObject is undefined');
            }

            return getCellDataByInput(
                cell,
                documentLayoutObject.documentModel?.getSnapshot(),
                lexerTreeBuilder,
                localeService,
                get(IMockFunctionService) as IFunctionService,
                workbook.getStyles()
            );
        };

        normalizeStringByLexer = (str: string) => {
            // @ts-ignore
            return normalizeString(str, lexerTreeBuilder, LocaleType.ZH_CN, get(IMockFunctionService));
        };
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('Function getCellDataByInput', () => {
        it('Normal cell', () => {
            const cell = {
                v: 1,
            };

            const inputCell = {
                v: 2,
            };

            const cellData = getCellDataByInputCell(cell, inputCell);
            const target = { v: '2', f: null, si: null, p: null };

            expect(cellData).toEqual({
                ...target,
            });
        });
        it('Text cell input 001', () => {
            const cell: ICellData = {
                s: {
                    n: {
                        pattern: DEFAULT_TEXT_FORMAT_EXCEL,
                    },
                },
                t: null,
            };

            const inputCell = {
                v: '001',
            };

            const cellData = getCellDataByInputCell(cell, inputCell);
            const target = {
                v: '001',
                t: CellValueType.STRING,
                s: {
                    n: {
                        pattern: DEFAULT_TEXT_FORMAT_EXCEL,
                    },
                },
                f: null,
                si: null,
                p: null,
            };

            expect(cellData).toEqual({
                ...target,
            });
        });
        it('Text cell input 2024-10-28', () => {
            const cell: ICellData = {
                s: {
                    n: {
                        pattern: DEFAULT_TEXT_FORMAT_EXCEL,
                    },
                },
                t: null,
            };

            const inputCell = {
                v: '2024-10-28',
            };

            const cellData = getCellDataByInputCell(cell, inputCell);
            const target = {
                v: '2024-10-28',
                t: CellValueType.STRING,
                s: {
                    n: {
                        pattern: DEFAULT_TEXT_FORMAT_EXCEL,
                    },
                },
                f: null,
                si: null,
                p: null,
            };

            expect(cellData).toEqual({
                ...target,
            });
        });
        it('Text cell input formula', () => {
            const cell: ICellData = {
                s: {
                    n: {
                        pattern: DEFAULT_TEXT_FORMAT_EXCEL,
                    },
                },
                t: null,
            };

            const inputCell = {
                v: '=SUM(1)',
            };

            const cellData = getCellDataByInputCell(cell, inputCell);
            const target = {
                v: '=SUM(1)',
                t: CellValueType.STRING,
                s: {
                    n: {
                        pattern: DEFAULT_TEXT_FORMAT_EXCEL,
                    },
                },
                f: null,
                si: null,
                p: null,
            };

            expect(cellData).toEqual({
                ...target,
            });
        });
        it('Text cell input richText', () => {
            const cell: ICellData = {
                s: {
                    n: {
                        pattern: DEFAULT_TEXT_FORMAT_EXCEL,
                    },
                },
                t: 1,
                v: '10',
            };

            const inputCell = {
                p: {
                    id: '__INTERNAL_EDITOR__DOCS_NORMAL',
                    documentStyle: {
                        pageSize: {
                            width: 73,
                            height: undefined,
                        },
                        marginTop: 1,
                        marginBottom: 2,
                        marginRight: 2,
                        marginLeft: 2,
                        renderConfig: {
                            horizontalAlign: 0,
                            verticalAlign: 0,
                            centerAngle: 0,
                            vertexAngle: 0,
                            wrapStrategy: 0,
                        },
                    },
                    body: {
                        dataStream: '10\r\n',
                        textRuns: [
                            { ts: { ff: 'Arial', fs: 11 }, st: 0, ed: 1 },
                            { st: 1, ed: 2, ts: { ff: 'Arial', fs: 11, cl: { rgb: '#B20000' } } },
                        ],
                        paragraphs: [
                            { startIndex: 2, paragraphStyle: { horizontalAlign: 0 } },
                        ],
                        sectionBreaks: [
                            { startIndex: 3 },
                        ],
                        customRanges: [],
                        customDecorations: [],
                    },
                    drawings: {},
                    drawingsOrder: [],
                    settings: {
                        zoomRatio: 1,
                    },
                },
            };

            const cellData = getCellDataByInputCell(cell, inputCell);
            const target = {
                v: '10',
                t: CellValueType.STRING,
                s: {
                    n: {
                        pattern: DEFAULT_TEXT_FORMAT_EXCEL,
                    },
                },
                f: null,
                si: null,
                p: {
                    id: '__INTERNAL_EDITOR__DOCS_NORMAL',
                    documentStyle: {
                        pageSize: {
                            width: Infinity,
                            height: Infinity,
                        },
                        marginTop: 0,
                        marginBottom: 2,
                        marginRight: 2,
                        marginLeft: 2,
                        renderConfig: {
                            horizontalAlign: 0,
                            verticalAlign: 0,
                            centerAngle: 0,
                            vertexAngle: 0,
                            wrapStrategy: 0,
                            zeroWidthParagraphBreak: 1,
                        },
                    },
                    body: {
                        dataStream: '10\r\n',
                        textRuns: [
                            { ts: { ff: 'Arial', fs: 11 }, st: 0, ed: 1 },
                            { st: 1, ed: 2, ts: { ff: 'Arial', fs: 11, cl: { rgb: '#B20000' } } },
                        ],
                        paragraphs: [
                            { startIndex: 2, paragraphStyle: { horizontalAlign: 0 } },
                        ],
                        sectionBreaks: [
                            { startIndex: 3 },
                        ],
                        customRanges: [],
                        customDecorations: [],
                    },
                    drawings: {},
                    drawingsOrder: [],
                    settings: {
                        zoomRatio: 1,
                    },
                },
            };

            expect(cellData).toEqual({
                ...target,
            });
        });
        it('Rich text cell', () => {
            const cell = {
                v: 1,
            };
            const inputCell = {
                p: richTextDemo,
            };

            const cellData = getCellDataByInputCell(cell, inputCell);
            const target = { v: null, f: null, si: null, p: richTextDemo, t: undefined };
            expect(cellData).toEqual({
                ...target,
            });
        });
        it('Formula cell', () => {
            const cell = {
                v: 1,
            };
            const inputCell = {
                f: '=SUM(1)',
            };

            const cellData = getCellDataByInputCell(cell, inputCell);
            const target = { v: null, f: '=SUM(1)', si: null, p: null, t: undefined };
            expect(cellData).toEqual({
                ...target,

            });
        });
        it('Clear formula cell', () => {
            const cell = {
                f: '=H18:H25',
                v: 0,
                t: 2,
            };

            const inputCell = {
                v: '',
            };

            const cellData = getCellDataByInputCell(cell, inputCell);
            const target = { v: '', f: null, si: null, p: null, t: undefined };
            expect(cellData).toEqual({
                ...target,
            });
        });

        it('Clear formula cell with rich text', () => {
            const cell = {
                f: '=H18:H25',
                v: 0,
                t: 2,
            };

            const inputCell = {
                p: richTextDemo,
            };

            const cellData = getCellDataByInputCell(cell, inputCell);
            const target = { v: null, f: null, si: null, p: richTextDemo, t: undefined };
            expect(cellData).toEqual({
                ...target,
            });
        });

        it('Input force string, normal string', () => {
            const cell = {
                v: null,
            };

            let cellData = getCellDataByInputCell(cell, { v: "'test" });
            let target = { v: 'test', t: CellValueType.FORCE_STRING, f: null, si: null, p: null };
            expect(cellData).toEqual({
                ...target,
            });

            cellData = getCellDataByInputCell(cell, { v: "'1" });
            target = { v: '1', t: CellValueType.FORCE_STRING, f: null, si: null, p: null };
            expect(cellData).toEqual({
                ...target,
            });

            cellData = getCellDataByInputCell(cell, { v: "'=SUM" });
            target = { v: '=SUM', t: CellValueType.FORCE_STRING, f: null, si: null, p: null };
            expect(cellData).toEqual({
                ...target,
            });
        });

        it('Function normalizeString', () => {
            // boolean
            expect(normalizeStringByLexer('ｔｒｕｅ')).toEqual('TRUE');

            // force string
            expect(normalizeStringByLexer('＇ｔｒｕｅ')).toEqual("'ｔｒｕｅ");

            // formatted number
            expect(normalizeStringByLexer('１００％')).toEqual('100%');
            expect(normalizeStringByLexer('＄１００')).toEqual('$100');
            expect(normalizeStringByLexer('０．１１')).toEqual('0.11');
            expect(normalizeStringByLexer('２０２０－１－１')).toEqual('2020-1-1');
            expect(normalizeStringByLexer('１０ｅ＋１')).toEqual('10e+1');

            // formula
            expect(normalizeStringByLexer('＝ｗ')).toEqual('=ｗ');
            expect(normalizeStringByLexer('=a1')).toEqual('=A1');
            expect(normalizeStringByLexer('=tan(sheet001!a1')).toEqual('=TAN(sheet001!A1');

            expect(normalizeStringByLexer('＝＂１＂')).toEqual('="１"');
            expect(normalizeStringByLexer('＝＇１＇')).toEqual("=＇１'"); // invalid in Excel
            expect(normalizeStringByLexer('＝“２”')).toEqual('=“２”');
            expect(normalizeStringByLexer('＝“ｗ”')).toEqual('=“ｗ”');
            expect(normalizeStringByLexer('＝“１')).toEqual('=“１');
            expect(normalizeStringByLexer('=‘１’')).toEqual('=‘１’');
            expect(normalizeStringByLexer('=‘１')).toEqual('=‘１');

            expect(normalizeStringByLexer('＝１００％＋２＋ｗ')).toEqual('=100%+2+ｗ');
            expect(normalizeStringByLexer('＝ｔｒｕｅ＋１')).toEqual('=TRUE+1');
            expect(normalizeStringByLexer('＝ｔｒｕｅ＋ｗ')).toEqual('=TRUE+ｗ');
            expect(normalizeStringByLexer('＝ｉｆ')).toEqual('=ｉｆ');
            expect(normalizeStringByLexer('＝ｉｆ（')).toEqual('=IF('); // invalid in Excel
            expect(normalizeStringByLexer('＝＠ｉｆ（ｔｒｕｅ＝１，＂　Ａ＄，＂＆＂＋－×＝＜＞％＄＠＆＊＃＂，＂false＂）')).toEqual('=@IF(TRUE=1,"　Ａ＄，"&"＋－×＝＜＞％＄＠＆＊＃","false")');
            expect(normalizeStringByLexer('＝ｉｆ（０，１，”３“）')).toEqual('=IF(0,1,”３“)');
            expect(normalizeStringByLexer('＝ｉｆ（Ａ１＝＂＊２？３＂，１，２）')).toEqual('=IF(A1="＊２？３",1,2)');
            expect(normalizeStringByLexer('＝｛１，２｝')).toEqual('={1,2}');

            // normal string
            expect(normalizeStringByLexer('１００％＋２－×＝＜＞％＄＠＆＊＃')).toEqual('１００％＋２－×＝＜＞％＄＠＆＊＃');
            expect(normalizeStringByLexer('＄ｗ')).toEqual('＄ｗ');
            expect(normalizeStringByLexer('ｔｒｕｅ＋１')).toEqual('ｔｒｕｅ＋１');

            // sheet name
            expect(normalizeStringByLexer("='Sheet1（副本）'!F20:H29")).toEqual("='Sheet1（副本）'!F20:H29");

            // TODO@Dushusir: Differences from Excel, pending,
            // '＝＠＠ｉｆ＠ｓ'
            // '＝＠＠ｉｆ＋＠ｓ'
            // '=SUM(  "1"  ,  2  )'
            // '＝＋－ｉｆ'
            // eslint-disable-next-line no-irregular-whitespace
            // '＝ｉｆ（１，“Ａ”，“false　”）'
            // '＝Ａ１＋Ｂ２－Ｃ３＊（Ｄ４＞＝Ｅ５）／（Ｆ６＜Ｇ７）'
        });

        it('test isRichText util', () => {
            const cellBody = {
                dataStream: 'qqqqqq\r\n',
                textRuns: [
                    {
                        ts: {
                            fs: 18,
                        },
                        st: 0,
                        ed: 8,
                    },
                ],
                paragraphs: [
                    {
                        startIndex: 8,
                        paragraphStyle: {
                            horizontalAlign: 0,
                        },
                    },
                ],
                customRanges: [],
                customDecorations: [],
            };
            const isRichTextRes = isRichText(cellBody);
            // textRuns acts on the entire string
            expect(isRichTextRes).toBe(false);
            const anotherCellBody = Tools.deepClone(cellBody);
            anotherCellBody.dataStream = `${anotherCellBody.dataStream}qqq`;
            // textRuns works on parts of strings
            const isRichTextRes2 = isRichText(anotherCellBody);
            expect(isRichTextRes2).toBe(true);

            const cellBody2 = {
                dataStream: 'true\r\n',
                textRuns: [
                    {
                        ts: {},
                        st: 0,
                        ed: 0,
                    },
                ],
                paragraphs: [
                    {
                        startIndex: 4,
                        paragraphStyle: {
                            horizontalAlign: 0,
                        },
                    },
                ],
                customBlocks: [],
                customRanges: [],
            };

            const isRichTextWithCellBody2 = isRichText(cellBody2);
            expect(isRichTextWithCellBody2).toBe(false);
        });

        describe('normalizeStringByLexer', () => {
            it('should convert leading . to 0.', () => {
                expect(normalizeStringByLexer('=.07/0.1')).toBe('=0.07/0.1');
            });

            it('should remove unnecessary trailing zeros', () => {
                expect(normalizeStringByLexer('=1.0+2.00')).toBe('=1+2');
            });

            it('should not modify normal cell references', () => {
                expect(normalizeStringByLexer('=A1+B2')).toBe('=A1+B2');
                expect(normalizeStringByLexer('=Sheet1!A1')).toBe('=Sheet1!A1');
            });

            it('should not modify function names', () => {
                expect(normalizeStringByLexer('=SUM(A1:A10)')).toBe('=SUM(A1:A10)');
                expect(normalizeStringByLexer('=IF(A1>0, "Yes", "No")')).toBe('=IF(A1>0, "Yes", "No")');
            });

            it('should handle negative numbers', () => {
                expect(normalizeStringByLexer('=-.5*-2.00')).toBe('=-0.5*-2');
            });

            it('should handle numbers with leading zeros', () => {
                expect(normalizeStringByLexer('=001.00+000.20')).toBe('=1+0.2');
            });

            it('should handle percentages', () => {
                expect(normalizeStringByLexer('=50% + .5')).toBe('=50% + 0.5');
            });

            it('should handle scientific notation', () => {
                expect(normalizeStringByLexer('=1.00E+03')).toBe('=1000');
                expect(normalizeStringByLexer('=1e3 + 2E-2')).toBe('=1000 + 0.02');

                expect(normalizeStringByLexer('=1e20 + 2E-2')).toBe('=100000000000000000000 + 0.02');
                // Excel =1.1E+21 + 0.02, numfmt =1.1e+21 + 0.02
                expect(normalizeStringByLexer('=11e20 + 2E-2')).toBe('=1.1e+21 + 0.02');
                // Excel =1E+21 + 0.02, numfmt =1e+21 + 0.02
                expect(normalizeStringByLexer('=1e21 + 2E-2')).toBe('=1e+21 + 0.02');

                expect(normalizeStringByLexer('=2e-6')).toBe('=0.000002');
                // Excel =0.0000002, numfmt =2e-7
                expect(normalizeStringByLexer('=2e-7')).toBe('=2e-7');
                // Excel =1E+21 + 0.0000000000000000002, numfmt =1e+21 + 2e-19
                expect(normalizeStringByLexer('=1E+21 + 2E-19')).toBe('=1e+21 + 2e-19');
                // Excel =1E+21 + 2E-20, numfmt =1e+21 + 2e-20
                expect(normalizeStringByLexer('=1E+21 + 0.2E-19')).toBe('=1e+21 + 2e-20');
                // Excel =1E+21 + 2E-20, numfmt =1e+21 + 2e-20
                expect(normalizeStringByLexer('=1E+21 + 2E-20')).toBe('=1e+21 + 2e-20');
            });

            it('should handle dates', () => {
                expect(normalizeStringByLexer('="2023-01-01"')).toBe('="2023-01-01"');
            });

            it('should handle complex expressions', () => {
                expect(normalizeStringByLexer('=SUM(A1:A10)/.5 - 2.00')).toBe('=SUM(A1:A10)/0.5 - 2');
            });

            it('should not modify logical operators', () => {
                expect(normalizeStringByLexer('=A1>=B2')).toBe('=A1>=B2');
            });

            it('should handle names with numbers', () => {
                expect(normalizeStringByLexer('=Rate1 + Rate2')).toBe('=Rate1 + Rate2');
            });

            it('should handle underscores in names', () => {
                expect(normalizeStringByLexer('=_myVar + another_var')).toBe('=_myVar + another_var');
            });

            it('should handle numbers adjacent to letters', () => {
                expect(normalizeStringByLexer('=A1*B2')).toBe('=A1*B2');
                expect(normalizeStringByLexer('=C3/2.0')).toBe('=C3/2');
            });

            it('should handle decimal numbers without leading zero', () => {
                expect(normalizeStringByLexer('=.123')).toBe('=0.123');
            });

            it('should handle multiple numbers in expression', () => {
                expect(normalizeStringByLexer('=.1 + .2 + .3')).toBe('=0.1 + 0.2 + 0.3');
            });

            it('should not modify cell ranges', () => {
                expect(normalizeStringByLexer('=SUM(A1:B2)')).toBe('=SUM(A1:B2)');
            });

            it('should handle complex numbers', () => {
                expect(normalizeStringByLexer('=COMPLEX(0, .5)')).toBe('=COMPLEX(0, 0.5)');
            });

            it('should handle percentage calculations', () => {
                expect(normalizeStringByLexer('=.5*50%')).toBe('=0.5*50%');
            });

            it('should handle brackets', () => {
                expect(normalizeStringByLexer('=(.5 + .25)/(.1)')).toBe('=(0.5 + 0.25)/(0.1)');
            });

            it('should not modify text outside of formulas', () => {
                expect(normalizeStringByLexer('Just some text.')).toBe('Just some text.');
            });

            it('should handle formulas starting with + or -', () => {
                expect(normalizeStringByLexer('=+1.0+-2.00')).toBe('=+1+-2'); // Follows Google Sheets' behavior
            });

            it('should handle numbers in logical expressions', () => {
                expect(normalizeStringByLexer('=IF(A1>.5, TRUE, FALSE)')).toBe('=IF(A1>0.5, TRUE, FALSE)');
                expect(normalizeStringByLexer('=IF("A1>.5", TRUE, FALSE)')).toBe('=IF("A1>.5", TRUE, FALSE)');
            });

            it('should handle exponents', () => {
                expect(normalizeStringByLexer('=2^0.0')).toBe('=2^0');
            });

            it('should not modify quoted numbers', () => {
                expect(normalizeStringByLexer('="The value is .5"')).toBe('="The value is .5"');
            });

            it('should handle numbers with only zeros', () => {
                expect(normalizeStringByLexer('=0.0 + 0.00')).toBe('=0 + 0');
            });

            it('should handle zero with decimal point', () => {
                expect(normalizeStringByLexer('=0. + .0')).toBe('=0 + 0');
            });

            it('should handle negative numbers with leading zeros', () => {
                expect(normalizeStringByLexer('=-0002.00')).toBe('=-2');
            });

            it('should handle positive numbers with leading zeros', () => {
                expect(normalizeStringByLexer('=+0002.50')).toBe('=+2.5'); // Follows Google Sheets' behavior
            });

            it('should handle escaped quotes in strings', () => {
                expect(normalizeStringByLexer('="He said, ""Hello, .5!"""')).toBe('="He said, ""Hello, .5!"""');
            });
            it('Illegal strings should not be modified', () => {
                expect(normalizeStringByLexer('=SUM(11, 2 2, 33)')).toBe('=SUM(11, 2 2, 33)');
                expect(normalizeStringByLexer('=SUM(11, 123 123, 33)')).toBe('=SUM(11, 123 123, 33)');
            });
        });
    });
});
