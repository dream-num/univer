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
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Offset } from '../index';

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
                            v: -1,
                            t: CellValueType.NUMBER,
                        },
                        3: {
                            v: -1,
                            t: CellValueType.NUMBER,
                        },
                        4: {
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

describe('Test offset', () => {
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
            new Offset(FUNCTION_NAMES_LOOKUP.OFFSET)
        );

        calculate = (formula: string) => {
            const lexerNode = lexer.treeBuilder(formula);

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            return getObjectValue(result);
        };
    });

    describe('Offset, reference is single reference value object', () => {
        it('Normal single cell', async () => {
            const result = await calculate('=OFFSET(A1,1,0,1,1)');

            expect(result).toStrictEqual([[3]]);
        });

        it('Normal array cell', async () => {
            const result = await calculate('=OFFSET(A1,1,0,3,1)');

            expect(result).toStrictEqual([[3], [1], [0]]);
        });

        it('TRUE as 1', async () => {
            const result = await calculate('=OFFSET(A1,TRUE,0,3,1)');

            expect(result).toStrictEqual([[3], [1], [0]]);
        });

        it('Height is negative', async () => {
            const result = await calculate('=OFFSET(A1,1,0,0,1)');

            expect(result).toStrictEqual(ErrorType.REF);
        });

        it('Offset outside sheet boundary', async () => {
            const result = await calculate('=OFFSET(A1,-1,0,1,1)');

            expect(result).toStrictEqual(ErrorType.REF);
        });

        it('The result of the OFFSET function is a reference', async () => {
            const result = await calculate('=OFFSET(A1,1,1):C2');

            expect(result).toStrictEqual([[4, 'B2']]);
        });

        it('Rows is single reference object', async () => {
            const result = await calculate('=OFFSET(A1,A1,1,1,1)');

            expect(result).toStrictEqual([[4]]);
        });

        it('Rows is array value object, positive and negative numbers', async () => {
            const result = await calculate('=OFFSET(A1,B1:C1,1)');

            expect(result).toStrictEqual([[ErrorType.VALUE, ErrorType.REF]]);
        });

        it('Rows is array value object, Columns is array value object', async () => {
            const result = await calculate('=OFFSET(A1,A1:B1,A1:A2,1,1)');

            expect(result).toStrictEqual([[ErrorType.VALUE, ErrorType.VALUE], [ErrorType.VALUE, ErrorType.VALUE]]);
        });

        it('Rows is array value object, Columns is array value object, ref error', async () => {
            const result = await calculate('=OFFSET(A1,A1:A2,D1:E1,1,1)');

            expect(result).toStrictEqual([[ErrorType.REF, ErrorType.NAME], [ErrorType.REF, ErrorType.NAME]]);
        });

        it('Rows is array value object, Columns is array value object, ref error, height is array, width is array', async () => {
            const result = await calculate('=OFFSET(A1,A1:A2,D1:E1,I4:I6,J4:L4)');

            expect(result).toStrictEqual([[ErrorType.REF, ErrorType.NAME, ErrorType.NA], [ErrorType.REF, ErrorType.NAME, ErrorType.NA], [ErrorType.NA, ErrorType.NA, ErrorType.NA]]);
        });
    });

    describe('Offset, reference is base value object', () => {
        it('Rows single number, columns single number', async () => {
            let result = await calculate('=OFFSET(1,1,1)');

            expect(result).toBe(ErrorType.VALUE);

            result = await calculate('=OFFSET("Univer",1,1)');

            expect(result).toBe(ErrorType.VALUE);

            result = await calculate('=OFFSET(TRUE,1,1)');

            expect(result).toBe(ErrorType.VALUE);
        });
    });

    describe('Offset, reference is array value object', () => {
        it('Rows single number, columns single number', async () => {
            const result = await calculate('=OFFSET(A1:B2,1,1)');

            expect(result).toStrictEqual([[4, 'B2'], [' ', 1.23]]);
        });
    });
});
