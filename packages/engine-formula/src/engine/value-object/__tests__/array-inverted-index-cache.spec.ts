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

import type { Injector, IWorkbookData } from '@univerjs/core';
import type { LexerNode } from '../../analysis/lexer-node';

import type { BaseAstNode } from '../../ast-node/base-ast-node';
import { LocaleType } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFunctionTestBed, getObjectValue } from '../../../functions/__tests__/create-function-test-bed';
import { FUNCTION_NAMES_LOGICAL } from '../../../functions/logical/function-names';
import { If } from '../../../functions/logical/if';
import { FUNCTION_NAMES_MATH } from '../../../functions/math/function-names';
import { Sumif } from '../../../functions/math/sumif';
import { Compare } from '../../../functions/meta/compare';
import { FUNCTION_NAMES_META } from '../../../functions/meta/function-names';
import { IFormulaCurrentConfigService } from '../../../services/current-data.service';
import { IFunctionService } from '../../../services/function.service';
import { IFormulaRuntimeService } from '../../../services/runtime.service';
import { Lexer } from '../../analysis/lexer';
import { AstTreeBuilder } from '../../analysis/parser';
import { Interpreter } from '../../interpreter/interpreter';
import { generateExecuteAstNodeData } from '../../utils/ast-node-tool';

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
                            v: 'B1',
                            t: 1,
                        },
                        1: {
                            v: 1,
                            t: 2,
                        },
                    },
                    1: {
                        0: {
                            v: 'B2',
                            t: 1,
                        },
                    },
                    2: {
                        0: {
                            v: 'B3',
                            t: 1,
                        },
                    },
                    3: {
                        0: {
                            v: 'B1',
                            t: 1,
                        },
                        1: {
                            v: 3,
                            t: 2,
                        },
                    },
                    4: {
                        0: {
                            v: 'B2',
                            t: 1,
                        },
                    },
                    5: {
                        0: {
                            v: 'B3',
                            t: 1,
                        },
                    },
                    6: {
                        0: {
                            v: 'B1',
                            t: 1,
                        },
                        1: {
                            v: 5,
                            t: 2,
                        },
                    },
                    7: {
                        0: {
                            v: 'B2',
                            t: 1,
                        },
                        2: {
                            v: 0,
                            t: 2,
                        },
                    },
                    8: {
                        0: {
                            v: 'B3',
                            t: 1,
                        },
                    },
                    9: {
                        0: {
                            v: 'B1',
                            t: 1,
                        },
                        1: {
                            v: 7,
                            t: 2,
                        },
                    },
                    10: {
                        0: {
                            v: 'B2',
                            t: 1,
                        },
                    },
                    11: {
                        0: {
                            v: 'B3',
                            t: 1,
                        },
                    },
                    12: {
                        0: {
                            v: 'B1',
                            t: 1,
                        },
                        1: {
                            v: 9,
                            t: 2,
                        },
                    },
                    23: {
                        2: {
                            v: 1,
                            t: 2,
                        },
                    },
                    25: {
                        2: {
                            v: 100,
                            t: 2,
                        },
                    },
                    30: {
                        2: {
                            f: '=C32/C33',
                        },
                    },
                    31: {
                        2: {
                            f: '=C24/C45',
                        },
                    },
                    32: {
                        2: {
                            f: '=C26/C45',
                        },
                    },
                    44: {
                        2: {
                            v: 1,
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
describe('Test inverted index cache', () => {
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
            new If(FUNCTION_NAMES_LOGICAL.IF),
            new Sumif(FUNCTION_NAMES_MATH.SUMIF),
            new Compare(FUNCTION_NAMES_META.COMPARE)
        );

        calculate = (formula: string) => {
            const lexerNode = lexer.treeBuilder(formula);

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            return getObjectValue(result);
        };
    });

    describe('Test formula', () => {
        it('If formula test', () => {
            const result = calculate('=IF(C8<0,IF(C31<1,1,0.8),IF(C31<1,0.95,1))');
            expect(result).toBe(0.95);
        });

        it('Sumif formula test', () => {
            let result = calculate('=SUMIF($A$1:A1,A1,$B$1:B1)');
            expect(result).toBe(1);

            result = calculate('=SUMIF($A$1:A2,A2,$B$1:B2)');
            expect(result).toBe(0);

            result = calculate('=SUMIF($A$1:A3,A3,$B$1:B3)');
            expect(result).toBe(0);

            result = calculate('=SUMIF($A$1:A4,A4,$B$1:B4)');
            expect(result).toBe(4);

            result = calculate('=SUMIF($A$1:A5,A5,$B$1:B5)');
            expect(result).toBe(0);

            result = calculate('=SUMIF($A$1:A6,A6,$B$1:B6)');
            expect(result).toBe(0);

            result = calculate('=SUMIF($A$1:A7,A7,$B$1:B7)');
            expect(result).toBe(9);

            result = calculate('=SUMIF($A$1:A8,A8,$B$1:B8)');
            expect(result).toBe(0);

            result = calculate('=SUMIF($A$1:A9,A9,$B$1:B9)');
            expect(result).toBe(0);

            result = calculate('=SUMIF($A$1:A10,A10,$B$1:B10)');
            expect(result).toBe(16);

            result = calculate('=SUMIF($A$1:A11,A11,$B$1:B11)');
            expect(result).toBe(0);

            result = calculate('=SUMIF($A$1:A12,A12,$B$1:B12)');
            expect(result).toBe(0);

            result = calculate('=SUMIF($A$1:A13,A13,$B$1:B13)');
            expect(result).toBe(25);
        });
    });
});
