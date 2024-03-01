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
import { CellValueType, LocaleType } from '@univerjs/core';
import { Lexer } from '../../../../engine/analysis/lexer';
import type { LexerNode } from '../../../../engine/analysis/lexer-node';
import { AstTreeBuilder } from '../../../../engine/analysis/parser';
import type { BaseAstNode } from '../../../../engine/ast-node/base-ast-node';
import { Interpreter } from '../../../../engine/interpreter/interpreter';
import { IFormulaCurrentConfigService } from '../../../../services/current-data.service';
import { IFunctionService } from '../../../../services/function.service';
import { IFormulaRuntimeService } from '../../../../services/runtime.service';
import { createFunctionTestBed } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Subtotal } from '..';
import type { BaseValueObject, ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';
import type { ArrayValueObject } from '../../../../engine/value-object/array-value-object';

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
    let calculate: (formula: string) => Promise<(string | number | boolean | null)[][] | string | number | boolean>;

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
            forceCalculate: false,
            numfmtItemMap: {},
            dirtyRanges: [],
            dirtyNameMap: {},
            dirtyUnitFeatureMap: {},
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
            new Subtotal(FUNCTION_NAMES_MATH.SUBTOTAL)
        );

        calculate = async (formula: string) => {
            const lexerNode = lexer.treeBuilder(formula);

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = await interpreter.executeAsync(astNode as BaseAstNode);

            if ((result as ErrorValueObject).isError()) {
                return (result as ErrorValueObject).getValue();
            } else if ((result as ArrayValueObject).isArray()) {
                return (result as ArrayValueObject).toValue();
            }
            return (result as BaseValueObject).getValue();
        };
    });

    describe('Subtotal common', () => {
        it('FunctionNum is normal number, refs is non-reference object', async () => {
            // number
            let result = await calculate('=SUBTOTAL(1,1)');
            expect(result).toBe(ErrorType.VALUE);

            // string normal
            result = await calculate('=SUBTOTAL(2,"test")');
            expect(result).toBe(ErrorType.VALUE);

            // string number
            result = await calculate('=SUBTOTAL(3,"1")');
            expect(result).toBe(ErrorType.VALUE);

            // boolean true
            result = await calculate('=SUBTOTAL(4,true)');
            expect(result).toBe(ErrorType.VALUE);

            // boolean false
            result = await calculate('=SUBTOTAL(5,false)');
            expect(result).toBe(ErrorType.VALUE);

            // null
            result = await calculate('=SUBTOTAL(6,D1)');
            expect(result).toBe(ErrorType.VALUE);

            // error
            result = await calculate('=SUBTOTAL(7,C1)');
            expect(result).toBe(ErrorType.VALUE);
        });

        it('FunctionNum is normal number, ref1 is array, ref2 is array includes error', async () => {
            const result = await calculate('=SUBTOTAL(9,A1:B2,C1:C2)');
            expect(result).toBe(ErrorType.NAME);
        });
    });

    describe('Subtotal sum', () => {
        it('Var1 is array, var2 is array', async () => {
            const result = await calculate('=SUBTOTAL(9,A1:B2,A3:F4)');
            expect(result).toBe(111.57);
        });
    });
});
