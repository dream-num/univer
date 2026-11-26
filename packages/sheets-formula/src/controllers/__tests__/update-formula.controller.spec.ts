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
import { BooleanNumber, CellValueType, FormulaType, ICommandService, IConfigService, IUniverInstanceService, LocaleType, LogLevel, RedoCommand, UndoCommand, Univer, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import {
    FormulaDataModel,
    IDefinedNamesService,
    IFormulaRuntimeService,
    RemoveDefinedNameMutation,
    SetArrayFormulaDataMutation,
    SetDefinedNameMutation,
    SetFormulaDataMutation,
    SetTriggerFormulaCalculationStartMutation,
    UniverFormulaEnginePlugin,
} from '@univerjs/engine-formula';
import {
    InsertRowMutation,
    InsertSheetMutation,
    MoveRangeCommand,
    MoveRangeMutation,
    RemoveDefinedNameCommand,
    RemoveRowByRangeCommand,
    RemoveRowCommand,
    RemoveRowMutation,
    RemoveSheetCommand,
    RemoveSheetMutation,
    SetDefinedNameCommand,
    SetRangeValuesCommand,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetStyleCommand,
    SetWorksheetNameCommand,
    SheetInterceptorService,
    UniverSheetsPlugin,
} from '@univerjs/sheets';
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

    it('deletes a row referenced by formulas on two sheets and restores references on undo', async () => {
        for (const command of [RemoveRowCommand, RemoveRowByRangeCommand, RemoveRowMutation, InsertRowMutation]) {
            commandService.registerCommand(command);
        }
        const workbook = testBed.injector.get(IUniverInstanceService).getUnit<Workbook>('test')!;
        const first = workbook.getSheetBySheetId('sheet1')!;
        const second = workbook.getSheetBySheetId('sheet2')!;
        expect(await commandService.executeCommand(RemoveRowCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 19 },
        })).toBe(true);
        expect(first.getCellRaw(4, 2)?.f).toBe('=SUM(A1:B1)');
        expect(second.getCellRaw(0, 0)?.f).toBe('=Sheet1!A1:B1');
        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(first.getCellRaw(5, 2)?.f).toBe('=SUM(A1:B2)');
        expect(second.getCellRaw(0, 0)?.f).toBe('=Sheet1!A1:B2');
        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(second.getCellRaw(0, 0)?.f).toBe('=Sheet1!A1:B1');
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
    it('recalculates imported spill references and fixed arrays without cached values', async () => {
        const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: {} }, logLevel: LogLevel.SILENT });
        univer.registerPlugin(UniverSheetsPlugin);
        univer.registerPlugin(UniverFormulaEnginePlugin);
        univer.registerPlugin(UniverSheetsFormulaPlugin, { initialFormulaComputing: CalculationMode.NO_CALCULATION });
        const facade = FUniver.newAPI(univer);
        const workbook = facade.createWorkbook({
            id: 'imported-array-results',
            sheetOrder: ['sheet'],
            sheets: {
                sheet: {
                    id: 'sheet',
                    name: 'Sheet1',
                    rowCount: 5000,
                    columnCount: 27,
                    cellData: {
                        0: {
                            0: { v: 3, t: CellValueType.NUMBER },
                            1: { f: '=SEQUENCE(A1)', ref: 'B1:B3', ft: FormulaType.ARRAY, fd: BooleanNumber.TRUE },
                            2: { f: '=_xlfn.SINGLE($A$1:$A$2)' },
                            3: { f: '=ANCHORARRAY(B1)', ref: 'D1:D3', ft: FormulaType.ARRAY, fd: BooleanNumber.TRUE },
                            5: { f: '=SUM(A1,1)', ref: 'F1:G2', ft: FormulaType.ARRAY, fd: BooleanNumber.FALSE },
                            8: { f: '={1,2;3,4}*A1', ref: 'I1:K3', ft: FormulaType.ARRAY, fd: BooleanNumber.FALSE },
                            12: { f: '={1,2}*A1', ref: 'M1:N3', ft: FormulaType.ARRAY, fd: BooleanNumber.FALSE },
                            15: { f: '={1;2}*A1', ref: 'P1:Q3', ft: FormulaType.ARRAY, fd: BooleanNumber.FALSE },
                            18: { f: '=ANCHORARRAY(A1)' },
                            20: { f: '=SUM(ANCHORARRAY(B1))' },
                            22: { f: '=ANCHORARRAY(U1)' },
                            24: { f: '=SEQUENCE(2)' },
                            25: { f: '=ANCHORARRAY(Y1)' },
                        },
                        1: { 2: { f: '=_xlfn.SINGLE({1,2;3,4})' }, 18: { f: '=ANCHORARRAY(B2)' }, 24: { v: 7, t: CellValueType.NUMBER } },
                        8: {
                            1: { f: '=LINEST({2;4;6}*A1,{1;2;3})', ref: 'B9:D10', ft: FormulaType.ARRAY, fd: BooleanNumber.FALSE },
                            5: { f: '=LINEST({2;4;6}*A1,{1;2;3})', ref: 'F9:G9', ft: FormulaType.ARRAY, fd: BooleanNumber.TRUE },
                            10: { f: '=LINEST({2;4;6}*A1,{1;2;3})' },
                        },
                        12: {
                            0: { v: 5, t: CellValueType.NUMBER },
                            1: { f: '=A1' },
                            3: { f: "=SUM(Sheet1!$A$13:$A$14:'Sheet1'!$C$15)" },
                            4: { f: '=ISREF((Sheet1!$A$13:$A$14 Sheet1!$C$13:$C$14))' },
                            6: { f: '=_xlfn.TRIMRANGE(A12:C16)', ref: 'G13', ft: FormulaType.ARRAY, fd: BooleanNumber.TRUE },
                            10: { f: '=ISREF(TRIMRANGE(A12:C16))' },
                            11: { f: '=TRIMRANGE(A12:C16,4)' },
                            12: { f: '=TRIMRANGE(F12:F16)' },
                            13: { f: '=ROWS(TRIMRANGE(A12:C16,1))' },
                            14: { f: '=ISO.CEILING(-A1-0.3,-2)' },
                            15: { f: '=ISO.CEILING(A1+0.3,)' },
                            16: { f: '=ISO.CEILING(A1+0.3,F12)' },
                            17: { f: '=ROWS(TRIMRANGE(A12:C16,F12))' },
                            19: { f: '=ROWS(TRIMRANGE(AA1:AA5000))' },
                            20: { f: '=INDIRECT("Sheet1!R1C1",)' },
                            21: { f: '=INDIRECT("A1",)' },
                            22: { f: '=_xlfn.SINGLE($A$1:$B$2)' },
                            23: { f: '=ARABIC(" LVII ")' },
                            24: { f: '=ARABIC("IIV")' },
                        },
                        14: { 2: { v: 2, t: CellValueType.NUMBER }, 26: { v: 99, t: CellValueType.NUMBER } },
                        19: {
                            2: { f: '=UNREGISTERED_ARRAY_FUNCTION()', ref: 'C20:E20', ft: FormulaType.ARRAY, fd: BooleanNumber.TRUE },
                            3: { s: { bl: BooleanNumber.TRUE } },
                            4: { s: { bl: BooleanNumber.TRUE } },
                        },
                        20: {
                            0: { f: '=AMORDEGRC(A1*800,45157,45291,300,1,0.15,1)' },
                            1: { f: '=AMORDEGRC(2400,45157,45291,300,0,0.15,1)' },
                            2: { f: '=AMORDEGRC(2400,45157,45291,300,5,0.15,1)' },
                            3: { f: '=AMORDEGRC(2400,45157,45291,300,6,0.15,1)' },
                            4: { f: '=AMORDEGRC(2400,45157,45291,300,1,0.15,2)' },
                            5: { f: '=AMORDEGRC(TRUE,45157,45291,300,1,0.15,1)' },
                            6: { f: '=SUM(AMORDEGRC(2400,45157,45291,300,{0,1,2,3},0.15,1))' },
                            7: { f: '=SUM(N(OFFSET(A13,{0,-12,2},0)))' },
                            8: { f: '=SUM(N(INDIRECT({"A1","A13"})))' },
                            9: { f: '=SUM(N(A1:A2))' },
                            10: { f: '=AMORDEGRC(2400,45157,45291,300,2,0.19,1)' },
                            11: { f: '=SUM(PRICEMAT(DATE(2024,3,15),DATE(2024,11,15),DATE(2023,11,15),0.061,0.061,{0,1,2}+A1))' },
                            12: { f: '=SUM(YIELDMAT(DATE(2024,3,15),DATE(2024,11,15),DATE(2023,11,15),0.0625,{98,99,100}+A1))' },
                            13: { f: '=PRICEMAT(DATE(2024,3,15),DATE(2024,11,15),N22,0.061,0.061)' },
                            14: { f: '=YIELDMAT(DATE(2024,3,15),O22,DATE(2023,11,15),0.0625,100.0123)' },
                        },
                    },
                },
            },
        });
        const calculator = facade.getFormula();
        const sheet = workbook.getActiveSheet();
        const injector = univer.__getInjector();
        injector.get(IUniverInstanceService).focusUnit(workbook.getId());
        const commands = injector.get(ICommandService);
        const calculate = async (action: () => unknown) => {
            let subscription: { dispose(): void } | undefined;
            let timer: ReturnType<typeof setTimeout> | undefined;
            const completed = new Promise<void>((resolve, reject) => {
                subscription = calculator.calculationEnd(() => resolve());
                timer = setTimeout(() => reject(new Error('Imported array calculation timed out')), 5000);
            });
            try {
                action();
                await completed;
            } finally {
                clearTimeout(timer);
                subscription?.dispose();
            }
        };
        function expectExcelValues(input: number) {
            const spill = [[1], [input >= 2 ? 2 : null], [input === 3 ? 3 : null]];
            expect(sheet.getRange('B1:B3').getValues()).toEqual(spill);
            expect(sheet.getRange('C1:C2').getValues()).toEqual([[input], [1]]);
            expect(sheet.getRange('D1:D3').getValues()).toEqual(spill);
            expect(sheet.getRange('F1:G2').getValues()).toEqual([[input + 1, input + 1], [input + 1, input + 1]]);
            expect(sheet.getRange('I1:K3').getValues()).toEqual([
                [input, 2 * input, '#N/A'],
                [3 * input, 4 * input, '#N/A'],
                ['#N/A', '#N/A', '#N/A'],
            ]);
            expect(sheet.getRange('M1:N3').getValues()).toEqual([[input, 2 * input], [input, 2 * input], [input, 2 * input]]);
            expect(sheet.getRange('P1:Q3').getValues()).toEqual([[input, input], [2 * input, 2 * input], ['#N/A', '#N/A']]);
            expect(sheet.getRange('B9:D10').getValues()).toEqual([[2 * input, 0, '#N/A'], [2 * input, 0, '#N/A']]);
            expect(sheet.getRange('F9:G9').getValues()).toEqual([[2 * input, 0]]);
            expect(sheet.getRange('K9:L9').getValues()).toEqual([[2 * input, null]]);
            expect(sheet.getRange('D13').getValue()).toBe(input + 7);
            expect(sheet.getRange('E13').getValue()).toBe(0);
            expect(sheet.getRange('G13:I15').getValues()).toEqual([[5, input, 0], [0, 0, 0], [0, 0, 2]]);
            expect(sheet.getRange('K13:R13').getValues()).toEqual([[1, '#VALUE!', '#REF!', 4, Math.ceil((-input - 0.3) / 2) * 2 + 0, input + 1, 0, 5]]);
            expect(sheet.getRange('T13').getValue()).toBe(1);
            expect(sheet.getRange('U13:Y13').getValues()).toEqual([[input, '#REF!', '#VALUE!', 57, 3]]);
            expect(sheet.getRange('C20:E20').getValues()).toEqual([['#NAME?', null, null]]);
            expect(sheet.getRange('A21:K21').getValues()).toEqual([[[259, 518, 776][input - 1], 330, 158, 0, '#NUM!', '#VALUE!', 1894, input + 5, input + 5, input, 487]]);
            if (input === 3) {
                expect(sheet.getRange('L21').getValue()).toBe('#NUM!');
            } else {
                expect(sheet.getRange('L21').getValue()).toBeCloseTo([299.7596187969094, 299.75927781090263][input - 1], 9);
            }
            expect(sheet.getRange('M21').getValue()).toBeCloseTo([0.18397312839913993, 0.138528693708766, 0.09395765355598794][input - 1], 10);
            expect(sheet.getRange('N21').getValue()).toBeCloseTo(70.39210708947269, 10);
            expect(sheet.getRange('O21').getValue()).toBe('#NUM!');
            expect(sheet.getRange('S1:S2').getValues()).toEqual([['#REF!'], ['#REF!']]);
            const sum = input * (input + 1) / 2;
            expect(sheet.getRange('U1').getValue()).toBe(sum);
            expect(sheet.getRange('W1').getValue()).toBe(sum);
            expect(sheet.getRange('Y1:Z1').getValues()).toEqual([['#SPILL!', '#SPILL!']]);
        }
        try {
            await calculate(() => calculator.executeCalculation());
            expectExcelValues(3);
            await calculate(() => sheet.getRange('A1').setValue(2));
            expectExcelValues(2);
            await calculate(() => expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(true));
            expectExcelValues(3);
            await calculate(() => sheet.getRange('A1').setValue(1));
            expectExcelValues(1);
            await calculate(() => sheet.getRange('C15').setValue({ v: null }));
            expect(sheet.getRange('G13:I15').getValues()).toEqual([[5, 1, null], [null, null, null], [null, null, null]]);
            await calculate(() => expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(true));
            expectExcelValues(1);
        } finally {
            univer.dispose();
        }
    });

    it('keeps an imported FILTER spill editable after shrinking and undoing', async () => {
        const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: {} }, logLevel: LogLevel.SILENT });
        univer.registerPlugin(UniverSheetsPlugin);
        univer.registerPlugin(UniverFormulaEnginePlugin);
        univer.registerPlugin(UniverSheetsFormulaPlugin, { initialFormulaComputing: CalculationMode.NO_CALCULATION });
        const api = FUniver.newAPI(univer);
        const book = api.createWorkbook({
            id: 'imported-filter-spill',
            sheetOrder: ['data'],
            sheets: {
                data: {
                    id: 'data',
                    name: 'Data',
                    rowCount: 10,
                    columnCount: 10,
                    cellData: {
                        0: {
                            0: { v: 1 },
                            1: { v: 1 },
                            3: { f: '=FILTER(A1:A3,B1:B3=1)', v: '1', t: CellValueType.NUMBER, ref: 'D1:D3' },
                            5: { f: '=SUM(D1:D3)' },
                        },
                        1: { 0: { v: 2 }, 1: { v: 1 }, 3: { v: '2', t: CellValueType.NUMBER } },
                        2: { 0: { v: 3 }, 1: { v: 1 }, 3: { v: '3', t: CellValueType.NUMBER } },
                    },
                },
            },
        });
        const injector = univer.__getInjector();
        injector.get(IUniverInstanceService).focusUnit(book.getId());
        const sheet = book.getActiveSheet();
        const commands = injector.get(ICommandService);
        const calculator = api.getFormula();
        const calculate = async (action: () => unknown) => {
            let subscription: { dispose(): void } | undefined;
            let timer: ReturnType<typeof setTimeout> | undefined;
            const done = new Promise<void>((resolve, reject) => {
                subscription = calculator.calculationEnd(() => resolve());
                timer = setTimeout(() => reject(new Error('Imported spill calculation timed out')), 5000);
            });
            try {
                action();
                await done;
            } finally {
                clearTimeout(timer);
                subscription?.dispose();
            }
        };
        const values = () => sheet.getRange('D1:D3').getValues().map(([value]) => value ?? null);
        try {
            await calculate(() => calculator.executeCalculation());
            expect(values()).toEqual([1, 2, 3]);
            expect(sheet.getRange('F1').getValue()).toBe(6);
            await calculate(() => sheet.getRange('A2').setValue(20));
            expect(values()).toEqual([1, 20, 3]);
            expect(sheet.getRange('F1').getValue()).toBe(24);
            await calculate(() => sheet.getRange('B3').setValue(0));
            expect(values()).toEqual([1, 20, null]);
            expect(sheet.getRange('F1').getValue()).toBe(21);
            await calculate(() => expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(true));
            expect(values()).toEqual([1, 20, 3]);
            await calculate(() => expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(true));
            expect(values()).toEqual([1, 2, 3]);
            expect(sheet.getRange('F1').getValue()).toBe(6);
            await calculate(() => calculator.executeCalculation());
            expect(values()).toEqual([1, 2, 3]);
        } finally {
            univer.dispose();
        }
    });

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
            const spillTail = sheet.getRange(tail);
            expect(spillTail.getRawValue() ?? null).toBeNull();
            expect(spillTail.getValues(true)).toEqual([[5 * scale]]);
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

