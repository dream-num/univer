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

import type { Dependency, ICellData, IWorkbookData, Nullable, Workbook } from '@univerjs/core';
import { CellValueType, ICommandService, IConfigService, IUniverInstanceService, LocaleType, UniverInstanceType } from '@univerjs/core';
import { FormulaDataModel, SetArrayFormulaDataMutation, SetFormulaDataMutation, SetTriggerFormulaCalculationStartMutation } from '@univerjs/engine-formula';
import { InsertSheetMutation, MoveRangeCommand, MoveRangeMutation, RemoveSheetCommand, RemoveSheetMutation, SetRangeValuesCommand, SetRangeValuesMutation, SetSelectionsOperation, SetStyleCommand, SetWorksheetNameCommand, SheetInterceptorService } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFacadeTestBed } from '../../facade/__tests__/create-test-bed';
import { CalculationMode, PLUGIN_CONFIG_KEY_BASE } from '../config.schema';
import { UpdateFormulaController } from '../update-formula.controller';

function createWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'test',
        sheetOrder: ['sheet1', 'sheet2'],
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'Sheet1',
                rowCount: 20,
                columnCount: 20,
                cellData: {
                    0: {
                        0: { v: 1, t: CellValueType.NUMBER },
                        1: { v: 1, t: CellValueType.NUMBER },
                    },
                    1: {
                        0: { v: 1, t: CellValueType.NUMBER },
                        1: { v: 1, t: CellValueType.NUMBER },
                    },
                    5: {
                        2: { f: '=SUM(A1:B2)' },
                        3: { v: 1, t: CellValueType.NUMBER },
                    },
                },
            },
            sheet2: {
                id: 'sheet2',
                name: 'Sheet2',
                rowCount: 20,
                columnCount: 20,
                cellData: {
                    0: {
                        0: { f: '=Sheet1!A1:B2' },
                        1: { f: '=RANGE_NAME' },
                    },
                },
            },
        },
        styles: {},
    };
}

function createControllerTestBed() {
    const dependencies: Dependency[] = [[UpdateFormulaController]];

    return createFacadeTestBed(createWorkbookData(), dependencies);
}

