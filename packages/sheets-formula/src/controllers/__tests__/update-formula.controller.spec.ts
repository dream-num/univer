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
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { CellValueType, ICommandService, IConfigService, IUniverInstanceService, LocaleType, LogLevel, RedoCommand, UndoCommand, Univer, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import {
    FormulaDataModel,
    IDefinedNamesService,
    RemoveDefinedNameMutation,
    SetArrayFormulaDataMutation,
    SetDefinedNameMutation,
    SetFormulaDataMutation,
    SetTriggerFormulaCalculationStartMutation,
    UniverFormulaEnginePlugin,
} from '@univerjs/engine-formula';
import { InsertSheetMutation, MoveRangeCommand, MoveRangeMutation, RemoveDefinedNameCommand, RemoveSheetCommand, RemoveSheetMutation, SetDefinedNameCommand, SetRangeValuesCommand, SetRangeValuesMutation, SetSelectionsOperation, SetStyleCommand, SetWorksheetNameCommand, SheetInterceptorService, UniverSheetsPlugin } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CalculationMode, PLUGIN_CONFIG_KEY_BASE } from '../../config/config';
import { createFacadeTestBed } from '../../facade/__tests__/create-test-bed';
import { UniverSheetsFormulaPlugin } from '../../plugin';
import { UpdateDefinedNameController } from '../update-defined-name.controller';
import { UpdateFormulaController } from '../update-formula.controller';
import '@univerjs/sheets/facade';
import '../../facade/index';

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
                    6: {
                        0: { f: '=SUM(RANGE_NAME)' },
                        1: { f: '=RANGE_NAME' },
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
                    1: {
                        0: { f: '=RANGE_NAME' },
                        1: { f: '=RANGE_NAME+SUM(RANGE_NAME)' },
                    },
                },
            },
        },
        styles: {},
    };
}

function createControllerTestBed(initialFormulaComputing?: CalculationMode) {
    const dependencies: Dependency[] = [
        [UpdateFormulaController],
    ];

    const testBed = createFacadeTestBed(createWorkbookData(), dependencies);
    if (initialFormulaComputing != null) {
        testBed.injector.get(IConfigService).setConfig(PLUGIN_CONFIG_KEY_BASE, { initialFormulaComputing });
    }
    return testBed;
}

function setTwoByTwoArrayFormula(formulaDataModel: FormulaDataModel): void {
    formulaDataModel.setArrayFormulaRange({
        test: {
            sheet1: {
                5: {
                    5: { startRow: 5, startColumn: 5, endRow: 6, endColumn: 6 },
                },
            },
        },
    });
    formulaDataModel.setArrayFormulaCellData({
        test: {
            sheet1: {
                5: {
                    5: { v: 1 },
                    6: { v: 2 },
                },
                6: {
                    5: { v: 3 },
                    6: { v: 4 },
                },
            },
        },
    });
}

