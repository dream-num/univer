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

import { ICommandService, IUndoRedoService, IUniverInstanceService, ObjectMatrix } from '@univerjs/core';
import { MoveRangeMutation, SheetInterceptorService, SheetsSelectionsService } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { SheetsTableController } from '../../../controllers/sheets-table.controller';
import { TableManager } from '../../../models/table-manager';
import {
    SheetTableInsertColCommand,
    SheetTableInsertColumnAtCommand,
    SheetTableInsertRowAtCommand,
    SheetTableInsertRowCommand,
    SheetTableRemoveColCommand,
    SheetTableRemoveColumnAtCommand,
    SheetTableRemoveRowCommand,
} from '../sheet-table-row-col.command';

function createAccessor(pairs: Array<[unknown, unknown]>) {
    const map = new Map<unknown, unknown>(pairs);
    return {
        get(token: unknown) {
            if (!map.has(token)) {
                throw new Error(`Unknown token: ${String(token)}`);
            }
            return map.get(token);
        },
    } as any;
}

interface ICreateSheetContextOptions {
    unitId?: string;
    subUnitId?: string;
    rowCount?: number;
    columnCount?: number;
    dataRange?: { endRow: number; endColumn: number };
    cells?: Array<[number, number, unknown]>;
}

class TestCellMatrix {
    private readonly _matrix = new ObjectMatrix<unknown>();

    constructor(private readonly _dataRange: { endRow: number; endColumn: number }) {}

    getDataRange() {
        return this._dataRange;
    }

    getValue(row: number, column: number) {
        return this._matrix.getValue(row, column);
    }

    setValue(row: number, column: number, value: unknown) {
        this._matrix.setValue(row, column, value);
    }
}

class TestWorksheet {
    private readonly _cellMatrix: TestCellMatrix;

    constructor(
        private readonly _sheetId: string,
        private readonly _rowCount: number,
        private readonly _columnCount: number,
        dataRange: { endRow: number; endColumn: number },
        cells: Array<[number, number, unknown]>
    ) {
        this._cellMatrix = new TestCellMatrix(dataRange);
        cells.forEach(([row, column, value]) => this._cellMatrix.setValue(row, column, value));
    }

    getSheetId() {
        return this._sheetId;
    }

    getRowCount() {
        return this._rowCount;
    }

    getColumnCount() {
        return this._columnCount;
    }

    getCellMatrix() {
        return this._cellMatrix;
    }

    getMatrixWithMergedCells() {
        return new ObjectMatrix<{ rowSpan?: number; colSpan?: number }>();
    }

    getMergedCell() {
        return null;
    }
}

class TestWorkbook {
    constructor(
        private readonly _unitId: string,
        private readonly _worksheet: TestWorksheet
    ) {}

    getUnitId() {
        return this._unitId;
    }

    getActiveSheet() {
        return this._worksheet;
    }

    getSheetBySheetId(sheetId: string) {
        return sheetId === this._worksheet.getSheetId() ? this._worksheet : null;
    }

    getStyles() {
        return {
            get: (styleId: string) => styleId,
        };
    }
}

class TestUniverInstanceService {
    constructor(private readonly _workbook: TestWorkbook | null = null) {}

    getUnit(unitId: string) {
        return this._workbook?.getUnitId() === unitId ? this._workbook : null;
    }

    getCurrentUnitOfType() {
        return this._workbook;
    }

    getUniverSheetInstance(unitId: string) {
        return this.getUnit(unitId);
    }
}

function createSheetContext(options: ICreateSheetContextOptions = {}) {
    const {
        unitId = 'u1',
        subUnitId = 's1',
        rowCount = 100,
        columnCount = 100,
        dataRange = { endRow: 10, endColumn: 10 },
        cells = [],
    } = options;
    const worksheet = new TestWorksheet(subUnitId, rowCount, columnCount, dataRange, cells);
    const workbook = new TestWorkbook(unitId, worksheet);

    return {
        workbook,
        worksheet,
        univerInstanceService: new TestUniverInstanceService(workbook),
    };
}

