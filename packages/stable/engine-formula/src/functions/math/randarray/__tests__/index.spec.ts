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
import { CellValueType, LocaleType } from '@univerjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorType } from '../../../../basics/error-type';
import { Lexer } from '../../../../engine/analysis/lexer';
import { AstTreeBuilder } from '../../../../engine/analysis/parser';
import { Interpreter } from '../../../../engine/interpreter/interpreter';
import { generateExecuteAstNodeData } from '../../../../engine/utils/ast-node-tool';
import { IFormulaCurrentConfigService } from '../../../../services/current-data.service';
import { IFunctionService } from '../../../../services/function.service';
import { IFormulaRuntimeService } from '../../../../services/runtime.service';
import { createFunctionTestBed, getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Randarray } from '../index';

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
                            v: true,
                            t: CellValueType.BOOLEAN,
                        },
                        2: {
                            v: false,
                            t: CellValueType.BOOLEAN,
                        },
                        3: {
                            v: 'test',
                            t: CellValueType.STRING,
                        },
                        4: {
                            v: null,
                        },
                        5: {
                            v: ErrorType.NAME,
                            t: CellValueType.STRING,
                        },
                    },
                    1: {
                        0: {
                            v: 1,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: 2,
                            t: CellValueType.NUMBER,
                        },
                        2: {
                            v: 1,
                            t: CellValueType.NUMBER,
                        },
                        3: {
                            v: 2.5,
                            t: CellValueType.NUMBER,
                        },
                    },
                    2: {
                        0: {
                            v: 2,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: 3,
                            t: CellValueType.NUMBER,
                        },
                        2: {
                            v: 2,
                            t: CellValueType.NUMBER,
                        },
                        3: {
                            v: 3,
                            t: CellValueType.NUMBER,
                        },
                    },
                    3: {
                        0: {
                            v: null,
                        },
                        1: {
                            v: 1,
                            t: CellValueType.NUMBER,
                        },
                    },
                    4: {
                        0: {
                            v: null,
                        },
                        1: {
                            v: null,
                        },
                    },
                },
                rowCount: 1000,
                columnCount: 20,
            },
        },
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: [],
        styles: {},
    };
};

describe('Test randarray function', () => {
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
            new Randarray(FUNCTION_NAMES_MATH.RANDARRAY)
        );

        calculate = (formula: string) => {
            const lexerNode = lexer.treeBuilder(formula);

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            return getObjectValue(result);
        };
    });

    describe('Randarray', () => {
        const mockRandom = vi.spyOn(Math, 'random');
        mockRandom.mockReturnValue(0.5);

        it('Value is normal', async () => {
            const result = await calculate('=RANDARRAY()');
            expect(result).toBe(0.5);
        });

        it('rows is number', async () => {
            const result = await calculate('=RANDARRAY(3)');
            expect(result).toStrictEqual([
                [0.5],
                [0.5],
                [0.5],
            ]);
        });

        it('rows is number, columns is number', async () => {
            const result = await calculate('=RANDARRAY(3,3)');
            expect(result).toStrictEqual([
                [0.5, 0.5, 0.5],
                [0.5, 0.5, 0.5],
                [0.5, 0.5, 0.5],
            ]);
        });

        it('rows and columns is exceed', async () => {
            const result = await calculate('=RANDARRAY(10000,10000)');
            expect(result).toBe(ErrorType.VALUE);

            const result2 = await calculate('=RANDARRAY(2000,3)');
            expect(result2).toBe(ErrorType.REF);
        });

        it('rows or columns is 0/-2/false/blank cell', async () => {
            const result = await calculate('=RANDARRAY(0)');
            expect(result).toBe(ErrorType.CALC);

            const result2 = await calculate('=RANDARRAY(-2)');
            expect(result2).toBe(ErrorType.VALUE);

            const result3 = await calculate('=RANDARRAY(C1)');
            expect(result3).toBe(ErrorType.CALC);

            const result4 = await calculate('=RANDARRAY(E1)');
            expect(result4).toBe(ErrorType.CALC);
        });

        it('Value is array', async () => {
            const result = await calculate('=RANDARRAY(6,6,A2:A3,A2:B3)');
            expect(result).toStrictEqual([
                [1, 1.5],
                [2, 2.5],
            ]);
        });

        it('min > max', async () => {
            const result = await calculate('=RANDARRAY(3,3,3,2)');
            expect(result).toBe(ErrorType.VALUE);
        });

        it('wholeNumber', async () => {
            const result = await calculate('=RANDARRAY(6,6,C2:C3,C2:D3,A4:B5)');
            expect(result).toStrictEqual([
                [1, ErrorType.VALUE],
                [2, 2.5],
            ]);
        });
    });
});
