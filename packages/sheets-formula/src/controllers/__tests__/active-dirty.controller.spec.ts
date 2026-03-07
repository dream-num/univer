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

import type { Dependency, ICommandInfo, IWorkbookData } from '@univerjs/core';
import type { ISetDefinedNameMutationParam } from '@univerjs/engine-formula';
import type { IInsertSheetMutationParams, IRemoveRowsMutationParams } from '@univerjs/sheets';
import type { ITestBed } from '../../facade/__tests__/create-test-bed';
import { LocaleType } from '@univerjs/core';
import {
    ActiveDirtyManagerService,
    FormulaDataModel,
    IActiveDirtyManagerService,
    RemoveDefinedNameMutation,
    SetDefinedNameMutation,
    SetTriggerFormulaCalculationStartMutation,
} from '@univerjs/engine-formula';
import {
    InsertSheetMutation,
    MoveRangeMutation,
    RemoveColMutation,
    RemoveRowMutation,
    RemoveSheetMutation,
    ReorderRangeMutation,
    SetRangeValuesMutation,
    SetRowHiddenMutation,
    SetStyleCommand,
} from '@univerjs/sheets';
import { afterEach, describe, expect, it } from 'vitest';

import { createFacadeTestBed } from '../../facade/__tests__/create-test-bed';
import { ActiveDirtyController } from '../active-dirty.controller';

function createWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'test',
        sheetOrder: ['sheet1'],
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'Sheet1',
                cellData: {},
                rowCount: 6,
                columnCount: 8,
            },
        },
        styles: {},
    };
}

function createControllerTestBed(): ITestBed {
    const dependencies: Dependency[] = [
        [IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }],
        [ActiveDirtyController],
    ];

    return createFacadeTestBed(createWorkbookData(), dependencies);
}

function getDirtyData(testBed: ITestBed, command: ICommandInfo) {
    const activeDirtyManagerService = testBed.injector.get(IActiveDirtyManagerService);
    const conversion = activeDirtyManagerService.get(command.id);

    expect(conversion).toBeDefined();

    return conversion!.getDirtyData(command);
}