describe('sheet-table-row-col commands', () => {
    it('insert commands should return false when there is no sheet target', () => {
        const accessor = createAccessor([
            [IUniverInstanceService, new TestUniverInstanceService()],
        ]);

        expect(SheetTableInsertRowCommand.handler(accessor)).toBe(false);
        expect(SheetTableInsertColCommand.handler(accessor)).toBe(false);
    });

    it('remove commands should return false for invalid params', () => {
        const accessor = createAccessor([
            [IUniverInstanceService, new TestUniverInstanceService()],
        ]);

        expect(SheetTableRemoveRowCommand.handler(accessor, undefined as any)).toBe(false);
        expect(SheetTableRemoveColCommand.handler(accessor, undefined as any)).toBe(false);
    });

    it('commands should stop when current selection is invalid or table is missing', () => {
        const { univerInstanceService } = createSheetContext();

        const accessor = createAccessor([
            [IUniverInstanceService, univerInstanceService],
            [SheetsSelectionsService, { getCurrentSelections: () => [] }],
            [SheetsTableController, { getContainerTableWithRange: () => null }],
            [TableManager, {}],
            [ICommandService, { syncExecuteCommand: vi.fn(() => true) }],
            [IUndoRedoService, { pushUndoRedo: vi.fn() }],
        ]);

        expect(SheetTableInsertRowCommand.handler(accessor)).toBe(false);
        expect(SheetTableInsertColCommand.handler(accessor)).toBe(false);

        expect(SheetTableRemoveRowCommand.handler(accessor, { unitId: 'u1', subUnitId: 's1', tableId: 't1' } as any)).toBe(false);
        expect(SheetTableRemoveColCommand.handler(accessor, { unitId: 'u1', subUnitId: 's1', tableId: 't1' } as any)).toBe(false);
    });

    it('toolbar insert row should insert worksheet rows when there is not enough trailing space', () => {
        const range = { startRow: 4, endRow: 5, startColumn: 1, endColumn: 3 };
        const { univerInstanceService } = createSheetContext({
            rowCount: 10,
            columnCount: 20,
            dataRange: { endRow: 9, endColumn: 8 },
        });

        const syncExecuteCommand = vi.fn(() => true);
        const pushUndoRedo = vi.fn();
        const table = {
            getId: () => 't1',
            getRange: () => ({ startRow: 0, endRow: 5, startColumn: 1, endColumn: 3 }),
        };
        const accessor = createAccessor([
            [IUniverInstanceService, univerInstanceService],
            [SheetsSelectionsService, { getCurrentSelections: () => [{ range }] }],
            [SheetsTableController, { getContainerTableWithRange: () => table }],
            [TableManager, {}],
            [ICommandService, { syncExecuteCommand }],
            [IUndoRedoService, { pushUndoRedo }],
        ]);

        expect(SheetTableInsertRowCommand.handler(accessor)).toBe(true);
        expect((syncExecuteCommand.mock.calls as unknown as Array<[string]>).map(([id]) => id)).toEqual([
            'sheet.mutation.insert-row',
            'sheet.mutation.set-sheet-table',
        ]);
        expect(pushUndoRedo).toHaveBeenCalledWith(expect.objectContaining({
            unitID: 'u1',
            undoMutations: expect.arrayContaining([expect.objectContaining({ id: 'sheet.mutation.remove-rows' })]),
        }));
    });

    it('toolbar insert column should insert worksheet columns when there is not enough trailing space', () => {
        const range = { startRow: 1, endRow: 4, startColumn: 4, endColumn: 5 };
        const { univerInstanceService } = createSheetContext({
            rowCount: 20,
            columnCount: 10,
            dataRange: { endRow: 8, endColumn: 9 },
        });

        const syncExecuteCommand = vi.fn(() => true);
        const pushUndoRedo = vi.fn();
        const table = {
            getId: () => 't1',
            getRange: () => ({ startRow: 1, endRow: 4, startColumn: 1, endColumn: 5 }),
        };
        const accessor = createAccessor([
            [IUniverInstanceService, univerInstanceService],
            [SheetsSelectionsService, { getCurrentSelections: () => [{ range }] }],
            [SheetsTableController, { getContainerTableWithRange: () => table }],
            [ICommandService, { syncExecuteCommand }],
            [IUndoRedoService, { pushUndoRedo }],
        ]);

        expect(SheetTableInsertColCommand.handler(accessor)).toBe(true);
        expect((syncExecuteCommand.mock.calls as unknown as Array<[string]>).map(([id]) => id)).toEqual([
            'sheet.mutation.insert-col',
            'sheet.mutation.set-sheet-table',
        ]);
        expect(pushUndoRedo).toHaveBeenCalledWith(expect.objectContaining({
            unitID: 'u1',
            undoMutations: expect.arrayContaining([expect.objectContaining({ id: 'sheet.mutation.remove-col' })]),
        }));
    });

    it('direct insert commands should reject invalid count, table and index inputs', () => {
        const { univerInstanceService } = createSheetContext();
        const table = {
            getSubunitId: () => 's1',
            getRange: () => ({ startRow: 1, endRow: 4, startColumn: 1, endColumn: 4 }),
        };
        const accessor = createAccessor([
            [IUniverInstanceService, univerInstanceService],
            [TableManager, { getTableById: (_unitId: string, tableId: string) => (tableId === 't1' ? table : null) }],
            [ICommandService, { syncExecuteCommand: vi.fn(() => true) }],
            [IUndoRedoService, { pushUndoRedo: vi.fn() }],
        ]);

        expect(SheetTableInsertRowAtCommand.handler(accessor, { unitId: 'u1', subUnitId: 's1', tableId: 't1', index: 2, count: 0 })).toBe(false);
        expect(SheetTableInsertColumnAtCommand.handler(accessor, { unitId: 'u1', subUnitId: 's1', tableId: 'missing', index: 2, count: 1 })).toBe(false);
        expect(SheetTableInsertRowAtCommand.handler(accessor, { unitId: 'u1', subUnitId: 's1', tableId: 't1', index: 1, count: 1 })).toBe(false);
        expect(SheetTableInsertColumnAtCommand.handler(accessor, { unitId: 'u1', subUnitId: 's1', tableId: 't1', index: 6, count: 1 })).toBe(false);
    });

    it('direct row insert should not push undo records when command sequence fails', () => {
        const { univerInstanceService } = createSheetContext();
        const syncExecuteCommand = vi.fn(() => false);
        const pushUndoRedo = vi.fn();
        const table = {
            getId: () => 't1',
            getSubunitId: () => 's1',
            getRange: () => ({ startRow: 0, endRow: 4, startColumn: 1, endColumn: 3 }),
        };
        const accessor = createAccessor([
            [IUniverInstanceService, univerInstanceService],
            [TableManager, { getTableById: () => table }],
            [ICommandService, { syncExecuteCommand }],
            [IUndoRedoService, { pushUndoRedo }],
        ]);

        expect(SheetTableInsertRowAtCommand.handler(accessor, {
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            index: 2,
            count: 1,
        })).toBe(false);
        expect(pushUndoRedo).not.toHaveBeenCalled();
        expect((syncExecuteCommand.mock.calls as unknown as Array<[string]>).map(([id]) => id)).toEqual([
            'sheet.mutation.set-sheet-table',
        ]);
    });

    it('direct row insert should update table range and move trailing table rows', () => {
        const { univerInstanceService } = createSheetContext({
            cells: [
                [2, 1, { v: 'body-1' }],
                [10, 3, { v: 'tail' }],
            ],
        });

        const syncExecuteCommand = vi.fn(() => true);
        const pushUndoRedo = vi.fn();
        const table = {
            getId: () => 't1',
            getSubunitId: () => 's1',
            getRange: () => ({ startRow: 0, endRow: 4, startColumn: 1, endColumn: 3 }),
        };
        const accessor = createAccessor([
            [IUniverInstanceService, univerInstanceService],
            [TableManager, { getTableById: () => table }],
            [ICommandService, { syncExecuteCommand }],
            [IUndoRedoService, { pushUndoRedo }],
        ]);

        expect(SheetTableInsertRowAtCommand.handler(accessor, {
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            index: 2,
            count: 1,
        })).toBe(true);
        const calls = syncExecuteCommand.mock.calls as unknown as Array<[string, any]>;
        expect(calls.map(([id]) => id)).toEqual([
            'sheet.mutation.set-sheet-table',
            MoveRangeMutation.id,
        ]);
        expect(calls[0][1].config.updateRange.newRange).toEqual({ startRow: 0, endRow: 5, startColumn: 1, endColumn: 3 });
        expect(calls[1][1]).toEqual(expect.objectContaining({
            fromRange: { startRow: 2, endRow: 10, startColumn: 1, endColumn: 3 },
            toRange: { startRow: 3, endRow: 11, startColumn: 1, endColumn: 3 },
        }));
        expect(pushUndoRedo).toHaveBeenCalledWith(expect.objectContaining({
            unitID: 'u1',
            undoMutations: expect.arrayContaining([
                expect.objectContaining({
                    id: 'sheet.mutation.set-sheet-table',
                    params: expect.objectContaining({
                        config: expect.objectContaining({
                            updateRange: expect.objectContaining({
                                newRange: { startRow: 0, endRow: 4, startColumn: 1, endColumn: 3 },
                            }),
                        }),
                    }),
                }),
                expect.objectContaining({
                    id: MoveRangeMutation.id,
                    params: expect.objectContaining({
                        fromRange: { startRow: 3, endRow: 11, startColumn: 1, endColumn: 3 },
                        toRange: { startRow: 2, endRow: 10, startColumn: 1, endColumn: 3 },
                    }),
                }),
            ]),
        }));
    });

    it('direct column insert should update table columns and move trailing table columns', () => {
        const { univerInstanceService } = createSheetContext({
            cells: [
                [0, 2, { v: 'middle-col' }],
                [4, 10, { v: 'tail-col' }],
            ],
        });

        const syncExecuteCommand = vi.fn(() => true);
        const pushUndoRedo = vi.fn();
        const table = {
            getId: () => 't1',
            getSubunitId: () => 's1',
            getRange: () => ({ startRow: 0, endRow: 4, startColumn: 1, endColumn: 3 }),
        };
        const accessor = createAccessor([
            [IUniverInstanceService, univerInstanceService],
            [TableManager, { getTableById: () => table }],
            [ICommandService, { syncExecuteCommand }],
            [IUndoRedoService, { pushUndoRedo }],
        ]);

        expect(SheetTableInsertColumnAtCommand.handler(accessor, {
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            index: 2,
            count: 1,
        })).toBe(true);
        const calls = syncExecuteCommand.mock.calls as unknown as Array<[string, any]>;
        expect(calls.map(([id]) => id)).toEqual([
            'sheet.mutation.set-sheet-table',
            MoveRangeMutation.id,
        ]);
        expect(calls[0][1].config.rowColOperation).toEqual({
            operationType: 'insert',
            rowColType: 'column',
            index: 2,
            count: 1,
        });
        expect(calls[1][1]).toEqual(expect.objectContaining({
            fromRange: { startRow: 0, endRow: 4, startColumn: 2, endColumn: 10 },
            toRange: { startRow: 0, endRow: 4, startColumn: 3, endColumn: 11 },
        }));
        expect(pushUndoRedo).toHaveBeenCalledWith(expect.objectContaining({
            unitID: 'u1',
            redoMutations: expect.arrayContaining([
                expect.objectContaining({
                    id: MoveRangeMutation.id,
                    params: expect.objectContaining({
                        toRange: { startRow: 0, endRow: 4, startColumn: 3, endColumn: 11 },
                    }),
                }),
            ]),
        }));
    });

    it('direct column remove should update table columns and move trailing table columns', () => {
        const { univerInstanceService } = createSheetContext({
            cells: [
                [0, 3, { v: 'right-col' }],
                [4, 10, { v: 'tail-col' }],
            ],
        });

        const syncExecuteCommand = vi.fn(() => true);
        const pushUndoRedo = vi.fn();
        const onCommandExecute = vi.fn(() => ({
            preRedos: [{ id: 'formula.redo.before', params: { phase: 'pre' } }],
            redos: [{ id: 'formula.redo.after', params: { phase: 'post' } }],
            preUndos: [{ id: 'formula.undo.before', params: { phase: 'pre' } }],
            undos: [{ id: 'formula.undo.after', params: { phase: 'post' } }],
        }));
        const table = {
            getId: () => 't1',
            getSubunitId: () => 's1',
            getRange: () => ({ startRow: 0, endRow: 4, startColumn: 1, endColumn: 3 }),
            getTableInfo: () => ({
                name: 'Table',
                columns: [
                    { id: 'c1', displayName: '1' },
                    { id: 'c2', displayName: '2' },
                    { id: 'c3', displayName: '3' },
                ],
            }),
        };
        const accessor = createAccessor([
            [IUniverInstanceService, univerInstanceService],
            [TableManager, { getTableById: () => table }],
            [ICommandService, { syncExecuteCommand }],
            [IUndoRedoService, { pushUndoRedo }],
            [SheetInterceptorService, { onCommandExecute }],
        ]);

        expect(SheetTableRemoveColumnAtCommand.handler(accessor, {
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            index: 2,
            count: 1,
        })).toBe(true);
        expect(onCommandExecute).toHaveBeenCalledWith({
            id: SheetTableRemoveColumnAtCommand.id,
            params: expect.objectContaining({
                unitId: 'u1',
                subUnitId: 's1',
                tableId: 't1',
                tableName: 'Table',
                removedColumnNames: ['2'],
            }),
        });
        expect((syncExecuteCommand.mock.calls as unknown as Array<[string, unknown, unknown?]>).map(([id]) => id)).toEqual([
            'formula.redo.before',
            'sheet.mutation.set-sheet-table',
            'formula.redo.after',
            MoveRangeMutation.id,
        ]);
        expect((syncExecuteCommand.mock.calls as unknown as Array<[string, any]>)[3][1]).toEqual(expect.objectContaining({
            fromRange: { startRow: 0, endRow: 4, startColumn: 3, endColumn: 10 },
            toRange: { startRow: 0, endRow: 4, startColumn: 2, endColumn: 9 },
        }));
        expect(pushUndoRedo).toHaveBeenCalledWith(expect.objectContaining({
            unitID: 'u1',
            undoMutations: expect.arrayContaining([
                expect.objectContaining({ id: 'formula.undo.before' }),
                expect.objectContaining({ id: 'formula.undo.after' }),
                expect.objectContaining({
                    id: MoveRangeMutation.id,
                    params: expect.objectContaining({
                        fromRange: { startRow: 0, endRow: 4, startColumn: 2, endColumn: 9 },
                        toRange: { startRow: 0, endRow: 4, startColumn: 3, endColumn: 10 },
                    }),
                }),
            ]),
            redoMutations: expect.arrayContaining([
                expect.objectContaining({ id: 'formula.redo.before' }),
                expect.objectContaining({ id: 'formula.redo.after' }),
            ]),
        }));
    });

    it('toolbar remove row should shrink the table and move trailing rows', () => {
        const range = { startRow: 2, endRow: 3, startColumn: 1, endColumn: 3 };
        const { univerInstanceService } = createSheetContext({
            cells: [
                [4, 1, { v: 'after-removed-row' }],
                [10, 3, { v: 'tail-row' }],
            ],
        });

        const syncExecuteCommand = vi.fn(() => true);
        const pushUndoRedo = vi.fn();
        const table = {
            getId: () => 't1',
            getRange: () => ({ startRow: 0, endRow: 5, startColumn: 1, endColumn: 3 }),
        };
        const accessor = createAccessor([
            [IUniverInstanceService, univerInstanceService],
            [SheetsSelectionsService, { getCurrentSelections: () => [{ range }] }],
            [SheetsTableController, { getContainerTableWithRange: () => table }],
            [ICommandService, { syncExecuteCommand }],
            [IUndoRedoService, { pushUndoRedo }],
        ]);

        expect(SheetTableRemoveRowCommand.handler(accessor, { unitId: 'u1', subUnitId: 's1', tableId: 't1' })).toBe(true);
        expect((syncExecuteCommand.mock.calls as unknown as Array<[string]>).map(([id]) => id)).toEqual([
            'sheet.mutation.set-sheet-table',
            MoveRangeMutation.id,
        ]);
        expect((syncExecuteCommand.mock.calls as unknown as Array<[string, any]>)[0][1].config.updateRange.newRange).toEqual({
            startRow: 0,
            endRow: 3,
            startColumn: 1,
            endColumn: 3,
        });
        expect((syncExecuteCommand.mock.calls as unknown as Array<[string, any]>)[1][1]).toEqual(expect.objectContaining({
            fromRange: { startRow: 4, endRow: 10, startColumn: 1, endColumn: 3 },
            toRange: { startRow: 2, endRow: 8, startColumn: 1, endColumn: 3 },
        }));
        expect(pushUndoRedo).toHaveBeenCalledWith(expect.objectContaining({
            unitID: 'u1',
            redoMutations: expect.arrayContaining([expect.objectContaining({ id: MoveRangeMutation.id })]),
        }));
    });

    it('toolbar remove column should notify interceptors, restore removed column metadata, and move trailing columns', () => {
        const range = { startRow: 0, endRow: 4, startColumn: 2, endColumn: 2 };
        const { univerInstanceService } = createSheetContext({
            dataRange: { endRow: 10, endColumn: 8 },
            cells: [
                [0, 3, { v: 'after-removed-col' }],
                [4, 8, { v: 'tail-col' }],
            ],
        });

        const syncExecuteCommand = vi.fn(() => true);
        const pushUndoRedo = vi.fn();
        const onCommandExecute = vi.fn(() => ({
            preRedos: [{ id: 'pre-redo', params: {} }],
            redos: [{ id: 'post-redo', params: {} }],
            preUndos: [{ id: 'pre-undo', params: {} }],
            undos: [{ id: 'post-undo', params: {} }],
        }));
        const table = {
            getId: () => 't1',
            getRange: () => ({ startRow: 0, endRow: 4, startColumn: 1, endColumn: 4 }),
            getTableInfo: () => ({
                name: 'Table',
                columns: [
                    { id: 'c1', displayName: 'A' },
                    { id: 'c2', displayName: 'B' },
                    { id: 'c3', displayName: 'C' },
                ],
            }),
        };
        const accessor = createAccessor([
            [IUniverInstanceService, univerInstanceService],
            [TableManager, {}],
            [SheetsSelectionsService, { getCurrentSelections: () => [{ range }] }],
            [SheetsTableController, { getContainerTableWithRange: () => table }],
            [ICommandService, { syncExecuteCommand }],
            [IUndoRedoService, { pushUndoRedo }],
            [SheetInterceptorService, { onCommandExecute }],
        ]);

        expect(SheetTableRemoveColCommand.handler(accessor, { unitId: 'u1', subUnitId: 's1', tableId: 't1' })).toBe(true);
        expect(onCommandExecute).toHaveBeenCalledWith({
            id: SheetTableRemoveColCommand.id,
            params: expect.objectContaining({
                tableName: 'Table',
                removedColumnNames: ['B'],
            }),
        });
        expect((syncExecuteCommand.mock.calls as unknown as Array<[string]>).map(([id]) => id)).toEqual([
            'pre-redo',
            'sheet.mutation.set-sheet-table',
            'post-redo',
            MoveRangeMutation.id,
        ]);
        expect((syncExecuteCommand.mock.calls as unknown as Array<[string, any]>)[3][1]).toEqual(expect.objectContaining({
            fromRange: { startRow: 0, endRow: 4, startColumn: 3, endColumn: 8 },
            toRange: { startRow: 0, endRow: 4, startColumn: 2, endColumn: 7 },
        }));
        expect(pushUndoRedo).toHaveBeenCalledWith(expect.objectContaining({
            undoMutations: expect.arrayContaining([
                expect.objectContaining({ id: 'pre-undo' }),
                expect.objectContaining({
                    id: 'sheet.mutation.set-sheet-table',
                    params: expect.objectContaining({
                        config: expect.objectContaining({
                            rowColOperation: expect.objectContaining({
                                columnsJson: [{ id: 'c2', displayName: 'B' }],
                            }),
                        }),
                    }),
                }),
                expect.objectContaining({
                    id: MoveRangeMutation.id,
                    params: expect.objectContaining({
                        fromRange: { startRow: 0, endRow: 4, startColumn: 2, endColumn: 7 },
                        toRange: { startRow: 0, endRow: 4, startColumn: 3, endColumn: 8 },
                    }),
                }),
            ]),
        }));
    });
});
