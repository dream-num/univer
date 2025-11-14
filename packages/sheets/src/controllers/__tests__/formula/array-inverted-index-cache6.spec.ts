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

import type { CellValue, CellValueType, Ctor, Injector, IWorkbookData, Nullable, Worksheet } from '@univerjs/core';
import type { BaseFunction, IFunctionNames } from '@univerjs/engine-formula';
import type { FFormula } from '@univerjs/engine-formula/facade';
import { ICommandService, LocaleType } from '@univerjs/core';
import { FormulaDataModel, functionMeta, IFormulaCurrentConfigService, IFormulaRuntimeService, IFunctionService, SetArrayFormulaDataMutation, SetFormulaCalculationNotificationMutation, SetFormulaCalculationResultMutation, SetFormulaCalculationStartMutation, SetFormulaCalculationStopMutation } from '@univerjs/engine-formula';
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
            R4: {
                n: {
                    pattern: '[$-409]mmm\\-yy;@',
                },
            },
            R5: {
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
                            v: 'Hire Date',
                            t: 1,
                        },
                        1: {
                            v: 'Term Date',
                            t: 1,
                        },
                        3: {
                            v: 'Month 2016',
                            t: 1,
                        },
                        4: {
                            v: '42370',
                            t: 2,
                            s: 'R4',
                        },
                        5: {
                            v: '42401',
                            t: 2,
                            s: 'R4',
                        },
                        6: {
                            v: '42430',
                            t: 2,
                            s: 'R4',
                        },
                        7: {
                            v: '42461',
                            t: 2,
                            s: 'R4',
                        },
                        8: {
                            v: '42491',
                            t: 2,
                            s: 'R4',
                        },
                        9: {
                            v: '42522',
                            t: 2,
                            s: 'R4',
                        },
                        10: {
                            v: '42552',
                            t: 2,
                            s: 'R4',
                        },
                        11: {
                            v: '42583',
                            t: 2,
                            s: 'R4',
                        },
                        12: {
                            v: '42614',
                            t: 2,
                            s: 'R4',
                        },
                        13: {
                            v: '42644',
                            t: 2,
                            s: 'R4',
                        },
                        14: {
                            v: '42675',
                            t: 2,
                            s: 'R4',
                        },
                        15: {
                            v: '42705',
                            t: 2,
                            s: 'R4',
                        },
                    },
                    1: {
                        0: {
                            v: '40514',
                            t: 2,
                            s: 'R5',
                        },
                        3: {
                            v: 'Current',
                            t: 1,
                        },
                    },
                    2: {
                        0: {
                            v: '40665',
                            t: 2,
                            s: 'R5',
                        },
                        3: {
                            v: 'Term/Resign/Trans',
                            t: 1,
                        },
                    },
                    3: {
                        0: {
                            v: '40721',
                            t: 2,
                            s: 'R5',
                        },
                        3: {
                            v: 'Budget',
                            t: 1,
                        },
                    },
                    4: {
                        0: {
                            v: '40931',
                            t: 2,
                            s: 'R5',
                        },
                        3: {
                            v: 'Difference',
                            t: 1,
                        },
                    },
                    5: {
                        0: {
                            v: '41110',
                            t: 2,
                            s: 'R5',
                        },
                        1: {
                            v: '42370',
                            t: 2,
                            s: 'R5',
                        },
                    },
                    6: {
                        0: {
                            v: '41298',
                            t: 2,
                            s: 'R5',
                        },
                    },
                    7: {
                        0: {
                            v: '41437',
                            t: 2,
                            s: 'R5',
                        },
                    },
                    8: {
                        0: {
                            v: '41652',
                            t: 2,
                            s: 'R5',
                        },
                    },
                    9: {
                        0: {
                            v: '41652',
                            t: 2,
                            s: 'R5',
                        },
                    },
                    10: {
                        0: {
                            v: '41786',
                            t: 2,
                            s: 'R5',
                        },
                    },
                    11: {
                        0: {
                            v: '41799',
                            t: 2,
                            s: 'R5',
                        },
                    },
                    12: {
                        0: {
                            v: '41884',
                            t: 2,
                            s: 'R5',
                        },
                    },
                    13: {
                        0: {
                            v: '41981',
                            t: 2,
                            s: 'R5',
                        },
                    },
                    14: {
                        0: {
                            v: '42100',
                            t: 2,
                            s: 'R5',
                        },
                    },
                    15: {
                        0: {
                            v: '42114',
                            t: 2,
                            s: 'R5',
                        },
                    },
                    16: {
                        0: {
                            v: '42142',
                            t: 2,
                            s: 'R5',
                        },
                    },
                    17: {
                        0: {
                            v: '42142',
                            t: 2,
                            s: 'R5',
                        },
                    },
                    18: {
                        0: {
                            v: '42156',
                            t: 2,
                            s: 'R5',
                        },
                    },
                    19: {
                        0: {
                            v: '42163',
                            t: 2,
                            s: 'R5',
                        },
                    },
                    20: {
                        0: {
                            v: '42226',
                            t: 2,
                            s: 'R5',
                        },
                    },
                    21: {
                        0: {
                            v: '42296',
                            t: 2,
                            s: 'R5',
                        },
                    },
                    25: {
                        5: {
                            f: '=$B$2:$B$22>F$1',
                        },
                        9: {
                            f: '=$B$2:$B$22=""',
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

describe('Test inverted index cache 6', () => {
    let get: Injector['get'];
    let worksheet: Worksheet;
    let formulaEngine: FFormula;
    let commandService: ICommandService;
    let formulaDataModel: FormulaDataModel;
    let getArrayFormulaResult: (row: number, column: number) => Array<Array<{ v: Nullable<CellValue>; t: CellValueType } | null>> | null;

    beforeEach(async () => {
        const testBed = createFunctionTestBed(getFunctionsTestWorkbookData());

        get = testBed.get;
        worksheet = testBed.sheet.getSheetBySheetId(subUnitId) as Worksheet;
        formulaEngine = testBed.api.getFormula() as FFormula;
        formulaDataModel = get(FormulaDataModel);

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

        getArrayFormulaResult = (row: number, column: number) => {
            const arrayFormulaRange = formulaDataModel.getArrayFormulaRange();
            const rangeInfo = arrayFormulaRange?.[unitId]?.[subUnitId]?.[row]?.[column];
            const arrayFormulaCellData = formulaDataModel.getArrayFormulaCellData();
            const valueMatrix = arrayFormulaCellData?.[unitId]?.[subUnitId];

            if (!rangeInfo || !valueMatrix) {
                return null;
            }

            const { startRow, endRow, startColumn, endColumn } = rangeInfo;
            const result: Array<Array<{ v: Nullable<CellValue>; t: CellValueType } | null>> = [];

            for (let r = startRow; r <= endRow; r++) {
                const rowValues: Array<{ v: Nullable<CellValue>; t: CellValueType } | null> = [];
                for (let c = startColumn; c <= endColumn; c++) {
                    const cellValue = valueMatrix?.[r]?.[c];
                    if (!cellValue) {
                        rowValues.push(null);
                    } else {
                        rowValues.push({
                            v: cellValue?.v ?? null,
                            t: cellValue?.t ?? 2,
                        });
                    }
                }
                result.push(rowValues);
            }

            return result;
        };
    });

    describe('Test formula', () => {
        it('Test blank cell compare', () => {
            expect(getArrayFormulaResult(25, 5)).toStrictEqual([
                [{ v: 0, t: 3 }],
                [{ v: 0, t: 3 }],
                [{ v: 0, t: 3 }],
                [{ v: 0, t: 3 }],
                [{ v: 0, t: 3 }],
                [{ v: 0, t: 3 }],
                [{ v: 0, t: 3 }],
                [{ v: 0, t: 3 }],
                [{ v: 0, t: 3 }],
                [{ v: 0, t: 3 }],
                [{ v: 0, t: 3 }],
                [{ v: 0, t: 3 }],
                [{ v: 0, t: 3 }],
                [{ v: 0, t: 3 }],
                [{ v: 0, t: 3 }],
                [{ v: 0, t: 3 }],
                [{ v: 0, t: 3 }],
                [{ v: 0, t: 3 }],
                [{ v: 0, t: 3 }],
                [{ v: 0, t: 3 }],
                [{ v: 0, t: 3 }],
            ]);
            expect(getArrayFormulaResult(25, 9)).toStrictEqual([
                [{ v: 1, t: 3 }],
                [{ v: 1, t: 3 }],
                [{ v: 1, t: 3 }],
                [{ v: 1, t: 3 }],
                [{ v: 0, t: 3 }],
                [{ v: 1, t: 3 }],
                [{ v: 1, t: 3 }],
                [{ v: 1, t: 3 }],
                [{ v: 1, t: 3 }],
                [{ v: 1, t: 3 }],
                [{ v: 1, t: 3 }],
                [{ v: 1, t: 3 }],
                [{ v: 1, t: 3 }],
                [{ v: 1, t: 3 }],
                [{ v: 1, t: 3 }],
                [{ v: 1, t: 3 }],
                [{ v: 1, t: 3 }],
                [{ v: 1, t: 3 }],
                [{ v: 1, t: 3 }],
                [{ v: 1, t: 3 }],
                [{ v: 1, t: 3 }],
            ]);
        });
    });
});
