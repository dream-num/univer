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
import {
    AstTreeBuilder,
    functionLogical,
    functionMath,
    functionMeta,
    generateExecuteAstNodeData,
    IFormulaCurrentConfigService,
    IFormulaRuntimeService,
    IFunctionService,
    Interpreter,
    Lexer,
    SetArrayFormulaDataMutation,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
    SetFormulaCalculationStartMutation,
    SetFormulaCalculationStopMutation,
} from '@univerjs/engine-formula';
import { beforeEach, describe, expect, it } from 'vitest';
import { SetRangeValuesMutation } from '../../../commands/mutations/set-range-values.mutation';
import { createFunctionTestBed, getObjectValue } from './create-function-test-bed';

import '@univerjs/engine-formula/facade';

const unitId = 'test';
const subUnitId = 'sheet1';

const getFunctionsTestWorkbookData = (): IWorkbookData => {
    return {
        id: unitId,
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: subUnitId,
                cellData: {
                    7: {
                        1: {
                            v: 'B1',
                            t: 1,
                        },
                        5: {
                            v: 1,
                            t: 2,
                        },
                    },
                    8: {
                        1: {
                            v: 'B2',
                            t: 1,
                        },
                    },
                    9: {
                        1: {
                            v: 'B3',
                            t: 1,
                        },
                    },
                    10: {
                        1: {
                            v: 'B1',
                            t: 1,
                        },
                        5: {
                            v: 3,
                            t: 2,
                        },
                    },
                    11: {
                        1: {
                            v: 'B2',
                            t: 1,
                        },
                    },
                    12: {
                        1: {
                            v: 'B3',
                            t: 1,
                        },
                    },
                    13: {
                        1: {
                            v: 'B1',
                            t: 1,
                        },
                        5: {
                            v: 5,
                            t: 2,
                        },
                    },
                    14: {
                        1: {
                            v: 'B2',
                            t: 1,
                        },
                    },
                    15: {
                        1: {
                            v: 'B3',
                            t: 1,
                        },
                    },
                    16: {
                        1: {
                            v: 'B1',
                            t: 1,
                        },
                        5: {
                            v: 7,
                            t: 2,
                        },
                    },
                    17: {
                        1: {
                            v: 'B2',
                            t: 1,
                        },
                    },
                    18: {
                        1: {
                            v: 'B3',
                            t: 1,
                        },
                    },
                    19: {
                        1: {
                            v: 'B1',
                            t: 1,
                        },
                        5: {
                            v: 9,
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
            ...functionMath,
            ...functionMeta,
            ...functionLogical,
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

            return getObjectValue(result);
        };
    });

    describe('Test formula', () => {
        it('If nested sumif formula', () => {
            let result = calculate('=IF(SUMIF($B$8:B8, B8, $F$8:F8) = 0, "", SUMIF($B$8:B8, B8, $F$8:F8))');
            expect(result).toBe(1);

            result = calculate('=IF(SUMIF($B$8:B9, B9, $F$8:F9) = 0, "", SUMIF($B$8:B9, B9, $F$8:F9))');
            expect(result).toBe('');

            result = calculate('=IF(SUMIF($B$8:B10, B10, $F$8:F10) = 0, "", SUMIF($B$8:B10, B10, $F$8:F10))');
            expect(result).toBe('');

            result = calculate('=IF(SUMIF($B$8:B11, B11, $F$8:F11) = 0, "", SUMIF($B$8:B11, B11, $F$8:F11))');
            expect(result).toBe(4);

            result = calculate('=IF(SUMIF($B$8:B12, B12, $F$8:F12) = 0, "", SUMIF($B$8:B12, B12, $F$8:F12))');
            expect(result).toBe('');

            result = calculate('=IF(SUMIF($B$8:B13, B13, $F$8:F13) = 0, "", SUMIF($B$8:B13, B13, $F$8:F13))');
            expect(result).toBe('');

            result = calculate('=IF(SUMIF($B$8:B14, B14, $F$8:F14) = 0, "", SUMIF($B$8:B14, B14, $F$8:F14))');
            expect(result).toBe(9);

            result = calculate('=IF(SUMIF($B$8:B15, B15, $F$8:F15) = 0, "", SUMIF($B$8:B15, B15, $F$8:F15))');
            expect(result).toBe('');

            result = calculate('=IF(SUMIF($B$8:B16, B16, $F$8:F16) = 0, "", SUMIF($B$8:B16, B16, $F$8:F16))');
            expect(result).toBe('');

            result = calculate('=IF(SUMIF($B$8:B17, B17, $F$8:F17) = 0, "", SUMIF($B$8:B17, B17, $F$8:F17))');
            expect(result).toBe(16);

            result = calculate('=IF(SUMIF($B$8:B18, B18, $F$8:F18) = 0, "", SUMIF($B$8:B18, B18, $F$8:F18))');
            expect(result).toBe('');

            result = calculate('=IF(SUMIF($B$8:B19, B19, $F$8:F19) = 0, "", SUMIF($B$8:B19, B19, $F$8:F19))');
            expect(result).toBe('');

            result = calculate('=IF(SUMIF($B$8:B20, B20, $F$8:F20) = 0, "", SUMIF($B$8:B20, B20, $F$8:F20))');
            expect(result).toBe(25);
        });
    });
});
