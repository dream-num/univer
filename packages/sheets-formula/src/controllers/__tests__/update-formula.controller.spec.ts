/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICellData, IWorkbookData, Nullable, Univer } from '@univerjs/core';
import { CellValueType, Direction, ICommandService, IUniverInstanceService, LocaleType, RANGE_TYPE, RedoCommand, UndoCommand } from '@univerjs/core';
import type { IDeleteRangeMoveLeftCommandParams, IDeleteRangeMoveUpCommandParams, IInsertColCommandParams, IInsertRowCommandParams, IMoveColsCommandParams, IMoveRangeCommandParams, IMoveRowsCommandParams, InsertRangeMoveDownCommandParams, InsertRangeMoveRightCommandParams, IRemoveRowColCommandParams, IRemoveSheetCommandParams, ISetWorksheetNameCommandParams } from '@univerjs/sheets';
import { DeleteRangeMoveLeftCommand, DeleteRangeMoveUpCommand, InsertColCommand, InsertColMutation, InsertRangeMoveDownCommand, InsertRangeMoveRightCommand, InsertRowCommand, InsertRowMutation, MoveColsCommand, MoveColsMutation, MoveRangeCommand, MoveRangeMutation, MoveRowsCommand, MoveRowsMutation, NORMAL_SELECTION_PLUGIN_NAME, RemoveColCommand, RemoveColMutation, RemoveRowCommand, RemoveRowMutation, RemoveSheetCommand, RemoveSheetMutation, SelectionManagerService, SetRangeValuesMutation, SetSelectionsOperation, SetWorksheetNameCommand, SetWorksheetNameMutation } from '@univerjs/sheets';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SetArrayFormulaDataMutation, SetFormulaDataMutation } from '@univerjs/engine-formula';
import { UpdateFormulaController } from '../update-formula.controller';
import { createCommandTestBed } from './create-command-test-bed';

const TEST_WORKBOOK_DATA_DEMO = (): IWorkbookData => ({
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    6: {
                        f: '=A1:B2',
                    },
                },
                1: {
                    2: {
                        v: 1,
                        t: CellValueType.NUMBER,
                    },
                },
                2: {
                    1: {
                        v: 1,
                        t: CellValueType.NUMBER,
                    },
                    2: {
                        f: '=A1:B2',
                    },
                },
                5: {
                    2: {
                        f: '=SUM(A1:B2)',
                    },
                    3: {
                        v: 1,
                        t: CellValueType.NUMBER,
                    },
                },
                6: {
                    2: {
                        v: 1,
                        t: CellValueType.NUMBER,
                    },
                },
                14: {
                    0: {
                        f: '=A1:B2',
                    },
                    2: {
                        f: '=Sheet2!A1:B2',
                    },
                },
            },
            name: 'Sheet1',
        },
        sheet2: {
            id: 'sheet2',
            cellData: {
            },
            name: 'Sheet2',
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: ['sheet1', 'sheet2'],
    styles: {},
});

