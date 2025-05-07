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

import type { CellValue, Ctor, Injector, IWorkbookData, Nullable, Worksheet } from '@univerjs/core';
import type { BaseAstNode, BaseFunction, IFunctionNames, LexerNode } from '@univerjs/engine-formula';
import type { FFormula } from '@univerjs/engine-formula/facade';
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
                    0: {
                        0: {
                            v: 'B1',
                            t: 1,
                        },
                        1: {
                            v: 1,
                            t: 2,
                        },
                    },
                    1: {
                        0: {
                            v: 'B2',
                            t: 1,
                        },
                    },
                    2: {
                        0: {
                            v: 'B3',
                            t: 1,
                        },
                    },
                    3: {
                        0: {
                            v: 'B1',
                            t: 1,
                        },
                        1: {
                            v: 3,
                            t: 2,
                        },
                    },
                    4: {
                        0: {
                            v: 'B2',
                            t: 1,
                        },
                    },
                    5: {
                        0: {
                            v: 'B3',
                            t: 1,
                        },
                    },
                    6: {
                        0: {
                            v: 'B1',
                            t: 1,
                        },
                        1: {
                            v: 5,
                            t: 2,
                        },
                    },
                    7: {
                        0: {
                            v: 'B2',
                            t: 1,
                        },
                        2: {
                            v: 0,
                            t: 2,
                        },
                    },
                    8: {
                        0: {
                            v: 'B3',
                            t: 1,
                        },
                    },
                    9: {
                        0: {
                            v: 'B1',
                            t: 1,
                        },
                        1: {
                            v: 7,
                            t: 2,
                        },
                    },
                    10: {
                        0: {
                            v: 'B2',
                            t: 1,
                        },
                    },
                    11: {
                        0: {
                            v: 'B3',
                            t: 1,
                        },
                    },
                    12: {
                        0: {
                            v: 'B1',
                            t: 1,
                        },
                        1: {
                            v: 9,
                            t: 2,
                        },
                    },
                    23: {
                        2: {
                            v: 1,
                            t: 2,
                        },
                    },
                    25: {
                        2: {
                            v: 100,
                            t: 2,
                        },
                    },
                    30: {
                        2: {
                            f: '=C32/C33',
                        },
                        3: {
                            f: '=IF(C8<0,IF(C31<1,1,0.8),IF(C31<1,0.95,1))',
                        },
                    },
                    31: {
                        2: {
                            f: '=C24/C45',
                        },
                    },
                    32: {
                        2: {
                            f: '=C26/C45',
                        },
                    },
                    44: {
                        2: {
                            v: 1,
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
    let worksheet: Worksheet;
    let formulaEngine: FFormula;
    let lexer: Lexer;
    let astTreeBuilder: AstTreeBuilder;
    let interpreter: Interpreter;
    let commandService: ICommandService;
    let getCellValue: (row: number, column: number) => Nullable<CellValue>;
    let calculate: (formula: string) => (string | number | boolean | null)[][] | string | number | boolean;

    beforeEach(async () => {
        const testBed = createFunctionTestBed(getFunctionsTestWorkbookData());

        get = testBed.get;
        worksheet = testBed.sheet.getSheetBySheetId(subUnitId) as Worksheet;
        formulaEngine = testBed.api.getFormula() as FFormula;

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

        formulaEngine.executeCalculation();
        await formulaEngine.onCalculationEnd();

        getCellValue = (row: number, column: number) => {
            return worksheet.getCellRaw(row, column)?.v;
        };

        calculate = (formula: string) => {
            const lexerNode = lexer.treeBuilder(formula);

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            return getObjectValue(result);
        };
    });

    describe('Test formula', () => {
        it('If formula test', async () => {
            // D31 is IF formula: =IF(C8<0,IF(C31<1,1,0.8),IF(C31<1,0.95,1))
            expect(getCellValue(30, 3)).toBe(0.95);

            // Update C24 value to 100
            await commandService.executeCommand(SetRangeValuesMutation.id, {
                unitId,
                subUnitId,
                cellValue: {
                    23: {
                        2: {
                            v: 100,
                            t: 2,
                        },
                    },
                },
            });
            formulaEngine.executeCalculation();
            await formulaEngine.onCalculationEnd();

            // now result should be 1
            expect(getCellValue(30, 3)).toBe(1);
        });

        it('Sumif formula test', () => {
            let result = calculate('=SUMIF($A$1:A1,A1,$B$1:B1)');
            expect(result).toBe(1);

            result = calculate('=SUMIF($A$1:A2,A2,$B$1:B2)');
            expect(result).toBe(0);

            result = calculate('=SUMIF($A$1:A3,A3,$B$1:B3)');
            expect(result).toBe(0);

            result = calculate('=SUMIF($A$1:A4,A4,$B$1:B4)');
            expect(result).toBe(4);

            result = calculate('=SUMIF($A$1:A5,A5,$B$1:B5)');
            expect(result).toBe(0);

            result = calculate('=SUMIF($A$1:A6,A6,$B$1:B6)');
            expect(result).toBe(0);

            result = calculate('=SUMIF($A$1:A7,A7,$B$1:B7)');
            expect(result).toBe(9);

            result = calculate('=SUMIF($A$1:A8,A8,$B$1:B8)');
            expect(result).toBe(0);

            result = calculate('=SUMIF($A$1:A9,A9,$B$1:B9)');
            expect(result).toBe(0);

            result = calculate('=SUMIF($A$1:A10,A10,$B$1:B10)');
            expect(result).toBe(16);

            result = calculate('=SUMIF($A$1:A11,A11,$B$1:B11)');
            expect(result).toBe(0);

            result = calculate('=SUMIF($A$1:A12,A12,$B$1:B12)');
            expect(result).toBe(0);

            result = calculate('=SUMIF($A$1:A13,A13,$B$1:B13)');
            expect(result).toBe(25);
        });
    });
});
