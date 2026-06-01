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

import { ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import { SheetInterceptorService, SheetsSelectionsService } from '@univerjs/sheets';

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

const sheetsMocks = vi.hoisted(() => ({
    getSheetCommandTarget: vi.fn(),
    getMoveRangeUndoRedoMutations: vi.fn(),
    SheetsSelectionsService: Symbol('SheetsSelectionsService'),
}));

vi.mock('@univerjs/sheets', async () => {
    const actual = await vi.importActual('@univerjs/sheets');
    return {
        ...actual,
        getSheetCommandTarget: sheetsMocks.getSheetCommandTarget,
        getMoveRangeUndoRedoMutations: sheetsMocks.getMoveRangeUndoRedoMutations,
        SheetsSelectionsService: sheetsMocks.SheetsSelectionsService,
    };
});

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

describe('sheet-table-row-col commands', () => {
    it('insert commands should return false when there is no sheet target', () => {
        sheetsMocks.getSheetCommandTarget.mockReturnValue(null);

        const accessor = createAccessor([
            [IUniverInstanceService, {}],
        ]);

        expect(SheetTableInsertRowCommand.handler(accessor)).toBe(false);
        expect(SheetTableInsertColCommand.handler(accessor)).toBe(false);
    });

    it('remove commands should return false for invalid params', () => {
        const accessor = createAccessor([
            [IUniverInstanceService, {}],
        ]);

        expect(SheetTableRemoveRowCommand.handler(accessor, undefined as any)).toBe(false);
        expect(SheetTableRemoveColCommand.handler(accessor, undefined as any)).toBe(false);
    });

    it('commands should stop when current selection is invalid or table is missing', () => {
        sheetsMocks.getSheetCommandTarget.mockReturnValue({
            unitId: 'u1',
            subUnitId: 's1',
            worksheet: {
                getRowCount: () => 100,
                getColumnCount: () => 100,
                getCellMatrix: () => ({ getDataRange: () => ({ endRow: 10, endColumn: 10 }) }),
            },
            workbook: {},
        });

        const accessor = createAccessor([
            [IUniverInstanceService, {}],
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

    it('direct row insert should update table range and move trailing table rows', () => {
        sheetsMocks.getSheetCommandTarget.mockReturnValue({
            unitId: 'u1',
            subUnitId: 's1',
            worksheet: {
                getRowCount: () => 100,
                getColumnCount: () => 100,
                getCellMatrix: () => ({ getDataRange: () => ({ endRow: 10, endColumn: 10 }) }),
            },
            workbook: {},
        });
        sheetsMocks.getMoveRangeUndoRedoMutations.mockReturnValue({
            redos: [{ id: 'move-redo', params: {} }],
            undos: [{ id: 'move-undo', params: {} }],
        });

        const syncExecuteCommand = vi.fn(() => true);
        const pushUndoRedo = vi.fn();
        const table = {
            getId: () => 't1',
            getSubunitId: () => 's1',
            getRange: () => ({ startRow: 0, endRow: 4, startColumn: 1, endColumn: 3 }),
        };
        const accessor = createAccessor([
            [IUniverInstanceService, {}],
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
        expect(syncExecuteCommand).toHaveBeenCalled();
        expect(pushUndoRedo).toHaveBeenCalledWith(expect.objectContaining({ unitID: 'u1' }));
    });

    it('direct column insert should update table columns and move trailing table columns', () => {
        sheetsMocks.getSheetCommandTarget.mockReturnValue({
            unitId: 'u1',
            subUnitId: 's1',
            worksheet: {
                getRowCount: () => 100,
                getColumnCount: () => 100,
                getCellMatrix: () => ({ getDataRange: () => ({ endRow: 10, endColumn: 10 }) }),
            },
            workbook: {},
        });
        sheetsMocks.getMoveRangeUndoRedoMutations.mockReturnValue({
            redos: [{ id: 'move-redo', params: {} }],
            undos: [{ id: 'move-undo', params: {} }],
        });

        const syncExecuteCommand = vi.fn(() => true);
        const pushUndoRedo = vi.fn();
        const table = {
            getId: () => 't1',
            getSubunitId: () => 's1',
            getRange: () => ({ startRow: 0, endRow: 4, startColumn: 1, endColumn: 3 }),
        };
        const accessor = createAccessor([
            [IUniverInstanceService, {}],
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
        expect(syncExecuteCommand).toHaveBeenCalled();
        expect(pushUndoRedo).toHaveBeenCalledWith(expect.objectContaining({ unitID: 'u1' }));
    });

    it('direct column remove should update table columns and move trailing table columns', () => {
        sheetsMocks.getSheetCommandTarget.mockReturnValue({
            unitId: 'u1',
            subUnitId: 's1',
            worksheet: {
                getRowCount: () => 100,
                getColumnCount: () => 100,
                getCellMatrix: () => ({ getDataRange: () => ({ endRow: 10, endColumn: 10 }) }),
            },
            workbook: {},
        });
        sheetsMocks.getMoveRangeUndoRedoMutations.mockReturnValue({
            redos: [{ id: 'move-redo', params: {} }],
            undos: [{ id: 'move-undo', params: {} }],
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
            [IUniverInstanceService, {}],
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
            'move-redo',
        ]);
        expect(pushUndoRedo).toHaveBeenCalledWith(expect.objectContaining({
            unitID: 'u1',
            undoMutations: expect.arrayContaining([
                expect.objectContaining({ id: 'formula.undo.before' }),
                expect.objectContaining({ id: 'formula.undo.after' }),
            ]),
            redoMutations: expect.arrayContaining([
                expect.objectContaining({ id: 'formula.redo.before' }),
                expect.objectContaining({ id: 'formula.redo.after' }),
            ]),
        }));
    });
});