describe('UpdateFormulaController', () => {
    let testBed: ReturnType<typeof createControllerTestBed>;
    let commandService: ICommandService;
    let formulaDataModel: FormulaDataModel;

    beforeEach(() => {
        testBed = createControllerTestBed();
        commandService = testBed.injector.get(ICommandService);
        formulaDataModel = testBed.injector.get(FormulaDataModel);

        commandService.registerCommand(MoveRangeCommand);
        commandService.registerCommand(MoveRangeMutation);
        commandService.registerCommand(InsertSheetMutation);
        commandService.registerCommand(RemoveSheetMutation);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetFormulaDataMutation);
        commandService.registerCommand(SetArrayFormulaDataMutation);

        testBed.injector.get(UpdateFormulaController);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        testBed?.univer.dispose();
    });

    it('should update formula references when a referenced range moves', async () => {
        expect(await commandService.executeCommand(MoveRangeCommand.id, {
            fromRange: {
                startRow: 0,
                startColumn: 0,
                endRow: 1,
                endColumn: 1,
                rangeType: 0,
            },
            toRange: {
                startRow: 0,
                startColumn: 3,
                endRow: 1,
                endColumn: 4,
                rangeType: 0,
            },
        })).toBe(true);

        const values = testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet1')
            ?.getRange(5, 2, 5, 2)
            .getValues() as Array<Array<Nullable<ICellData>>>;

        expect(values).toEqual([[{ f: '=SUM(D1:E2)' }]]);
    });

    it('should move the formula cell itself without changing its formula string', async () => {
        expect(await commandService.executeCommand(MoveRangeCommand.id, {
            fromRange: {
                startRow: 5,
                startColumn: 2,
                endRow: 5,
                endColumn: 2,
                rangeType: 0,
            },
            toRange: {
                startRow: 5,
                startColumn: 3,
                endRow: 5,
                endColumn: 3,
                rangeType: 0,
            },
        })).toBe(true);

        const values = testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet1')
            ?.getRange(5, 2, 5, 3)
            .getValues() as Array<Array<Nullable<ICellData>>>;

        expect(values).toEqual([[null, { f: '=SUM(A1:B2)' }]]);
    });

    it('should rewrite formulas when referenced sheets change', () => {
        const sheetInterceptorService = testBed.injector.get(SheetInterceptorService);

        const renameSheetResult = sheetInterceptorService.onCommandExecute({
            id: SetWorksheetNameCommand.id,
            params: {
                unitId: 'test',
                subUnitId: 'sheet1',
                name: 'Sheet1Renamed',
            },
        });

        expect(renameSheetResult.redos).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: SetRangeValuesMutation.id,
                params: expect.objectContaining({
                    unitId: 'test',
                    subUnitId: 'sheet2',
                    cellValue: {
                        0: {
                            0: expect.objectContaining({ f: '=Sheet1Renamed!A1:B2' }),
                        },
                    },
                }),
            }),
        ]));
        expect(renameSheetResult.undos).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: SetRangeValuesMutation.id,
                params: expect.objectContaining({
                    unitId: 'test',
                    subUnitId: 'sheet2',
                    cellValue: {
                        0: {
                            0: expect.objectContaining({ f: '=Sheet1!A1:B2' }),
                        },
                    },
                }),
            }),
        ]));

        const removeSheetResult = sheetInterceptorService.onCommandExecute({
            id: RemoveSheetCommand.id,
            params: {
                unitId: 'test',
                subUnitId: 'sheet1',
            },
        });

        expect(removeSheetResult.redos).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: SetRangeValuesMutation.id,
                params: expect.objectContaining({
                    unitId: 'test',
                    subUnitId: 'sheet2',
                    cellValue: {
                        0: {
                            0: expect.objectContaining({ f: '=#REF!' }),
                        },
                    },
                }),
            }),
        ]));
    });

    it('should sync formula data for value mutations and ignore style-only updates', async () => {
        const executeCommandSpy = vi.spyOn(commandService, 'executeCommand');

        await commandService.executeCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: {
                6: {
                    0: { f: '=A1' },
                },
            },
        });

        expect(formulaDataModel.getFormulaData().test?.sheet1?.[6]?.[0]).toMatchObject({ f: '=A1' });

        const formulaSyncCallCount = executeCommandSpy.mock.calls.filter(([id]) => id === SetFormulaDataMutation.id).length;

        await commandService.executeCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            trigger: SetStyleCommand.id,
            cellValue: {
                7: {
                    0: { f: '=B1' },
                },
            },
        });

        expect(executeCommandSpy.mock.calls.filter(([id]) => id === SetFormulaDataMutation.id)).toHaveLength(formulaSyncCallCount);
    });

    it('should initialize formula data for added sheets and workbooks, then clear removed sheets', async () => {
        const configService = testBed.injector.get(IConfigService);
        const executeCommandSpy = vi.spyOn(commandService, 'executeCommand');
        const workbookSnapshot = testBed.injector.get(IUniverInstanceService).getUnit<Workbook>('test')?.getSnapshot();

        configService.setConfig(PLUGIN_CONFIG_KEY_BASE, {
            initialFormulaComputing: CalculationMode.FORCED,
        });

        await commandService.executeCommand(InsertSheetMutation.id, {
            unitId: 'test',
            sheet: {
                ...workbookSnapshot!.sheets.sheet1,
                id: 'sheet-added',
                name: 'Added Sheet',
                cellData: {
                    0: {
                        0: { f: '=Sheet1!A1' },
                    },
                },
            },
        });

        expect(formulaDataModel.getFormulaData().test?.['sheet-added']?.[0]?.[0]).toMatchObject({ f: '=Sheet1!A1' });

        await commandService.executeCommand(RemoveSheetMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet-added',
            subUnitName: 'Added Sheet',
        });

        expect(formulaDataModel.getFormulaData().test?.['sheet-added']).toBeUndefined();

        testBed.univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
            id: 'secondary',
            appVersion: '3.0.0-alpha',
            locale: LocaleType.EN_US,
            name: 'secondary',
            sheetOrder: ['sheet1'],
            sheets: {
                sheet1: {
                    id: 'sheet1',
                    name: 'Sheet1',
                    rowCount: 20,
                    columnCount: 20,
                    cellData: {
                        0: {
                            0: { f: '=SUM(A1)' },
                        },
                    },
                },
            },
            styles: {},
        });

        expect(formulaDataModel.getFormulaData().secondary?.sheet1?.[0]?.[0]).toMatchObject({ f: '=SUM(A1)' });
        expect(executeCommandSpy).toHaveBeenCalledWith(
            SetTriggerFormulaCalculationStartMutation.id,
            expect.objectContaining({
                forceCalculation: true,
            }),
            {
                onlyLocal: true,
            }
        );
    });
});
