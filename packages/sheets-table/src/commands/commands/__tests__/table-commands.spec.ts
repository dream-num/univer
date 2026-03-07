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

import { ICommandService, ILogService, IUndoRedoService, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { IDefinedNamesService } from '@univerjs/engine-formula';
import { AddRangeThemeMutation, RemoveRangeThemeMutation, SheetRangeThemeModel } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { TableManager } from '../../../model/table-manager';
import { IRangeOperationTypeEnum, IRowColTypeEnum } from '../../../types/type';
import { AddSheetTableMutation } from '../../mutations/add-sheet-table.mutation';
import { DeleteSheetTableMutation } from '../../mutations/delete-sheet-table.mutation';
import { SetSheetTableMutation } from '../../mutations/set-sheet-table.mutation';
import { SetSheetTableFilterMutation } from '../../mutations/set-table-filter.mutation';
import { AddSheetTableCommand } from '../add-sheet-table.command';
import { AddTableThemeCommand } from '../add-table-theme.command';
import { DeleteSheetTableCommand } from '../delete-sheet-table.command';
import { RemoveTableThemeCommand } from '../remove-table-theme.command';
import { SetSheetTableCommand } from '../set-sheet-table.command';
import { SetSheetTableFilterCommand } from '../set-table-filter.command';

function createAccessor(pairs: Array<[unknown, unknown]>) {
    const services = new Map<unknown, unknown>(pairs);
    return {
        get(token: unknown) {
            if (!services.has(token)) {
                throw new Error(`Missing dependency: ${String(token)}`);
            }
            return services.get(token);
        },
    } as any;
}

describe('sheets-table commands', () => {
    it('AddSheetTableCommand should auto-generate table name and push undo/redo', () => {
        const syncExecuteCommand = vi.fn(() => true);
        const pushUndoRedo = vi.fn();
        const tableManager = {
            getTableList: vi.fn(() => [{ name: 'table9' }]),
            getColumnHeader: vi.fn(() => ['Name']),
        };

        const accessor = createAccessor([
            [ICommandService, { syncExecuteCommand }],
            [IUndoRedoService, { pushUndoRedo }],
            [LocaleService, { t: (key: string) => (key === 'sheets-table.tablePrefix' ? 'Table' : 'Column') }],
            [TableManager, tableManager],
            [IUniverInstanceService, {
                getUnit: () => ({ getSheets: () => [{ getName: () => 'SheetA' }] }),
            }],
            [IDefinedNamesService, {
                getDefinedNameMap: () => ({ d1: { name: 'DefinedA' } }),
            }],
        ]);

        const result = AddSheetTableCommand.handler(accessor, {
            unitId: 'u1',
            subUnitId: 's1',
            range: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 },
            name: 'SheetA',
        });

        expect(result).toBe(true);
        expect(tableManager.getColumnHeader).toHaveBeenCalledWith(
            'u1',
            's1',
            { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 },
            'Column'
        );
        expect(syncExecuteCommand).toHaveBeenCalledWith(
            AddSheetTableMutation.id,
            expect.objectContaining({
                unitId: 'u1',
                subUnitId: 's1',
                name: 'Table10',
                header: ['Name'],
            }),
            undefined
        );
        expect(pushUndoRedo).toHaveBeenCalledTimes(1);
    });

    it('AddSheetTableCommand should return false when params are missing', () => {
        expect(AddSheetTableCommand.handler(createAccessor([]), undefined as any)).toBe(false);
    });

    it('DeleteSheetTableCommand should build undo mutations from table snapshot', () => {
        const syncExecuteCommand = vi.fn(() => true);
        const pushUndoRedo = vi.fn();
        const tableSnapshot = {
            id: 't1',
            name: 'Table1',
            range: { startRow: 1, endRow: 5, startColumn: 2, endColumn: 4 },
            options: { headerRow: true },
        };
        const tableManager = {
            getTable: vi.fn(() => ({ toJSON: () => tableSnapshot })),
        };
        const accessor = createAccessor([
            [IUndoRedoService, { pushUndoRedo }],
            [ICommandService, { syncExecuteCommand }],
            [TableManager, tableManager],
            [ILogService, { error: vi.fn() }],
        ]);

        const result = DeleteSheetTableCommand.handler(accessor, { unitId: 'u1', subUnitId: 's1', tableId: 't1' });

        expect(result).toBe(true);
        expect(syncExecuteCommand).toHaveBeenCalledWith(DeleteSheetTableMutation.id, { unitId: 'u1', subUnitId: 's1', tableId: 't1' }, undefined);
        expect(pushUndoRedo).toHaveBeenCalledWith(expect.objectContaining({
            unitID: 'u1',
            undoMutations: [
                expect.objectContaining({
                    id: AddSheetTableMutation.id,
                    params: expect.objectContaining({
                        tableId: 't1',
                        name: 'Table1',
                    }),
                }),
            ],
        }));
    });

    it('DeleteSheetTableCommand should return false when table does not exist', () => {
        const logService = { error: vi.fn() };
        const accessor = createAccessor([
            [IUndoRedoService, { pushUndoRedo: vi.fn() }],
            [ICommandService, { syncExecuteCommand: vi.fn(() => true) }],
            [TableManager, { getTable: () => undefined }],
            [ILogService, logService],
        ]);

        expect(DeleteSheetTableCommand.handler(accessor, { unitId: 'u1', subUnitId: 's1', tableId: 't1' })).toBe(false);
        expect(logService.error).toHaveBeenCalled();
    });

    it('SetSheetTableCommand should reject invalid table name and warn', () => {
        const logService = { warn: vi.fn() };
        const commandService = { executeCommand: vi.fn() };
        const table = {
            getDisplayName: () => 'Old',
            getRange: () => ({ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 }),
            getSubunitId: () => 's1',
            getTableStyleId: () => 'theme-1',
        };

        const accessor = createAccessor([
            [TableManager, { getTableById: () => table, getTableList: () => [] }],
            [LocaleService, { t: () => 'invalid name' }],
            [IUniverInstanceService, {
                getUnit: () => ({ getSheets: () => [{ getName: () => 'SheetA' }] }),
            }],
            [IDefinedNamesService, { getDefinedNameMap: () => ({}) }],
            [ICommandService, commandService],
            [IUndoRedoService, { pushUndoRedo: vi.fn() }],
            [ILogService, logService],
        ]);

        const result = SetSheetTableCommand.handler(accessor, {
            unitId: 'u1',
            tableId: 't1',
            name: 'SheetA',
        });

        expect(result).toBe(false);
        expect(logService.warn).toHaveBeenCalledWith('invalid name');
        expect(commandService.executeCommand).not.toHaveBeenCalled();
    });

    it('SetSheetTableCommand should execute mutation and build inverse undo config', () => {
        const executeCommand = vi.fn();
        const pushUndoRedo = vi.fn();
        const table = {
            getDisplayName: () => 'OldName',
            getRange: () => ({ startRow: 1, endRow: 4, startColumn: 1, endColumn: 3 }),
            getSubunitId: () => 's1',
            getTableStyleId: () => 'theme-old',
        };

        const accessor = createAccessor([
            [TableManager, { getTableById: () => table, getTableList: () => [] }],
            [LocaleService, { t: () => 'msg' }],
            [IUniverInstanceService, { getUnit: () => ({ getSheets: () => [{ getName: () => 'SheetA' }] }) }],
            [IDefinedNamesService, { getDefinedNameMap: () => ({}) }],
            [ICommandService, { executeCommand }],
            [IUndoRedoService, { pushUndoRedo }],
            [ILogService, { warn: vi.fn() }],
        ]);

        const result = SetSheetTableCommand.handler(accessor, {
            unitId: 'u1',
            tableId: 't1',
            name: 'NewName',
            rowColOperation: {
                operationType: IRangeOperationTypeEnum.Insert,
                rowColType: IRowColTypeEnum.Col,
                index: 2,
                count: 1,
            },
            updateRange: {
                newRange: { startRow: 1, endRow: 6, startColumn: 1, endColumn: 4 },
            },
            theme: 'theme-new',
        });

        expect(result).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(
            SetSheetTableMutation.id,
            expect.objectContaining({
                unitId: 'u1',
                subUnitId: 's1',
                tableId: 't1',
                config: expect.objectContaining({
                    name: 'NewName',
                    theme: 'theme-new',
                }),
            })
        );

        expect(pushUndoRedo).toHaveBeenCalledWith(expect.objectContaining({
            undoMutations: [
                expect.objectContaining({
                    id: SetSheetTableMutation.id,
                    params: expect.objectContaining({
                        config: expect.objectContaining({
                            name: 'OldName',
                            theme: 'theme-old',
                            rowColOperation: expect.objectContaining({ operationType: IRangeOperationTypeEnum.Delete }),
                        }),
                    }),
                }),
            ],
        }));
    });

    it('SetSheetTableFilterCommand should execute mutation with generated table id', () => {
        const syncExecuteCommand = vi.fn(() => true);
        const pushUndoRedo = vi.fn();
        const accessor = createAccessor([
            [IUndoRedoService, { pushUndoRedo }],
            [ICommandService, { syncExecuteCommand }],
        ]);

        const result = SetSheetTableFilterCommand.handler(accessor, {
            unitId: 'u1',
            tableId: undefined as any,
            column: 1,
            tableFilter: { filterType: 'manual', values: ['A'] } as any,
        });

        expect(result).toBe(true);
        expect(syncExecuteCommand).toHaveBeenCalledWith(
            SetSheetTableFilterMutation.id,
            expect.objectContaining({
                unitId: 'u1',
                column: 1,
                tableFilter: { filterType: 'manual', values: ['A'] },
            }),
            undefined
        );
        const firstCall = syncExecuteCommand.mock.calls[0] as Array<any> | undefined;
        const tableId = (firstCall?.[1] as { tableId?: string } | undefined)?.tableId;
        expect(typeof tableId).toBe('string');
        expect((tableId ?? '').length).toBeGreaterThan(0);
        expect(pushUndoRedo).toHaveBeenCalled();
    });

    it('AddTableThemeCommand should register theme and update table style', () => {
        const syncExecuteCommand = vi.fn(() => true);
        const pushUndoRedo = vi.fn();
        const themeStyle = {
            toJson: () => ({ name: 'theme-new' }),
            getName: () => 'theme-new',
        } as any;
        const table = {
            getSubunitId: () => 's1',
            getTableStyleId: () => 'theme-old',
        };

        const accessor = createAccessor([
            [TableManager, { getTableById: () => table }],
            [ICommandService, { syncExecuteCommand }],
            [IUndoRedoService, { pushUndoRedo }],
        ]);

        const result = AddTableThemeCommand.handler(accessor, {
            unitId: 'u1',
            tableId: 't1',
            themeStyle,
        });

        expect(result).toBe(true);
        expect(syncExecuteCommand).toHaveBeenNthCalledWith(1, AddRangeThemeMutation.id, {
            unitId: 'u1',
            subUnitId: 's1',
            styleJSON: { name: 'theme-new' },
        }, undefined);
        expect(syncExecuteCommand).toHaveBeenNthCalledWith(2, SetSheetTableMutation.id, {
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            config: { theme: 'theme-new' },
        }, undefined);
        expect(pushUndoRedo).toHaveBeenCalled();
    });

    it('RemoveTableThemeCommand should select replacement theme and build undo payload', () => {
        const syncExecuteCommand = vi.fn(() => true);
        const pushUndoRedo = vi.fn();

        const accessor = createAccessor([
            [TableManager, { getTableById: () => ({ getSubunitId: () => 's1' }) }],
            [SheetRangeThemeModel, {
                getRegisteredRangeThemes: () => ['table-default-0', 'table-default-1', 'table-custom-1', 'table-custom-2'],
                getDefaultRangeThemeStyle: () => ({ toJson: () => ({ name: 'table-custom-1' }) }),
            }],
            [ICommandService, { syncExecuteCommand }],
            [IUndoRedoService, { pushUndoRedo }],
        ]);

        const result = RemoveTableThemeCommand.handler(accessor, {
            unitId: 'u1',
            tableId: 't1',
            themeName: 'table-custom-1',
        });

        expect(result).toBe(true);
        expect(syncExecuteCommand).toHaveBeenNthCalledWith(1, SetSheetTableMutation.id, {
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            config: { theme: 'table-custom-2' },
        }, undefined);
        expect(syncExecuteCommand).toHaveBeenNthCalledWith(2, RemoveRangeThemeMutation.id, {
            unitId: 'u1',
            subUnitId: 's1',
            styleName: 'table-custom-1',
        }, undefined);
        expect(pushUndoRedo).toHaveBeenCalled();
    });
});
