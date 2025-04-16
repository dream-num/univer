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

import type { ICellData, Injector, IWorkbookData, Nullable, Univer, Workbook } from '@univerjs/core';
import type { ISetDefinedNameMutationParam } from '@univerjs/engine-formula';
import type { IDeleteRangeMoveLeftCommandParams, IDeleteRangeMoveUpCommandParams, IInsertColCommandParams, IInsertRowCommandParams, IMoveColsCommandParams, IMoveRangeCommandParams, IMoveRowsCommandParams, InsertRangeMoveDownCommandParams, InsertRangeMoveRightCommandParams, IRemoveRowColCommandParams, IRemoveSheetCommandParams, ISetRangeValuesCommandParams, ISetWorksheetNameCommandParams } from '@univerjs/sheets';
import type { ISetRowHiddenCommandParams } from '@univerjs/sheets/commands/commands/set-row-visible.command.js';
import { CellValueType, Direction, ICommandService, IUniverInstanceService, LocaleType, RANGE_TYPE, RedoCommand, UndoCommand } from '@univerjs/core';
import { RemoveDefinedNameMutation, SetArrayFormulaDataMutation, SetDefinedNameMutation, SetFormulaDataMutation } from '@univerjs/engine-formula';
import { DeleteRangeMoveLeftCommand, DeleteRangeMoveUpCommand, InsertColByRangeCommand, InsertColCommand, InsertColMutation, InsertRangeMoveDownCommand, InsertRangeMoveRightCommand, InsertRowByRangeCommand, InsertRowCommand, InsertRowMutation, MoveColsCommand, MoveColsMutation, MoveRangeCommand, MoveRangeMutation, MoveRowsCommand, MoveRowsMutation, RemoveColByRangeCommand, RemoveColCommand, RemoveColMutation, RemoveDefinedNameCommand, RemoveRowByRangeCommand, RemoveRowCommand, RemoveRowMutation, RemoveSheetCommand, RemoveSheetMutation, SetColHiddenCommand, SetColHiddenMutation, SetColVisibleMutation, SetDefinedNameCommand, SetRangeValuesCommand, SetRangeValuesMutation, SetRowHiddenCommand, SetRowHiddenMutation, SetRowVisibleMutation, SetSelectionsOperation, SetSpecificColsVisibleCommand, SetSpecificRowsVisibleCommand, SetWorksheetNameCommand, SetWorksheetNameMutation, SheetsSelectionsService } from '@univerjs/sheets';
import { UpdateFormulaController } from '@univerjs/sheets-formula';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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
                7: {
                    0: {
                        v: 1,
                        t: CellValueType.NUMBER,
                    },
                    1: {
                        v: 1,
                        t: CellValueType.NUMBER,
                    },
                    2: {
                        v: 1,
                        t: CellValueType.NUMBER,
                    },
                    3: {
                        f: '=SUM(A8)',
                    },
                    4: {
                        f: '=SUM(B8)',
                    },
                    5: {
                        f: '=SUM(C8)',
                    },
                    7: {
                        f: '=SUM(A8:C10)',
                    },
                    8: {
                        f: '=SUM(B8:D10)',
                        si: 'CarNau',
                    },
                    9: {
                        si: 'CarNau',
                    },
                },
                8: {
                    0: {
                        v: 1,
                        t: CellValueType.NUMBER,
                    },
                    1: {
                        v: 1,
                        t: CellValueType.NUMBER,
                    },
                    2: {
                        v: 1,
                        t: CellValueType.NUMBER,
                    },
                    3: {
                        f: '=SUM(A9)',
                    },
                    4: {
                        f: '=SUM(B9)',
                    },
                    5: {
                        f: '=SUM(C9)',
                    },
                    7: {
                        f: '=SUM(A9:C11)',
                        si: 'y0gLJX',
                    },
                    8: {
                        si: 'y0gLJX',
                    },
                    9: {
                        si: 'y0gLJX',
                    },
                },
                9: {
                    0: {
                        v: 1,
                        t: CellValueType.NUMBER,
                    },
                    1: {
                        v: 1,
                        t: CellValueType.NUMBER,
                    },
                    2: {
                        v: 1,
                        t: CellValueType.NUMBER,
                    },
                    3: {
                        f: '=SUM(A10)',
                    },
                    4: {
                        f: '=SUM(B10)',
                    },
                    5: {
                        f: '=SUM(C10)',
                    },
                    7: {
                        si: 'y0gLJX',
                    },
                    8: {
                        si: 'y0gLJX',
                    },
                    9: {
                        si: 'y0gLJX',
                    },
                },
                10: {
                    0: {
                        f: '=SUM(A8)',
                    },
                    1: {
                        f: '=SUM(B8)',
                    },
                    2: {
                        f: '=SUM(C8)',
                    },
                },
                11: {
                    0: {
                        f: '=SUM(A9)',
                    },
                    1: {
                        f: '=SUM(B9)',
                    },
                    2: {
                        f: '=SUM(C9)',
                    },
                },
                12: {
                    0: {
                        f: '=SUM(A10)',
                    },
                    1: {
                        f: '=SUM(B10)',
                    },
                    2: {
                        f: '=SUM(C10)',
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
                18: {
                    0: {
                        v: 1,
                    },
                    1: {
                        f: '=SUM(A19)',
                        t: 2,
                        v: 1,
                    },
                },
                19: {
                    0: {
                        v: 2,
                    },
                    1: {
                        f: '=SUM(A20)',
                        si: 'id1',
                        t: 2,
                        v: 2,
                    },
                },
                20: {
                    0: {
                        v: 3,
                    },
                    1: {
                        si: 'id1',
                        t: 2,
                        v: 3,
                    },
                },
                21: {
                    2: {
                        f: '=OFFSET(A1,1,1)',
                        v: 0,
                        t: 2,
                    },
                    3: {
                        f: '=OFFSET(B1,1,1)',
                        si: 'id2',
                        v: 1,
                        t: 2,
                    },
                    4: {
                        si: 'id2',
                        v: 1,
                        t: 2,
                    },
                },
            },
            name: 'Sheet1',
        },
        sheet2: {
            id: 'sheet2',
            cellData: {
                2: {
                    0: {
                        f: '=SUM(DefinedName1)',
                    },
                },
                9: {
                    0: {
                        f: '=SUM(Sheet1!A1:A3)',
                    },
                    9: {
                        f: '=SUM(A2:C4)',
                    },
                },
            },
            name: 'Sheet2',
        },
        sheet3: {
            id: 'sheet3',
            cellData: {
                0: {
                    0: {
                        v: 1,
                        t: 2,
                    },
                    3: {
                        f: '=A1:A5',
                        v: 1,
                        t: 2,
                    },
                },
                1: {
                    0: {
                        v: 2,
                        t: 2,
                    },
                },
                2: {
                    0: {
                        v: 3,
                        t: 2,
                    },
                },
                3: {
                    0: {
                        v: 4,
                        t: 2,
                    },
                },
                4: {
                    0: {
                        v: 5,
                        t: 2,
                    },
                },
                5: {
                    0: {
                        f: '=SUBTOTAL(109,A1:A5)',
                        v: 15,
                        t: 2,
                    },
                    1: {
                        f: '=SUBTOTAL(109,A3)',
                        v: 3,
                        t: 2,
                    },
                    2: {
                        f: '=A3',
                        v: 3,
                        t: 2,
                    },
                },
            },
            name: 'Sheet3',
        },
        sheet4: {
            id: 'sheet4',
            cellData: {
                0: {
                    0: {
                        f: '=SUBTOTAL(109,Sheet3!A1:A5)',
                        v: 15,
                        t: 2,
                    },
                },
            },
            name: 'Sheet4',
        },

    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: ['sheet1', 'sheet2', 'sheet3', 'sheet4'],
    styles: {},
    resources: [
        {
            name: 'SHEET_DEFINED_NAME_PLUGIN',
            data: '{"soAI3OK4sq":{"id":"soAI3OK4sq","name":"DefinedName1","formulaOrRefString":"Sheet2!$A$1:$B$2","comment":"","localSheetId":"AllDefaultWorkbook"}}',
        },
    ],
});

