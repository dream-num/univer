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
import type { LexerNode } from '../../../../engine/analysis/lexer-node';

import type { BaseAstNode } from '../../../../engine/ast-node/base-ast-node';
import type { ArrayValueObject } from '../../../../engine/value-object/array-value-object';
import type { BaseValueObject, ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanNumber, CellValueType, LocaleType } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { ErrorType } from '../../../../basics/error-type';
import { Lexer } from '../../../../engine/analysis/lexer';
import { AstTreeBuilder } from '../../../../engine/analysis/parser';
import { Interpreter } from '../../../../engine/interpreter/interpreter';
import { generateExecuteAstNodeData } from '../../../../engine/utils/ast-node-tool';
import { stripErrorMargin } from '../../../../engine/utils/math-kit';
import { IFormulaCurrentConfigService } from '../../../../services/current-data.service';
import { IFunctionService } from '../../../../services/function.service';
import { IFormulaRuntimeService } from '../../../../services/runtime.service';
import { createFunctionTestBed } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Subtotal } from '../index';

const getTestWorkbookData = (): IWorkbookData => {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                cellData: {
                    0: {
                        0: {
                            v: 1,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: 2,
                            t: CellValueType.NUMBER,
                        },
                        2: {
                            v: ErrorType.NAME,
                            t: CellValueType.STRING,
                        },
                    },
                    1: {
                        0: {
                            v: 3,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: 4,
                            t: CellValueType.NUMBER,
                        },
                        2: {
                            v: 'B2',
                            t: CellValueType.STRING,
                        },
                        3: {
                            v: 'R2C2',
                            t: CellValueType.STRING,
                        },
                    },
                    2: {
                        0: {
                            v: 1,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: ' ',
                            t: CellValueType.STRING,
                        },
                        2: {
                            v: 1.23,
                            t: CellValueType.NUMBER,
                        },
                        3: {
                            v: true,
                            t: CellValueType.BOOLEAN,
                        },
                        4: {
                            v: false,
                            t: CellValueType.BOOLEAN,
                        },
                    },
                    3: {
                        0: {
                            v: 0,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: '100',
                        },
                        2: {
                            v: '2.34',
                        },
                        3: {
                            v: 'test',
                            t: CellValueType.STRING,
                        },
                        4: {
                            v: -3,
                            t: CellValueType.NUMBER,
                        },
                    },
                },
                rowData: {
                    3: {
                        hd: BooleanNumber.TRUE,
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

describe('Test subtotal', () => {
    let get: Injector['get'];
    let lexer: Lexer;
    let astTreeBuilder: AstTreeBuilder;
    let interpreter: Interpreter;
    let calculate: (formula: string) => (string | number | boolean | null)[][] | string | number | boolean;

    beforeEach(() => {
        const testBed = createFunctionTestBed(getTestWorkbookData());

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
            excludedCell: {},
            allUnitData: {
                [testBed.unitId]: testBed.sheetData,
            },
            dirtyUnitOtherFormulaMap: {},
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
            new Subtotal(FUNCTION_NAMES_MATH.SUBTOTAL)
        );

        calculate = (formula: string) => {
            const lexerNode = lexer.treeBuilder(formula);

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            if ((result as ErrorValueObject).isError()) {
                return (result as ErrorValueObject).getValue();
            } else if ((result as ArrayValueObject).isArray()) {
                return (result as ArrayValueObject).toValue();
            }
            return (result as BaseValueObject).getValue();
        };
    });

    describe('Subtotal common', () => {
        it('FunctionNum is normal number, refs is non-reference object', () => {
            // number
            let result = calculate('=SUBTOTAL(1,1)');
            expect(result).toBe(ErrorType.VALUE);

            // string normal
            result = calculate('=SUBTOTAL(2,"test")');
            expect(result).toBe(ErrorType.VALUE);

            // string number
            result = calculate('=SUBTOTAL(3,"1")');
            expect(result).toBe(ErrorType.VALUE);

            // boolean true
            result = calculate('=SUBTOTAL(4,true)');
            expect(result).toBe(ErrorType.VALUE);

            // boolean false
            result = calculate('=SUBTOTAL(5,false)');
            expect(result).toBe(ErrorType.VALUE);
        });

        it('FunctionNum is normal number, refs is error or blank cell', () => {
            // error
            let result = calculate('=SUBTOTAL(7,C1)');
            expect(result).toBe(ErrorType.NAME);

            // null
            result = calculate('=SUBTOTAL(1,D1)');
            expect(result).toBe(ErrorType.DIV_BY_ZERO);

            result = calculate('=SUBTOTAL(2,D1)');
            expect(result).toBe(0);

            result = calculate('=SUBTOTAL(3,D1)');
            expect(result).toBe(0);

            result = calculate('=SUBTOTAL(4,D1)');
            expect(result).toBe(0);

            result = calculate('=SUBTOTAL(5,D1)');
            expect(result).toBe(0);

            result = calculate('=SUBTOTAL(6,D1)');
            expect(result).toBe(0);

            result = calculate('=SUBTOTAL(7,D1)');
            expect(result).toBe(ErrorType.DIV_BY_ZERO);

            result = calculate('=SUBTOTAL(8,D1)');
            expect(result).toBe(ErrorType.DIV_BY_ZERO);

            result = calculate('=SUBTOTAL(9,D1)');
            expect(result).toBe(0);

            result = calculate('=SUBTOTAL(10,D1)');
            expect(result).toBe(ErrorType.DIV_BY_ZERO);

            result = calculate('=SUBTOTAL(11,D1)');
            expect(result).toBe(ErrorType.DIV_BY_ZERO);
        });

        it('FunctionNum is normal number, ref1 is array, ref2 is array includes error', () => {
            const result = calculate('=SUBTOTAL(9,A1:B2,C1:C2)');
            expect(result).toBe(ErrorType.NAME);
        });

        it('FunctionNum ia array', () => {
            const result = calculate('=SUBTOTAL(A1:B2,A1:B2)');
            expect(result).toStrictEqual([
                [2.5, 4],
                [4, 4],
            ]);
        });
    });

    describe('Subtotal every function, function number is single number', () => {
        it('Average, Var1 is array, var2 is array', () => {
            const result = calculate('=SUBTOTAL(1,A1:B2,A3:F4)');
            expect(result).toBe(11.157);
        });
        it('Count, Var1 is array, var2 is array', () => {
            let result = calculate('=SUBTOTAL(2,A1:B2,A3:F4)');
            expect(result).toBe(10);
            result = calculate('=SUBTOTAL(2,B1:C1)');
            expect(result).toBe(1);
        });
        it('Counta, Var1 is array, var2 is array', () => {
            let result = calculate('=SUBTOTAL(3,A1:B2,A3:F4)');
            expect(result).toBe(14);
            result = calculate('=SUBTOTAL(3,B1:C1)');
            expect(result).toBe(2);
        });
        it('Max, Var1 is array, var2 is array', () => {
            const result = calculate('=SUBTOTAL(4,A1:B2,A3:F4)');
            expect(result).toBe(100);
        });
        it('Min, Var1 is array, var2 is array', () => {
            const result = calculate('=SUBTOTAL(5,A1:B2,A3:F4)');
            expect(result).toBe(-3);
        });
        it('Product, Var1 is array, var2 is array', () => {
            const result = calculate('=SUBTOTAL(6,A1:B2,A3:F4)');
            expect(typeof result === 'number' && Math.abs(result)).toBe(0);
        });
        it('Stdev.s, Var1 is array, var2 is array', () => {
            const result = calculate('=SUBTOTAL(7,A1:B2,A3:F4)');
            expect(result).toBe(31.27335040502625);
        });
        it('Stdev.p, Var1 is array, var2 is array', () => {
            const result = calculate('=SUBTOTAL(8,A1:B2,A3:F4)');
            expect(result).toBe(29.668505203329676);
        });
        it('sum, Var1 is array, var2 is array', () => {
            const result = calculate('=SUBTOTAL(9,A1:B2,A3:F4)');
            expect(stripErrorMargin(Number(result))).toBe(111.57);
        });
        it('Var.s, Var1 is array, var2 is array', () => {
            const result = calculate('=SUBTOTAL(10,A1:B2,A3:F4)');
            expect(result).toBeCloseTo(978.0224456, 7);
        });
        it('Var.p, Var1 is array, var2 is array', () => {
            const result = calculate('=SUBTOTAL(11,A1:B2,A3:F4)');
            expect(stripErrorMargin(Number(result))).toBe(880.220201);
        });
    });

    describe('Subtotal every function, function number is array', () => {
        it('Function num is array, var1 is array, var2 is array', () => {
            const result = calculate('=SUBTOTAL(A1:B2,A1:B2,A3:F4)');
            expect(result).toStrictEqual([[11.157, 10], [14, 100]]);
        });
    });
    describe('Subtotal every function, including hidden row', () => {
        it('Function num is normal number, var1 is array', () => {
            let result = calculate('=SUBTOTAL(101,A3:F4)');
            expect(result).toBe(1.115);

            result = calculate('=SUBTOTAL(102,A3:F4)');
            expect(result).toBe(2);

            result = calculate('=SUBTOTAL(103,A3:F4)');
            expect(result).toBe(5);

            result = calculate('=SUBTOTAL(104,A3:F4)');
            expect(result).toBe(1.23);

            result = calculate('=SUBTOTAL(105,A3:F4)');
            expect(result).toBe(1);

            result = calculate('=SUBTOTAL(106,A3:F4)');
            expect(result).toBe(1.23);

            result = calculate('=SUBTOTAL(107,A3:F4)');
            expect(result).toBeCloseTo(0.16263456, 7);

            result = calculate('=SUBTOTAL(108,A3:F4)');
            expect(stripErrorMargin(Number(result))).toBe(0.115);

            result = calculate('=SUBTOTAL(109,A3:F4)');
            expect(result).toBe(2.23);

            result = calculate('=SUBTOTAL(110,A3:F4)');
            expect(stripErrorMargin(Number(result))).toBe(0.02645);

            result = calculate('=SUBTOTAL(111,A3:F4)');
            expect(stripErrorMargin(Number(result))).toBe(0.013225);
        });
    });
});