describe('UpdateFormulaController', () => {
    let testBed: ReturnType<typeof createControllerTestBed>;
    let commandService: ICommandService;
    let formulaDataModel: FormulaDataModel;
    let definedNamesService: IDefinedNamesService;

    beforeEach(() => {
        testBed = createControllerTestBed();
        commandService = testBed.injector.get(ICommandService);
        formulaDataModel = testBed.injector.get(FormulaDataModel);
        definedNamesService = testBed.injector.get(IDefinedNamesService);

        commandService.registerCommand(MoveRangeCommand);
        commandService.registerCommand(MoveRangeMutation);
        commandService.registerCommand(InsertSheetMutation);
        commandService.registerCommand(RemoveSheetMutation);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetDefinedNameCommand);
        commandService.registerCommand(RemoveDefinedNameCommand);
        commandService.registerCommand(SetDefinedNameMutation);
        commandService.registerCommand(RemoveDefinedNameMutation);
        commandService.registerCommand(SetFormulaDataMutation);
        commandService.registerCommand(SetArrayFormulaDataMutation);

        definedNamesService.registerDefinedName('test', {
            id: 'range-name',
            name: 'RANGE_NAME',
            formulaOrRefString: 'Sheet1!$A$1:$B$2',
            localSheetId: 'AllDefaultWorkbook',
            comment: '',
        });

        testBed.injector.get(UpdateFormulaController);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        testBed?.univer.dispose();
    });

    it('does not schedule workbook-added calculation in no-calculation mode', () => {
        testBed.univer.dispose();
        testBed = createControllerTestBed(CalculationMode.NO_CALCULATION);
        commandService = testBed.injector.get(ICommandService);
        commandService.registerCommand(SetFormulaDataMutation);
        const executeCommand = vi.spyOn(commandService, 'executeCommand');

        testBed.injector.get(UpdateFormulaController);
        testBed.injector.get(IUniverInstanceService).createUnit(UniverInstanceType.UNIVER_SHEET, {
            ...createWorkbookData(),
            id: 'second',
        });

        expect(executeCommand).not.toHaveBeenCalledWith(
            SetTriggerFormulaCalculationStartMutation.id,
            expect.anything(),
            expect.anything()
        );
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

    it('preserves source and other-sheet references when cutting a formula across sheets, undoing and redoing', async () => {
        const workbook = testBed.injector.get(IUniverInstanceService).getUnit<Workbook>('test')!;
        const source = workbook.getSheetBySheetId('sheet1')!;
        const target = workbook.getSheetBySheetId('sheet2')!;
        const original = '=SUM(A1:B2)+SUM(Sheet2!A1:B2)';
        commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: { 5: { 2: { f: original } } },
        });

        expect(await commandService.executeCommand(MoveRangeCommand.id, {
            fromUnitId: 'test',
            fromSubUnitId: 'sheet1',
            toUnitId: 'test',
            toSubUnitId: 'sheet2',
            fromRange: { startRow: 5, endRow: 5, startColumn: 2, endColumn: 2 },
            toRange: { startRow: 7, endRow: 7, startColumn: 3, endColumn: 3 },
        })).toBe(true);
        const expected = '=SUM(Sheet1!A1:B2)+SUM(Sheet2!A1:B2)';
        expect(target.getCell(7, 3)?.f).toBe(expected);
        expect(source.getCell(5, 2)?.f).toBeFalsy();

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(source.getCell(5, 2)?.f).toBe(original);
        expect(target.getCell(7, 3)?.f).toBeFalsy();
        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(target.getCell(7, 3)?.f).toBe(expected);
    });

    it('unpacks shared followers when moving a reference used only by their anchor, with undo and redo', async () => {
        const sheet = testBed.injector.get(IUniverInstanceService).getUnit<Workbook>('test')!.getSheetBySheetId('sheet1')!;
        commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: {
                10: { 0: { v: 10 }, 2: { f: '=A11', si: 'shared-move' } },
                11: { 0: { v: 20 }, 2: { si: 'shared-move' } },
            },
        });
        expect(await commandService.executeCommand(MoveRangeCommand.id, {
            fromRange: { startRow: 10, endRow: 10, startColumn: 0, endColumn: 0 },
            toRange: { startRow: 10, endRow: 10, startColumn: 1, endColumn: 1 },
        })).toBe(true);
        expect(sheet.getCell(10, 2)?.f).toBe('=B11');
        expect(sheet.getCell(11, 2)?.f).toBe('=A12');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(sheet.getCell(10, 2)?.f).toBe('=A11');
        expect(sheet.getCell(11, 2)?.si).toBe('shared-move');
        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(sheet.getCell(10, 2)?.f).toBe('=B11');
        expect(sheet.getCell(11, 2)?.f).toBe('=A12');
    });

    it.each([
        {
            id: 'sheet.command.set-table-config',
            params: { unitId: 'test', oldTableName: 'Sales', name: 'Revenue' },
            expected: '=SUM(Revenue[Amount])+SUM(Other[Amount])+SUM(Revenue[Units])+SUM(Revenue[[#Data],[Amount]])',
        },
        {
            id: 'sheet.command.delete-table',
            params: { unitId: 'test', tableName: 'Sales' },
            expected: '=SUM(#REF!)+SUM(Other[Amount])+SUM(#REF!)+SUM(#REF!)',
        },
        {
            id: 'sheet.command.table-remove-column-at',
            params: { unitId: 'test', subUnitId: 'sheet1', tableName: 'Sales', removedColumnNames: ['Amount'] },
            expected: '=SUM(#REF!)+SUM(Other[Amount])+SUM(Sales[Units])+SUM(#REF!)',
        },
    ])('preserves unaffected table references and reversible formula updates for $id', ({ id, params, expected }) => {
        const original = '=SUM(Sales[Amount])+SUM(Other[Amount])+SUM(Sales[Units])+SUM(Sales[[#Data],[Amount]])';
        const sheet = testBed.injector.get(IUniverInstanceService).getUnit<Workbook>('test')!.getSheetBySheetId('sheet1')!;
        commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: { 10: { 1: { f: original } } },
        });
        const result = testBed.injector.get(SheetInterceptorService).onCommandExecute({ id, params });
        for (const mutations of [result.redos, result.undos, result.redos]) {
            for (const mutation of mutations) {
                expect(commandService.syncExecuteCommand(mutation.id, mutation.params)).toBe(true);
            }
            expect(sheet.getCell(10, 1)?.f).toBe(mutations === result.undos ? original : expected);
        }
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

    it('should remove a sheet that references itself without leaving dangling formulas behind', async () => {
        commandService.registerCommand(RemoveSheetCommand);
        testBed.injector.add([UpdateDefinedNameController]);
        testBed.injector.get(UpdateDefinedNameController);

        const univerInstanceService = testBed.injector.get(IUniverInstanceService);
        const sheetInterceptorService = testBed.injector.get(SheetInterceptorService);
        const getWorkbook = () => univerInstanceService.getUnit<Workbook>('test');
        const getDefinedNameRef = () => definedNamesService.getValueById('test', 'range-name')?.formulaOrRefString;
        const getSheet2Formula = () => getWorkbook()?.getSheetBySheetId('sheet2')?.getRange(0, 0, 0, 0).getValue()?.f;

        // A formula on the sheet that is about to be removed, qualified with that sheet's own name.
        expect(commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: { 10: { 1: { f: '=SUM(Sheet1!A1:B2)' } } },
        })).toBe(true);

        const intercepted = sheetInterceptorService.onCommandExecute({
            id: RemoveSheetCommand.id,
            params: { unitId: 'test', subUnitId: 'sheet1' },
        });

        // A rewrite aimed at the removed sheet can never be applied and would abort RemoveSheetCommand halfway.
        expect(intercepted.redos).not.toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: SetRangeValuesMutation.id,
                params: expect.objectContaining({ subUnitId: 'sheet1' }),
            }),
        ]));
        expect(intercepted.redos).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: SetRangeValuesMutation.id,
                params: expect.objectContaining({ subUnitId: 'sheet2' }),
            }),
        ]));

        expect(commandService.syncExecuteCommand(RemoveSheetCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
        })).toBe(true);

        expect(getWorkbook()?.getSheetBySheetId('sheet1')).toBeFalsy();
        expect(getSheet2Formula()).toBe('=#REF!');
        expect(getDefinedNameRef()).toBe('#REF!');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);

        expect(getWorkbook()?.getSheetBySheetId('sheet1')).toBeTruthy();
        expect(getSheet2Formula()).toBe('=Sheet1!A1:B2');
        expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$2');
    });

    it('should sync defined-name formulas when a defined name is renamed, undone, and redone', async () => {
        const getFormula = () => formulaDataModel.getFormulaData().test?.sheet2?.[0]?.[1]?.f;
        const getCellFormula = () => testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet2')
            ?.getRange(0, 1, 0, 1)
            .getValue()
            ?.f;

        expect(await commandService.executeCommand(SetDefinedNameCommand.id, {
            unitId: 'test',
            id: 'range-name',
            name: 'RENAMED_RANGE',
            formulaOrRefString: 'Sheet1!$A$1:$B$2',
            localSheetId: 'AllDefaultWorkbook',
        })).toBe(true);

        expect(getFormula()).toBe('=RENAMED_RANGE');
        expect(getCellFormula()).toBe('=RENAMED_RANGE');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getFormula()).toBe('=RANGE_NAME');
        expect(getCellFormula()).toBe('=RANGE_NAME');

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getFormula()).toBe('=RENAMED_RANGE');
        expect(getCellFormula()).toBe('=RENAMED_RANGE');
    });

    it('should sync defined-name formulas when a defined name is removed, undone, and redone', async () => {
        const getFormula = () => formulaDataModel.getFormulaData().test?.sheet2?.[0]?.[1]?.f;
        const getCellFormula = () => testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet2')
            ?.getRange(0, 1, 0, 1)
            .getValue()
            ?.f;

        expect(await commandService.executeCommand(RemoveDefinedNameCommand.id, {
            unitId: 'test',
            id: 'range-name',
            name: 'RANGE_NAME',
            formulaOrRefString: 'Sheet1!$A$1:$B$2',
            localSheetId: 'AllDefaultWorkbook',
        })).toBe(true);

        expect(getFormula()).toBe('=#REF!');
        expect(getCellFormula()).toBe('=#REF!');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getFormula()).toBe('=RANGE_NAME');
        expect(getCellFormula()).toBe('=RANGE_NAME');

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getFormula()).toBe('=#REF!');
        expect(getCellFormula()).toBe('=#REF!');
    });

    it('should keep defined-name formulas synchronized when the defined name range changes, then undo and redo', async () => {
        const getFormula = () => formulaDataModel.getFormulaData().test?.sheet2?.[0]?.[1]?.f;
        const getCellFormula = () => testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet2')
            ?.getRange(0, 1, 0, 1)
            .getValue()
            ?.f;
        const getDefinedNameRef = () => definedNamesService.getValueById('test', 'range-name')?.formulaOrRefString;

        expect(await commandService.executeCommand(SetDefinedNameCommand.id, {
            unitId: 'test',
            id: 'range-name',
            name: 'RANGE_NAME',
            formulaOrRefString: '=SUM(Sheet1!$C$1:$C$2)',
            localSheetId: 'AllDefaultWorkbook',
        })).toBe(true);

        expect(getDefinedNameRef()).toBe('=SUM(Sheet1!$C$1:$C$2)');
        expect(getFormula()).toBe('=RANGE_NAME');
        expect(getCellFormula()).toBe('=RANGE_NAME');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$2');
        expect(getFormula()).toBe('=RANGE_NAME');
        expect(getCellFormula()).toBe('=RANGE_NAME');

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getDefinedNameRef()).toBe('=SUM(Sheet1!$C$1:$C$2)');
        expect(getFormula()).toBe('=RANGE_NAME');
        expect(getCellFormula()).toBe('=RANGE_NAME');
    });

    it('should sync defined-name formulas wrapped by functions when renamed, undone, and redone', async () => {
        const getFormula = () => formulaDataModel.getFormulaData().test?.sheet1?.[6]?.[0]?.f;
        const getCellFormula = () => testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet1')
            ?.getRange(6, 0, 6, 0)
            .getValue()
            ?.f;

        expect(await commandService.executeCommand(SetDefinedNameCommand.id, {
            unitId: 'test',
            id: 'range-name',
            name: 'RENAMED_RANGE',
            formulaOrRefString: 'Sheet1!$A$1:$B$2',
            localSheetId: 'AllDefaultWorkbook',
        })).toBe(true);

        expect(getFormula()).toBe('=SUM(RENAMED_RANGE)');
        expect(getCellFormula()).toBe('=SUM(RENAMED_RANGE)');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getFormula()).toBe('=SUM(RANGE_NAME)');
        expect(getCellFormula()).toBe('=SUM(RANGE_NAME)');

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getFormula()).toBe('=SUM(RENAMED_RANGE)');
        expect(getCellFormula()).toBe('=SUM(RENAMED_RANGE)');
    });

    it('should sync defined-name formulas wrapped by functions when removed, undone, and redone', async () => {
        const getFormula = () => formulaDataModel.getFormulaData().test?.sheet1?.[6]?.[0]?.f;
        const getCellFormula = () => testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet1')
            ?.getRange(6, 0, 6, 0)
            .getValue()
            ?.f;

        expect(await commandService.executeCommand(RemoveDefinedNameCommand.id, {
            unitId: 'test',
            id: 'range-name',
            name: 'RANGE_NAME',
            formulaOrRefString: 'Sheet1!$A$1:$B$2',
            localSheetId: 'AllDefaultWorkbook',
        })).toBe(true);

        expect(getFormula()).toBe('=SUM(#REF!)');
        expect(getCellFormula()).toBe('=SUM(#REF!)');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getFormula()).toBe('=SUM(RANGE_NAME)');
        expect(getCellFormula()).toBe('=SUM(RANGE_NAME)');

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getFormula()).toBe('=SUM(#REF!)');
        expect(getCellFormula()).toBe('=SUM(#REF!)');
    });

    it('should keep function-wrapped defined-name formulas synchronized when the defined name range changes, then undo and redo', async () => {
        const getFormula = () => formulaDataModel.getFormulaData().test?.sheet1?.[6]?.[0]?.f;
        const getCellFormula = () => testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet1')
            ?.getRange(6, 0, 6, 0)
            .getValue()
            ?.f;
        const getDefinedNameRef = () => definedNamesService.getValueById('test', 'range-name')?.formulaOrRefString;

        expect(await commandService.executeCommand(SetDefinedNameCommand.id, {
            unitId: 'test',
            id: 'range-name',
            name: 'RANGE_NAME',
            formulaOrRefString: '=SUM(Sheet1!$C$1:$C$2)',
            localSheetId: 'AllDefaultWorkbook',
        })).toBe(true);

        expect(getDefinedNameRef()).toBe('=SUM(Sheet1!$C$1:$C$2)');
        expect(getFormula()).toBe('=SUM(RANGE_NAME)');
        expect(getCellFormula()).toBe('=SUM(RANGE_NAME)');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$2');
        expect(getFormula()).toBe('=SUM(RANGE_NAME)');
        expect(getCellFormula()).toBe('=SUM(RANGE_NAME)');

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getDefinedNameRef()).toBe('=SUM(Sheet1!$C$1:$C$2)');
        expect(getFormula()).toBe('=SUM(RANGE_NAME)');
        expect(getCellFormula()).toBe('=SUM(RANGE_NAME)');
    });

    it('should sync multiple defined-name formulas across sheets when renamed, undone, and redone', async () => {
        const getSheet1Formula = () => formulaDataModel.getFormulaData().test?.sheet1?.[6]?.[1]?.f;
        const getSheet2Formula = () => formulaDataModel.getFormulaData().test?.sheet2?.[1]?.[0]?.f;
        const getSheet1CellFormula = () => testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet1')
            ?.getRange(6, 1, 6, 1)
            .getValue()
            ?.f;
        const getSheet2CellFormula = () => testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet2')
            ?.getRange(1, 0, 1, 0)
            .getValue()
            ?.f;

        expect(await commandService.executeCommand(SetDefinedNameCommand.id, {
            unitId: 'test',
            id: 'range-name',
            name: 'RENAMED_RANGE',
            formulaOrRefString: 'Sheet1!$A$1:$B$2',
            localSheetId: 'AllDefaultWorkbook',
        })).toBe(true);

        expect(getSheet1Formula()).toBe('=RENAMED_RANGE');
        expect(getSheet2Formula()).toBe('=RENAMED_RANGE');
        expect(getSheet1CellFormula()).toBe('=RENAMED_RANGE');
        expect(getSheet2CellFormula()).toBe('=RENAMED_RANGE');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getSheet1Formula()).toBe('=RANGE_NAME');
        expect(getSheet2Formula()).toBe('=RANGE_NAME');
        expect(getSheet1CellFormula()).toBe('=RANGE_NAME');
        expect(getSheet2CellFormula()).toBe('=RANGE_NAME');

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getSheet1Formula()).toBe('=RENAMED_RANGE');
        expect(getSheet2Formula()).toBe('=RENAMED_RANGE');
        expect(getSheet1CellFormula()).toBe('=RENAMED_RANGE');
        expect(getSheet2CellFormula()).toBe('=RENAMED_RANGE');
    });

    it('should sync multiple defined-name formulas across sheets when removed, undone, and redone', async () => {
        const getSheet1Formula = () => formulaDataModel.getFormulaData().test?.sheet1?.[6]?.[1]?.f;
        const getSheet2Formula = () => formulaDataModel.getFormulaData().test?.sheet2?.[1]?.[0]?.f;
        const getSheet1CellFormula = () => testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet1')
            ?.getRange(6, 1, 6, 1)
            .getValue()
            ?.f;
        const getSheet2CellFormula = () => testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet2')
            ?.getRange(1, 0, 1, 0)
            .getValue()
            ?.f;

        expect(await commandService.executeCommand(RemoveDefinedNameCommand.id, {
            unitId: 'test',
            id: 'range-name',
            name: 'RANGE_NAME',
            formulaOrRefString: 'Sheet1!$A$1:$B$2',
            localSheetId: 'AllDefaultWorkbook',
        })).toBe(true);

        expect(getSheet1Formula()).toBe('=#REF!');
        expect(getSheet2Formula()).toBe('=#REF!');
        expect(getSheet1CellFormula()).toBe('=#REF!');
        expect(getSheet2CellFormula()).toBe('=#REF!');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getSheet1Formula()).toBe('=RANGE_NAME');
        expect(getSheet2Formula()).toBe('=RANGE_NAME');
        expect(getSheet1CellFormula()).toBe('=RANGE_NAME');
        expect(getSheet2CellFormula()).toBe('=RANGE_NAME');

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getSheet1Formula()).toBe('=#REF!');
        expect(getSheet2Formula()).toBe('=#REF!');
        expect(getSheet1CellFormula()).toBe('=#REF!');
        expect(getSheet2CellFormula()).toBe('=#REF!');
    });

    it('should keep multiple defined-name formulas across sheets synchronized when the defined name range changes, then undo and redo', async () => {
        const getSheet1Formula = () => formulaDataModel.getFormulaData().test?.sheet1?.[6]?.[1]?.f;
        const getSheet2Formula = () => formulaDataModel.getFormulaData().test?.sheet2?.[1]?.[0]?.f;
        const getSheet1CellFormula = () => testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet1')
            ?.getRange(6, 1, 6, 1)
            .getValue()
            ?.f;
        const getSheet2CellFormula = () => testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet2')
            ?.getRange(1, 0, 1, 0)
            .getValue()
            ?.f;
        const getDefinedNameRef = () => definedNamesService.getValueById('test', 'range-name')?.formulaOrRefString;

        expect(await commandService.executeCommand(SetDefinedNameCommand.id, {
            unitId: 'test',
            id: 'range-name',
            name: 'RANGE_NAME',
            formulaOrRefString: '=SUM(Sheet1!$C$1:$C$2)',
            localSheetId: 'AllDefaultWorkbook',
        })).toBe(true);

        expect(getDefinedNameRef()).toBe('=SUM(Sheet1!$C$1:$C$2)');
        expect(getSheet1Formula()).toBe('=RANGE_NAME');
        expect(getSheet2Formula()).toBe('=RANGE_NAME');
        expect(getSheet1CellFormula()).toBe('=RANGE_NAME');
        expect(getSheet2CellFormula()).toBe('=RANGE_NAME');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$2');
        expect(getSheet1Formula()).toBe('=RANGE_NAME');
        expect(getSheet2Formula()).toBe('=RANGE_NAME');
        expect(getSheet1CellFormula()).toBe('=RANGE_NAME');
        expect(getSheet2CellFormula()).toBe('=RANGE_NAME');

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getDefinedNameRef()).toBe('=SUM(Sheet1!$C$1:$C$2)');
        expect(getSheet1Formula()).toBe('=RANGE_NAME');
        expect(getSheet2Formula()).toBe('=RANGE_NAME');
        expect(getSheet1CellFormula()).toBe('=RANGE_NAME');
        expect(getSheet2CellFormula()).toBe('=RANGE_NAME');
    });

    it('should sync every occurrence of a defined name in one formula when renamed, undone, and redone', async () => {
        const getFormula = () => formulaDataModel.getFormulaData().test?.sheet2?.[1]?.[1]?.f;
        const getCellFormula = () => testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet2')
            ?.getRange(1, 1, 1, 1)
            .getValue()
            ?.f;

        expect(await commandService.executeCommand(SetDefinedNameCommand.id, {
            unitId: 'test',
            id: 'range-name',
            name: 'RENAMED_RANGE',
            formulaOrRefString: 'Sheet1!$A$1:$B$2',
            localSheetId: 'AllDefaultWorkbook',
        })).toBe(true);

        expect(getFormula()).toBe('=RENAMED_RANGE+SUM(RENAMED_RANGE)');
        expect(getCellFormula()).toBe('=RENAMED_RANGE+SUM(RENAMED_RANGE)');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getFormula()).toBe('=RANGE_NAME+SUM(RANGE_NAME)');
        expect(getCellFormula()).toBe('=RANGE_NAME+SUM(RANGE_NAME)');

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getFormula()).toBe('=RENAMED_RANGE+SUM(RENAMED_RANGE)');
        expect(getCellFormula()).toBe('=RENAMED_RANGE+SUM(RENAMED_RANGE)');
    });

    it('should sync every occurrence of a defined name in one formula when removed, undone, and redone', async () => {
        const getFormula = () => formulaDataModel.getFormulaData().test?.sheet2?.[1]?.[1]?.f;
        const getCellFormula = () => testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet2')
            ?.getRange(1, 1, 1, 1)
            .getValue()
            ?.f;

        expect(await commandService.executeCommand(RemoveDefinedNameCommand.id, {
            unitId: 'test',
            id: 'range-name',
            name: 'RANGE_NAME',
            formulaOrRefString: 'Sheet1!$A$1:$B$2',
            localSheetId: 'AllDefaultWorkbook',
        })).toBe(true);

        expect(getFormula()).toBe('=#REF!+SUM(#REF!)');
        expect(getCellFormula()).toBe('=#REF!+SUM(#REF!)');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getFormula()).toBe('=RANGE_NAME+SUM(RANGE_NAME)');
        expect(getCellFormula()).toBe('=RANGE_NAME+SUM(RANGE_NAME)');

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getFormula()).toBe('=#REF!+SUM(#REF!)');
        expect(getCellFormula()).toBe('=#REF!+SUM(#REF!)');
    });

    it('should keep every occurrence of a defined name in one formula synchronized when the defined name range changes, then undo and redo', async () => {
        const getFormula = () => formulaDataModel.getFormulaData().test?.sheet2?.[1]?.[1]?.f;
        const getCellFormula = () => testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet2')
            ?.getRange(1, 1, 1, 1)
            .getValue()
            ?.f;
        const getDefinedNameRef = () => definedNamesService.getValueById('test', 'range-name')?.formulaOrRefString;

        expect(await commandService.executeCommand(SetDefinedNameCommand.id, {
            unitId: 'test',
            id: 'range-name',
            name: 'RANGE_NAME',
            formulaOrRefString: '=SUM(Sheet1!$C$1:$C$2)',
            localSheetId: 'AllDefaultWorkbook',
        })).toBe(true);

        expect(getDefinedNameRef()).toBe('=SUM(Sheet1!$C$1:$C$2)');
        expect(getFormula()).toBe('=RANGE_NAME+SUM(RANGE_NAME)');
        expect(getCellFormula()).toBe('=RANGE_NAME+SUM(RANGE_NAME)');

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$2');
        expect(getFormula()).toBe('=RANGE_NAME+SUM(RANGE_NAME)');
        expect(getCellFormula()).toBe('=RANGE_NAME+SUM(RANGE_NAME)');

        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(getDefinedNameRef()).toBe('=SUM(Sheet1!$C$1:$C$2)');
        expect(getFormula()).toBe('=RANGE_NAME+SUM(RANGE_NAME)');
        expect(getCellFormula()).toBe('=RANGE_NAME+SUM(RANGE_NAME)');
    });

    it.each(['0', '1', 'TRUE'])('preserves text %s when replaying formula edits and undo on a replica', async (text) => {
        const replica = createFacadeTestBed(createWorkbookData());
        const replicaCommands = replica.injector.get(ICommandService);
        replicaCommands.registerCommand(SetRangeValuesMutation);
        const mutations: ISetRangeValuesMutationParams[] = [];
        const subscription = commandService.onCommandExecuted((command) => {
            if (command.id === SetRangeValuesMutation.id) {
                mutations.push(structuredClone(command.params as ISetRangeValuesMutationParams));
            }
        });
        const getCell = (bed: typeof testBed): Nullable<ICellData> => bed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet1')
            ?.getCellMatrix()
            .getValue(5, 2);
        const replay = (): void => {
            for (const params of mutations.splice(0)) {
                replicaCommands.syncExecuteCommand(SetRangeValuesMutation.id, params, { onlyLocal: true });
            }
            expect(getCell(replica)).toEqual(getCell(testBed));
        };

        try {
            await commandService.executeCommand(SetRangeValuesCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { startRow: 5, endRow: 5, startColumn: 2, endColumn: 2 },
                value: { v: text, t: CellValueType.STRING, f: null, si: null },
            });
            replay();
            expect(getCell(replica)).toMatchObject({ v: text, t: CellValueType.STRING });
            await commandService.executeCommand(UndoCommand.id);
            replay();
            await commandService.executeCommand(RedoCommand.id);
            replay();
            expect(getCell(replica)).toMatchObject({ v: text, t: CellValueType.STRING });
        } finally {
            subscription.dispose();
            replica.univer.dispose();
        }
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

        await commandService.executeCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: {
                6: {
                    0: { s: { bg: { rgb: '#ff0000' } } },
                },
            },
        });

        const cellFormula = testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet1')
            ?.getRange(6, 0, 6, 0)
            .getValue()
            ?.f;

        expect(formulaDataModel.getFormulaData().test?.sheet1?.[6]?.[0]).toMatchObject({ f: '=A1' });
        expect(cellFormula).toBe('=A1');
        expect(executeCommandSpy.mock.calls.filter(([id]) => id === SetFormulaDataMutation.id)).toHaveLength(formulaSyncCallCount);
    });

    it('should sync array formula data when editing a spill cell without formula data changes', async () => {
        const executeCommandSpy = vi.spyOn(commandService, 'executeCommand');
        formulaDataModel.setArrayFormulaRange({
            test: {
                sheet1: {
                    5: {
                        5: {
                            startRow: 5,
                            startColumn: 5,
                            endRow: 6,
                            endColumn: 6,
                        },
                    },
                },
            },
        });
        formulaDataModel.setArrayFormulaCellData({
            test: {
                sheet1: {
                    5: {
                        5: { v: 1 },
                        6: { v: 2 },
                    },
                    6: {
                        5: { v: 3 },
                        6: { v: 4 },
                    },
                },
            },
        });

        await commandService.executeCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: {
                6: {
                    6: { v: 111 },
                },
            },
        });

        expect(formulaDataModel.getArrayFormulaCellData().test?.sheet1).toEqual({
            5: {
                5: { v: 1 },
                6: { v: 2 },
            },
            6: {
                5: { v: 3 },
            },
        });
        expect(executeCommandSpy.mock.calls.some(([id]) => id === SetArrayFormulaDataMutation.id)).toBe(true);
    });

    it('should not sync array formula data when a formula edit leaves array formulas unchanged', async () => {
        setTwoByTwoArrayFormula(formulaDataModel);
        const arrayFormulaRange = formulaDataModel.getArrayFormulaRange();
        const arrayFormulaCellData = formulaDataModel.getArrayFormulaCellData();
        const executeCommandSpy = vi.spyOn(commandService, 'executeCommand');

        await commandService.executeCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: {
                8: {
                    0: { f: '=A1' },
                },
            },
        });

        expect(formulaDataModel.getFormulaData().test?.sheet1?.[8]?.[0]).toMatchObject({ f: '=A1' });
        expect(executeCommandSpy.mock.calls.some(([id]) => id === SetFormulaDataMutation.id)).toBe(true);
        expect(executeCommandSpy.mock.calls.some(([id]) => id === SetArrayFormulaDataMutation.id)).toBe(false);
        expect(formulaDataModel.getArrayFormulaRange()).toBe(arrayFormulaRange);
        expect(formulaDataModel.getArrayFormulaCellData()).toBe(arrayFormulaCellData);
    });

    it('should sync array formula data when a formula edit replaces an array formula anchor', async () => {
        setTwoByTwoArrayFormula(formulaDataModel);
        // Replacing a multi-cell array anchor also marks its former range dirty.
        commandService.registerCommand(SetTriggerFormulaCalculationStartMutation);
        const executeCommandSpy = vi.spyOn(commandService, 'executeCommand');

        await commandService.executeCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: {
                5: {
                    5: { f: '=A1' },
                },
            },
        });

        expect(formulaDataModel.getArrayFormulaRange().test?.sheet1?.[5]?.[5]).toBeUndefined();
        const notification = executeCommandSpy.mock.calls.find(([id]) => id === SetArrayFormulaDataMutation.id);
        expect(notification?.[2]).toMatchObject({ onlyLocal: true, remove: true });
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
                        0: { f: '=Sheet1!A1', si: 'inserted-shared-formula' },
                    },
                    1: {
                        0: { si: 'inserted-shared-formula' },
                    },
                },
            },
        });

        const addedSheetCellMatrix = testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('test')
            ?.getSheetBySheetId('sheet-added')
            ?.getCellMatrix();
        const scanAddedSheet = vi.spyOn(addedSheetCellMatrix!, 'forValue');

        expect(formulaDataModel.getFormulaStringByCell(1, 0, 'sheet-added', 'test')).toBe('=Sheet1!A2');
        expect(scanAddedSheet).not.toHaveBeenCalled();
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
                            0: { f: '=SUM(A1)', si: 'workbook-shared-formula' },
                        },
                        1: {
                            0: { si: 'workbook-shared-formula' },
                        },
                    },
                },
            },
            styles: {},
        });

        const secondaryCellMatrix = testBed.injector
            .get(IUniverInstanceService)
            .getUnit<Workbook>('secondary')
            ?.getSheetBySheetId('sheet1')
            ?.getCellMatrix();
        const scanSecondarySheet = vi.spyOn(secondaryCellMatrix!, 'forValue');

        expect(formulaDataModel.getFormulaStringByCell(1, 0, 'sheet1', 'secondary')).toBe('=SUM(A2)');
        expect(scanSecondarySheet).not.toHaveBeenCalled();
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

