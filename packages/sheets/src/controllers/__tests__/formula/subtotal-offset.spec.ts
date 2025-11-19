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

import type { Ctor, Injector, IWorkbookData } from '@univerjs/core';
import type { BaseAstNode, BaseFunction, IFunctionNames, LexerNode } from '@univerjs/engine-formula';
import { ICommandService, LocaleType } from '@univerjs/core';
import { AstTreeBuilder, ErrorType, functionLookup, functionMath, functionMeta, functionStatistical, generateExecuteAstNodeData, getObjectValue, IFormulaCurrentConfigService, IFormulaRuntimeService, IFunctionService, Interpreter, Lexer, SetArrayFormulaDataMutation, SetFormulaCalculationNotificationMutation, SetFormulaCalculationResultMutation, SetFormulaCalculationStartMutation, SetFormulaCalculationStopMutation } from '@univerjs/engine-formula';
import { beforeEach, describe, expect, it } from 'vitest';
import { SetRangeValuesMutation } from '../../../commands/mutations/set-range-values.mutation';
import { createFunctionTestBed } from './create-function-test-bed';

import '@univerjs/engine-formula/facade';

const unitId = 'test';
const subUnitId = 'sheet1';

const getFunctionsTestWorkbookData = (): IWorkbookData => {
    return {
        id: unitId,
        appVersion: '3.0.0-alpha',
        styles: {},
        sheets: {
            sheet1: {
                id: subUnitId,
                cellData: {
                    0: {
                        0: {
                            v: 1,
                            t: 2,
                        },
                        1: {
                            v: 2,
                            t: 2,
                        },
                        2: {
                            v: '#NAME?',
                            t: 1,
                        },
                    },
                    1: {
                        0: {
                            v: 3,
                            t: 2,
                        },
                        1: {
                            v: 4,
                            t: 2,
                        },
                        2: {
                            v: 'B2',
                            t: 1,
                        },
                        3: {
                            v: 'R2C2',
                            t: 1,
                        },
                    },
                    2: {
                        0: {
                            v: 1,
                            t: 2,
                        },
                        2: {
                            v: 1.23,
                            t: 2,
                        },
                        3: {
                            v: 1,
                            t: 3,
                        },
                        4: {
                            v: 0,
                            t: 3,
                        },
                        9: {
                            v: 8,
                            t: 2,
                        },
                        10: {
                            v: 9,
                            t: 2,
                        },
                        11: {
                            v: 10,
                            t: 2,
                        },
                        12: {
                            v: 11,
                            t: 2,
                        },
                    },
                    3: {
                        0: {
                            v: 0,
                            t: 2,
                        },
                        1: {
                            v: 100,
                            t: 2,
                        },
                        2: {
                            v: 2.34,
                            t: 2,
                        },
                        3: {
                            v: 'test',
                            t: 1,
                        },
                        4: {
                            v: -3,
                            t: 2,
                        },
                        9: {
                            v: 9,
                            t: 2,
                        },
                        10: {
                            v: 10,
                            t: 2,
                        },
                        11: {
                            v: 11,
                            t: 2,
                        },
                        12: {
                            v: 12,
                            t: 2,
                        },
                    },
                    4: {
                        2: {
                            v: 5,
                            t: 2,
                        },
                        9: {
                            v: 10,
                            t: 2,
                        },
                        10: {
                            v: 11,
                            t: 2,
                        },
                        11: {
                            v: 12,
                            t: 2,
                        },
                        12: {
                            v: 13,
                            t: 2,
                        },
                    },
                    5: {
                        9: {
                            v: 11,
                            t: 2,
                        },
                        10: {
                            v: 12,
                            t: 2,
                        },
                        11: {
                            v: 13,
                            t: 2,
                        },
                        12: {
                            v: 14,
                            t: 2,
                        },
                    },
                    6: {
                        9: {
                            v: 12,
                            t: 2,
                        },
                        10: {
                            v: 13,
                            t: 2,
                        },
                        11: {
                            v: 14,
                            t: 2,
                        },
                        12: {
                            v: 15,
                            t: 2,
                        },
                    },
                    7: {
                        9: {
                            v: 13,
                            t: 2,
                        },
                        10: {
                            v: 14,
                            t: 2,
                        },
                        11: {
                            v: 15,
                            t: 2,
                        },
                        12: {
                            v: 16,
                            t: 2,
                        },
                    },
                    8: {
                        1: {
                            v: 4,
                            t: 2,
                        },
                        9: {
                            v: 14,
                            t: 2,
                        },
                        10: {
                            v: 15,
                            t: 2,
                        },
                        11: {
                            v: 16,
                            t: 2,
                        },
                        12: {
                            v: 17,
                            t: 2,
                        },
                    },
                    9: {
                        9: {
                            v: 15,
                            t: 2,
                        },
                        10: {
                            v: 16,
                            t: 2,
                        },
                        11: {
                            v: 17,
                            t: 2,
                        },
                        12: {
                            v: 18,
                            t: 2,
                        },
                    },
                    10: {
                        9: {
                            v: 16,
                            t: 2,
                        },
                        10: {
                            v: 17,
                            t: 2,
                        },
                        11: {
                            v: 18,
                            t: 2,
                        },
                        12: {
                            v: 19,
                            t: 2,
                        },
                    },
                    11: {
                        9: {
                            v: 17,
                            t: 2,
                        },
                        10: {
                            v: 18,
                            t: 2,
                        },
                        11: {
                            v: 19,
                            t: 2,
                        },
                        12: {
                            v: 20,
                            t: 2,
                        },
                    },
                    12: {
                        2: {
                            v: 11,
                            t: 2,
                        },
                        3: {
                            v: 12,
                            t: 2,
                        },
                        4: {
                            v: 13,
                            t: 2,
                        },
                        5: {
                            v: 14,
                            t: 2,
                        },
                        6: {
                            v: 15,
                            t: 2,
                        },
                        7: {
                            v: 16,
                            t: 2,
                        },
                        8: {
                            v: 17,
                            t: 2,
                        },
                        9: {
                            v: 18,
                            t: 2,
                        },
                        10: {
                            v: 19,
                            t: 2,
                        },
                        11: {
                            v: 20,
                            t: 2,
                        },
                        12: {
                            v: 21,
                            t: 2,
                        },
                    },
                    13: {
                        2: {
                            v: 12,
                            t: 2,
                        },
                        3: {
                            v: 13,
                            t: 2,
                        },
                        4: {
                            v: 14,
                            t: 2,
                        },
                        5: {
                            v: 15,
                            t: 2,
                        },
                        6: {
                            v: 16,
                            t: 2,
                        },
                        7: {
                            v: 17,
                            t: 2,
                        },
                        8: {
                            v: 18,
                            t: 2,
                        },
                        9: {
                            v: 19,
                            t: 2,
                        },
                        10: {
                            v: 20,
                            t: 2,
                        },
                        11: {
                            v: 21,
                            t: 2,
                        },
                        12: {
                            v: 22,
                            t: 2,
                        },
                    },
                    14: {
                        2: {
                            v: 13,
                            t: 2,
                        },
                        3: {
                            v: 14,
                            t: 2,
                        },
                        4: {
                            v: 15,
                            t: 2,
                        },
                        5: {
                            v: 16,
                            t: 2,
                        },
                        6: {
                            v: 17,
                            t: 2,
                        },
                        7: {
                            v: 18,
                            t: 2,
                        },
                        8: {
                            v: 19,
                            t: 2,
                        },
                        9: {
                            v: 20,
                            t: 2,
                        },
                        10: {
                            v: 21,
                            t: 2,
                        },
                        11: {
                            v: 22,
                            t: 2,
                        },
                        12: {
                            v: 23,
                            t: 2,
                        },
                    },
                    15: {
                        2: {
                            v: 14,
                            t: 2,
                        },
                        3: {
                            v: 15,
                            t: 2,
                        },
                        4: {
                            v: 16,
                            t: 2,
                        },
                        5: {
                            v: 17,
                            t: 2,
                        },
                        6: {
                            v: 18,
                            t: 2,
                        },
                        7: {
                            v: 19,
                            t: 2,
                        },
                        8: {
                            v: 20,
                            t: 2,
                        },
                        9: {
                            v: 21,
                            t: 2,
                        },
                        10: {
                            v: 22,
                            t: 2,
                        },
                        11: {
                            v: 23,
                            t: 2,
                        },
                        12: {
                            v: 24,
                            t: 2,
                        },
                    },
                    16: {
                        2: {
                            v: 15,
                            t: 2,
                        },
                        3: {
                            v: 16,
                            t: 2,
                        },
                        4: {
                            v: 17,
                            t: 2,
                        },
                        5: {
                            v: 18,
                            t: 2,
                        },
                        6: {
                            v: 19,
                            t: 2,
                        },
                        7: {
                            v: 20,
                            t: 2,
                        },
                        8: {
                            v: 21,
                            t: 2,
                        },
                        9: {
                            v: 22,
                            t: 2,
                        },
                        10: {
                            v: 23,
                            t: 2,
                        },
                        11: {
                            v: 24,
                            t: 2,
                        },
                        12: {
                            v: 25,
                            t: 2,
                        },
                    },
                    17: {
                        2: {
                            v: 16,
                            t: 2,
                        },
                        3: {
                            v: 17,
                            t: 2,
                        },
                        4: {
                            v: 18,
                            t: 2,
                        },
                        5: {
                            v: 19,
                            t: 2,
                        },
                        6: {
                            v: 20,
                            t: 2,
                        },
                        7: {
                            v: 21,
                            t: 2,
                        },
                        8: {
                            v: 22,
                            t: 2,
                        },
                        9: {
                            v: 23,
                            t: 2,
                        },
                        10: {
                            v: 24,
                            t: 2,
                        },
                        11: {
                            v: 25,
                            t: 2,
                        },
                        12: {
                            v: 26,
                            t: 2,
                        },
                    },
                    18: {
                        2: {
                            v: 17,
                            t: 2,
                        },
                        3: {
                            v: 18,
                            t: 2,
                        },
                        4: {
                            v: 19,
                            t: 2,
                        },
                        5: {
                            v: 20,
                            t: 2,
                        },
                        6: {
                            v: 21,
                            t: 2,
                        },
                        7: {
                            v: 22,
                            t: 2,
                        },
                        8: {
                            v: 23,
                            t: 2,
                        },
                        9: {
                            v: 24,
                            t: 2,
                        },
                        10: {
                            v: 25,
                            t: 2,
                        },
                        11: {
                            v: 26,
                            t: 2,
                        },
                        12: {
                            v: 27,
                            t: 2,
                        },
                    },
                    19: {
                        2: {
                            v: 18,
                            t: 2,
                        },
                        3: {
                            v: 19,
                            t: 2,
                        },
                        4: {
                            v: 20,
                            t: 2,
                        },
                        5: {
                            v: 21,
                            t: 2,
                        },
                        6: {
                            v: 22,
                            t: 2,
                        },
                        7: {
                            v: 23,
                            t: 2,
                        },
                        8: {
                            v: 24,
                            t: 2,
                        },
                        9: {
                            v: 25,
                            t: 2,
                        },
                        10: {
                            v: 26,
                            t: 2,
                        },
                        11: {
                            v: 27,
                            t: 2,
                        },
                        12: {
                            v: 28,
                            t: 2,
                        },
                    },
                    20: {
                        2: {
                            v: 19,
                            t: 2,
                        },
                        3: {
                            v: 20,
                            t: 2,
                        },
                        4: {
                            v: 21,
                            t: 2,
                        },
                        5: {
                            v: 22,
                            t: 2,
                        },
                        6: {
                            v: 23,
                            t: 2,
                        },
                        7: {
                            v: 24,
                            t: 2,
                        },
                        8: {
                            v: 25,
                            t: 2,
                        },
                        9: {
                            v: 26,
                            t: 2,
                        },
                        10: {
                            v: 27,
                            t: 2,
                        },
                        11: {
                            v: 28,
                            t: 2,
                        },
                        12: {
                            v: 29,
                            t: 2,
                        },
                    },
                    21: {
                        2: {
                            v: 20,
                            t: 2,
                        },
                        3: {
                            v: 21,
                            t: 2,
                        },
                        4: {
                            v: 22,
                            t: 2,
                        },
                        5: {
                            v: 23,
                            t: 2,
                        },
                        6: {
                            v: 24,
                            t: 2,
                        },
                        7: {
                            v: 25,
                            t: 2,
                        },
                        8: {
                            v: 26,
                            t: 2,
                        },
                        9: {
                            v: 27,
                            t: 2,
                        },
                        10: {
                            v: 28,
                            t: 2,
                        },
                        11: {
                            v: 29,
                            t: 2,
                        },
                        12: {
                            v: 30,
                            t: 2,
                        },
                    },
                    22: {
                        2: {
                            v: 21,
                            t: 2,
                        },
                        3: {
                            v: 22,
                            t: 2,
                        },
                        4: {
                            v: 23,
                            t: 2,
                        },
                        5: {
                            v: 24,
                            t: 2,
                        },
                        6: {
                            v: 25,
                            t: 2,
                        },
                        7: {
                            v: 26,
                            t: 2,
                        },
                        8: {
                            v: 27,
                            t: 2,
                        },
                        9: {
                            v: 28,
                            t: 2,
                        },
                        10: {
                            v: 29,
                            t: 2,
                        },
                        11: {
                            v: 30,
                            t: 2,
                        },
                        12: {
                            v: 31,
                            t: 2,
                        },
                    },
                    23: {
                        2: {
                            v: 22,
                            t: 2,
                        },
                        3: {
                            v: 23,
                            t: 2,
                        },
                        4: {
                            v: 24,
                            t: 2,
                        },
                        5: {
                            v: 25,
                            t: 2,
                        },
                        6: {
                            v: 26,
                            t: 2,
                        },
                        7: {
                            v: 27,
                            t: 2,
                        },
                        8: {
                            v: 28,
                            t: 2,
                        },
                        9: {
                            v: 29,
                            t: 2,
                        },
                        10: {
                            v: 30,
                            t: 2,
                        },
                        11: {
                            v: 31,
                            t: 2,
                        },
                        12: {
                            v: 32,
                            t: 2,
                        },
                    },
                    24: {
                        2: {
                            v: 23,
                            t: 2,
                        },
                        3: {
                            v: 24,
                            t: 2,
                        },
                        4: {
                            v: 25,
                            t: 2,
                        },
                        5: {
                            v: 26,
                            t: 2,
                        },
                        6: {
                            v: 27,
                            t: 2,
                        },
                        7: {
                            v: 28,
                            t: 2,
                        },
                        8: {
                            v: 29,
                            t: 2,
                        },
                        9: {
                            v: 30,
                            t: 2,
                        },
                        10: {
                            v: 31,
                            t: 2,
                        },
                        11: {
                            v: 32,
                            t: 2,
                        },
                        12: {
                            v: 33,
                            t: 2,
                        },
                    },
                    25: {
                        2: {
                            v: 24,
                            t: 2,
                        },
                        3: {
                            v: 25,
                            t: 2,
                        },
                        4: {
                            v: 26,
                            t: 2,
                        },
                        5: {
                            v: 27,
                            t: 2,
                        },
                        6: {
                            v: 28,
                            t: 2,
                        },
                        7: {
                            v: 29,
                            t: 2,
                        },
                        8: {
                            v: 30,
                            t: 2,
                        },
                        9: {
                            v: 31,
                            t: 2,
                        },
                        10: {
                            v: 32,
                            t: 2,
                        },
                        11: {
                            v: 33,
                            t: 2,
                        },
                        12: {
                            v: 34,
                            t: 2,
                        },
                    },
                    26: {
                        2: {
                            v: 25,
                            t: 2,
                        },
                        3: {
                            v: 26,
                            t: 2,
                        },
                        4: {
                            v: 27,
                            t: 2,
                        },
                        5: {
                            v: 28,
                            t: 2,
                        },
                        6: {
                            v: 29,
                            t: 2,
                        },
                        7: {
                            v: 30,
                            t: 2,
                        },
                        8: {
                            v: 31,
                            t: 2,
                        },
                        9: {
                            v: 32,
                            t: 2,
                        },
                        10: {
                            v: 33,
                            t: 2,
                        },
                        11: {
                            v: 34,
                            t: 2,
                        },
                        12: {
                            v: 35,
                            t: 2,
                        },
                    },
                },
                rowData: {
                    3: {
                        hd: 1,
                    },
                },
            },
        },
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: [],
    };
};

