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

import type { ICellData, Injector, IWorkbookData, Nullable, Univer } from '@univerjs/core';
import type { IDeleteRangeMoveLeftCommandParams, IDeleteRangeMoveUpCommandParams, IInsertColCommandParams, IInsertRowCommandParams, IMoveColsCommandParams, IMoveRangeCommandParams, IMoveRowsCommandParams, InsertRangeMoveDownCommandParams, InsertRangeMoveRightCommandParams, IRemoveRowColCommandParams, IRemoveSheetCommandParams, ISetWorksheetNameCommandParams } from '@univerjs/sheets';
import { Direction, ICommandService, IUniverInstanceService, LocaleType, RANGE_TYPE, RedoCommand, UndoCommand } from '@univerjs/core';
import { IDefinedNamesService, RemoveDefinedNameMutation, SetArrayFormulaDataMutation, SetDefinedNameMutation, SetFormulaDataMutation } from '@univerjs/engine-formula';
import { DeleteRangeMoveLeftCommand, DeleteRangeMoveUpCommand, InsertColByRangeCommand, InsertColCommand, InsertColMutation, InsertRangeMoveDownCommand, InsertRangeMoveRightCommand, InsertRowByRangeCommand, InsertRowCommand, InsertRowMutation, MoveColsCommand, MoveColsMutation, MoveRangeCommand, MoveRangeMutation, MoveRowsCommand, MoveRowsMutation, RemoveColByRangeCommand, RemoveColCommand, RemoveColMutation, RemoveRowByRangeCommand, RemoveRowCommand, RemoveRowMutation, RemoveSheetCommand, RemoveSheetMutation, SetDefinedNameCommand, SetRangeValuesCommand, SetRangeValuesMutation, SetSelectionsOperation, SetWorksheetNameCommand, SetWorksheetNameMutation, SheetsSelectionsService } from '@univerjs/sheets';

import { UpdateDefinedNameController } from '@univerjs/sheets-formula';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCommandTestBed } from './create-command-test-bed';

const TEST_WORKBOOK_DATA_DEMO = (): IWorkbookData => ({
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {},
            name: 'Sheet1',
        },
        sheet2: {
            id: 'sheet2',
            cellData: {},
            name: 'Sheet2',
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: ['sheet1', 'sheet2'],
    styles: {},
    resources: [
        {
            name: 'SHEET_DEFINED_NAME_PLUGIN',
            data: '{"soAI3OK4sq":{"id":"soAI3OK4sq","name":"DefinedName1","formulaOrRefString":"Sheet1!$A$1:$B$2","comment":"","localSheetId":"AllDefaultWorkbook"},"qwert12345":{"id":"qwert12345","name":"DefinedName2","formulaOrRefString":"Sheet1!$1:$3","comment":"","localSheetId":"AllDefaultWorkbook"},"asdfg67890":{"id":"asdfg67890","name":"DefinedName3","formulaOrRefString":"Sheet1!$A:$C","comment":"","localSheetId":"AllDefaultWorkbook"}}',
        },
    ],
});

