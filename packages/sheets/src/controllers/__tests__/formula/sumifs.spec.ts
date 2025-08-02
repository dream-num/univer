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
    functionText,
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
const sheet1Id = 'sheet1';
const sheet2Id = 'sheet2';

const getFunctionsTestWorkbookData = (): IWorkbookData => {
    return {
        id: unitId,
        name: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.ZH_CN,
        sheetOrder: [
            sheet1Id,
            sheet2Id,
        ],
        sheets: {
            [sheet1Id]: {
                id: sheet1Id,
                name: '申赎TA系统统计',
                cellData: {
                    0: {
                        2: {
                            v: 'TA系统查询（万元）',
                            s: '4776597a-942f-4137-8ff0-735001593668',
                            t: 1,
                        },
                        3: {
                            s: '6947c841-23d0-44ad-a847-d2297a51494d',
                            t: 1,
                        },
                        4: {
                            s: '6947c841-23d0-44ad-a847-d2297a51494d',
                            t: 1,
                        },
                        5: {
                            s: '6947c841-23d0-44ad-a847-d2297a51494d',
                            t: 1,
                        },
                        6: {
                            s: '4776597a-942f-4137-8ff0-735001593668',
                            t: 1,
                        },
                        7: {
                            s: '23cb90eb-1afc-4d14-958d-eeed8b866445',
                            t: 1,
                        },
                        8: {
                            v: '理财销售系统交易数据(头寸)报表(万元）',
                            s: '23cb90eb-1afc-4d14-958d-eeed8b866445',
                            t: 1,
                        },
                    },
                    1: {
                        0: {
                            v: '序号',
                            s: 'aef83e6b-473e-483c-8a97-724576536f62',
                            t: 1,
                        },
                        1: {
                            v: '产品',
                            s: '2410b93c-32e8-4b37-9363-f12515f947c9',
                            t: 1,
                        },
                        2: {
                            v: '渠道',
                            s: 'aef83e6b-473e-483c-8a97-724576536f62',
                            t: 1,
                        },
                        3: {
                            v: '净值',
                            s: 'aef83e6b-473e-483c-8a97-724576536f62',
                            t: 1,
                        },
                        4: {
                            v: '申购',
                            s: 'aef83e6b-473e-483c-8a97-724576536f62',
                            t: 1,
                        },
                        5: {
                            v: '赎回',
                            s: 'aef83e6b-473e-483c-8a97-724576536f62',
                            t: 1,
                        },
                        6: {
                            v: '净申购',
                            s: 'aef83e6b-473e-483c-8a97-724576536f62',
                            t: 1,
                        },
                        7: {
                            s: '3010fe04-5c10-4757-af1d-9745de064d7b',
                            t: 2,
                        },
                        8: {
                            v: '申购',
                            s: 'aef83e6b-473e-483c-8a97-724576536f62',
                            t: 1,
                        },
                    },
                    2: {
                        0: {
                            v: '1',
                            s: '401a5b4f-8f3d-4b6b-b815-6e88317a13a8',
                            t: 2,
                        },
                        1: {
                            v: '增利1号',
                            s: '507d9c70-1cb3-45e1-aed0-a44d6adc6b12',
                            t: 1,
                        },
                        2: {
                            v: '2301187111',
                            s: '0ce3577d-2d45-4901-8fe8-12b16d32a2b5',
                            t: 2,
                        },
                        3: {
                            v: '1',
                            s: '7ea38281-bc20-483c-a480-aea20864cd42',
                            t: 2,
                        },
                        4: {
                            s: '350d5835-cb41-4656-9b40-02899897f911',
                            t: 2,
                        },
                        5: {
                            s: '350d5835-cb41-4656-9b40-02899897f911',
                            t: 2,
                        },
                        6: {
                            s: '350d5835-cb41-4656-9b40-02899897f911',
                            t: 2,
                        },
                        7: {
                            s: '350d5835-cb41-4656-9b40-02899897f911',
                            t: 2,
                        },
                        8: {
                            s: '350d5835-cb41-4656-9b40-02899897f911',
                            t: 2,
                            f: "=SUMIFS('理财销售系统交易数据(头寸)报表'!I:I,'理财销售系统交易数据(头寸)报表'!B:B,申赎TA系统统计!C3)/10000",
                        },
                    },
                },
            },
            [sheet2Id]: {
                id: sheet2Id,
                name: '理财销售系统交易数据(头寸)报表',
                cellData: {
                    0: {
                        0: {
                            v: '理财销售系统交易数据(头寸)报表',
                            s: 'c2f440c8-806d-4bd7-a843-d951e147a3b6',
                            t: 1,
                        },
                        7: {
                            v: '数据转化',
                            s: '7382b988-514f-4258-8089-84f15ca94055',
                            t: 1,
                        },
                        8: {
                            s: 'e85f8f37-b060-47f7-8a07-7eb2495ceb82',
                            t: 2,
                        },
                    },
                    1: {
                        0: {
                            v: '截至时间：2024-10-23 17:23:26',
                            s: '6de254be-4231-47b6-86df-d28b69e0c607',
                            t: 1,
                        },
                        7: {
                            s: 'b0d6fb11-0e5e-46b0-a4e0-d7bcf440f7fd',
                            t: 2,
                        },
                        8: {
                            s: 'b0d6fb11-0e5e-46b0-a4e0-d7bcf440f7fd',
                            t: 2,
                        },
                    },
                    2: {
                        0: {
                            v: '确认日期',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        1: {
                            v: '产品代码',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        2: {
                            v: '产品名称',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        3: {
                            v: '类型',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        4: {
                            v: '交易类型',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        5: {
                            v: '申请份额',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        6: {
                            v: '申请金额',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        7: {
                            v: '申请份额',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        8: {
                            v: '申请金额',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                    },
                    3: {
                        0: {
                            v: '20241024',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        1: {
                            v: '2301187111',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        2: {
                            v: '天添盈增利1号',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        3: {
                            v: '代销浦银',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        4: {
                            v: '申购',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        5: {
                            v: '',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        6: {
                            v: '25553138.63',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        7: {
                            s: 'e8762147-5f85-4f28-8c89-5eaeb08a0bc2',
                            t: 2,
                            f: '=IFERROR(VALUE(F4),0)',
                        },
                        8: {
                            s: 'e8762147-5f85-4f28-8c89-5eaeb08a0bc2',
                            t: 2,
                            f: '=IFERROR(VALUE(G4),0)',
                        },
                    },
                    4: {
                        0: {
                            v: '20241024',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        1: {
                            v: '2301187111',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        2: {
                            v: '天添盈增利1号',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        3: {
                            v: '代销浦银',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        4: {
                            v: '赎回',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        5: {
                            v: '-60161703.9',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        6: {
                            v: '',
                            s: '1888bb21-41ac-458a-8733-00177b49c982',
                            t: 1,
                        },
                        7: {
                            s: 'e8762147-5f85-4f28-8c89-5eaeb08a0bc2',
                            t: 2,
                            f: '=IFERROR(VALUE(F5),0)',
                        },
                        8: {
                            s: 'e8762147-5f85-4f28-8c89-5eaeb08a0bc2',
                            t: 2,
                            f: '=IFERROR(VALUE(G5),0)',
                        },
                    },
                },
            },
        },
        styles: {},
    };
};

describe('Test inverted index cache', () => {
    let get: Injector['get'];
    // let worksheet: Worksheet;
    let formulaEngine: FFormula;
    let lexer: Lexer;
    let astTreeBuilder: AstTreeBuilder;
    let interpreter: Interpreter;
    let commandService: ICommandService;
    let getCellValue: (subUnitId: string, row: number, column: number) => Nullable<CellValue>;
    let calculate: (formula: string) => (string | number | boolean | null)[][] | string | number | boolean;

    beforeEach(async () => {
        const testBed = createFunctionTestBed(getFunctionsTestWorkbookData());

        get = testBed.get;
        // worksheet = testBed.sheet.getSheetBySheetId(subUnitId) as Worksheet;
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
            ...functionText,
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

        getCellValue = (subUnitId: string, row: number, column: number) => {
            const worksheet = testBed.sheet.getSheetBySheetId(subUnitId) as Worksheet;
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
        it('SUMIFS formula test', async () => {
            expect(getCellValue(sheet1Id, 2, 8)).toBe(2555.313863);
        });
    });
});