describe('UpdateFormulaController spill cache integration', () => {
    it.each([
        { formula: '=SEQUENCE($A$1)', horizontal: false, scale: 1 },
        { formula: '=SEQUENCE(1,$A$1)', horizontal: true, scale: 1 },
        { formula: '=FILTER($M$1:$M$5,$M$1:$M$5<=$A$1)', horizontal: false, scale: 1 },
        { formula: '=SEQUENCE($A$1)*10', horizontal: false, scale: 10 },
    ])('updates removed spill cells and their dependents for $formula', async ({ formula, horizontal, scale }) => {
        const range = horizontal ? 'H1:L1' : 'H1:H5';
        const tail = horizontal ? 'L1' : 'H5';
        const removedRange = horizontal ? 'J1:L1' : 'H3:H5';
        const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
            0: { 0: { v: 5 }, 7: { f: formula }, 13: { f: `=SUM(${range})` } },
            1: { 13: { f: `=${tail}` } },
            2: { 13: { f: `=SUM(${removedRange})` } },
            3: { 13: { f: '=N1*2' } },
        };
        for (let row = 0; row < 5; row++) {
            (cellData[row] ??= {})[12] = { v: row + 1 };
        }
        const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: {} }, logLevel: LogLevel.SILENT });
        univer.registerPlugin(UniverSheetsPlugin);
        univer.registerPlugin(UniverFormulaEnginePlugin);
        univer.registerPlugin(UniverSheetsFormulaPlugin, { initialFormulaComputing: CalculationMode.NO_CALCULATION });
        const api = FUniver.newAPI(univer);
        const book = api.createWorkbook({
            id: 'spill-cache',
            sheetOrder: ['data', 'check'],
            sheets: {
                data: { id: 'data', name: 'Data', rowCount: 20, columnCount: 20, cellData },
                check: { id: 'check', name: 'Check', rowCount: 5, columnCount: 3, cellData: { 0: { 0: { f: `=SUM(Data!${range})` } } } },
            },
        });
        const sheet = book.getSheetByName('Data')!;
        const calculator = api.getFormula();
        univer.__getInjector().get(IUniverInstanceService).focusUnit(book.getId());
        let calculationIndex = 0;
        async function calculate(action: () => unknown): Promise<void> {
            calculationIndex++;
            let subscription: { dispose(): void };
            let timer: ReturnType<typeof setTimeout>;
            const completed = new Promise<void>((resolve, reject) => {
                subscription = calculator.calculationEnd(() => resolve());
                timer = setTimeout(() => reject(new Error(`Spill calculation ${calculationIndex} timed out`)), 5000);
            });
            try {
                action();
                await completed;
            } finally {
                clearTimeout(timer!);
                subscription!.dispose();
            }
        }
        function expectValues(count: number, scalar = false): void {
            const sum = scalar ? 99 : count * (count + 1) / 2 * scale;
            expect(sheet.getRange('N1').getValue()).toBe(sum);
            expect(sheet.getRange('N2').getValue()).toBe(!scalar && count === 5 ? 5 * scale : 0);
            expect(sheet.getRange('N3').getValue()).toBe(scalar ? 0 : Array.from({ length: Math.max(0, count - 2) }, (_, index) => (index + 3) * scale).reduce((a, b) => a + b, 0));
            expect(sheet.getRange('N4').getValue()).toBe(sum * 2);
            expect(book.getSheetByName('Check')!.getRange('A1').getValue()).toBe(sum);
            for (let index = 0; index < 5; index++) {
                const address = horizontal ? `${String.fromCharCode(72 + index)}1` : `H${index + 1}`;
                const expected = scalar ? (index === 0 ? 99 : null) : (index < count ? (index + 1) * scale : null);
                expect(sheet.getRange(address).getValue() ?? null).toBe(expected);
            }
        }
        try {
            await calculate(() => calculator.executeCalculation());
            expectValues(5);
            for (const count of [2, 1, 5, 1, 3]) {
                await calculate(() => sheet.getRange('A1').setValue(count));
                expectValues(count);
                await calculate(() => calculator.executeCalculation());
                expectValues(count);
            }
            await calculate(() => sheet.getRange(tail).setValue(100));
            await calculate(() => sheet.getRange('A1').setValue(5));
            expect(sheet.getRange('H1').getValue()).toBe('#SPILL!');
            expect(sheet.getRange(tail).getValue()).toBe(100);
            await calculate(() => sheet.getRange(tail).clearContent());
            expectValues(5);
            await calculate(() => sheet.getRange('H1').setFormula('=99'));
            expectValues(1, true);
            const commands = univer.__getInjector().get(ICommandService);
            await calculate(() => expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(true));
            expectValues(5);
            await calculate(() => expect(commands.syncExecuteCommand(RedoCommand.id)).toBe(true));
            expectValues(1, true);
        } finally {
            univer.dispose();
        }
    });
});