describe('Test update formula ', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number,
        sheetId?: string
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
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetFormulaDataMutation);
        commandService.registerCommand(SetArrayFormulaDataMutation);

        // set defined name
        commandService.registerCommand(SetDefinedNameCommand);
        commandService.registerCommand(RemoveDefinedNameCommand);
        commandService.registerCommand(SetDefinedNameMutation);
        commandService.registerCommand(RemoveDefinedNameMutation);

        [
            RemoveColByRangeCommand,
            RemoveRowByRangeCommand,
            InsertRowByRangeCommand,
            InsertColByRangeCommand,
        ].forEach((command) => {
            commandService.registerCommand(command);
        });
        // hide row/column
        commandService.registerCommand(SetRowHiddenCommand);
        commandService.registerCommand(SetRowHiddenMutation);
        commandService.registerCommand(SetSpecificRowsVisibleCommand);
        commandService.registerCommand(SetRowVisibleMutation);
        commandService.registerCommand(SetColHiddenCommand);
        commandService.registerCommand(SetColHiddenMutation);
        commandService.registerCommand(SetSpecificColsVisibleCommand);
        commandService.registerCommand(SetColVisibleMutation);

        getValues = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number,
            sheetId: string = 'sheet1'
        ): Array<Array<Nullable<ICellData>>> | undefined =>
            get(IUniverInstanceService)
                .getUnit<Workbook>('test')
                ?.getSheetBySheetId(sheetId)
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValues();

        get(UpdateFormulaController);
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
            expect(values).toStrictEqual([[null, { f: '=SUM(A1:B2)' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(5, 2, 5, 3);
            expect(valuesUndo).toStrictEqual([[{ f: '=SUM(A1:B2)' }, { v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(5, 2, 5, 3);
            expect(valuesRedo).toStrictEqual([[null, { f: '=SUM(A1:B2)' }]]);
        });

        it('Move range, update reference with si ', async () => {
            const params: IMoveRangeCommandParams = {
                fromRange: {
                    startRow: 18,
                    startColumn: 1,
                    endRow: 20,
                    endColumn: 1,
                    rangeType: 0,
                },
                toRange: {
                    startRow: 18,
                    startColumn: 2,
                    endRow: 20,
                    endColumn: 2,
                    rangeType: 0,
                },
            };

            expect(await commandService.executeCommand(MoveRangeCommand.id, params)).toBeTruthy();
            const values = getValues(18, 1, 20, 2);
            expect(values).toStrictEqual([[null, { f: '=SUM(A19)', t: 2, v: 1 }], [null, { f: '=SUM(A20)', si: 'id1', t: 2, v: 2 }], [null, { si: 'id1', t: 2, v: 3 }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(18, 1, 20, 2);
            expect(valuesUndo).toStrictEqual([[{ f: '=SUM(A19)', t: 2, v: 1 }, null], [{ f: '=SUM(A20)', si: 'id1', t: 2, v: 2 }, null], [{ si: 'id1', t: 2, v: 3 }, null]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(18, 1, 20, 2);
            expect(valuesRedo).toStrictEqual([[null, { f: '=SUM(A19)', t: 2, v: 1 }], [null, { f: '=SUM(A20)', si: 'id1', t: 2, v: 2 }], [null, { si: 'id1', t: 2, v: 3 }]]);
        });

        it('Move rows, update reference', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // A1
            selectionManager.addSelections([
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
            const selectionManager = get(SheetsSelectionsService);
            // A1
            selectionManager.addSelections([
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
            expect(values).toStrictEqual([[{ f: '=A1:B9' }], [null]]);
            const values2 = getValues(4, 2, 5, 2);
            expect(values2).toStrictEqual([[{ f: '=SUM(A1:B9)' }], [{ v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(1, 2, 2, 2);
            expect(valuesUndo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }], [{ f: '=A1:B2' }]]);
            const valuesUndo2 = getValues(5, 2, 6, 2);
            expect(valuesUndo2).toStrictEqual([[{ f: '=SUM(A1:B2)' }], [{ v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(1, 2, 2, 2);
            expect(valuesRedo).toStrictEqual([[{ f: '=A1:B9' }], [null]]);
            const valuesRedo2 = getValues(4, 2, 5, 2);
            expect(valuesRedo2).toStrictEqual([[{ f: '=SUM(A1:B9)' }], [{ v: 1, t: CellValueType.NUMBER }]]);
        });

        it('Move rows, reduce scope', async () => {
            const workbook = get(IUniverInstanceService).getUnit<Workbook>('test');
            const sheet2 = workbook?.getSheetBySheetId('sheet2');
            if (!sheet2) {
                throw new Error('sheet2 not found');
            }
            workbook?.setActiveSheet(sheet2);

            const selectionManager = get(SheetsSelectionsService);
            // A1
            selectionManager.addSelections([
                {
                    range: { startRow: 2, startColumn: 0, endRow: 2, endColumn: 19, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
            ]);

            const params: IMoveRowsCommandParams = {
                fromRange: {
                    startRow: 2,
                    startColumn: 0,
                    endRow: 2,
                    endColumn: 19,
                    rangeType: RANGE_TYPE.ROW,
                },
                toRange: {
                    startRow: 7,
                    startColumn: 0,
                    endRow: 7,
                    endColumn: 19,
                    rangeType: RANGE_TYPE.ROW,
                },
            };

            expect(await commandService.executeCommand(MoveRowsCommand.id, params)).toBeTruthy();
            const values = getValues(9, 9, 9, 9, 'sheet2');
            expect(values).toStrictEqual([[{ f: '=SUM(A2:C3)' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo2 = getValues(9, 9, 9, 9, 'sheet2');
            expect(valuesUndo2).toStrictEqual([[{ f: '=SUM(A2:C4)' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(9, 9, 9, 9, 'sheet2');
            expect(valuesRedo).toStrictEqual([[{ f: '=SUM(A2:C3)' }]]);
        });

        it('Move columns, update reference', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // A1
            selectionManager.addSelections([
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
            const selectionManager = get(SheetsSelectionsService);

            // A1
            selectionManager.addSelections([
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
            expect(values).toStrictEqual([[{ f: '=A1:I2' }, null]]);
            const values2 = getValues(5, 1, 5, 2);
            expect(values2).toStrictEqual([[{ f: '=SUM(A1:I2)' }, { v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(2, 1, 2, 2);
            expect(valuesUndo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }, { f: '=A1:B2' }]]);
            const valuesUndo2 = getValues(5, 2, 5, 3);
            expect(valuesUndo2).toStrictEqual([[{ f: '=SUM(A1:B2)' }, { v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(2, 1, 2, 2);
            expect(valuesRedo).toStrictEqual([[{ f: '=A1:I2' }, null]]);
            const valuesRedo2 = getValues(5, 1, 5, 2);
            expect(valuesRedo2).toStrictEqual([[{ f: '=SUM(A1:I2)' }, { v: 1, t: CellValueType.NUMBER }]]);
        });

        it('Move columns, reduce scope', async () => {
            const workbook = get(IUniverInstanceService).getUnit<Workbook>('test');
            const sheet2 = workbook?.getSheetBySheetId('sheet2');
            if (!sheet2) {
                throw new Error('sheet2 not found');
            }
            workbook?.setActiveSheet(sheet2);

            const selectionManager = get(SheetsSelectionsService);
            // A1
            selectionManager.addSelections([
                {
                    range: { startRow: 0, startColumn: 1, endRow: 999, endColumn: 1, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
            ]);

            const params: IMoveRowsCommandParams = {
                fromRange: {
                    startRow: 0,
                    startColumn: 1,
                    endRow: 999,
                    endColumn: 1,
                    rangeType: RANGE_TYPE.COLUMN,
                },
                toRange: {
                    startRow: 0,
                    startColumn: 7,
                    endRow: 999,
                    endColumn: 7,
                    rangeType: RANGE_TYPE.COLUMN,
                },
            };

            expect(await commandService.executeCommand(MoveColsCommand.id, params)).toBeTruthy();
            const values = getValues(9, 9, 9, 9, 'sheet2');
            expect(values).toStrictEqual([[{ f: '=SUM(A2:B4)' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo2 = getValues(9, 9, 9, 9, 'sheet2');
            expect(valuesUndo2).toStrictEqual([[{ f: '=SUM(A2:C4)' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(9, 9, 9, 9, 'sheet2');
            expect(valuesRedo).toStrictEqual([[{ f: '=SUM(A2:B4)' }]]);
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

        it('Insert row, update reference and position, adjacent formula', async () => {
            const params: IInsertRowCommandParams = {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: {
                    startRow: 8,
                    endRow: 8,
                    startColumn: 0,
                    endColumn: 19,
                },
                direction: Direction.UP,
            };

            expect(await commandService.executeCommand(InsertRowCommand.id, params)).toBeTruthy();
            const values = getValues(10, 0, 13, 0);
            expect(values).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }], [{ f: '=SUM(A8)' }], [{ f: '=SUM(A10)' }], [{ f: '=SUM(A11)' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(10, 0, 13, 0);
            expect(valuesUndo).toStrictEqual([[{ f: '=SUM(A8)' }], [{ f: '=SUM(A9)' }], [{ f: '=SUM(A10)' }], [null]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(10, 0, 13, 0);
            expect(valuesRedo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }], [{ f: '=SUM(A8)' }], [{ f: '=SUM(A10)' }], [{ f: '=SUM(A11)' }]]);
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
            const values3 = getValues(7, 2, 7, 6);
            expect(values3).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }, { v: 1, t: CellValueType.NUMBER }, { f: '=SUM(A8)' }, { f: '=SUM(C8)' }, { f: '=SUM(D8)' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(2, 1, 2, 2);
            expect(valuesUndo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }, { f: '=A1:B2' }]]);
            const valuesUndo2 = getValues(5, 2, 5, 3);
            expect(valuesUndo2).toStrictEqual([[{ f: '=SUM(A1:B2)' }, { v: 1, t: CellValueType.NUMBER }]]);
            const valuesUndo3 = getValues(7, 2, 7, 6);
            expect(valuesUndo3).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }, { f: '=SUM(A8)' }, { f: '=SUM(B8)' }, { f: '=SUM(C8)' }, null]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(2, 2, 2, 3);
            expect(valuesRedo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }, { f: '=A1:C2' }]]);
            const valuesRedo2 = getValues(5, 3, 5, 4);
            expect(valuesRedo2).toStrictEqual([[{ f: '=SUM(A1:C2)' }, { v: 1, t: CellValueType.NUMBER }]]);
            const valuesRedo3 = getValues(7, 2, 7, 6);
            expect(valuesRedo3).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }, { v: 1, t: CellValueType.NUMBER }, { f: '=SUM(A8)' }, { f: '=SUM(C8)' }, { f: '=SUM(D8)' }]]);
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
            expect(values).toStrictEqual([[{ f: '=A1:B1' }], [null]]);
            const values2 = getValues(4, 2, 5, 2);
            expect(values2).toStrictEqual([[{ f: '=SUM(A1:B1)' }], [{ v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(1, 2, 2, 2);
            expect(valuesUndo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }], [{ f: '=A1:B2' }]]);
            const valuesUndo2 = getValues(5, 2, 6, 2);
            expect(valuesUndo2).toStrictEqual([[{ f: '=SUM(A1:B2)' }], [{ v: 1, t: CellValueType.NUMBER }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(1, 2, 2, 2);
            expect(valuesRedo).toStrictEqual([[{ f: '=A1:B1' }], [null]]);
            const valuesRedo2 = getValues(4, 2, 5, 2);
            expect(valuesRedo2).toStrictEqual([[{ f: '=SUM(A1:B1)' }], [{ v: 1, t: CellValueType.NUMBER }]]);
        });

        it('Remove row, update reference and position, adjacent formula', async () => {
            const params: IRemoveRowColCommandParams = {
                range: {
                    startRow: 8,
                    endRow: 8,
                    startColumn: 0,
                    endColumn: 19,
                },
            };

            expect(await commandService.executeCommand(RemoveRowCommand.id, params)).toBeTruthy();
            const values = getValues(9, 0, 12, 0);
            expect(values).toStrictEqual([[{ f: '=SUM(A8)' }], [{ f: '=SUM(#REF!)' }], [{ f: '=SUM(A9)' }], [null]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(9, 0, 12, 0);
            expect(valuesUndo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }], [{ f: '=SUM(A8)' }], [{ f: '=SUM(A9)' }], [{ f: '=SUM(A10)' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(9, 0, 12, 0);
            expect(valuesRedo).toStrictEqual([[{ f: '=SUM(A8)' }], [{ f: '=SUM(#REF!)' }], [{ f: '=SUM(A9)' }], [null]]);
        });

        it('Remove row, removed row contains formula', async () => {
            const params: IRemoveRowColCommandParams = {
                range: {
                    startRow: 10,
                    endRow: 10,
                    startColumn: 0,
                    endColumn: 19,
                },
            };

            expect(await commandService.executeCommand(RemoveRowCommand.id, params)).toBeTruthy();
            const values = getValues(10, 0, 10, 0);
            expect(values).toStrictEqual([[{ f: '=SUM(A9)' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(10, 0, 10, 0);
            expect(valuesUndo).toStrictEqual([[{ f: '=SUM(A8)' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(10, 0, 10, 0);
            expect(valuesRedo).toStrictEqual([[{ f: '=SUM(A9)' }]]);
        });

        it('Remove row, changes to other sheet reference ranges', async () => {
            const params: IRemoveRowColCommandParams = {
                range: {
                    startRow: 1,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 19,
                },
            };

            expect(await commandService.executeCommand(RemoveRowCommand.id, params)).toBeTruthy();

            const values1 = getValues(1, 0, 2, 0, 'sheet2');
            expect(values1).toStrictEqual([[null], [{ f: '=SUM(DefinedName1)' }]]);
            const values2 = getValues(8, 0, 9, 0, 'sheet2');
            expect(values2).toStrictEqual([[null], [{ f: '=SUM(Sheet1!A1:A2)' }]]);
            const values3 = getValues(8, 9, 9, 9, 'sheet2');
            expect(values3).toStrictEqual([[null], [{ f: '=SUM(A2:C4)' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo1 = getValues(1, 0, 2, 0, 'sheet2');
            expect(valuesUndo1).toStrictEqual([[null], [{ f: '=SUM(DefinedName1)' }]]);
            const valuesUndo2 = getValues(8, 0, 9, 0, 'sheet2');
            expect(valuesUndo2).toStrictEqual([[null], [{ f: '=SUM(Sheet1!A1:A3)' }]]);
            const valuesUndo3 = getValues(8, 9, 9, 9, 'sheet2');
            expect(valuesUndo3).toStrictEqual([[null], [{ f: '=SUM(A2:C4)' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo1 = getValues(1, 0, 2, 0, 'sheet2');
            expect(valuesRedo1).toStrictEqual([[null], [{ f: '=SUM(DefinedName1)' }]]);
            const valuesRedo2 = getValues(8, 0, 9, 0, 'sheet2');
            expect(valuesRedo2).toStrictEqual([[null], [{ f: '=SUM(Sheet1!A1:A2)' }]]);
            const valuesRedo3 = getValues(8, 9, 9, 9, 'sheet2');
            expect(valuesRedo3).toStrictEqual([[null], [{ f: '=SUM(A2:C4)' }]]);
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
            expect(values).toStrictEqual([[{ f: '=A1:A2' }, null]]);
            const values2 = getValues(5, 1, 5, 2);
            expect(values2).toStrictEqual([[{ f: '=SUM(A1:A2)' }, { v: 1, t: CellValueType.NUMBER }]]);
            const values3 = getValues(7, 2, 7, 5);
            expect(values3).toStrictEqual([[{ f: '=SUM(A8)' }, { f: '=SUM(#REF!)' }, { f: '=SUM(B8)' }, null]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(2, 1, 2, 2);
            expect(valuesUndo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }, { f: '=A1:B2' }]]);
            const valuesUndo2 = getValues(5, 2, 5, 3);
            expect(valuesUndo2).toStrictEqual([[{ f: '=SUM(A1:B2)' }, { v: 1, t: CellValueType.NUMBER }]]);
            const valuesUndo3 = getValues(7, 2, 7, 5);
            expect(valuesUndo3).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }, { f: '=SUM(A8)' }, { f: '=SUM(B8)' }, { f: '=SUM(C8)' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(2, 1, 2, 2);
            expect(valuesRedo).toStrictEqual([[{ f: '=A1:A2' }, null]]);
            const valuesRedo2 = getValues(5, 1, 5, 2);
            expect(valuesRedo2).toStrictEqual([[{ f: '=SUM(A1:A2)' }, { v: 1, t: CellValueType.NUMBER }]]);
            const valuesRedo3 = getValues(7, 2, 7, 5);
            expect(valuesRedo3).toStrictEqual([[{ f: '=SUM(A8)' }, { f: '=SUM(#REF!)' }, { f: '=SUM(B8)' }, null]]);
        });

        it('Remove column, update reference and position, contains #REF', async () => {
            const params: IRemoveRowColCommandParams = {
                range: {
                    startColumn: 0,
                    endColumn: 1,
                    startRow: 0,
                    endRow: 2,
                },
            };

            expect(await commandService.executeCommand(RemoveColCommand.id, params)).toBeTruthy();
            const values = getValues(21, 0, 21, 4);

            // Ignore the calculation results and only verify the offset information
            expect(values).toStrictEqual([[{
                f: '=OFFSET(#REF!,1,1)',
                v: 0,
                t: 2,
            }, {
                f: '=OFFSET(#REF!,1,1)',
                v: 1,
                t: 2,
            }, {
                f: '=OFFSET(A1,1,1)',
                v: 1,
                t: 2,
            }, null, null]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(21, 0, 21, 4);
            expect(valuesUndo).toStrictEqual([[null, null, {
                f: '=OFFSET(A1,1,1)',
                v: 0,
                t: 2,
            }, {
                f: '=OFFSET(B1,1,1)',
                si: 'id2',
                v: 1,
                t: 2,
            }, {
                si: 'id2',
                v: 1,
                t: 2,
            }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(21, 0, 21, 4);
            expect(valuesRedo).toStrictEqual([[{
                f: '=OFFSET(#REF!,1,1)',
                v: 0,
                t: 2,
            }, {
                f: '=OFFSET(#REF!,1,1)',
                v: 1,
                t: 2,
            }, {
                f: '=OFFSET(A1,1,1)',
                v: 1,
                t: 2,
            }, null, null]]);
        });

        it('Remove column, removed column contains formula', async () => {
            const params: IRemoveRowColCommandParams = {
                range: {
                    startColumn: 3,
                    endColumn: 3,
                    startRow: 0,
                    endRow: 2,
                },
            };

            expect(await commandService.executeCommand(RemoveColCommand.id, params)).toBeTruthy();
            const values = getValues(7, 3, 7, 3);
            expect(values).toStrictEqual([[{ f: '=SUM(B8)' }]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(7, 3, 7, 3);
            expect(valuesUndo).toStrictEqual([[{ f: '=SUM(A8)' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(7, 3, 7, 3);
            expect(valuesRedo).toStrictEqual([[{ f: '=SUM(B8)' }]]);
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
            expect(values).toStrictEqual([[{ f: '=A1:B2' }, null]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(2, 1, 2, 2);
            expect(valuesUndo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }, { f: '=A1:B2' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(2, 1, 2, 2);
            expect(valuesRedo).toStrictEqual([[{ f: '=A1:B2' }, null]]);
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
            expect(values).toStrictEqual([[{ f: '=A1:B2' }], [null]]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            const valuesUndo = getValues(1, 2, 2, 2);
            expect(valuesUndo).toStrictEqual([[{ v: 1, t: CellValueType.NUMBER }], [{ f: '=A1:B2' }]]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            const valuesRedo = getValues(1, 2, 2, 2);
            expect(valuesRedo).toStrictEqual([[{ f: '=A1:B2' }], [null]]);
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

        it('set worksheet name', async () => {
            const params: ISetWorksheetNameCommandParams = {
                subUnitId: 'sheet2',
                name: 'Sheet2Rename',
            };

            expect(await commandService.executeCommand(SetWorksheetNameCommand.id, params)).toBeTruthy();
            const values = getValues(14, 2, 14, 2);
            expect(values).toStrictEqual([[{ f: '=Sheet2Rename!A1:B2' }]]);
        });

        it('set defined name', async () => {
            const params: ISetDefinedNameMutationParam = {
                unitId: 'test',
                id: 'soAI3OK4sq',
                name: 'DefinedName2',
                formulaOrRefString: 'Sheet2!$A$1:$B$2',
                comment: '',
                localSheetId: 'AllDefaultWorkbook',
            };

            expect(await commandService.executeCommand(SetDefinedNameCommand.id, params)).toBeTruthy();
            const values = getValues(2, 0, 2, 0, 'sheet2');
            expect(values).toStrictEqual([[{ f: '=SUM(DefinedName2)' }]]);
        });

        it('remove defined name', async () => {
            const params: ISetDefinedNameMutationParam = {
                unitId: 'test',
                id: 'soAI3OK4sq',
                name: 'DefinedName1',
                formulaOrRefString: 'Sheet2!$A$1:$B$2',
                comment: '',
                localSheetId: 'AllDefaultWorkbook',
            };

            expect(await commandService.executeCommand(RemoveDefinedNameCommand.id, params)).toBeTruthy();
            const values = getValues(2, 0, 2, 0, 'sheet2');
            expect(values).toStrictEqual([[{ f: '=SUM(#REF!)' }]]);
        });

        it('remove worksheet', async () => {
            const params: IRemoveSheetCommandParams = {
                unitId: 'test',
                subUnitId: 'sheet2',
            };

            expect(await commandService.executeCommand(RemoveSheetCommand.id, params)).toBeTruthy();
            const values = getValues(14, 2, 14, 2);
            expect(values).toStrictEqual([[{ f: '=#REF!' }]]);
        });

        it('set range values, set new formula string and formula id', async () => {
            const params: ISetRangeValuesCommandParams = {
                range: {
                    startRow: 7,
                    startColumn: 8,
                    endRow: 7,
                    endColumn: 8,
                },
                value: {
                    f: '=A1',
                    si: 'qwerty',
                },
            };

            expect(await commandService.executeCommand(SetRangeValuesCommand.id, params)).toBeTruthy();
            const values = getValues(7, 8, 7, 9);
            expect(values).toStrictEqual([[{ f: '=A1', si: 'qwerty' }, { f: '=SUM(C8:E10)', si: 'CarNau' }]]);
        });
        it('set range values, set same formula string and formula id', async () => {
            const params: ISetRangeValuesCommandParams = {
                range: {
                    startRow: 7,
                    startColumn: 8,
                    endRow: 7,
                    endColumn: 8,
                },
                value: {
                    f: '=SUM(B8:D10)',
                    si: 'CarNau',
                },
            };

            expect(await commandService.executeCommand(SetRangeValuesCommand.id, params)).toBeTruthy();
            const values = getValues(7, 8, 7, 9);
            expect(values).toStrictEqual([[{ f: '=SUM(B8:D10)', si: 'CarNau' }, { si: 'CarNau' }]]);
        });
        it('set range values, set same formula id', async () => {
            const params: ISetRangeValuesCommandParams = {
                range: {
                    startRow: 7,
                    startColumn: 9,
                    endRow: 7,
                    endColumn: 9,
                },
                value: {
                    si: 'CarNau',
                },
            };

            expect(await commandService.executeCommand(SetRangeValuesCommand.id, params)).toBeTruthy();
            const values = getValues(7, 8, 7, 9);
            expect(values).toStrictEqual([[{ f: '=SUM(B8:D10)', si: 'CarNau' }, { si: 'CarNau' }]]);
        });
        it('set range values, set new formula string', async () => {
            const params: ISetRangeValuesCommandParams = {
                range: {
                    startRow: 7,
                    startColumn: 8,
                    endRow: 7,
                    endColumn: 8,
                },
                value: {
                    f: '=A1',
                    si: null,
                },
            };

            expect(await commandService.executeCommand(SetRangeValuesCommand.id, params)).toBeTruthy();
            const values = getValues(7, 8, 7, 9);
            expect(values).toStrictEqual([[{ f: '=A1' }, { f: '=SUM(C8:E10)', si: 'CarNau' }]]);
        });

        it('set range values, set new formula id', async () => {
            const params: ISetRangeValuesCommandParams = {
                range: {
                    startRow: 7,
                    startColumn: 8,
                    endRow: 7,
                    endColumn: 8,
                },
                value: {
                    f: null,
                    si: 'y0gLJX',
                },
            };

            expect(await commandService.executeCommand(SetRangeValuesCommand.id, params)).toBeTruthy();
            const values = getValues(7, 8, 7, 9);
            expect(values).toStrictEqual([[{ si: 'y0gLJX' }, { f: '=SUM(C8:E10)', si: 'CarNau' }]]);
        });

        it('set range values, remove formula string and id', async () => {
            const params: ISetRangeValuesCommandParams = {
                range: {
                    startRow: 7,
                    startColumn: 8,
                    endRow: 7,
                    endColumn: 8,
                },
                value: {
                    f: null,
                    si: null,
                },
            };

            expect(await commandService.executeCommand(SetRangeValuesCommand.id, params)).toBeTruthy();
            const values = getValues(7, 8, 7, 9);
            expect(values).toStrictEqual([[null, { f: '=SUM(C8:E10)', si: 'CarNau' }]]);
        });

        it('hide row and show row', async () => {
            const params: ISetRowHiddenCommandParams = {
                unitId: 'test',
                subUnitId: 'sheet3',
                ranges: [{
                    startRow: 2,
                    startColumn: 0,
                    endRow: 2,
                    endColumn: 19,
                    rangeType: RANGE_TYPE.ROW,
                }],
            };

            expect(await commandService.executeCommand(SetRowHiddenCommand.id, params)).toBeTruthy();
            const values = getValues(5, 0, 5, 2, 'sheet3');

            // No change in the formula
            expect(values?.[0][0]?.f).toStrictEqual('=SUBTOTAL(109,A1:A5)');
            expect(values?.[0][1]?.f).toStrictEqual('=SUBTOTAL(109,A3)');
            expect(values?.[0][2]?.f).toStrictEqual('=A3');
        });
    });
});
