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
import { CellValueType, ICommandService, IConfigService, IUniverInstanceService, LocaleType, RedoCommand, UndoCommand, UniverInstanceType } from '@univerjs/core';
import {
    FormulaDataModel,
    IDefinedNamesService,
    RemoveDefinedNameMutation,
    SetArrayFormulaDataMutation,
    SetDefinedNameMutation,
    SetFormulaDataMutation,
    SetTriggerFormulaCalculationStartMutation,
} from '@univerjs/engine-formula';
import { InsertSheetMutation, MoveRangeCommand, MoveRangeMutation, RemoveDefinedNameCommand, RemoveSheetCommand, RemoveSheetMutation, SetDefinedNameCommand, SetRangeValuesCommand, SetRangeValuesMutation, SetSelectionsOperation, SetStyleCommand, SetWorksheetNameCommand, SheetInterceptorService } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CalculationMode, PLUGIN_CONFIG_KEY_BASE } from '../../config/config';
import { createFacadeTestBed } from '../../facade/__tests__/create-test-bed';
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

function createControllerTestBed() {
    const dependencies: Dependency[] = [
        [UpdateFormulaController],
    ];

    return createFacadeTestBed(createWorkbookData(), dependencies);
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
