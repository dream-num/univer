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
        styles: {},
        sheets: {
            sheet1: {
                id: subUnitId,
                cellData: {
                    0: {
                        0: {
                            v: '1st',
                            t: 1,
                        },
                        1: {
                            v: '2nd',
                            t: 1,
                        },
                        6: {
                            v: '1st',
                            t: 1,
                        },
                        7: {
                            v: 'Occurances',
                            t: 1,
                        },
                        8: {
                            v: '2nd ->',
                            t: 1,
                        },
                    },
                    1: {
                        0: {
                            v: '1',
                            t: 2,
                        },
                        1: {
                            v: 'a',
                            t: 1,
                        },
                        2: {
                            v: '1',
                            t: 2,
                        },
                        6: {
                            v: 1,
                            t: 2,
                        },
                        8: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G2,ROW($B$2:$B$13)),1)),"")',
                        },
                        9: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G2,ROW($B$2:$B$13)),2)),"")',
                        },
                        10: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G2,ROW($B$2:$B$13)),3)),"")',
                        },
                        11: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G2,ROW($B$2:$B$13)),4)),"")',
                        },
                        12: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G2,ROW($B$2:$B$13)),5)),"")',
                        },
                        13: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G2,ROW($B$2:$B$13)),6)),"")',
                        },
                        14: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G2,ROW($B$2:$B$13)),7)),"")',
                        },
                    },
                    2: {
                        0: {
                            v: '1',
                            t: 2,
                        },
                        1: {
                            v: 'b',
                            t: 1,
                        },
                        2: {
                            v: '1',
                            t: 2,
                        },
                        6: {
                            v: 2,
                            t: 2,
                        },
                        8: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G3,ROW($B$2:$B$13)),1)),"")',
                        },
                        9: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G3,ROW($B$2:$B$13)),2)),"")',
                        },
                        10: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G3,ROW($B$2:$B$13)),3)),"")',
                        },
                        11: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G3,ROW($B$2:$B$13)),4)),"")',
                        },
                        12: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G3,ROW($B$2:$B$13)),5)),"")',
                        },
                        13: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G3,ROW($B$2:$B$13)),6)),"")',
                        },
                        14: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G3,ROW($B$2:$B$13)),7)),"")',
                        },
                    },
                    3: {
                        0: {
                            v: '1',
                            t: 2,
                        },
                        1: {
                            v: 'c',
                            t: 1,
                        },
                        2: {
                            v: '1',
                            t: 2,
                        },
                        6: {
                            v: 3,
                            t: 2,
                        },
                        8: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G4,ROW($B$2:$B$13)),1)),"")',
                        },
                        9: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G4,ROW($B$2:$B$13)),2)),"")',
                        },
                        10: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G4,ROW($B$2:$B$13)),3)),"")',
                        },
                        11: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G4,ROW($B$2:$B$13)),4)),"")',
                        },
                        12: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G4,ROW($B$2:$B$13)),5)),"")',
                        },
                        13: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G4,ROW($B$2:$B$13)),6)),"")',
                        },
                        14: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G4,ROW($B$2:$B$13)),7)),"")',
                        },
                    },
                    4: {
                        0: {
                            v: '2',
                            t: 2,
                        },
                        1: {
                            v: 'x',
                            t: 1,
                        },
                        2: {
                            v: '1',
                            t: 2,
                        },
                        8: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G5,ROW($B$2:$B$13)),1)),"")',
                        },
                        9: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G5,ROW($B$2:$B$13)),2)),"")',
                        },
                        10: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G5,ROW($B$2:$B$13)),3)),"")',
                        },
                        11: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G5,ROW($B$2:$B$13)),4)),"")',
                        },
                        12: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G5,ROW($B$2:$B$13)),5)),"")',
                        },
                        13: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G5,ROW($B$2:$B$13)),6)),"")',
                        },
                        14: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G5,ROW($B$2:$B$13)),7)),"")',
                        },
                    },
                    5: {
                        0: {
                            v: '2',
                            t: 2,
                        },
                        1: {
                            v: 'w',
                            t: 1,
                        },
                        2: {
                            v: '1',
                            t: 2,
                        },
                    },
                    6: {
                        0: {
                            v: '2',
                            t: 2,
                        },
                        1: {
                            v: 'y',
                            t: 1,
                        },
                        2: {
                            v: '1',
                            t: 2,
                        },
                        8: {
                            f: '=INDEX($B$2:$B$13,1)',
                        },
                    },
                    7: {
                        0: {
                            v: '2',
                            t: 2,
                        },
                        1: {
                            v: 'z',
                            t: 1,
                        },
                        2: {
                            v: '1',
                            t: 2,
                        },
                        8: {
                            f: '=INDEX($B:$B,2)',
                        },
                    },
                    8: {
                        0: {
                            v: '3',
                            t: 2,
                        },
                        1: {
                            v: 'aa',
                            t: 1,
                        },
                        2: {
                            v: '1',
                            t: 2,
                        },
                    },
                    9: {
                        0: {
                            v: '3',
                            t: 2,
                        },
                        1: {
                            v: 'ab',
                            t: 1,
                        },
                        2: {
                            v: '1',
                            t: 2,
                        },
                        8: {
                            f: '=AGGREGATE(15,6,ROW($B$2:$B$13)/($A$2:$A$13=$G2),1)',
                        },
                    },
                    10: {
                        0: {
                            v: '3',
                            t: 2,
                        },
                        1: {
                            v: 'ac',
                            t: 1,
                        },
                        2: {
                            v: '1',
                            t: 2,
                        },
                    },
                    11: {
                        0: {
                            v: '3',
                            t: 2,
                        },
                        1: {
                            v: 'ad',
                            t: 1,
                        },
                        2: {
                            v: '1',
                            t: 2,
                        },
                        8: {
                            f: '=IFERROR(INDEX($B:$B,SMALL(IF($A$2:$A$13=$G2,ROW($B$2:$B$13)),1)),"")',
                        },
                    },
                    12: {
                        0: {
                            v: '3',
                            t: 2,
                        },
                        1: {
                            v: 'ae',
                            t: 1,
                        },
                        2: {
                            v: '1',
                            t: 2,
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

describe('Test AGGREGATE formula', () => {
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
        it('Test IFERROR nested INDEX,SMALL,IF,ROW', () => {
            expect(getCellValue(1, 8)).toBe('a');
            expect(getCellValue(1, 9)).toBe('b');
            expect(getCellValue(1, 10)).toBe('c');
            expect(getCellValue(1, 11)).toBe('');
            expect(getCellValue(1, 12)).toBe('');
            expect(getCellValue(1, 13)).toBe('');
            expect(getCellValue(1, 14)).toBe('');

            expect(getCellValue(2, 8)).toBe('x');
            expect(getCellValue(2, 9)).toBe('w');
            expect(getCellValue(2, 10)).toBe('y');
            expect(getCellValue(2, 11)).toBe('z');
            expect(getCellValue(2, 12)).toBe('');
            expect(getCellValue(2, 13)).toBe('');
            expect(getCellValue(2, 14)).toBe('');

            expect(getCellValue(3, 8)).toBe('aa');
            expect(getCellValue(3, 9)).toBe('ab');
            expect(getCellValue(3, 10)).toBe('ac');
            expect(getCellValue(3, 11)).toBe('ad');
            expect(getCellValue(3, 12)).toBe('ae');
            expect(getCellValue(3, 13)).toBe('');
            expect(getCellValue(3, 14)).toBe('');

            expect(getCellValue(4, 8)).toBe('');
            expect(getCellValue(4, 9)).toBe('');
            expect(getCellValue(4, 10)).toBe('');
            expect(getCellValue(4, 11)).toBe('');
            expect(getCellValue(4, 12)).toBe('');
            expect(getCellValue(4, 13)).toBe('');
            expect(getCellValue(4, 14)).toBe('');

            expect(getCellValue(11, 8)).toBe('a');
        });

        it('Test INDEX', () => {
            expect(getCellValue(6, 8)).toBe('a');
            expect(getCellValue(7, 8)).toBe('a');
        });

        it('Test AGGREGATE nested ROW', () => {
            expect(getCellValue(9, 8)).toBe(2);
        });
    });
});
