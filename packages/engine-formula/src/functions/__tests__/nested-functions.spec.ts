/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Injector } from '@wendellhu/redi';
import { beforeEach, describe, expect, it } from 'vitest';

import type { IWorkbookData } from '@univerjs/core';
import { LocaleType } from '@univerjs/core';
import { Lexer } from '../../engine/analysis/lexer';
import { AstTreeBuilder } from '../../engine/analysis/parser';
import type { BaseAstNode } from '../../engine/ast-node/base-ast-node';
import { Interpreter } from '../../engine/interpreter/interpreter';
import { Iferror } from '../logical/iferror';
import { Xlookup } from '../lookup/xlookup';
import { Max } from '../statistical/max';
import { Sumifs } from '../math/sumifs';
import { Edate } from '../date/edate';
import { Today } from '../date/today';
import { Day } from '../date/day';
import { Address } from '../lookup/address';
import { Xmatch } from '../lookup/xmatch';
import { Min } from '../statistical/min';
import { IFormulaCurrentConfigService } from '../../services/current-data.service';
import { IFormulaRuntimeService } from '../../services/runtime.service';
import { Plus } from '../meta/plus';
import { FUNCTION_NAMES_META } from '../meta/function-names';
import { Minus } from '../meta/minus';
import { Concatenate } from '../text/concatenate';
import { FUNCTION_NAMES_LOGICAL } from '../logical/function-names';
import { FUNCTION_NAMES_MATH } from '../math/function-names';
import { FUNCTION_NAMES_LOOKUP } from '../lookup/function-names';
import { FUNCTION_NAMES_STATISTICAL } from '../statistical/function-names';
import { FUNCTION_NAMES_DATE } from '../date/function-names';
import { FUNCTION_NAMES_TEXT } from '../text/function-names';
import { IFunctionService } from '../../services/function.service';
import type { ArrayValueObject } from '../../engine/value-object/array-value-object';
import type { LexerNode } from '../../engine/analysis/lexer-node';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { createFunctionTestBed } from './create-function-test-bed';

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
            new Sumifs(FUNCTION_NAMES_MATH.SUMIFS),
            new Edate(FUNCTION_NAMES_DATE.EDATE),
            new Today(FUNCTION_NAMES_DATE.TODAY),
            new Day(FUNCTION_NAMES_DATE.DAY),
            new Address(FUNCTION_NAMES_LOOKUP.ADDRESS),
            new Xmatch(FUNCTION_NAMES_LOOKUP.XMATCH),
            new Min(FUNCTION_NAMES_STATISTICAL.MIN),
            new Plus(FUNCTION_NAMES_META.PLUS),
            new Minus(FUNCTION_NAMES_META.MINUS),
            new Concatenate(FUNCTION_NAMES_TEXT.CONCATENATE)

        );
    });

    describe('Normal', () => {
        it('Nested functions IFERROR,XLOOKUP,MAX,SUMIFS,EDATE,TODAY,DAY,PLUS,Minus,CONCATENATE', async () => {
            const lexerNode = lexer.treeBuilder('=IFERROR(XLOOKUP(MAX(SUMIFS(C2:C10, A2:A10, ">="&EDATE(TODAY(),-1)+1-DAY(TODAY()), A2:A10, "<"&TODAY()-DAY(TODAY())+1)), SUMIFS(C2:C10, A2:A10, ">="&EDATE(TODAY(),-1)+1-DAY(TODAY()), A2:A10, "<"&TODAY()-DAY(TODAY())+1), B2:B10, "No Data"), "No Data")');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = await interpreter.executeAsync(astNode as BaseAstNode);

            expect((result as ArrayValueObject).toValue()).toStrictEqual([[101], [102], [103], [104], [105], [101], [102], [103], [104]]);
        });
        it('Nested functions ADDRESS,XMATCH,MIN,SUMIFS,EDATE,TODAY,DAY', async () => {
            const lexerNode = lexer.treeBuilder('=ADDRESS(XMATCH(MIN(SUMIFS(C2:C10, A2:A10, ">=" & EDATE(TODAY(), -1) + 1 - DAY(TODAY()), A2:A10, "<" & TODAY() - DAY(TODAY()) + 1)), SUMIFS(C2:C10, A2:A10, ">=" & EDATE(TODAY(), -1) + 1 - DAY(TODAY()), A2:A10, "<" & TODAY() - DAY(TODAY()) + 1), 0) + 1, 2)');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = await interpreter.executeAsync(astNode as BaseAstNode);

            expect((result as BaseValueObject).getValue()).toBe('$B$2');
        });
    });
});