describe('Test insert function operation', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<ICellData>>> | undefined;

    beforeEach(() => {
        const testBed = createCommandTestBed(TEST_WORKBOOK_DATA_DEMO(), [
            [UpdateFormulaController],
        ]);
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(MoveRangeCommand);
        commandService.registerCommand(MoveRangeMutation);

        commandService.registerCommand(MoveRowsCommand);
        commandService.registerCommand(MoveRowsMutation);

        commandService.registerCommand(MoveColsCommand);
        commandService.registerCommand(MoveColsMutation);

        commandService.registerCommand(InsertRowCommand);
        commandService.registerCommand(InsertRowMutation);

        commandService.registerCommand(InsertColCommand);
        commandService.registerCommand(InsertColMutation);

        commandService.registerCommand(RemoveRowCommand);
        commandService.registerCommand(RemoveRowMutation);

        commandService.registerCommand(RemoveColCommand);
        commandService.registerCommand(RemoveColMutation);

        commandService.registerCommand(DeleteRangeMoveLeftCommand);
        commandService.registerCommand(DeleteRangeMoveUpCommand);
        commandService.registerCommand(InsertRangeMoveDownCommand);
        commandService.registerCommand(InsertRangeMoveRightCommand);

        commandService.registerCommand(SetWorksheetNameCommand);
        commandService.registerCommand(SetWorksheetNameMutation);
        commandService.registerCommand(RemoveSheetCommand);
        commandService.registerCommand(RemoveSheetMutation);

        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetFormulaDataMutation);
        commandService.registerCommand(SetArrayFormulaDataMutation);

        getValues = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Array<Array<Nullable<ICellData>>> | undefined =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValues();
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('update formula', () => {
        it('Move range, update reference', async () => {
            const params: IMoveRangeCommandParams = {
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
            };

            expect(await commandService.executeCommand(MoveRangeCommand.id, params)).toBeTruthy();
            const values = getValues(5, 2, 5, 2);
            expect(values).toStrictEqual([[{ f: '=SUM(D1:E2)' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(5, 2, 5, 2);
            expect(valuesUndo).toStrictEqual([[{ f: '=SUM(A1:B2)' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(5, 2, 5, 2);
            expect(valuesRedo).toStrictEqual([[{ f: '=SUM(D1:E2)' }]]);
        });

        it('Move range, update position', async () => {
            const params: IMoveRangeCommandParams = {
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
            };

            expect(await commandService.executeCommand(MoveRangeCommand.id, params)).toBeTruthy();
            const values = getValues(5, 2, 5, 3);
            expect(values).toStrictEqual([[{}, { f: '=SUM(A1:B2)' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(5, 2, 5, 3);
            expect(valuesUndo).toStrictEqual([[{ f: '=SUM(A1:B2)' }, { v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(5, 2, 5, 3);
            expect(valuesRedo).toStrictEqual([[{}, { f: '=SUM(A1:B2)' }]]);
        });

        it('Move rows, update reference', async () => {
            const selectionManager = get(SelectionManagerService);
            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });

            // A1
            selectionManager.add([
                {
                    range: { startRow: 1, startColumn: 0, endRow: 1, endColumn: 0, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
            ]);

            const params: IMoveRowsCommandParams = {
                fromRange: {
                    startRow: 1,
                    startColumn: 0,
                    endRow: 1,
                    endColumn: 19,
                    rangeType: 1,
                },
                toRange: {
                    startRow: 4,
                    startColumn: 0,
                    endRow: 4,
                    endColumn: 19,
                    rangeType: 1,
                },
            };

            expect(await commandService.executeCommand(MoveRowsCommand.id, params)).toBeTruthy();
            const values = getValues(5, 2, 5, 2);
            expect(values).toStrictEqual([[{ f: '=SUM(A1:B4)' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(5, 2, 5, 2);
            expect(valuesUndo).toStrictEqual([[{ f: '=SUM(A1:B2)' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(5, 2, 5, 2);
            expect(valuesRedo).toStrictEqual([[{ f: '=SUM(A1:B4)' }]]);
        });

        it('Move rows, update reference and position', async () => {
            const selectionManager = get(SelectionManagerService);
            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });

            // A1
            selectionManager.add([
                {
                    range: { startRow: 1, startColumn: 0, endRow: 1, endColumn: 0, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
            ]);

            const params: IMoveRowsCommandParams = {
                fromRange: {
                    startRow: 1,
                    startColumn: 0,
                    endRow: 1,
                    endColumn: 19,
                    rangeType: 1,
                },
                toRange: {
                    startRow: 9,
                    startColumn: 0,
                    endRow: 9,
                    endColumn: 19,
                    rangeType: 1,
                },
            };

            expect(await commandService.executeCommand(MoveRowsCommand.id, params)).toBeTruthy();
            const values = getValues(1, 2, 2, 2);
            expect(values).toStrictEqual([[{ f: '=A1:B9' }], [{}]]);
            const values2 = getValues(4, 2, 5, 2);
            expect(values2).toStrictEqual([[{ f: '=SUM(A1:B9)' }], [{ v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(1, 2, 2, 2);
            expect(valuesUndo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }], [{ f: '=A1:B2' }]]);
            const valuesUndo2 = getValues(5, 2, 6, 2);
            expect(valuesUndo2).toStrictEqual([[{ f: '=SUM(A1:B2)' }], [{ v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(1, 2, 2, 2);
            expect(valuesRedo).toStrictEqual([[{ f: '=A1:B9' }], [{}]]);
            const valuesRedo2 = getValues(4, 2, 5, 2);
            expect(valuesRedo2).toStrictEqual([[{ f: '=SUM(A1:B9)' }], [{ v: 1, t: CellValueType.NUMBER }]]);
        });

        it('Move columns, update reference', async () => {
            const selectionManager = get(SelectionManagerService);
            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });

            // A1
            selectionManager.add([
                {
                    range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
            ]);

            const params: IMoveColsCommandParams = {
                fromRange: {
                    startRow: 0,
                    startColumn: 0,
                    endRow: 999,
                    endColumn: 0,
                    rangeType: 2,
                },
                toRange: {
                    startRow: 0,
                    startColumn: 4,
                    endRow: 999,
                    endColumn: 4,
                    rangeType: 2,
                },
            };

            expect(await commandService.executeCommand(MoveColsCommand.id, params)).toBeTruthy();
            const values = getValues(0, 6, 0, 6);
            expect(values).toStrictEqual([[{ f: '=A1:A2' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(0, 6, 0, 6);
            expect(valuesUndo).toStrictEqual([[{ f: '=A1:B2' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(0, 6, 0, 6);
            expect(valuesRedo).toStrictEqual([[{ f: '=A1:A2' }]]);
        });

        it('Move columns, update reference and position', async () => {
            const selectionManager = get(SelectionManagerService);
            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });

            // A1
            selectionManager.add([
                {
                    range: { startRow: 0, startColumn: 1, endRow: 0, endColumn: 1, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
            ]);

            const params: IMoveColsCommandParams = {
                fromRange: {
                    startRow: 0,
                    startColumn: 1,
                    endRow: 999,
                    endColumn: 1,
                    rangeType: 2,
                },
                toRange: {
                    startRow: 0,
                    startColumn: 9,
                    endRow: 999,
                    endColumn: 9,
                    rangeType: 2,
                },
            };

            expect(await commandService.executeCommand(MoveColsCommand.id, params)).toBeTruthy();
            const values = getValues(2, 1, 2, 2);
            expect(values).toStrictEqual([[{ f: '=A1:I2' }, {}]]);
            const values2 = getValues(5, 1, 5, 2);
            expect(values2).toStrictEqual([[{ f: '=SUM(A1:I2)' }, { v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(2, 1, 2, 2);
            expect(valuesUndo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }, { f: '=A1:B2' }]]);
            const valuesUndo2 = getValues(5, 2, 5, 3);
            expect(valuesUndo2).toStrictEqual([[{ f: '=SUM(A1:B2)' }, { v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(2, 1, 2, 2);
            expect(valuesRedo).toStrictEqual([[{ f: '=A1:I2' }, {}]]);
            const valuesRedo2 = getValues(5, 1, 5, 2);
            expect(valuesRedo2).toStrictEqual([[{ f: '=SUM(A1:I2)' }, { v: 1, t: CellValueType.NUMBER }]]);
        });

        it('Insert row, update reference', async () => {
            const params: IInsertRowCommandParams = {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: {
                    startRow: 1,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 19,
                },
                direction: Direction.UP,
            };

            expect(await commandService.executeCommand(InsertRowCommand.id, params)).toBeTruthy();
            const values = getValues(0, 6, 0, 6);
            expect(values).toStrictEqual([[{ f: '=A1:B3' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(0, 6, 0, 6);
            expect(valuesUndo).toStrictEqual([[{ f: '=A1:B2' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(0, 6, 0, 6);
            expect(valuesRedo).toStrictEqual([[{ f: '=A1:B3' }]]);
        });

        it('Insert row, update reference and position', async () => {
            const params: IInsertRowCommandParams = {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: {
                    startRow: 1,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 19,
                },
                direction: Direction.UP,
            };

            expect(await commandService.executeCommand(InsertRowCommand.id, params)).toBeTruthy();
            const values = getValues(2, 2, 3, 2);
            expect(values).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }], [{ f: '=A1:B3' }]]);
            const values2 = getValues(6, 2, 7, 2);
            expect(values2).toStrictEqual([[{ f: '=SUM(A1:B3)' }], [{ v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(1, 2, 2, 2);
            expect(valuesUndo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }], [{ f: '=A1:B2' }]]);
            const valuesUndo2 = getValues(5, 2, 6, 2);
            expect(valuesUndo2).toStrictEqual([[{ f: '=SUM(A1:B2)' }], [{ v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(2, 2, 3, 2);
            expect(valuesRedo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }], [{ f: '=A1:B3' }]]);
            const valuesRedo2 = getValues(6, 2, 7, 2);
            expect(valuesRedo2).toStrictEqual([[{ f: '=SUM(A1:B3)' }], [{ v: 1, t: CellValueType.NUMBER }]]);
        });

        it('Insert column, update reference', async () => {
            const params: IInsertColCommandParams = {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: {
                    startColumn: 1,
                    endColumn: 1,
                    startRow: 0,
                    endRow: 14,
                },
                direction: Direction.LEFT,
                cellValue: {},
            };

            expect(await commandService.executeCommand(InsertColCommand.id, params)).toBeTruthy();
            const values = getValues(14, 0, 14, 0);
            expect(values).toStrictEqual([[{ f: '=A1:C2' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(14, 0, 14, 0);
            expect(valuesUndo).toStrictEqual([[{ f: '=A1:B2' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(14, 0, 14, 0);
            expect(valuesRedo).toStrictEqual([[{ f: '=A1:C2' }]]);
        });

        it('Insert column, update reference and position', async () => {
            const params: IInsertColCommandParams = {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: {
                    startColumn: 1,
                    endColumn: 1,
                    startRow: 0,
                    endRow: 14,
                },
                direction: Direction.LEFT,
                cellValue: {},
            };

            expect(await commandService.executeCommand(InsertColCommand.id, params)).toBeTruthy();
            const values = getValues(2, 2, 2, 3);
            expect(values).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }, { f: '=A1:C2' }]]);
            const values2 = getValues(5, 3, 5, 4);
            expect(values2).toStrictEqual([[{ f: '=SUM(A1:C2)' }, { v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(2, 1, 2, 2);
            expect(valuesUndo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }, { f: '=A1:B2' }]]);
            const valuesUndo2 = getValues(5, 2, 5, 3);
            expect(valuesUndo2).toStrictEqual([[{ f: '=SUM(A1:B2)' }, { v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(2, 2, 2, 3);
            expect(valuesRedo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }, { f: '=A1:C2' }]]);
            const valuesRedo2 = getValues(5, 3, 5, 4);
            expect(valuesRedo2).toStrictEqual([[{ f: '=SUM(A1:C2)' }, { v: 1, t: CellValueType.NUMBER }]]);
        });

        it('Remove row, update reference', async () => {
            const params: IRemoveRowColCommandParams = {
                range: {
                    startRow: 1,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 19,
                },
            };

            expect(await commandService.executeCommand(RemoveRowCommand.id, params)).toBeTruthy();
            const values = getValues(0, 6, 0, 6);
            expect(values).toStrictEqual([[{ f: '=A1:B1' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(0, 6, 0, 6);
            expect(valuesUndo).toStrictEqual([[{ f: '=A1:B2' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(0, 6, 0, 6);
            expect(valuesRedo).toStrictEqual([[{ f: '=A1:B1' }]]);
        });

        it('Remove row, update reference and position', async () => {
            const params: IRemoveRowColCommandParams = {
                range: {
                    startRow: 1,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 19,
                },
            };

            expect(await commandService.executeCommand(RemoveRowCommand.id, params)).toBeTruthy();
            const values = getValues(1, 2, 2, 2);
            expect(values).toStrictEqual([[{ f: '=A1:B1' }], [{}]]);
            const values2 = getValues(4, 2, 5, 2);
            expect(values2).toStrictEqual([[{ f: '=SUM(A1:B1)' }], [{ v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(1, 2, 2, 2);
            expect(valuesUndo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }], [{ f: '=A1:B2' }]]);
            const valuesUndo2 = getValues(5, 2, 6, 2);
            expect(valuesUndo2).toStrictEqual([[{ f: '=SUM(A1:B2)' }], [{ v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(1, 2, 2, 2);
            expect(valuesRedo).toStrictEqual([[{ f: '=A1:B1' }], [{}]]);
            const valuesRedo2 = getValues(4, 2, 5, 2);
            expect(valuesRedo2).toStrictEqual([[{ f: '=SUM(A1:B1)' }], [{ v: 1, t: CellValueType.NUMBER }]]);
        });

        it('Remove column, update reference', async () => {
            const params: IRemoveRowColCommandParams = {
                range: {
                    startColumn: 1,
                    endColumn: 1,
                    startRow: 0,
                    endRow: 2,
                },
            };

            expect(await commandService.executeCommand(RemoveColCommand.id, params)).toBeTruthy();
            const values = getValues(14, 0, 14, 0);
            expect(values).toStrictEqual([[{ f: '=A1:A2' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(14, 0, 14, 0);
            expect(valuesUndo).toStrictEqual([[{ f: '=A1:B2' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(14, 0, 14, 0);
            expect(valuesRedo).toStrictEqual([[{ f: '=A1:A2' }]]);
        });

        it('Remove column, update reference and position', async () => {
            const params: IRemoveRowColCommandParams = {
                range: {
                    startColumn: 1,
                    endColumn: 1,
                    startRow: 0,
                    endRow: 2,
                },
            };

            expect(await commandService.executeCommand(RemoveColCommand.id, params)).toBeTruthy();
            const values = getValues(2, 1, 2, 2);
            expect(values).toStrictEqual([[{ f: '=A1:A2' }, {}]]);
            const values2 = getValues(5, 1, 5, 2);
            expect(values2).toStrictEqual([[{ f: '=SUM(A1:A2)' }, { v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(2, 1, 2, 2);
            expect(valuesUndo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }, { f: '=A1:B2' }]]);
            const valuesUndo2 = getValues(5, 2, 5, 3);
            expect(valuesUndo2).toStrictEqual([[{ f: '=SUM(A1:B2)' }, { v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(2, 1, 2, 2);
            expect(valuesRedo).toStrictEqual([[{ f: '=A1:A2' }, {}]]);
            const valuesRedo2 = getValues(5, 1, 5, 2);
            expect(valuesRedo2).toStrictEqual([[{ f: '=SUM(A1:A2)' }, { v: 1, t: CellValueType.NUMBER }]]);
        });

        it('Delete move left, value on the left', async () => {
            const params: IDeleteRangeMoveLeftCommandParams = {
                range: {
                    startRow: 2,
                    startColumn: 1,
                    endRow: 2,
                    endColumn: 1,
                    rangeType: 0,
                },
            };

            expect(await commandService.executeCommand(DeleteRangeMoveLeftCommand.id, params)).toBeTruthy();
            const values = getValues(2, 1, 2, 2);
            expect(values).toStrictEqual([[{ f: '=A1:B2' }, {}]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(2, 1, 2, 2);
            expect(valuesUndo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }, { f: '=A1:B2' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(2, 1, 2, 2);
            expect(valuesRedo).toStrictEqual([[{ f: '=A1:B2' }, {}]]);
        });

        it('Delete move left, value on the right', async () => {
            const params: IDeleteRangeMoveLeftCommandParams = {
                range: {
                    startRow: 5,
                    startColumn: 1,
                    endRow: 5,
                    endColumn: 1,
                    rangeType: 0,
                },
            };

            expect(await commandService.executeCommand(DeleteRangeMoveLeftCommand.id, params)).toBeTruthy();
            const values = getValues(5, 1, 5, 2);
            expect(values).toStrictEqual([[{ f: '=SUM(A1:B2)' }, { v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(5, 2, 5, 3);
            expect(valuesUndo).toStrictEqual([[{ f: '=SUM(A1:B2)' }, { v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(5, 1, 5, 2);
            expect(valuesRedo).toStrictEqual([[{ f: '=SUM(A1:B2)' }, { v: 1, t: CellValueType.NUMBER }]]);
        });

        it('Delete move left, update reference', async () => {
            const params: IDeleteRangeMoveLeftCommandParams = {
                range: {
                    startRow: 0,
                    startColumn: 1,
                    endRow: 1,
                    endColumn: 1,
                    rangeType: 0,
                },
            };

            expect(await commandService.executeCommand(DeleteRangeMoveLeftCommand.id, params)).toBeTruthy();
            const values = getValues(14, 0, 14, 0);
            expect(values).toStrictEqual([[{ f: '=A1:A2' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(14, 0, 14, 0);
            expect(valuesUndo).toStrictEqual([[{ f: '=A1:B2' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(14, 0, 14, 0);
            expect(valuesRedo).toStrictEqual([[{ f: '=A1:A2' }]]);
        });

        it('Delete move up, value on the top', async () => {
            const params: IDeleteRangeMoveUpCommandParams = {
                range: {
                    startRow: 1,
                    startColumn: 2,
                    endRow: 1,
                    endColumn: 2,
                    rangeType: 0,
                },
            };

            expect(await commandService.executeCommand(DeleteRangeMoveUpCommand.id, params)).toBeTruthy();
            const values = getValues(1, 2, 2, 2);
            expect(values).toStrictEqual([[{ f: '=A1:B2' }], [{}]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(1, 2, 2, 2);
            expect(valuesUndo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }], [{ f: '=A1:B2' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(1, 2, 2, 2);
            expect(valuesRedo).toStrictEqual([[{ f: '=A1:B2' }], [{}]]);
        });

        it('Delete move up, value on the bottom', async () => {
            const params: IDeleteRangeMoveUpCommandParams = {
                range: {
                    startRow: 4,
                    startColumn: 2,
                    endRow: 4,
                    endColumn: 2,
                    rangeType: 0,
                },
            };

            expect(await commandService.executeCommand(DeleteRangeMoveUpCommand.id, params)).toBeTruthy();
            const values = getValues(4, 2, 5, 2);
            expect(values).toStrictEqual([[{ f: '=SUM(A1:B2)' }], [{ v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(5, 2, 6, 2);
            expect(valuesUndo).toStrictEqual([[{ f: '=SUM(A1:B2)' }], [{ v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(4, 2, 5, 2);
            expect(valuesRedo).toStrictEqual([[{ f: '=SUM(A1:B2)' }], [{ v: 1, t: CellValueType.NUMBER }]]);
        });

        it('Delete move up, update reference', async () => {
            const params: IDeleteRangeMoveUpCommandParams = {
                range: {
                    startRow: 1,
                    startColumn: 0,
                    endRow: 1,
                    endColumn: 1,
                    rangeType: 0,
                },
            };

            expect(await commandService.executeCommand(DeleteRangeMoveUpCommand.id, params)).toBeTruthy();
            const values = getValues(0, 6, 0, 6);
            expect(values).toStrictEqual([[{ f: '=A1:B1' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(0, 6, 0, 6);
            expect(valuesUndo).toStrictEqual([[{ f: '=A1:B2' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(0, 6, 0, 6);
            expect(valuesRedo).toStrictEqual([[{ f: '=A1:B1' }]]);
        });

        it('Insert move down, value on the top', async () => {
            const params: InsertRangeMoveDownCommandParams = {
                range: {
                    startRow: 1,
                    startColumn: 2,
                    endRow: 1,
                    endColumn: 2,
                    rangeType: 0,
                },
            };

            expect(await commandService.executeCommand(InsertRangeMoveDownCommand.id, params)).toBeTruthy();
            const values = getValues(2, 2, 3, 2);
            expect(values).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }], [{ f: '=A1:B2' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(1, 2, 2, 2);
            expect(valuesUndo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }], [{ f: '=A1:B2' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(2, 2, 3, 2);
            expect(valuesRedo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }], [{ f: '=A1:B2' }]]);
        });

        it('Insert move down, value on the bottom', async () => {
            const params: InsertRangeMoveDownCommandParams = {
                range: {
                    startRow: 4,
                    startColumn: 2,
                    endRow: 4,
                    endColumn: 2,
                    rangeType: 0,
                },
            };

            expect(await commandService.executeCommand(InsertRangeMoveDownCommand.id, params)).toBeTruthy();
            const values = getValues(6, 2, 7, 2);
            expect(values).toStrictEqual([[{ f: '=SUM(A1:B2)' }], [{ v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(5, 2, 6, 2);
            expect(valuesUndo).toStrictEqual([[{ f: '=SUM(A1:B2)' }], [{ v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(6, 2, 7, 2);
            expect(valuesRedo).toStrictEqual([[{ f: '=SUM(A1:B2)' }], [{ v: 1, t: CellValueType.NUMBER }]]);
        });

        it('Insert move down, update reference', async () => {
            const params: InsertRangeMoveDownCommandParams = {
                range: {
                    startRow: 1,
                    startColumn: 0,
                    endRow: 1,
                    endColumn: 1,
                    rangeType: 0,
                },
            };

            expect(await commandService.executeCommand(InsertRangeMoveDownCommand.id, params)).toBeTruthy();
            const values = getValues(0, 6, 0, 6);
            expect(values).toStrictEqual([[{ f: '=A1:B3' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(0, 6, 0, 6);
            expect(valuesUndo).toStrictEqual([[{ f: '=A1:B2' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(0, 6, 0, 6);
            expect(valuesRedo).toStrictEqual([[{ f: '=A1:B3' }]]);
        });

        it('Insert move right, value on the left', async () => {
            const params: InsertRangeMoveRightCommandParams = {
                range: {
                    startRow: 2,
                    startColumn: 1,
                    endRow: 2,
                    endColumn: 1,
                    rangeType: 0,
                },
            };

            expect(await commandService.executeCommand(InsertRangeMoveRightCommand.id, params)).toBeTruthy();
            const values = getValues(2, 2, 2, 3);
            expect(values).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }, { f: '=A1:B2' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(2, 1, 2, 2);
            expect(valuesUndo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }, { f: '=A1:B2' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(2, 2, 2, 3);
            expect(valuesRedo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }, { f: '=A1:B2' }]]);
        });

        it('Insert move right, value on the right', async () => {
            const params: InsertRangeMoveRightCommandParams = {
                range: {
                    startRow: 5,
                    startColumn: 1,
                    endRow: 5,
                    endColumn: 1,
                    rangeType: 0,
                },
            };

            expect(await commandService.executeCommand(InsertRangeMoveRightCommand.id, params)).toBeTruthy();
            const values = getValues(5, 3, 5, 4);
            expect(values).toStrictEqual([[{ f: '=SUM(A1:B2)' }, { v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(5, 2, 5, 3);
            expect(valuesUndo).toStrictEqual([[{ f: '=SUM(A1:B2)' }, { v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(5, 3, 5, 4);
            expect(valuesRedo).toStrictEqual([[{ f: '=SUM(A1:B2)' }, { v: 1, t: CellValueType.NUMBER }]]);
        });

        it('Insert move right, update reference', async () => {
            const params: InsertRangeMoveRightCommandParams = {
                range: {
                    startRow: 0,
                    startColumn: 1,
                    endRow: 1,
                    endColumn: 1,
                    rangeType: 0,
                },
            };

            expect(await commandService.executeCommand(InsertRangeMoveRightCommand.id, params)).toBeTruthy();
            const values = getValues(14, 0, 14, 0);
            expect(values).toStrictEqual([[{ f: '=A1:C2' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(14, 0, 14, 0);
            expect(valuesUndo).toStrictEqual([[{ f: '=A1:B2' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(14, 0, 14, 0);
            expect(valuesRedo).toStrictEqual([[{ f: '=A1:C2' }]]);
        });

        it('set name', async () => {
            const params: ISetWorksheetNameCommandParams = {
                subUnitId: 'sheet2',
                name: 'Sheet2Rename',
            };

            expect(await commandService.executeCommand(SetWorksheetNameCommand.id, params)).toBeTruthy();
            const values = getValues(14, 2, 14, 2);
            expect(values).toStrictEqual([[{ f: '=Sheet2Rename!A1:B2' }]]);
        });

        it('remove sheet', async () => {
            const params: IRemoveSheetCommandParams = {
                unitId: 'test',
                subUnitId: 'sheet2',
            };

            expect(await commandService.executeCommand(RemoveSheetCommand.id, params)).toBeTruthy();
            const values = getValues(14, 2, 14, 2);
            expect(values).toStrictEqual([[{ f: '=#REF!' }]]);
        });
    });
});
