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
import { createFunctionTestBed } from '../../../__tests__/create-function-test-bed';
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
                            v: 2,
                            t: CellValueType.NUMBER,
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
                    4: {
                        3: {
                            v: 'test1',
                            t: CellValueType.STRING,
                        },
                    },
                    5: {
                        0: {
                            v: 'Tom',
                            t: CellValueType.STRING,
                        },
                        1: {
                            v: 'Sarah',
                            t: CellValueType.STRING,
                        },
                        3: {
                            v: 'Univer',
                            t: CellValueType.STRING,
                        },
                    },
                    6: {
                        0: {
                            v: 'Alex',
                            t: CellValueType.STRING,
                        },
                        1: {
                            v: 'Mickey',
                            t: CellValueType.STRING,
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
describe('Test isref function', () => {
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
            new Averageif(FUNCTION_NAMES_STATISTICAL.AVERAGEIF)
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

    describe('Averageif', () => {
        it('Range and criteria', async () => {
            const result = await calculate('=AVERAGEIF(A1:A4,">0")');

            expect(result).toBe(1.6666666666666667);
        });
        it('Range and criteria, compare number', async () => {
            const result = await calculate('=AVERAGEIF(A6:A7,">1")');

            expect(result).toBe(ErrorType.DIV_BY_ZERO);
        });

        it('Range number', async () => {
            const result = await calculate('=AVERAGEIF(1,1)');

            expect(result).toBe(1);
        });

        it('Range string', async () => {
            const result = await calculate('=AVERAGEIF("test",">1")');

            expect(result).toBe(ErrorType.DIV_BY_ZERO);
        });

        it('Range string, average range number', async () => {
            const result = await calculate('=AVERAGEIF("test",1,1)');

            expect(result).toBe(ErrorType.NA);
        });

        it('Range blank cell', async () => {
            const result = await calculate('=AVERAGEIF(A5,">1")');

            expect(result).toBe(ErrorType.DIV_BY_ZERO);
        });

        it('Average range with wildcard asterisk', async () => {
            const result = await calculate('=AVERAGEIF(D4:D6,"test*",A1)');

            expect(result).toBe(2);
        });

        it('ArrayValueObject range and ArrayValueObject criteria', async () => {
            const result = await calculate('=AVERAGEIF(A3:F4,A3:F4)');

            // [0][1] ErrorType.DIV_BY_ZERO refer to Google Sheets
            expect(result).toStrictEqual([[1, ErrorType.DIV_BY_ZERO, 1.23, ErrorType.DIV_BY_ZERO, ErrorType.DIV_BY_ZERO, 0], [0, 100, 2.34, ErrorType.DIV_BY_ZERO, -3, 0]]);
        });

        it('ArrayValueObject range and string criteria', async () => {
            const result = await calculate('=AVERAGEIF(A3:F4," ")');

            expect(result).toBe(ErrorType.DIV_BY_ZERO);
        });
    });
});
