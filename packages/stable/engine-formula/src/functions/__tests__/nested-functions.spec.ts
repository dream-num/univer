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

import type { Injector, IWorkbookData } from '@univerjs/core';
import type { LexerNode } from '../../engine/analysis/lexer-node';

import type { BaseAstNode } from '../../engine/ast-node/base-ast-node';
import { LocaleType } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { ErrorType } from '../../basics/error-type';
import { Lexer } from '../../engine/analysis/lexer';
import { AstTreeBuilder } from '../../engine/analysis/parser';
import { Interpreter } from '../../engine/interpreter/interpreter';
import { generateExecuteAstNodeData } from '../../engine/utils/ast-node-tool';
import { IFormulaCurrentConfigService } from '../../services/current-data.service';
import { IFunctionService } from '../../services/function.service';
import { IFormulaRuntimeService } from '../../services/runtime.service';
import { Day } from '../date/day';
import { Edate } from '../date/edate';
import { FUNCTION_NAMES_DATE } from '../date/function-names';
import { Today } from '../date/today';
import { FUNCTION_NAMES_LOGICAL } from '../logical/function-names';
import { Iferror } from '../logical/iferror';
import { Address } from '../lookup/address';
import { Choose } from '../lookup/choose';
import { FUNCTION_NAMES_LOOKUP } from '../lookup/function-names';
import { Xlookup } from '../lookup/xlookup';
import { Xmatch } from '../lookup/xmatch';
import { Fact } from '../math/fact';
import { FUNCTION_NAMES_MATH } from '../math/function-names';
import { Product } from '../math/product';
import { Sum } from '../math/sum';
import { Sumif } from '../math/sumif';
import { Sumifs } from '../math/sumifs';
import { Divided } from '../meta/divided';
import { FUNCTION_NAMES_META } from '../meta/function-names';
import { Minus } from '../meta/minus';
import { Plus } from '../meta/plus';
import { FUNCTION_NAMES_STATISTICAL } from '../statistical/function-names';
import { Max } from '../statistical/max';
import { Min } from '../statistical/min';
import { Concatenate } from '../text/concatenate';
import { FUNCTION_NAMES_TEXT } from '../text/function-names';
import { Len } from '../text/len';
import { T } from '../text/t';
import { Text } from '../text/text';
import { createFunctionTestBed, getObjectValue } from './create-function-test-bed';

