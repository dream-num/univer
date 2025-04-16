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

import type { ICellData, Injector, Nullable, Univer } from '@univerjs/core';
import type { IInsertFunctionOperationParams } from '../insert-function.operation';
import { ICommandService, IUniverInstanceService, ObjectMatrix, RANGE_TYPE, RedoCommand, UndoCommand } from '@univerjs/core';
import {
    SetRangeValuesCommand,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SheetsSelectionsService,
} from '@univerjs/sheets';

import { InsertFunctionCommand } from '@univerjs/sheets-formula';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    InsertFunctionOperation,
    isMultiRowsColumnsRange,
    isNumberCell,
    isSingleCell,
} from '../insert-function.operation';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test insert function operation', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(InsertFunctionOperation);
        commandService.registerCommand(InsertFunctionCommand);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetSelectionsOperation);
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('insert function', () => {
        describe('correct situations', () => {
            it('insert function, match the data range above, directly set values', async () => {
                const selectionManager = get(SheetsSelectionsService);

                // B3:B4
                selectionManager.addSelections([
                    {
                        range: { startRow: 2, startColumn: 1, endRow: 3, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getValues() {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(2, 1, 3, 1)
                        .getValues();
                }
                const params: IInsertFunctionOperationParams = {
                    value: 'SUM',
                };

                expect(await commandService.executeCommand(InsertFunctionOperation.id, params)).toBeTruthy();
                let values = getValues();
                expect(values?.[0]?.[0]?.f).toStrictEqual('=SUM(B2)');
                expect(values?.[0]?.[0]?.si).toStrictEqual(values?.[1]?.[0]?.si);
                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValues()).toStrictEqual([[null], [null]]);
                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                values = getValues();
                expect(values?.[0]?.[0]?.f).toStrictEqual('=SUM(B2)');
                expect(values?.[0]?.[0]?.si).toStrictEqual(values?.[1]?.[0]?.si);
            });

            it('insert function, match the data range left, directly set values', async () => {
                const selectionManager = get(SheetsSelectionsService);

                // C2:D2
                selectionManager.addSelections([
                    {
                        range: { startRow: 1, startColumn: 2, endRow: 1, endColumn: 3, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getValues() {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(1, 2, 1, 3)
                        .getValues();
                }
                const params: IInsertFunctionOperationParams = {
                    value: 'SUM',
                };

                expect(await commandService.executeCommand(InsertFunctionOperation.id, params)).toBeTruthy();
                let values = getValues();
                expect(values?.[0]?.[0]?.f).toStrictEqual('=SUM(B2)');
                expect(values?.[0]?.[0]?.si).toStrictEqual(values?.[0]?.[1]?.si);
                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValues()).toStrictEqual([[null, null]]);
                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                values = getValues();
                expect(values?.[0]?.[0]?.f).toStrictEqual('=SUM(B2)');
                expect(values?.[0]?.[0]?.si).toStrictEqual(values?.[0]?.[1]?.si);
            });

            it('insert function, the range cell has number value', async () => {
                const selectionManager = get(SheetsSelectionsService);
                const range = {
                    startRow: 1,
                    startColumn: 0,
                    endRow: 4,
                    endColumn: 3,
                    rangeType: RANGE_TYPE.NORMAL,
                };
                // A2:D5
                selectionManager.addSelections([
                    {
                        range,
                        primary: null,
                        style: null,
                    },
                ]);
                const params: IInsertFunctionOperationParams = {
                    value: 'SUM',
                };
                const cellMatrix = new ObjectMatrix<Nullable<ICellData>>({
                    1: {
                        0: { v: 1, t: 2 },
                        1: { v: 2, t: 2 },
                        2: { v: 3, t: 2 },
                    },
                    2: {
                        0: { v: 2, t: 2 },
                        1: { v: 3, t: 2 },
                        3: { v: 5, t: 2 },
                    },
                    3: {
                        0: { v: 3, t: 2 },
                        2: { v: 5, t: 2 },
                        3: { v: 6, t: 2 },
                    },
                    4: {
                        1: { v: 5, t: 2 },
                        2: { v: 6, t: 2 },
                        3: { v: 7, t: 2 },
                    },
                });
                await commandService.executeCommand(SetRangeValuesCommand.id, {
                    value: cellMatrix.getData(),
                    sheetId: 'sheet1',
                    range,
                });

                function getValues(range: { startRow: number; startColumn: number; endRow: number; endColumn: number }) {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(range.startRow, range.startColumn, range.endRow, range.endColumn)
                        .getValues();
                }

                let values = getValues({ startRow: 1, startColumn: 0, endRow: 4, endColumn: 3 });
                expect(values).toStrictEqual([
                    [{ v: 1, t: 2 }, { v: 2, t: 2 }, { v: 3, t: 2 }, null],
                    [{ v: 2, t: 2 }, { v: 3, t: 2 }, null, { v: 5, t: 2 }],
                    [{ v: 3, t: 2 }, null, { v: 5, t: 2 }, { v: 6, t: 2 }],
                    [null, { v: 5, t: 2 }, { v: 6, t: 2 }, { v: 7, t: 2 }],
                ]);

                values = getValues({ startRow: 5, startColumn: 0, endRow: 5, endColumn: 3 });
                expect(values).toStrictEqual([
                    [null, null, null, null],
                ]);

                // insert function
                expect(await commandService.executeCommand(InsertFunctionOperation.id, params)).toBeTruthy();

                values = getValues({ startRow: 5, startColumn: 0, endRow: 5, endColumn: 3 });
                expect(values).toStrictEqual([
                    [{ f: '=SUM(A2:A5)' }, { f: '=SUM(B2:B5)' }, { f: '=SUM(C2:C5)' }, { f: '=SUM(D2:D5)' }],
                ]);
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(InsertFunctionOperation.id);
                expect(result).toBeFalsy();
            });
        });

        describe('function isNumberCell', () => {
            it('should return true when cell type is number', () => {
                const cell = { t: 2, v: 1 };
                expect(isNumberCell(cell)).toBeTruthy();
            });

            it('should return true when cell is number', () => {
                const cell = { v: 1 };
                expect(isNumberCell(cell)).toBeTruthy();
            });

            it('should return false when cell is string number', () => {
                const cell = { v: '1' };
                expect(isNumberCell(cell)).toBeFalsy();
            });

            it('should return false when cell is string', () => {
                const cell = { v: 'test' };
                expect(isNumberCell(cell)).toBeFalsy();
            });

            it('should return false when cell is null', () => {
                const cell = null;
                expect(isNumberCell(cell)).toBeFalsy();
            });

            it('should return false when cell is undefined', () => {
                const cell = undefined;
                expect(isNumberCell(cell)).toBeFalsy();
            });

            it('should return false when cell is empty object', () => {
                const cell = {};
                expect(isNumberCell(cell)).toBeFalsy();
            });
            it('should return true when cell is rich text number', () => {
                const cell = {
                    p: {
                        id: 'rich1',
                        documentStyle: {},
                        body: {
                            dataStream: '111/r/n',
                        },
                    },
                };
                expect(isNumberCell(cell)).toBeFalsy();
            });
            it('should return true when cell is rich text', () => {
                const cell = {
                    p: {
                        id: 'rich1',
                        documentStyle: {},
                        body: {
                            dataStream: 'rich/r/n',
                        },
                    },
                };
                expect(isNumberCell(cell)).toBeFalsy();
            });
        });

        describe('function isSingleCell', () => {
            it('should return true when startRow === endRow and startColumn === endColumn', () => {
                const range = { startRow: 1, startColumn: 1, endRow: 1, endColumn: 1 };
                expect(isSingleCell(range)).toBeTruthy();
            });

            it('should return false when startRow !== endRow', () => {
                const range = { startRow: 1, startColumn: 1, endRow: 2, endColumn: 1 };
                expect(isSingleCell(range)).toBeFalsy();
            });

            it('should return false when startColumn !== endColumn', () => {
                const range = { startRow: 1, startColumn: 1, endRow: 1, endColumn: 2 };
                expect(isSingleCell(range)).toBeFalsy();
            });
        });

        describe('function isMultiRowsColumnsRange', () => {
            it('should return true when startRow !== endRow and startColumn !== endColumn', () => {
                const range = { startRow: 1, startColumn: 1, endRow: 2, endColumn: 2 };
                expect(isMultiRowsColumnsRange(range)).toBeTruthy();
            });

            it('should return false when startRow === endRow', () => {
                const range = { startRow: 1, startColumn: 1, endRow: 1, endColumn: 2 };
                expect(isMultiRowsColumnsRange(range)).toBeFalsy();
            });

            it('should return false when startColumn === endColumn', () => {
                const range = { startRow: 1, startColumn: 1, endRow: 2, endColumn: 1 };
                expect(isMultiRowsColumnsRange(range)).toBeFalsy();
            });
        });
    });
});