describe('Test SUBTOTAL formula', () => {
    let get: Injector['get'];
    let lexer: Lexer;
    let astTreeBuilder: AstTreeBuilder;
    let interpreter: Interpreter;
    let commandService: ICommandService;
    let calculate: (formula: string) => (string | number | boolean | null)[][] | string | number | boolean;

    beforeEach(async () => {
        const testBed = createFunctionTestBed(getFunctionsTestWorkbookData());

        get = testBed.get;

        lexer = get(Lexer);
        astTreeBuilder = get(AstTreeBuilder);
        interpreter = get(Interpreter);
        commandService = get(ICommandService);

        commandService.registerCommand(SetFormulaCalculationStartMutation);
        commandService.registerCommand(SetFormulaCalculationStopMutation);
        commandService.registerCommand(SetFormulaCalculationResultMutation);
        commandService.registerCommand(SetFormulaCalculationNotificationMutation);
        commandService.registerCommand(SetArrayFormulaDataMutation);
        commandService.registerCommand(SetRangeValuesMutation);

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

        const functions = [
            ...functionMeta,
            ...functionMath,
            ...functionStatistical,
            ...functionLookup,
        ]
            .map((registerObject) => {
                const Func = registerObject[0] as Ctor<BaseFunction>;
                const name = registerObject[1] as IFunctionNames;

                return new Func(name);
            });

        functionService.registerExecutors(
            ...functions
        );

        calculate = (formula: string) => {
            const lexerNode = lexer.treeBuilder(formula);

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            return getObjectValue(result, true);
        };
    });

    describe('Test formula', () => {
        it('Test SUBTOTAL nested OFFSET', () => {
            let result = calculate('=SUBTOTAL(A1:B2,C13)');
            expect(result).toStrictEqual([
                [11, 1],
                [1, 11],
            ]);

            result = calculate('=SUBTOTAL(A1:B2,OFFSET(J$16,ROW(J$16:J$37)-MIN(ROW($J$16:$J$37)),0))');
            expect(result).toStrictEqual([
                [21, 1],
                [1, 22],
                [ErrorType.NA, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA],
            ]);

            result = calculate('=SUBTOTAL(A1:B1,OFFSET(J$16,ROW(J$16:J$37)-MIN(ROW($J$16:$J$37)),0))');
            expect(result).toStrictEqual([
                [21, 1],
                [22, 1],
                [23, 1],
                [24, 1],
                [25, 1],
                [26, 1],
                [27, 1],
                [28, 1],
                [29, 1],
                [30, 1],
                [31, 1],
                [32, 1],
                [ErrorType.DIV_BY_ZERO, 0],
                [ErrorType.DIV_BY_ZERO, 0],
                [ErrorType.DIV_BY_ZERO, 0],
                [ErrorType.DIV_BY_ZERO, 0],
                [ErrorType.DIV_BY_ZERO, 0],
                [ErrorType.DIV_BY_ZERO, 0],
                [ErrorType.DIV_BY_ZERO, 0],
                [ErrorType.DIV_BY_ZERO, 0],
                [ErrorType.DIV_BY_ZERO, 0],
                [ErrorType.DIV_BY_ZERO, 0],
            ]);

            result = calculate('=SUBTOTAL(C3:C5,OFFSET(J$16,ROW(J$16:J$37)-MIN(ROW($J$16:$J$37)),0))');
            expect(result).toStrictEqual([
                [21],
                [1],
                [23],
                [ErrorType.NA],
                [ErrorType.NA],
                [ErrorType.NA],
                [ErrorType.NA],
                [ErrorType.NA],
                [ErrorType.NA],
                [ErrorType.NA],
                [ErrorType.NA],
                [ErrorType.NA],
                [ErrorType.NA],
                [ErrorType.NA],
                [ErrorType.NA],
                [ErrorType.NA],
                [ErrorType.NA],
                [ErrorType.NA],
                [ErrorType.NA],
                [ErrorType.NA],
                [ErrorType.NA],
                [ErrorType.NA],
            ]);
        });

        it('Test SUBTOTAL', () => {
            let result = calculate('=SUBTOTAL(107,H27:I27)');
            expect(result).toBe(0.707106781187);

            result = calculate('=SUBTOTAL(C1,C3:M27)');
            expect(result).toBe(ErrorType.NAME);

            result = calculate('=SUBTOTAL(C1:C3,C3:M27)');
            expect(result).toStrictEqual([
                [ErrorType.NAME],
                [ErrorType.VALUE],
                [20.8639712919],
            ]);
        });
    });
});
