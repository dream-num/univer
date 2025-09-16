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
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Minifs } from '../index';

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
                            v: 3,
                            t: CellValueType.NUMBER,
                        },
                        3: {
                            v: 4,
                            t: CellValueType.NUMBER,
                        },
                    },
                    1: {
                        0: {
                            v: 2,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: 3,
                            t: CellValueType.NUMBER,
                        },
                        2: {
                            v: 4,
                            t: CellValueType.NUMBER,
                        },
                        3: {
                            v: 5,
                            t: CellValueType.NUMBER,
                        },
                    },
                    2: {
                        0: {
                            v: 3,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: 4,
                            t: CellValueType.NUMBER,
                        },
                        2: {
                            v: 5,
                            t: CellValueType.NUMBER,
                        },
                        3: {
                            v: 6,
                            t: CellValueType.NUMBER,
                        },
                    },
                    3: {
                        0: {
                            v: 4,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: 5,
                            t: CellValueType.NUMBER,
                        },
                        2: {
                            v: 6,
                            t: CellValueType.NUMBER,
                        },
                        3: {
                            v: 7,
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

describe('Test minifs function', () => {
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
            new Minifs(FUNCTION_NAMES_STATISTICAL.MINIFS)
        );

        calculate = (formula: string) => {
            const lexerNode = lexer.treeBuilder(formula);

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            return getObjectValue(result);
        };
    });

    describe('Minifs', () => {
        it('Value is normal', async () => {
            const result = await calculate('=MINIFS(A1:A4,B1:B4,">3")');
            expect(result).toBe(3);
        });

        it('Value is array', async () => {
            const result = await calculate('=MINIFS({1;2;3;4},B1:B4,">3")');
            expect(result).toBe(ErrorType.VALUE);
        });

        it('Range and criteria is not paired', async () => {
            const result = await calculate('=MINIFS(A1:A4,B1:B4,">3",C1:C4)');
            expect(result).toBe(ErrorType.VALUE);
        });

        it('Range is different size', async () => {
            const result = await calculate('=MINIFS(A1:A4,B1:B4,">3",C1:C3,{"=5","=6"})');
            expect(result).toStrictEqual([
                [ErrorType.VALUE, ErrorType.VALUE],
            ]);
        });

        it('Range and array criteria', async () => {
            const result = await calculate('=MINIFS(A1:A4,B1:B4,{">1";">2"})');
            expect(result).toStrictEqual([
                [1],
                [2],
            ]);
        });

        it('Two ranges and criteria', async () => {
            const result = await calculate('=MINIFS(A1:A4,B1:B4,">2",C1:C4,"=5")');
            expect(result).toBe(3);
        });

        it('Two ranges and criteria, criteria is array', async () => {
            const result = await calculate('=MINIFS(A1:A4,B1:B4,">2",C1:C4,{">4";">5"})');
            expect(result).toStrictEqual([
                [3],
                [4],
            ]);
        });
    });
});
