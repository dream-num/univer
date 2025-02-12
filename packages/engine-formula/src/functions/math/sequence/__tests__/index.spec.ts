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
import { beforeEach, describe, expect, it } from 'vitest';
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
import { Sequence } from '../index';

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
                        5: {
                            v: null,
                        },
                    },
                    2: {
                        0: {
                            v: 0,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: '100',
                            t: CellValueType.STRING,
                        },
                        2: {
                            v: '2.34',
                            t: CellValueType.STRING,
                        },
                        3: {
                            v: 'test',
                            t: CellValueType.STRING,
                        },
                        4: {
                            v: -3,
                            t: CellValueType.NUMBER,
                        },
                        5: {
                            v: ErrorType.NAME,
                            t: CellValueType.STRING,
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

describe('Test sequence function', () => {
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
            new Sequence(FUNCTION_NAMES_MATH.SEQUENCE)
        );

        calculate = (formula: string) => {
            const lexerNode = lexer.treeBuilder(formula);

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            return getObjectValue(result);
        };
    });

    describe('Sequence', () => {
        it('Value is normal', async () => {
            const result = await calculate('=SEQUENCE(4,5,2,2)');
            expect(result).toStrictEqual([
                [2, 4, 6, 8, 10],
                [12, 14, 16, 18, 20],
                [22, 24, 26, 28, 30],
                [32, 34, 36, 38, 40],
            ]);
        });

        it('rows and columns is exceed', async () => {
            const result = await calculate('=SEQUENCE(10000,10000)');
            expect(result).toBe(ErrorType.VALUE);

            const result2 = await calculate('=SEQUENCE(2000,3)');
            expect(result2).toBe(ErrorType.REF);
        });

        it('Value is number negative', async () => {
            const result = await calculate('=SEQUENCE(-1,5,2,2)');
            expect(result).toBe(ErrorType.VALUE);
        });

        it('Value is number string', async () => {
            const result = await calculate('=SEQUENCE("1.5",5,2,2)');
            expect(result).toStrictEqual([
                [2, 4, 6, 8, 10],
            ]);
        });

        it('Value is normal string', async () => {
            const result = await calculate('=SEQUENCE("test",5,2,2)');
            expect(result).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', async () => {
            const result = await calculate('=SEQUENCE(B1,5,2,2)');
            expect(result).toStrictEqual([
                [2, 4, 6, 8, 10],
            ]);
        });

        it('Value is blank cell', async () => {
            const result = await calculate('=SEQUENCE(4,E1,2,2)');
            expect(result).toBe(ErrorType.CALC);
        });

        it('Value is null', async () => {
            const result = await calculate('=SEQUENCE(,)');
            expect(result).toStrictEqual([
                [1],
            ]);
        });

        it('Value is error', async () => {
            const result = await calculate('=SEQUENCE(F1,5,2,2)');
            expect(result).toBe(ErrorType.NAME);

            const result2 = await calculate('=SEQUENCE(4,F1,2,2)');
            expect(result2).toBe(ErrorType.NAME);

            const result3 = await calculate('=SEQUENCE(4,5,F1,2)');
            expect(result3).toBe(ErrorType.NAME);

            const result4 = await calculate('=SEQUENCE(4,5,2,F1)');
            expect(result4).toBe(ErrorType.NAME);
        });

        it('Value is array', async () => {
            const result = await calculate('=SEQUENCE(A2:F3,5,2,2)');
            expect(result).toStrictEqual([
                [2, ErrorType.VALUE, 2, 2, ErrorType.CALC, ErrorType.CALC],
                [ErrorType.CALC, 2, 2, ErrorType.VALUE, ErrorType.VALUE, ErrorType.NAME],
            ]);
        });
    });
});