describe('ActiveDirtyController', () => {
    let testBed: ITestBed;

    afterEach(() => {
        testBed?.univer.dispose();
    });

    it('should convert range mutations into dirty ranges and skip style-triggered updates', () => {
        testBed = createControllerTestBed();

        const formulaDataModel = testBed.injector.get(FormulaDataModel);

        formulaDataModel.setArrayFormulaRange({
            test: {
                sheet1: {
                    0: {
                        0: {
                            startRow: 0,
                            startColumn: 0,
                            endRow: 1,
                            endColumn: 1,
                        },
                    },
                },
            },
        });

        testBed.injector.get(ActiveDirtyController);

        expect(getDirtyData(testBed, {
            id: SetRangeValuesMutation.id,
            params: {
                unitId: 'test',
                subUnitId: 'sheet1',
                trigger: SetStyleCommand.id,
                cellValue: {
                    1: {
                        1: { v: 1 },
                    },
                },
            },
        } as ICommandInfo)).toEqual({});

        expect(getDirtyData(testBed, {
            id: SetRangeValuesMutation.id,
            params: {
                unitId: 'test',
                subUnitId: 'sheet1',
                cellValue: {
                    1: {
                        1: { v: 1 },
                    },
                    3: {
                        2: { v: 2 },
                    },
                },
            },
        } as ICommandInfo)).toEqual({
            dirtyRanges: [
                {
                    unitId: 'test',
                    sheetId: 'sheet1',
                    range: { startRow: 1, startColumn: 1, endRow: 1, endColumn: 1 },
                },
                {
                    unitId: 'test',
                    sheetId: 'sheet1',
                    range: { startRow: 3, startColumn: 2, endRow: 3, endColumn: 2 },
                },
                {
                    unitId: 'test',
                    sheetId: 'sheet1',
                    range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 },
                },
            ],
        });
    });

    it('should collect dirty ranges and dependency cache clears for move and reorder mutations', () => {
        testBed = createControllerTestBed();
        testBed.injector.get(ActiveDirtyController);

        expect(getDirtyData(testBed, {
            id: MoveRangeMutation.id,
            params: {
                unitId: 'test',
                from: {
                    subUnitId: 'sheet1',
                    value: {
                        0: {
                            0: { v: 1 },
                        },
                    },
                },
                to: {
                    subUnitId: 'sheet1',
                    value: {
                        2: {
                            2: { v: 2 },
                        },
                    },
                },
            },
        } as ICommandInfo)).toEqual({
            dirtyRanges: [
                {
                    unitId: 'test',
                    sheetId: 'sheet1',
                    range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 },
                },
                {
                    unitId: 'test',
                    sheetId: 'sheet1',
                    range: { startRow: 2, startColumn: 2, endRow: 2, endColumn: 2 },
                },
            ],
            clearDependencyTreeCache: {
                test: {
                    sheet1: '1',
                },
            },
        });

        expect(getDirtyData(testBed, {
            id: ReorderRangeMutation.id,
            params: {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: {
                    startRow: 1,
                    startColumn: 1,
                    endRow: 2,
                    endColumn: 3,
                },
            },
        } as ICommandInfo)).toEqual({
            dirtyRanges: [
                {
                    unitId: 'test',
                    sheetId: 'sheet1',
                    range: { startRow: 1, startColumn: 1, endRow: 2, endColumn: 3 },
                },
            ],
            clearDependencyTreeCache: {
                test: {
                    sheet1: '1',
                },
            },
        });
    });

    it('should expand row and column removals to worksheet bounds and keep hide-row ranges', () => {
        testBed = createControllerTestBed();
        testBed.injector.get(ActiveDirtyController);

        const removeRowsParams: IRemoveRowsMutationParams = {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: {
                startRow: 1,
                startColumn: 0,
                endRow: 2,
                endColumn: 0,
            },
        };

        expect(getDirtyData(testBed, {
            id: RemoveRowMutation.id,
            params: removeRowsParams,
        } as ICommandInfo)).toEqual({
            dirtyRanges: [
                {
                    unitId: 'test',
                    sheetId: 'sheet1',
                    range: { startRow: 1, startColumn: 0, endRow: 2, endColumn: 7 },
                },
            ],
            clearDependencyTreeCache: {
                test: {
                    sheet1: '1',
                },
            },
        });

        expect(getDirtyData(testBed, {
            id: RemoveColMutation.id,
            params: {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: {
                    startRow: 0,
                    startColumn: 2,
                    endRow: 0,
                    endColumn: 3,
                },
            },
        } as ICommandInfo)).toEqual({
            dirtyRanges: [
                {
                    unitId: 'test',
                    sheetId: 'sheet1',
                    range: { startRow: 0, startColumn: 2, endRow: 6, endColumn: 3 },
                },
            ],
            clearDependencyTreeCache: {
                test: {
                    sheet1: '1',
                },
            },
        });

        expect(getDirtyData(testBed, {
            id: SetRowHiddenMutation.id,
            params: {
                unitId: 'test',
                subUnitId: 'sheet1',
                ranges: [{ startRow: 4, startColumn: 0, endRow: 5, endColumn: 1 }],
            },
        } as ICommandInfo)).toEqual({
            dirtyRanges: [
                {
                    unitId: 'test',
                    sheetId: 'sheet1',
                    range: { startRow: 4, startColumn: 0, endRow: 5, endColumn: 1 },
                },
            ],
            clearDependencyTreeCache: {
                test: {
                    sheet1: '1',
                },
            },
        });
    });

    it('should pass through sheet and defined-name dirty maps', () => {
        testBed = createControllerTestBed();
        testBed.injector.get(ActiveDirtyController);

        const definedNameParams: ISetDefinedNameMutationParam = {
            unitId: 'test',
            id: 'defined-name',
            name: 'DIRTY_NAME',
            formulaOrRefString: 'Sheet1!$A$1',
        };
        const insertSheetParams = {
            unitId: 'test',
            sheet: {
                ...createWorkbookData().sheets.sheet1,
                id: 'sheet-added',
                name: 'Added Sheet',
            },
        } as IInsertSheetMutationParams;

        expect(getDirtyData(testBed, {
            id: SetTriggerFormulaCalculationStartMutation.id,
            params: {
                forceCalculation: true,
                dirtyRanges: [],
                dirtyNameMap: { test: { sheet1: 'Sheet1' } },
                dirtyDefinedNameMap: {},
                dirtyUnitFeatureMap: {},
                dirtyUnitOtherFormulaMap: {},
                clearDependencyTreeCache: {},
            },
        } as ICommandInfo)).toEqual({
            forceCalculation: true,
            dirtyRanges: [],
            dirtyNameMap: { test: { sheet1: 'Sheet1' } },
            dirtyDefinedNameMap: {},
            dirtyUnitFeatureMap: {},
            dirtyUnitOtherFormulaMap: {},
            clearDependencyTreeCache: {},
        });

        expect(getDirtyData(testBed, {
            id: RemoveSheetMutation.id,
            params: {
                unitId: 'test',
                subUnitId: 'sheet1',
                subUnitName: 'Sheet1',
            },
        } as ICommandInfo)).toEqual({
            dirtyNameMap: {
                test: {
                    sheet1: 'Sheet1',
                },
            },
            clearDependencyTreeCache: {
                test: {
                    sheet1: '1',
                },
            },
        });

        expect(getDirtyData(testBed, {
            id: InsertSheetMutation.id,
            params: insertSheetParams,
        } as ICommandInfo)).toEqual({
            dirtyNameMap: {
                test: {
                    'sheet-added': 'Added Sheet',
                },
            },
        });

        expect(getDirtyData(testBed, {
            id: SetDefinedNameMutation.id,
            params: definedNameParams,
        } as ICommandInfo)).toEqual({
            dirtyDefinedNameMap: {
                test: {
                    DIRTY_NAME: 'Sheet1!$A$1',
                },
            },
        });

        expect(getDirtyData(testBed, {
            id: RemoveDefinedNameMutation.id,
            params: definedNameParams,
        } as ICommandInfo)).toEqual({
            dirtyDefinedNameMap: {
                test: {
                    DIRTY_NAME: 'Sheet1!$A$1',
                },
            },
        });
    });
});