describe('conditional circular references', () => {
    it.each([CalculationMode.NO_CALCULATION, CalculationMode.WHEN_EMPTY])('recalculates after edits and undo in mode %s', async (initialFormulaComputing) => {
        const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: {} }, logLevel: LogLevel.SILENT });
        univer.registerPlugin(UniverSheetsPlugin);
        univer.registerPlugin(UniverFormulaEnginePlugin);
        univer.registerPlugin(UniverSheetsFormulaPlugin, { initialFormulaComputing });
        const api = FUniver.newAPI(univer);
        const calculator = api.getFormula();
        const injector = univer.__getInjector();

        async function calculate(action: () => void): Promise<void> {
            let subscription: { dispose(): void } | undefined;
            let timer: ReturnType<typeof setTimeout> | undefined;
            const completed = new Promise<void>((resolve, reject) => {
                subscription = calculator.calculationEnd(() => resolve());
                timer = setTimeout(() => reject(new Error('Conditional cycle calculation timed out')), 5000);
            });
            try {
                action();
                await completed;
            } finally {
                clearTimeout(timer);
                subscription?.dispose();
            }
        }

        const open = () => api.createWorkbook({
            id: 'conditional-cycle',
            sheetOrder: ['data'],
            sheets: {
                data: {
                    id: 'data',
                    name: 'Data',
                    rowCount: 10,
                    columnCount: 10,
                    cellData: {
                        0: {
                            0: { v: 1 },
                            1: { v: 5 },
                            2: { f: '=INDEX(B1:B2,MATCH(D1,A1:A2,0))' },
                            3: { v: 1 },
                            4: { f: '=IF(F1,SUM(E1:E3),G1)' },
                            5: { v: 0, t: CellValueType.BOOLEAN },
                            6: { v: 9 },
                            7: { f: '=C1+E1' },
                        },
                        1: { 0: { v: 2 }, 1: { f: '=C1+1' } },
                    },
                },
            },
        });

        try {
            let book: ReturnType<typeof open> | undefined;
            if (initialFormulaComputing === CalculationMode.WHEN_EMPTY) {
                await calculate(() => {
                    book = open();
                });
            } else {
                book = open();
                await calculate(() => calculator.executeCalculation());
            }
            const sheet = book!.getActiveSheet();
            injector.get(IUniverInstanceService).focusUnit(book!.getId());
            const commands = injector.get(ICommandService);
            const runtime = injector.get(IFormulaRuntimeService);
            const cycles = () => runtime.getRuntimeState().circularReferences?.map(({ row, column }) => [row, column]);
            const values = () => ['C1', 'B2', 'E1', 'H1'].map((cell) => sheet.getRange(cell).getValue());
            const undo = () => expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(true);

            expect(values()).toEqual([5, 6, 9, 14]);
            expect(cycles()).toEqual([]);
            await calculate(() => sheet.getRange('B1').setValue(8));
            expect(values()).toEqual([8, 9, 9, 17]);

            await calculate(() => sheet.getRange('D1').setValue(2));
            expect(cycles()).toHaveLength(2);
            expect(cycles()).toEqual(expect.arrayContaining([[0, 2], [1, 1]]));
            expect(values()).toEqual([8, 9, 9, 17]);
            await calculate(undo);
            expect(cycles()).toEqual([]);

            await calculate(() => sheet.getRange('F1').setValue(true));
            expect(cycles()).toEqual([[0, 4]]);
            expect(values()).toEqual([8, 9, 9, 17]);
            await calculate(undo);
            expect(cycles()).toEqual([]);
            expect(values()).toEqual([8, 9, 9, 17]);
        } finally {
            univer.dispose();
        }
    });
});

