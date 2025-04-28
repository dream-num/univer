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
import {
    functionLogical,
    functionLookup,
    functionMath,
    functionMeta,
    IFormulaCurrentConfigService,
    IFormulaRuntimeService,
    IFunctionService,
    SetArrayFormulaDataMutation,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
    SetFormulaCalculationStartMutation,
    SetFormulaCalculationStopMutation,
} from '@univerjs/engine-formula';
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
        sheets: {
            sheet1: {
                id: subUnitId,
                cellData: {
                    6: {
                        0: {
                            v: 'aaa',
                            t: 1,
                        },
                        1: {
                            f: '=ROW(A7)-ROW($A$6)',
                        },
                        2: {
                            f: '=ROW(A7)-ROW($A$6)+3',
                            t: 2,
                        },
                        3: {
                            f: '=XLOOKUP(B7,$B$7:$B$16,$A$7:$A$16)',
                        },
                        4: {
                            f: '=XLOOKUP(C7,$C$7:$C$16,$A$7:$A$16)',
                        },
                    },
                    7: {
                        0: {
                            v: 'bbb',
                            t: 1,
                        },
                        1: {
                            f: '=ROW(A8)-ROW($A$6)',
                            si: 'YKcfsr',
                        },
                        2: {
                            f: '=ROW(A8)-ROW($A$6)+3',
                            si: 'Di7wtl',
                        },
                        3: {
                            f: '=XLOOKUP(B8,$B$7:$B$16,$A$7:$A$16)',
                        },
                        4: {
                            f: '=XLOOKUP(C8,$C$7:$C$16,$A$7:$A$16)',
                        },
                    },
                    8: {
                        0: {
                            v: 'ccc',
                            t: 1,
                        },
                        1: {
                            si: 'YKcfsr',
                            t: 2,
                        },
                        2: {
                            si: 'Di7wtl',
                            t: 2,
                        },
                        3: {
                            f: '=XLOOKUP(B9,$B$7:$B$16,$A$7:$A$16)',
                        },
                        4: {
                            f: '=XLOOKUP(C9,$C$7:$C$16,$A$7:$A$16)',
                        },
                    },
                    9: {
                        0: {
                            v: 'ddd',
                            t: 1,
                        },
                        1: {
                            si: 'YKcfsr',
                            t: 2,
                        },
                        2: {
                            si: 'Di7wtl',
                            t: 2,
                        },
                        3: {
                            f: '=XLOOKUP(B10,$B$7:$B$16,$A$7:$A$16)',
                        },
                        4: {
                            f: '=XLOOKUP(C10,$C$7:$C$16,$A$7:$A$16)',
                        },
                    },
                    10: {
                        0: {
                            v: 'eee',
                            t: 1,
                        },
                        1: {
                            si: 'YKcfsr',
                            t: 2,
                        },
                        2: {
                            si: 'Di7wtl',
                            t: 2,
                        },
                        3: {
                            f: '=XLOOKUP(B11,$B$7:$B$16,$A$7:$A$16)',
                        },
                        4: {
                            f: '=XLOOKUP(C11,$C$7:$C$16,$A$7:$A$16)',
                        },
                    },
                    11: {
                        0: {
                            v: 'fff',
                            t: 1,
                        },
                        1: {
                            si: 'YKcfsr',
                            t: 2,
                        },
                        2: {
                            si: 'Di7wtl',
                            t: 2,
                        },
                        3: {
                            f: '=XLOOKUP(B12,$B$7:$B$16,$A$7:$A$16)',
                        },
                        4: {
                            f: '=XLOOKUP(C12,$C$7:$C$16,$A$7:$A$16)',
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
            ...functionMath,
            ...functionMeta,
            ...functionLogical,
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

        formulaEngine.executeCalculation();
        await formulaEngine.onCalculationEnd();

        getCellValue = (row: number, column: number) => {
            return worksheet.getCellRaw(row, column)?.v;
        };
    });

    describe('Test formula', () => {
        it('Xlookup formula test', () => {
            expect(getCellValue(6, 1)).toBe(1);
            expect(getCellValue(6, 2)).toBe(4);
            expect(getCellValue(6, 3)).toBe('aaa');
            expect(getCellValue(6, 4)).toBe('aaa');
            expect(getCellValue(7, 1)).toBe(2);
            expect(getCellValue(7, 2)).toBe(5);
            expect(getCellValue(7, 3)).toBe('bbb');
            expect(getCellValue(7, 4)).toBe('bbb');
            expect(getCellValue(8, 1)).toBe(3);
            expect(getCellValue(8, 2)).toBe(6);
            expect(getCellValue(8, 3)).toBe('ccc');
            expect(getCellValue(8, 4)).toBe('ccc');
            expect(getCellValue(9, 1)).toBe(4);
            expect(getCellValue(9, 2)).toBe(7);
            expect(getCellValue(9, 3)).toBe('ddd');
            expect(getCellValue(9, 4)).toBe('ddd');
            expect(getCellValue(10, 1)).toBe(5);
            expect(getCellValue(10, 2)).toBe(8);
            expect(getCellValue(10, 3)).toBe('eee');
            expect(getCellValue(10, 4)).toBe('eee');
            expect(getCellValue(11, 1)).toBe(6);
            expect(getCellValue(11, 2)).toBe(9);
            expect(getCellValue(11, 3)).toBe('fff');
            expect(getCellValue(11, 4)).toBe('fff');
        });
    });
});
