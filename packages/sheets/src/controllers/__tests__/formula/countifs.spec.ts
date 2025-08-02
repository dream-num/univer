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
    functionMeta,
    functionStatistical,
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
                            v: 'Users',
                            t: 1,
                        },
                        1: {
                            v: 'Done',
                            t: 1,
                        },
                        2: {
                            v: 'Name',
                            t: 1,
                        },
                        3: {
                            v: 'Count',
                            t: 1,
                        },
                    },
                    1: {
                        0: {
                            v: 'Alice',
                            t: 1,
                        },
                        1: {
                            v: 'a',
                            t: 1,
                        },
                        2: {
                            v: 'Alice',
                            t: 1,
                        },
                        3: {
                            f: '=COUNTIFS(A:A,C2,B:B,"<>")',
                        },
                    },
                    2: {
                        0: {
                            v: 'Bruce',
                            t: 1,
                        },
                        1: {
                            v: 'b',
                            t: 1,
                        },
                        2: {
                            v: 'Bruce',
                            t: 1,
                        },
                        3: {
                            f: '=COUNTIFS(A:A,C3,B:B,"<><>")',
                        },
                    },
                    3: {
                        0: {
                            v: 'Alice',
                            t: 1,
                        },
                        1: {
                            v: 'c',
                            t: 1,
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
            ...functionStatistical,
            ...functionMeta,
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
        it('COUNTIFS formula test', async () => {
            expect(getCellValue(1, 3)).toBe(2);
            expect(getCellValue(2, 3)).toBe(1);
        });
    });
});