const getFunctionsTestWorkbookData = (): IWorkbookData => {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                cellData: {
                    0: {
                        0: {
                            v: 'A',
                            t: 1,
                        },
                        1: {
                            v: 'B',
                            t: 1,
                        },
                        2: {
                            v: 'C',
                            t: 1,
                        },
                        3: {
                            v: 'D',
                            t: 1,
                        },
                        4: {
                            v: '"test"',
                            t: 1,
                        },
                    },
                    1: {
                        0: {
                            v: 44927,
                            t: 2,
                        },
                        1: {
                            v: 101,
                            t: 2,
                        },
                        2: {
                            v: 5,
                            t: 2,
                        },
                        3: {
                            v: 500,
                            t: 2,
                        },
                    },
                    2: {
                        0: {
                            v: 44928,
                            t: 2,
                        },
                        1: {
                            v: 102,
                            t: 2,
                        },
                        2: {
                            v: 3,
                            t: 2,
                        },
                        3: {
                            v: 300,
                            t: 2,
                        },
                    },
                    3: {
                        0: {
                            v: 44929,
                            t: 2,
                        },
                        1: {
                            v: 103,
                            t: 2,
                        },
                        2: {
                            v: 2,
                            t: 2,
                        },
                        3: {
                            v: 200,
                            t: 2,
                        },
                    },
                    4: {
                        0: {
                            v: 44930,
                            t: 2,
                        },
                        1: {
                            v: 104,
                            t: 2,
                        },
                        2: {
                            v: 4,
                            t: 2,
                        },
                        3: {
                            v: 400,
                            t: 2,
                        },
                    },
                    5: {
                        0: {
                            v: 44931,
                            t: 2,
                        },
                        1: {
                            v: 105,
                            t: 2,
                        },
                        2: {
                            v: 1,
                            t: 2,
                        },
                        3: {
                            v: 100,
                            t: 2,
                        },
                    },
                    6: {
                        0: {
                            v: 44932,
                            t: 2,
                        },
                        1: {
                            v: 101,
                            t: 2,
                        },
                        2: {
                            v: 3,
                            t: 2,
                        },
                        3: {
                            v: 300,
                            t: 2,
                        },
                    },
                    7: {
                        0: {
                            v: 44933,
                            t: 2,
                        },
                        1: {
                            v: 102,
                            t: 2,
                        },
                        2: {
                            v: 4,
                            t: 2,
                        },
                        3: {
                            v: 400,
                            t: 2,
                        },
                    },
                    8: {
                        0: {
                            v: 44934,
                            t: 2,
                        },
                        1: {
                            v: 103,
                            t: 2,
                        },
                        2: {
                            v: 5,
                            t: 2,
                        },
                        3: {
                            v: 500,
                            t: 2,
                        },
                    },
                    9: {
                        0: {
                            v: 44935,
                            t: 2,
                        },
                        1: {
                            v: 104,
                            t: 2,
                        },
                        2: {
                            v: 2,
                            t: 2,
                        },
                        3: {
                            v: 200,
                            t: 2,
                        },
                    },
                    10: {
                        0: {
                            v: 1,
                            t: 2,
                        },
                        1: {
                            v: 2,
                            t: 2,
                        },
                        2: {
                            v: 3,
                            t: 2,
                        },
                    },
                    11: {
                        0: {
                            v: '2',
                            t: 4,
                        },
                    },
                    12: {
                        0: {
                            v: '10',
                            t: 1,
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
};
describe('Test nested functions', () => {
    let get: Injector['get'];
    let lexer: Lexer;
    let astTreeBuilder: AstTreeBuilder;
    let interpreter: Interpreter;
    let calculate: (formula: string) => (string | number | boolean | null)[][] | string | number | boolean;

    beforeEach(() => {
        const testBed = createFunctionTestBed(getFunctionsTestWorkbookData());

        get = testBed.get;

        lexer = get(Lexer);
        astTreeBuilder = get(AstTreeBuilder);
        interpreter = get(Interpreter);

        const functionService = get(IFunctionService);

        const formulaCurrentConfigService = get(IFormulaCurrentConfigService);

        const formulaRuntimeService = get(IFormulaRuntimeService);

        formulaCurrentConfigService.load({
            formulaData: {},
            arrayFormulaCellData: {},
            arrayFormulaRange: {},
            forceCalculate: false,
            dirtyRanges: [],
            dirtyNameMap: {},
            dirtyDefinedNameMap: {},
            dirtyUnitFeatureMap: {},
            dirtyUnitOtherFormulaMap: {},
            excludedCell: {},
            allUnitData: {
                [testBed.unitId]: testBed.sheetData,
            },
        });

        const sheetItem = testBed.sheetData[testBed.sheetId];

        formulaRuntimeService.setCurrent(
            0,
            0,
            sheetItem.rowCount,
            sheetItem.columnCount,
            testBed.sheetId,
            testBed.unitId
        );

        functionService.registerExecutors(
            new Iferror(FUNCTION_NAMES_LOGICAL.IFERROR),
            new Xlookup(FUNCTION_NAMES_LOOKUP.XLOOKUP),
            new Max(FUNCTION_NAMES_STATISTICAL.MAX),
            new Sumif(FUNCTION_NAMES_MATH.SUMIF),
            new Sumifs(FUNCTION_NAMES_MATH.SUMIFS),
            new Edate(FUNCTION_NAMES_DATE.EDATE),
            new Today(FUNCTION_NAMES_DATE.TODAY),
            new Day(FUNCTION_NAMES_DATE.DAY),
            new Address(FUNCTION_NAMES_LOOKUP.ADDRESS),
            new Xmatch(FUNCTION_NAMES_LOOKUP.XMATCH),
            new Min(FUNCTION_NAMES_STATISTICAL.MIN),
            new Plus(FUNCTION_NAMES_META.PLUS),
            new Minus(FUNCTION_NAMES_META.MINUS),
            new Concatenate(FUNCTION_NAMES_TEXT.CONCATENATE),
            new Sum(FUNCTION_NAMES_MATH.SUM),
            new Choose(FUNCTION_NAMES_LOOKUP.CHOOSE),
            new Len(FUNCTION_NAMES_TEXT.LEN),
            new Divided(FUNCTION_NAMES_META.DIVIDED),
            new Product(FUNCTION_NAMES_MATH.PRODUCT),
            new Fact(FUNCTION_NAMES_MATH.FACT),
            new T(FUNCTION_NAMES_TEXT.T),
            new Text(FUNCTION_NAMES_TEXT.TEXT)
        );

        calculate = (formula: string) => {
            const lexerNode = lexer.treeBuilder(formula);

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            return getObjectValue(result);
        };
    });

    describe('Normal', () => {
        it('Nested functions IFERROR,XLOOKUP,MAX,SUMIFS,EDATE,TODAY,DAY,PLUS,Minus,CONCATENATE', () => {
            const result = calculate('=IFERROR(XLOOKUP(MAX(SUMIFS(C2:C10, A2:A10, ">="&EDATE(TODAY(),-1)+1-DAY(TODAY()), A2:A10, "<"&TODAY()-DAY(TODAY())+1)), SUMIFS(C2:C10, A2:A10, ">="&EDATE(TODAY(),-1)+1-DAY(TODAY()), A2:A10, "<"&TODAY()-DAY(TODAY())+1), B2:B10, "No Data"), "No Data")');

            expect(result).toStrictEqual([
                [101],
                [102],
                [103],
                [104],
                [105],
                [101],
                [102],
                [103],
                [104],
            ]);
        });

        it('Nested functions ADDRESS,XMATCH,MIN,SUMIFS,EDATE,TODAY,DAY', () => {
            const result = calculate('=ADDRESS(XMATCH(MIN(SUMIFS(C2:C10, A2:A10, ">=" & EDATE(TODAY(), -1) + 1 - DAY(TODAY()), A2:A10, "<" & TODAY() - DAY(TODAY()) + 1)), SUMIFS(C2:C10, A2:A10, ">=" & EDATE(TODAY(), -1) + 1 - DAY(TODAY()), A2:A10, "<" & TODAY() - DAY(TODAY()) + 1), 0) + 1, 2)');

            expect(result).toStrictEqual([['$B$2']]);
        });

        it('SUM, CHOOSE', () => {
            let result = calculate('=SUM(A2:CHOOSE(2,B2,C2))');

            expect(result).toStrictEqual(45033);

            result = calculate('=SUM(CHOOSE(1,A2:B2))');

            expect(result).toStrictEqual(45028);

            result = calculate('=SUM(CHOOSE({1,1},A2:B2))');

            expect(result).toStrictEqual(45028);

            result = calculate('=SUM(CHOOSE({1,1,1},A2:B2))');

            expect(result).toStrictEqual(ErrorType.NA);

            result = calculate('=SUM(CHOOSE({1,2},A2:B2))');

            expect(result).toStrictEqual(ErrorType.VALUE);
        });

        it('Parsing of double-quoted strings', () => {
            let result = calculate('=E1');
            expect(result).toStrictEqual([['"test"']]);

            result = calculate('="test"');
            expect(result).toStrictEqual('test');
        });

        it('Len gets length from formula result', () => {
            let result = calculate('=LEN(1/3)');
            expect(result).toStrictEqual(14);

            result = calculate('=LEN(0.1+0.2)');
            expect(result).toStrictEqual(3);
        });

        it('Sumifs test, range is number, criteria is number string', () => {
            let result = calculate('=SUMIFS(A11:C11,A11:C11,"2")');
            expect(result).toStrictEqual([
                [2],
            ]);

            result = calculate('=SUMIFS(A11:C11,A11:C11,A12)');
            expect(result).toStrictEqual([
                [2],
            ]);

            result = calculate('=SUMIFS(A11:C11,A11:C11,"2",A11:C11,3)');
            expect(result).toStrictEqual([
                [0],
            ]);

            result = calculate('=SUMIFS(A11:C11,A11:C11,"2",A11:C11,2)');
            expect(result).toStrictEqual([
                [2],
            ]);

            result = calculate('=SUMIF(A11:C11,"1",A11:C11)');
            expect(result).toBe(1);

            result = calculate('=SUMIF(A11:C11,3,A11:C11)');
            expect(result).toBe(3);

            result = calculate('=SUMIF(A11:C11,A12,A11:C11)');
            expect(result).toBe(2);
        });

        it('Product test, cell number string ignore, param number string can be calculated', () => {
            let result = calculate('=PRODUCT(A12)');
            expect(result).toBe(0);

            result = calculate('=PRODUCT("2")');
            expect(result).toBe(2);
        });

        it('value is rich text', () => {
            let result = calculate('=SUM(A13)');
            expect(result).toStrictEqual(0);

            result = calculate('=FACT(A13)');
            expect(result).toStrictEqual([
                [3628800],
            ]);
        });

        it('Text formula test', () => {
            const result = calculate('=TEXT(1234, "000000")');
            expect(result).toStrictEqual([
                ['001234'],
            ]);
        });

        it('T formula test', () => {
            const result = calculate('=T(A1:E1)');
            expect(result).toStrictEqual('A');
        });
    });
});
