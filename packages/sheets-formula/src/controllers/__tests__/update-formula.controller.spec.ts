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
import { Direction, ICommandService, IUniverInstanceService, LocaleType, RANGE_TYPE } from '@univerjs/core';
import type { IDeleteRangeMoveLeftCommandParams, IDeleteRangeMoveUpCommandParams, IInsertColCommandParams, IInsertRowCommandParams, IMoveColsCommandParams, IMoveRangeCommandParams, IMoveRowsCommandParams, InsertRangeMoveDownCommandParams, InsertRangeMoveRightCommandParams, IRemoveRowColCommandParams, IRemoveSheetCommandParams, ISetWorksheetNameCommandParams } from '@univerjs/sheets';
import { DeleteRangeMoveLeftCommand, DeleteRangeMoveUpCommand, InsertColCommand, InsertColMutation, InsertRangeMoveDownCommand, InsertRangeMoveRightCommand, InsertRowCommand, InsertRowMutation, MoveColsCommand, MoveColsMutation, MoveRangeCommand, MoveRangeMutation, MoveRowsCommand, MoveRowsMutation, NORMAL_SELECTION_PLUGIN_NAME, RemoveColCommand, RemoveColMutation, RemoveRowCommand, RemoveRowMutation, RemoveSheetCommand, RemoveSheetMutation, SelectionManagerService, SetRangeValuesMutation, SetSelectionsOperation, SetWorksheetNameCommand, SetWorksheetNameMutation } from '@univerjs/sheets';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SetArrayFormulaDataMutation, SetFormulaDataMutation, SetNumfmtFormulaDataMutation } from '@univerjs/engine-formula';
import { UpdateFormulaController } from '../update-formula.controller';
import { createCommandTestBed } from './create-command-test-bed';

const TEST_WORKBOOK_DATA_DEMO = (): IWorkbookData => ({
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                2: {
                    2: {
                        f: '=A1:B2',
                    },
                },
                4: {
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

// TODO@Dushusir: add move range,insert range,delete range test case
describe('Test insert function operation', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let getValueByPosition: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<ICellData>;
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
        commandService.registerCommand(SetNumfmtFormulaDataMutation);

        getValueByPosition = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<ICellData> =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValue();
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
        describe('correct situations', () => {
            it('Move range', async () => {
                const params: IMoveRangeCommandParams = {
                    fromRange: {
                        startRow: 2,
                        startColumn: 2,
                        endRow: 2,
                        endColumn: 2,
                        rangeType: 0,
                    },
                    toRange: {
                        startRow: 2,
                        startColumn: 3,
                        endRow: 2,
                        endColumn: 3,
                        rangeType: 0,
                    },
                };

                expect(await commandService.executeCommand(MoveRangeCommand.id, params)).toBeTruthy();
                const oldValue = getValues(2, 2, 2, 3);
                expect(oldValue).toStrictEqual([[{}, { f: '=A1:B2' }]]);
            });

            it('Move rows', async () => {
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
                const oldValue = getValues(1, 2, 2, 2);
                expect(oldValue).toStrictEqual([[{ f: '=A1:B4' }], [{ }]]);
            });

            it('Move columns', async () => {
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
                        startColumn: 4,
                        endRow: 999,
                        endColumn: 4,
                        rangeType: 2,
                    },
                };

                expect(await commandService.executeCommand(MoveColsCommand.id, params)).toBeTruthy();
                const oldValue = getValues(2, 1, 2, 2);
                expect(oldValue).toStrictEqual([[{ f: '=A1:D2' }, { }]]);
            });

            it('Insert row', async () => {
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
                const oldValue = getValues(2, 2, 3, 2);
                expect(oldValue).toStrictEqual([[{}], [{ f: '=A1:B3' }]]);
            });

            it('Insert column', async () => {
                const params: IInsertColCommandParams = {
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    range: {
                        startColumn: 1,
                        endColumn: 1,
                        startRow: 0,
                        endRow: 2,
                    },
                    direction: Direction.LEFT,
                };

                expect(await commandService.executeCommand(InsertColCommand.id, params)).toBeTruthy();
                const oldValue = getValues(2, 2, 2, 3);
                expect(oldValue).toStrictEqual([[{}, { f: '=A1:C2' }]]);
            });

            it('Remove row', async () => {
                const params: IRemoveRowColCommandParams = {
                    range: {
                        startRow: 1,
                        endRow: 1,
                        startColumn: 0,
                        endColumn: 19,
                    },
                };

                expect(await commandService.executeCommand(RemoveRowCommand.id, params)).toBeTruthy();
                const oldValue = getValues(1, 2, 2, 2);
                expect(oldValue).toStrictEqual([[{ f: '=A1:B1' }], [{}]]);
            });

            it('Remove column', async () => {
                const params: IRemoveRowColCommandParams = {
                    range: {
                        startColumn: 1,
                        endColumn: 1,
                        startRow: 0,
                        endRow: 2,
                    },
                };

                expect(await commandService.executeCommand(RemoveColCommand.id, params)).toBeTruthy();
                const oldValue = getValues(2, 1, 2, 2);
                expect(oldValue).toStrictEqual([[{ f: '=A1:A2' }, {}]]);
            });

            it('Delete move left', async () => {
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
                const oldValue = getValues(2, 1, 2, 2);
                expect(oldValue).toStrictEqual([[{ f: '=A1:B2' }, {}]]);
            });

            it('Delete move up', async () => {
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
                const oldValue = getValues(1, 2, 2, 2);
                expect(oldValue).toStrictEqual([[{ f: '=A1:B2' }], [{}]]);
            });

            it('Insert move down', async () => {
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
                const oldValue = getValues(2, 2, 3, 2);
                expect(oldValue).toStrictEqual([[{}], [{ f: '=A1:B2' }]]);
            });

            it('Insert move right', async () => {
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
                const oldValue = getValues(2, 2, 2, 3);
                expect(oldValue).toStrictEqual([[{}, { f: '=A1:B2' }]]);
            });

            it('set name', async () => {
                const params: ISetWorksheetNameCommandParams = {
                    subUnitId: 'sheet2',
                    name: 'Sheet2Rename',
                };

                expect(await commandService.executeCommand(SetWorksheetNameCommand.id, params)).toBeTruthy();
                const oldValue = getValues(4, 2, 4, 2);
                expect(oldValue).toStrictEqual([[{ f: '=Sheet2Rename!A1:B2' }]]);
            });

            it('remove sheet', async () => {
                const params: IRemoveSheetCommandParams = {
                    unitId: 'test',
                    subUnitId: 'sheet2',
                };

                expect(await commandService.executeCommand(RemoveSheetCommand.id, params)).toBeTruthy();
                const oldValue = getValues(4, 2, 4, 2);
                expect(oldValue).toStrictEqual([[{ f: '=#REF!' }]]);
            });
        });
    });
});