describe('Grouped dynamic array formulas', () => {
    it('recalculates PIVOTBY, GROUPBY and BYCOL from source values and restores the spill on undo', async () => {
        const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: {} }, logLevel: LogLevel.SILENT });
        univer.registerPlugin(UniverSheetsPlugin);
        univer.registerPlugin(UniverFormulaEnginePlugin);
        univer.registerPlugin(UniverSheetsFormulaPlugin, { initialFormulaComputing: CalculationMode.NO_CALCULATION });
        const facade = FUniver.newAPI(univer);
        try {
            const workbook = facade.createWorkbook({
                id: 'grouped-formula-com',
                sheetOrder: ['sheet', 'source'],
                resources: [{
                    name: 'SHEET_DEFINED_NAME_PLUGIN',
                    data: JSON.stringify({ previous: { id: 'previous', name: 'PreviousRow', localSheetId: 'source', formulaOrRefString: 'Source!$B1048576' } }),
                }],
                sheets: {
                    sheet: {
                        id: 'sheet',
                        name: 'Data',
                        rowCount: 20,
                        columnCount: 22,
                        cellData: {
                            0: {
                                7: { f: '=_xlfn.PIVOTBY(A2:A5,B2:B5,C2:C5,_xleta.SUM)' },
                                13: { f: '=GROUPBY(A2:A5,C2:C5,HSTACK(SUM,AVERAGE))' },
                                17: { f: '=ARRAYTOTEXT(BYCOL(C2:C5,_xleta.AVERAGE),1)' },
                                18: { f: '=FORMULATEXT(E2)' },
                            },
                            1: { 0: { v: 'West' }, 1: { v: 2025 }, 2: { v: 9 }, 4: { f: '=NA()' } },
                            2: { 0: { v: 'East' }, 1: { v: 2024 }, 2: { v: 3 } },
                            3: { 0: { v: 'West' }, 1: { v: 2024 }, 2: { v: 10 } },
                            4: { 0: { v: 'East' }, 1: { v: 2025 }, 2: { v: 4 } },
                            7: { 5: { v: 10 }, 6: { v: 'West' }, 7: { v: 'F8' } },
                            8: { 5: { v: 2 } },
                            10: {
                                5: { f: '=GROUPBY(G8:G9,F8:F9,SUM)' },
                                8: { f: '=ARRAYTOTEXT(GROUPBY(G8:G9,F8:F9,LAMBDA(x,INDEX(x,1))),1)' },
                                9: { f: '=TYPE(TAKE({10;2},1))' },
                                10: { f: '=TYPE(FILTER(42,TRUE))' },
                                11: { f: '=ISREF(TAKE(F8:F9,1))' },
                                12: { f: '=ISREF({1,2})' },
                                13: { f: '=TYPE(INDEX({1;2},1)+0)' },
                                14: { f: '=ARRAYTOTEXT(STDEV.P(4,14,16,27,31),1)' },
                                15: { f: '=ARRAYTOTEXT(GROUPBY(G8:G9,F8:F9,LAMBDA(x,TAKE(x,1))),1)' },
                                16: { f: '=ARRAYTOTEXT(VAR.P(1000000000004,1000000000014,1000000000016,1000000000027,1000000000031),1)' },
                                17: { f: '=ISREF(DROP(F8:F9,1))' },
                                18: { f: '=ISREF(INDIRECT({"F8"}))' },
                                19: { f: '=ISREF(INDIRECT(ADDRESS(8,6)))' },
                                20: { f: '=TYPE(DROP({1;2},1))' },
                                21: { f: '=TRUNC(-3.59,2)' },
                            },
                            14: {
                                5: { f: '=SUM(DROP(F8:F9,1))' },
                                6: { f: '=ISREF(INDIRECT(H8))' },
                                7: { f: '=ADDRESS(2,3,H9,TRUE)' },
                            },
                            16: {
                                5: { f: '=TYPE(MATCH(F9,F8:F9,0))' },
                                6: { f: '=TYPE(MATCH(F9:F9,F8:F9,0))' },
                                7: { f: '=TYPE(MATCH({10},F8:F9,0))' },
                                8: { f: '=ISREF(INDIRECT("F"&(MATCH(F9,F8:F9,0)+7)))' },
                                9: { f: '=ISREF(INDIRECT("F"&(MATCH({10},F8:F9,0)+7)))' },
                                10: { f: '=SUM(OFFSET(INDIRECT("F"&(MATCH(F9,F8:F9,0)+7)),0,0))' },
                                11: { f: '=SUM(OFFSET(INDIRECT({"Source!A1:A2"}),0,1))' },
                                12: { f: '=ISREF(OFFSET(INDIRECT({"Source!A1"}),0,1))' },
                            },
                            17: {
                                0: { f: '=WORKDAY(45169,{1;2},Source!A1)' },
                                1: { f: '=WORKDAY.INTL(45169,SEQUENCE(2),,Source!A1)' },
                                3: { f: '=SUM((Source!B1:B2,Source!B1))' },
                                4: { f: '=AREAS((Source!B1,Source!B2))' },
                                5: { f: '=ISREF((Source!B1,Source!B2))' },
                                6: { f: '=INDEX((Source!B1,Source!B2),1,1,2)' },
                                7: { f: '=SUM((Source!B1:B2,Source!B2) Source!B2)' },
                                8: { f: '=SUM(Source!B1 Source!B2)' },
                                9: { f: '=ROWS((Source!B1,Source!B2))' },
                            },
                            19: {
                                0: { f: '=CUBEVALUE("NoSuchConnection")' },
                                1: { f: '=CUBEMEMBER("ThisWorkbookDataModel","[Product].[Bikes]")' },
                                2: { f: '=CONVERT(Source!B1,"in2","cm2")' },
                                3: { f: '=FILTER(Source!B1:B2,Source!D1:D2>0)' },
                                4: { f: '=FILTER(Source!B1:B2,Source!D1:D2=0.1)' },
                                5: { f: '=FILTER(Source!B1:B2,{0;0},)' },
                                6: { f: '=SUM(CONVERT(+Source!B1:B2,"m","cm"))' },
                                7: { f: '=CONVERT(Source!B1:B2,"m","cm")' },
                                8: { f: '=WORKDAY(DATE(2024,3,15),-1.9)' },
                                9: { f: '=WORKDAY.INTL(DATE(2024,3,15),-0.1)' },
                                10: { f: '=TEXTJOIN("|",FALSE,CONVERT(1,"m",{"cm","in","ft"}))' },
                                11: { f: '=ARRAYTOTEXT(FILTER(Source!B1:B3,REGEXTEST(Source!E1:E3,"^m")),1)' },
                                12: { f: '=ISREF(+Source!B1:B2)' },
                                13: { f: '=TYPE(+TRUE)' },
                                14: { f: '=ODDLYIELD(DATE(2008,4,20),DATE(2008,6,15),DATE(2007,12,24),0.0375,IF(Source!B1>25,99.5,99.875),100,2)' },
                                15: { f: '=IFNA(A20,0)' },
                                16: { f: '=ISNA(A20)' },
                            },
                        },
                    },
                    source: {
                        id: 'source',
                        name: 'Source',
                        rowCount: 20,
                        columnCount: 22,
                        cellData: {
                            0: { 0: { v: 45170 }, 1: { v: 19 }, 3: { f: '=1/(B1-19)' }, 4: { f: '=IF(B1>25,"desk","motor")' } },
                            1: { 1: { v: 23 }, 2: { f: '=PreviousRow', si: 'previous-shared' }, 4: { v: 'desk' } },
                            2: { 1: { v: 31 }, 2: { si: 'previous-shared' }, 4: { v: 'millimeter' } },
                        },
                    },
                },
            });
            const sheet = workbook.getActiveSheet();
            const injector = univer.__getInjector();
            injector.get(IUniverInstanceService).focusUnit(workbook.getId());
            const commands = injector.get(ICommandService);
            const formula = facade.getFormula();
            const calculate = async (action: () => unknown) => {
                let subscription: { dispose(): void } | undefined;
                let timeout: ReturnType<typeof setTimeout> | undefined;
                const result = new Promise<void>((resolve, reject) => {
                    subscription = formula.calculationEnd(() => resolve());
                    timeout = setTimeout(() => reject(new Error('Grouped formula calculation timed out')), 5000);
                });
                try {
                    action();
                    await result;
                } finally {
                    clearTimeout(timeout);
                    subscription?.dispose();
                }
            };
            const check = (amount: number) => {
                expect(sheet.getRange('H1:K4').getValues()).toEqual([
                    ['', 2024, 2025, 'Total'],
                    ['East', 3, 4, 7],
                    ['West', 10, amount, amount + 10],
                    ['Total', 13, amount + 4, amount + 17],
                ]);
                expect(sheet.getRange('N1:P4').getValues()).toEqual([
                    ['', 'SUM', 'AVERAGE'],
                    ['East', 7, 3.5],
                    ['West', amount + 10, (amount + 10) / 2],
                    ['Total', amount + 17, (amount + 17) / 4],
                ]);
                expect(sheet.getRange('R1:S1').getValues()).toEqual([[`{${(amount + 17) / 4}}`, '=NA()']]);
            };
            await calculate(() => formula.executeCalculation());
            check(9);
            expect(sheet.getRange('F11:G13').getValues()).toEqual([['West', 10], [0, 2], ['Total', 12]]);
            expect(sheet.getRange('I11:Q11').getValues()).toEqual([[
                '{"West",10;,2;"Total",#VALUE!}',
                64,
                64,
                1,
                0,
                64,
                '{9.64572444143}',
                '{"West",#VALUE!;,#VALUE!;"Total",#VALUE!}',
                '{93.0400000005961}',
            ]]);
            await calculate(() => sheet.getRange('C2').setValue(19));
            check(19);
            await calculate(() => expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(true));
            check(9);
            await calculate(() => sheet.getRange('B2').setValue(2026));
            expect(sheet.getRange('H1:L4').getValues()).toEqual([
                ['', 2024, 2025, 2026, 'Total'],
                ['East', 3, 4, '', 7],
                ['West', 10, '', 9, 19],
                ['Total', 13, 4, 9, 26],
            ]);
            await calculate(() => expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(true));
            check(9);
            expect(sheet.getRange('L1:L4').getValues()).toEqual([[null], [null], [null], [null]]);
            expect(sheet.getRange('R11:V11').getValues()).toEqual([[1, 0, 1, 64, -3.59]]);
            expect(sheet.getRange('F15:G15').getValues()).toEqual([[2, 1]]);
            expect(sheet.getRange('H15').getValue()).toBe('#VALUE!');
            expect(sheet.getRange('F17:M17').getValues()).toEqual([[1, 1, 64, 1, 0, 2, 19, 0]]);
            await calculate(() => sheet.getRange('F9').setValue(7));
            expect(sheet.getRange('F17:M17').getValues()).toEqual([[1, 1, 64, 1, 0, 7, 19, 0]]);
            expect(sheet.getRange('F15:G15').getValues()).toEqual([[7, 1]]);
            await calculate(() => expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(true));
            expect(sheet.getRange('F17:M17').getValues()).toEqual([[1, 1, 64, 1, 0, 2, 19, 0]]);
            await calculate(() => sheet.getRange('H8').setValue('invalid'));
            expect(sheet.getRange('F15:G15').getValues()).toEqual([[2, 0]]);
            await calculate(() => expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(true));
            expect(sheet.getRange('F15:G15').getValues()).toEqual([[2, 1]]);
            expect(sheet.getRange('A18:B19').getValues()).toEqual([[45173, 45173], [45174, 45174]]);
            expect(sheet.getRange('D18:G18').getValues()).toEqual([[61, 2, 1, 23]]);
            expect(sheet.getRange('H18:J18').getValues()).toEqual([[46, '#NULL!', '#REF!']]);
            expect(sheet.getRange('A20:B20').getValues()).toEqual([['#NAME?', '#NAME?']]);
            expect(sheet.getRange('P20:Q20').getValues()).toEqual([['#NAME?', 0]]);
            const savedCells = workbook.save().sheets[sheet.getSheetId()]?.cellData;
            expect(savedCells?.[19]?.[0]?.f).toBe('=CUBEVALUE("NoSuchConnection")');
            expect(Number(sheet.getRange('C20').getValue())).toBeCloseTo(122.5804, 10);
            expect(sheet.getRange('D20:F20').getValues()).toEqual([['#DIV/0!', '#DIV/0!', '#CALC!']]);
            expect(sheet.getRange('G20:J20').getValues()).toEqual([[4200, '#VALUE!', 45364, 45365]]);
            expect(sheet.getRange('K20').getValue()).toBe('100|39.3700787401575|3.28083989501312');
            expect(sheet.getRange('L20:N20').getValues()).toEqual([['{19;31}', 0, 4]]);
            expect(sheet.getRange('O20').getValue()).toBeCloseTo(0.04519223562916916, 12);

            const source = workbook.getSheetByName('Source')!;
            expect(source.getRange('C2:C3').getValues()).toEqual([[19], [23]]);
            await calculate(() => source.getRange('A1:B1').setValues([[45173, 29]]));
            expect(sheet.getRange('A18:B19').getValues()).toEqual([[45170, 45170], [45174, 45174]]);
            expect(sheet.getRange('D18:G18').getValues()).toEqual([[81, 2, 1, 23]]);
            expect(Number(sheet.getRange('C20').getValue())).toBeCloseTo(187.0964, 10);
            expect(sheet.getRange('D20:F20').getValues()).toEqual([[29, 29, '#CALC!']]);
            expect(sheet.getRange('G20:J20').getValues()).toEqual([[5200, '#VALUE!', 45364, 45365]]);
            expect(sheet.getRange('L20').getValue()).toBe('{31}');
            expect(sheet.getRange('O20').getValue()).toBeCloseTo(0.06973332831835138, 12);
            expect(source.getRange('C2:C3').getValues()).toEqual([[29], [23]]);
            await calculate(() => expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(true));
            expect(sheet.getRange('A18:B19').getValues()).toEqual([[45173, 45173], [45174, 45174]]);
            expect(sheet.getRange('D18:G18').getValues()).toEqual([[61, 2, 1, 23]]);
            expect(Number(sheet.getRange('C20').getValue())).toBeCloseTo(122.5804, 10);
            expect(sheet.getRange('D20:F20').getValues()).toEqual([['#DIV/0!', '#DIV/0!', '#CALC!']]);
            expect(sheet.getRange('G20:J20').getValues()).toEqual([[4200, '#VALUE!', 45364, 45365]]);
            expect(sheet.getRange('K20').getValue()).toBe('100|39.3700787401575|3.28083989501312');
            expect(sheet.getRange('L20:N20').getValues()).toEqual([['{19;31}', 0, 4]]);
            expect(sheet.getRange('O20').getValue()).toBeCloseTo(0.04519223562916916, 12);
            expect(source.getRange('C2:C3').getValues()).toEqual([[19], [23]]);
        } finally {
            univer.dispose();
        }
    });
});
