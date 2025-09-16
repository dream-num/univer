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
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { IFormulaCurrentConfigService } from '../../../../services/current-data.service';
import { IFunctionService } from '../../../../services/function.service';
import { IFormulaRuntimeService } from '../../../../services/runtime.service';
import { createFunctionTestBed, getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Averageif } from '../index';

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
                            v: 'Ada',
                            t: CellValueType.STRING,
                        },
                        3: {
                            v: 4,
                            t: CellValueType.NUMBER,
                        },
                        4: {
                            v: 5,
                            t: CellValueType.NUMBER,
                        },
                    },
                    1: {
                        0: {
                            v: 4,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: false,
                            t: CellValueType.BOOLEAN,
                        },
                        2: {
                            v: 'test1',
                            t: CellValueType.STRING,
                        },
                        3: {
                            v: 4,
                            t: CellValueType.NUMBER,
                        },
                        4: {
                            v: 4,
                            t: CellValueType.NUMBER,
                        },
                    },
                    2: {
                        0: {
                            v: 44,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: null,
                            t: CellValueType.NUMBER,
                        },
                        2: {
                            v: 'test12',
                            t: CellValueType.STRING,
                        },
                        3: {
                            v: 44,
                            t: CellValueType.NUMBER,
                        },
                        4: {
                            v: 44,
                            t: CellValueType.NUMBER,
                        },
                    },
                    3: {
                        0: {
                            v: 444,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: null,
                            t: CellValueType.NUMBER,
                        },
                        2: {
                            v: 'Univer',
                            t: CellValueType.STRING,
                        },
                        3: {
                            v: 444,
                            t: CellValueType.NUMBER,
                        },
                        4: {
                            v: 444,
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

describe('Test averageif function', () => {
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
            new Averageif(FUNCTION_NAMES_STATISTICAL.AVERAGEIF)
        );

        calculate = (formula: string) => {
            const lexerNode = lexer.treeBuilder(formula);

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            return getObjectValue(result);
        };
    });

    describe('Averageif', () => {
        it('Range and criteria', async () => {
            const result = await calculate('=AVERAGEIF(A1:A4,">40")');
            expect(result).toBe(244);
        });

        it('Range and criteria, different type', async () => {
            const result = await calculate('=AVERAGEIF(B1,">4",A1)');
            expect(result).toBe(ErrorType.DIV_BY_ZERO);
        });

        it('averageRange with wildcard asterisk', async () => {
            const result = await calculate('=AVERAGEIF(C1:C4,"test*",A1:A4)');
            expect(result).toBe(24);
        });

        it('ArrayValueObject range and ArrayValueObject criteria', async () => {
            const result = await calculate('=AVERAGEIF(A1:A4,D1:D4)');
            expect(result).toStrictEqual([
                [4],
                [4],
                [44],
                [444],
            ]);

            const result2 = await calculate('=AVERAGEIF(A1:A4,E1:E4)');
            expect(result2).toStrictEqual([
                [ErrorType.DIV_BY_ZERO],
                [4],
                [44],
                [444],
            ]);

            const result3 = await calculate('=AVERAGEIF(A1:A4,A2)');
            expect(result3).toBe(4);
        });

        it('Includes error', async () => {
            const error = ErrorValueObject.create(ErrorType.NAME);

            const result = await calculate(`=AVERAGEIF(${error},A1:A4)`);
            expect(result).toBe(ErrorType.VALUE);

            const result2 = await calculate(`=AVERAGEIF(A1:A4,${error})`);
            expect(result2).toBe(ErrorType.DIV_BY_ZERO);

            const result3 = await calculate(`=AVERAGEIF(A1:A4,">40",${error})`);
            expect(result3).toBe(ErrorType.VALUE);
        });

        it('Range or averageRange is not referenceObject', async () => {
            const result = await calculate('=AVERAGEIF(1,"test*",A1:A4)');
            expect(result).toBe(ErrorType.VALUE);
        });

        it('Range length is not equal to averageRange length', async () => {
            const result = await calculate('=AVERAGEIF(A1:A4,">40",E1:E2)');
            expect(result).toBe(244);
        });
    });
});