describe('Test update defined name', () => {
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
    let getDefinedNameRef: (name?: string) => string | undefined;

    beforeEach(() => {
        const testBed = createCommandTestBed(TEST_WORKBOOK_DATA_DEMO(), [
            [UpdateDefinedNameController],
        ]);
        univer = testBed.univer;
        get = testBed.get;

        get(UpdateDefinedNameController);

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

        getValues = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number,
            sheetId: string = 'sheet1'
        ): Array<Array<Nullable<ICellData>>> | undefined =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId(sheetId)
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValues();

        getDefinedNameRef = (name: string = 'DefinedName1') => {
            const definedNameService = get(IDefinedNamesService);
            const definedName = definedNameService.getValueByName('test', name);
            if (definedName) {
                return definedName.formulaOrRefString;
            }
        };
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('update defined name', () => {
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
            expect(getDefinedNameRef()).toBe('Sheet1!$D$1:$E$2');

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$2');

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$D$1:$E$2');
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
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$4');

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$2');

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$4');
        });

        it('Move rows to range start', async () => {
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
                    startRow: 0,
                    startColumn: 0,
                    endRow: 0,
                    endColumn: 19,
                    rangeType: 1,
                },
            };

            expect(await commandService.executeCommand(MoveRowsCommand.id, params)).toBeTruthy();
            expect(getDefinedNameRef('DefinedName2')).toBe('Sheet1!$2:$3');

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef('DefinedName2')).toBe('Sheet1!$1:$3');

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef('DefinedName2')).toBe('Sheet1!$2:$3');
        });

        it('Move rows to range end', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // A1
            selectionManager.addSelections([
                {
                    range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
            ]);

            const params: IMoveRowsCommandParams = {
                fromRange: {
                    startRow: 0,
                    startColumn: 0,
                    endRow: 0,
                    endColumn: 19,
                    rangeType: 1,
                },
                toRange: {
                    startRow: 3,
                    startColumn: 0,
                    endRow: 3,
                    endColumn: 19,
                    rangeType: 1,
                },
            };

            expect(await commandService.executeCommand(MoveRowsCommand.id, params)).toBeTruthy();
            expect(getDefinedNameRef('DefinedName2')).toBe('Sheet1!$1:$2');

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef('DefinedName2')).toBe('Sheet1!$1:$3');

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef('DefinedName2')).toBe('Sheet1!$1:$2');
        });

        it('Move first row beyond the end', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // A1
            selectionManager.addSelections([
                {
                    range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
            ]);

            const params: IMoveRowsCommandParams = {
                fromRange: {
                    startRow: 0,
                    startColumn: 0,
                    endRow: 0,
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
            expect(getDefinedNameRef('DefinedName2')).toBe('Sheet1!$1:$2');

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef('DefinedName2')).toBe('Sheet1!$1:$3');

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef('DefinedName2')).toBe('Sheet1!$1:$2');
        });

        it('Move last row beyond the end', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // A1
            selectionManager.addSelections([
                {
                    range: { startRow: 2, startColumn: 0, endRow: 2, endColumn: 0, rangeType: RANGE_TYPE.ROW },
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
            expect(getDefinedNameRef('DefinedName2')).toBe('Sheet1!$1:$9');

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef('DefinedName2')).toBe('Sheet1!$1:$3');

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef('DefinedName2')).toBe('Sheet1!$1:$9');
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
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$A$2');

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$2');

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$A$2');
        });

        it('Move columns to range start', async () => {
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
                    startColumn: 0,
                    endRow: 999,
                    endColumn: 0,
                    rangeType: 2,
                },
            };

            expect(await commandService.executeCommand(MoveColsCommand.id, params)).toBeTruthy();
            expect(getDefinedNameRef('DefinedName3')).toBe('Sheet1!$B:$C');

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef('DefinedName3')).toBe('Sheet1!$A:$C');

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef('DefinedName3')).toBe('Sheet1!$B:$C');
        });

        it('Move columns to range end', async () => {
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
                    startColumn: 3,
                    endRow: 999,
                    endColumn: 3,
                    rangeType: 2,
                },
            };

            expect(await commandService.executeCommand(MoveColsCommand.id, params)).toBeTruthy();
            expect(getDefinedNameRef('DefinedName3')).toBe('Sheet1!$A:$B');

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef('DefinedName3')).toBe('Sheet1!$A:$C');

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef('DefinedName3')).toBe('Sheet1!$A:$B');
        });

        it('Move first column beyond the end', async () => {
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
                    startColumn: 9,
                    endRow: 999,
                    endColumn: 9,
                    rangeType: 2,
                },
            };

            expect(await commandService.executeCommand(MoveColsCommand.id, params)).toBeTruthy();
            expect(getDefinedNameRef('DefinedName3')).toBe('Sheet1!$A:$B');

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef('DefinedName3')).toBe('Sheet1!$A:$C');

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef('DefinedName3')).toBe('Sheet1!$A:$B');
        });

        it('Move last column beyond the end', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // A1
            selectionManager.addSelections([
                {
                    range: { startRow: 0, startColumn: 2, endRow: 0, endColumn: 2, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
            ]);

            const params: IMoveColsCommandParams = {
                fromRange: {
                    startRow: 0,
                    startColumn: 2,
                    endRow: 999,
                    endColumn: 2,
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
            expect(getDefinedNameRef('DefinedName3')).toBe('Sheet1!$A:$I');

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef('DefinedName3')).toBe('Sheet1!$A:$C');

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef('DefinedName3')).toBe('Sheet1!$A:$I');
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
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$3');

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$2');

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$3');
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
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$C$2');

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$2');

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$C$2');
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
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$1');

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$2');

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$1');
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
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$A$2');

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$2');

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$A$2');
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
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$A$2');

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$2');

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$A$2');
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
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$1');

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$2');

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$1');
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
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$3');

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$2');

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$3');
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
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$C$2');

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$B$2');

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1!$A$1:$C$2');
        });

        it('set worksheet name', async () => {
            const params: ISetWorksheetNameCommandParams = {
                subUnitId: 'sheet1',
                name: 'Sheet1Rename',
            };

            expect(await commandService.executeCommand(SetWorksheetNameCommand.id, params)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('Sheet1Rename!$A$1:$B$2');
        });

        it('remove worksheet', async () => {
            const params: IRemoveSheetCommandParams = {
                unitId: 'test',
                subUnitId: 'sheet1',
            };

            expect(await commandService.executeCommand(RemoveSheetCommand.id, params)).toBeTruthy();
            expect(getDefinedNameRef()).toBe('#REF!');
        });
    });
});
