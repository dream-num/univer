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
import type { BaseFunction, IFunctionNames } from '@univerjs/engine-formula';
import type { FFormula } from '@univerjs/engine-formula/facade';
import { ICommandService, LocaleType } from '@univerjs/core';
import { functionLogical, functionLookup, functionMath, functionMeta, functionStatistical, IFormulaCurrentConfigService, IFormulaRuntimeService, IFunctionService, SetArrayFormulaDataMutation, SetFormulaCalculationNotificationMutation, SetFormulaCalculationResultMutation, SetFormulaCalculationStartMutation, SetFormulaCalculationStopMutation } from '@univerjs/engine-formula';
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
        styles: {
            R3: {
                n: {
                    pattern: 'YYYY-M-D',
                },
            },
        },
        sheets: {
            sheet1: {
                id: subUnitId,
                cellData: {
                    0: {
                        0: {
                            v: 'Products',
                            t: 1,
                        },
                        1: {
                            v: 'Type',
                            t: 1,
                        },
                        3: {
                            v: 'Products',
                            t: 1,
                        },
                        4: {
                            v: 'Type',
                            t: 1,
                        },
                    },
                    1: {
                        0: {
                            v: 'Pencil',
                            t: 1,
                        },
                        1: {
                            v: 'Yellow',
                            t: 1,
                        },
                        3: {
                            v: 'Pencil',
                            t: 1,
                        },
                        4: {
                            f: '=IFERROR(INDEX(B:B,AGGREGATE(15,6,ROW($A$2:$A$20)/($A$2:$A$20=D2),COUNTIF(D$2:D2,D2))),"")',
                        },
                    },
                    2: {
                        0: {
                            v: 'Stapler',
                            t: 1,
                        },
                        1: {
                            v: 'Black',
                            t: 1,
                        },
                        3: {
                            v: 'Stapler',
                            t: 1,
                        },
                        4: {
                            f: '=IFERROR(INDEX(B:B,AGGREGATE(15,6,ROW($A$2:$A$20)/($A$2:$A$20=D3),COUNTIF(D$2:D3,D3))),"")',
                        },
                    },
                    3: {
                        0: {
                            v: 'Ruler',
                            t: 1,
                        },
                        1: {
                            v: 'Yellow1',
                            t: 1,
                        },
                        3: {
                            v: 'Ruler',
                            t: 1,
                        },
                        4: {
                            f: '=IFERROR(INDEX(B:B,AGGREGATE(15,6,ROW($A$2:$A$20)/($A$2:$A$20=D4),COUNTIF(D$2:D4,D4))),"")',
                        },
                    },
                    4: {
                        0: {
                            v: 'Paper',
                            t: 1,
                        },
                        1: {
                            v: 'Green',
                            t: 1,
                        },
                        3: {
                            v: 'Paper',
                            t: 1,
                        },
                        4: {
                            f: '=IFERROR(INDEX(B:B,AGGREGATE(15,6,ROW($A$2:$A$20)/($A$2:$A$20=D5),COUNTIF(D$2:D5,D5))),"")',
                        },
                    },
                    5: {
                        0: {
                            v: 'Pencil',
                            t: 1,
                        },
                        1: {
                            v: 'Red',
                            t: 1,
                        },
                        3: {
                            v: 'Pencil',
                            t: 1,
                        },
                        4: {
                            f: '=IFERROR(INDEX(B:B,AGGREGATE(15,6,ROW($A$2:$A$20)/($A$2:$A$20=D6),COUNTIF(D$2:D6,D6))),"")',
                        },
                    },
                    6: {
                        0: {
                            v: 'Paper',
                            t: 1,
                        },
                        1: {
                            v: 'Blue',
                            t: 1,
                        },
                        3: {
                            v: 'Paper',
                            t: 1,
                        },
                        4: {
                            f: '=IFERROR(INDEX(B:B,AGGREGATE(15,6,ROW($A$2:$A$20)/($A$2:$A$20=D7),COUNTIF(D$2:D7,D7))),"")',
                        },
                    },
                    7: {
                        4: {
                            f: '=IFERROR(INDEX(B:B,AGGREGATE(15,6,ROW($A$2:$A$20)/($A$2:$A$20=D8),COUNTIF(D$2:D8,D8))),"")',
                        },
                    },
                    8: {
                        4: {
                            f: '=IFERROR(INDEX(B:B,AGGREGATE(15,6,ROW($A$2:$A$20)/($A$2:$A$20=D9),COUNTIF(D$2:D9,D9))),"")',
                        },
                    },
                },
            },
        },
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: [],
    };
};

describe('Test AGGREGATE formula 3', () => {
    let get: Injector['get'];
    let worksheet: Worksheet;
    let formulaEngine: FFormula;
    let commandService: ICommandService;
    let getCellValue: (row: number, column: number) => Nullable<CellValue>;

    beforeEach(async () => {
        const testBed = createFunctionTestBed(getFunctionsTestWorkbookData());

        get = testBed.get;
        worksheet = testBed.sheet.getSheetBySheetId(subUnitId) as Worksheet;
        formulaEngine = testBed.api.getFormula() as FFormula;

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
    });

    describe('Test formula', () => {
        it('Test IFERROR nested INDEX,AGGREGATE,ROW,COUNTIF', () => {
            expect(getCellValue(1, 4)).toBe('Yellow');
            expect(getCellValue(2, 4)).toBe('Black');
            expect(getCellValue(3, 4)).toBe('Yellow1');
            expect(getCellValue(4, 4)).toBe('Green');
            expect(getCellValue(5, 4)).toBe('Red');
            expect(getCellValue(6, 4)).toBe('Blue');
            expect(getCellValue(7, 4)).toBe('');
            expect(getCellValue(8, 4)).toBe('');
        });
    });
});
