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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import {
    AddRangeThemeMutation,
    RangeThemeStyle,
    RemoveRangeThemeMutation,
    SheetInterceptorService,
    SheetRangeThemeModel,
    UniverSheetsPlugin,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ITableManualFilterItem } from '../../../types/type';
import enUS from '../../../locale/en-US';
import { TableManager } from '../../../models/table-manager';
import { UniverSheetsTablePlugin } from '../../../plugin';
import { SheetTableService } from '../../../services/table.service';
import { TableColumnFilterTypeEnum } from '../../../types/enum';
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

const range = { startRow: 1, endRow: 5, startColumn: 0, endColumn: 1 };
const unitId = 'table-command-workbook';
const subUnitId = 'grid';

describe('sheets-table commands with real table providers', () => {
    let univer: Univer;
    let commands: ICommandService;
    let history: IUndoRedoService;
    let tables: TableManager;
    let tableService: SheetTableService;

    beforeEach(() => {
        univer = new Univer();
        univer.registerPlugin(UniverFormulaEnginePlugin);
        univer.registerPlugin(UniverSheetsPlugin);
        univer.registerPlugin(UniverSheetsTablePlugin);
        univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: unitId,
            appVersion: '1.0.0',
            locale: LocaleType.EN_US,
            name: 'Table commands',
            sheetOrder: [subUnitId],
            styles: {},
            sheets: {
                grid: { id: subUnitId, name: 'Grid', cellData: {} },
            },
        });
        const injector = univer.__getInjector();
        injector.get(IUniverInstanceService).focusUnit(unitId);
        injector.get(LocaleService).load({ [LocaleType.EN_US]: enUS });
        injector.get(LocaleService).setLocale(LocaleType.EN_US);
        commands = injector.get(ICommandService);
        history = injector.get(IUndoRedoService);
        tables = injector.get(TableManager);
        tableService = injector.get(SheetTableService);
    });

    afterEach(() => {
        univer.dispose();
    });

    function addTable(tableId = 't1', name = 'Table1', options = {}) {
        tableService.addTable(unitId, subUnitId, name, range, ['Name', 'Value'], tableId, options);
        return tables.getTable(unitId, tableId)!;
    }

    it('generates a collision-free table name and records the inverse delete', async () => {
        addTable('existing', 'Table9');
        expect(await commands.executeCommand(AddSheetTableCommand.id, {
            unitId,
            subUnitId,
            id: 'new-table',
            range,
            name: 'Grid',
        })).toBe(true);
        expect(tables.getTable(unitId, 'new-table')?.getDisplayName()).toBe('Table10');
        expect(history.pitchTopUndoElement()?.undoMutations).toContainEqual({
            id: DeleteSheetTableMutation.id,
            params: expect.objectContaining({ unitId, tableId: 'new-table' }),
        });
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(tables.getTable(unitId, 'new-table')).toBeUndefined();
    });

    it('rejects missing add parameters without recording history', async () => {
        const before = history.pitchTopUndoElement();
        expect(await commands.executeCommand(AddSheetTableCommand.id)).toBe(false);
        expect(history.pitchTopUndoElement()).toBe(before);
    });

    it('deletes a real table with interceptor order and an inverse snapshot', async () => {
        addTable('t1', 'Table1', { headerRow: true });
        const interceptor = univer.__getInjector().get(SheetInterceptorService);
        const markerIds = ['formula.redo.before', 'formula.redo.after', 'formula.undo.before', 'formula.undo.after'];
        markerIds.forEach((id) => commands.registerCommand({ id, type: CommandType.MUTATION, handler: () => true }));
        const getMutations = vi.fn((info: { id: string }) => info.id === DeleteSheetTableCommand.id
            ? {
                preRedos: [{ id: markerIds[0], params: {} }],
                redos: [{ id: markerIds[1], params: {} }],
                preUndos: [{ id: markerIds[2], params: {} }],
                undos: [{ id: markerIds[3], params: {} }],
            }
            : { redos: [], undos: [] });
        const registration = interceptor.interceptCommand({ priority: 100, getMutations });
        const executed: string[] = [];
        const observation = commands.onCommandExecuted((command) => {
            if (command.type === CommandType.MUTATION) {
                executed.push(command.id);
            }
        });
        try {
            expect(await commands.executeCommand(DeleteSheetTableCommand.id, { unitId, subUnitId, tableId: 't1' })).toBe(true);
            expect(tables.getTable(unitId, 't1')).toBeUndefined();
            expect(getMutations).toHaveBeenCalledWith({
                id: DeleteSheetTableCommand.id,
                params: expect.objectContaining({ unitId, subUnitId, tableId: 't1', tableName: 'Table1' }),
            });
            expect(executed).toEqual(expect.arrayContaining([markerIds[0], DeleteSheetTableMutation.id, markerIds[1]]));
            expect(executed.indexOf(markerIds[0])).toBeLessThan(executed.indexOf(DeleteSheetTableMutation.id));
            expect(executed.indexOf(DeleteSheetTableMutation.id)).toBeLessThan(executed.indexOf(markerIds[1]));
            const undo = history.pitchTopUndoElement()!;
            expect(undo.undoMutations).toEqual(expect.arrayContaining([
                expect.objectContaining({ id: markerIds[2] }),
                expect.objectContaining({
                    id: AddSheetTableMutation.id,
                    params: expect.objectContaining({ unitId, subUnitId, tableId: 't1', name: 'Table1', range }),
                }),
                expect.objectContaining({ id: markerIds[3] }),
            ]));
            const undoIds = undo.undoMutations.map(({ id }) => id);
            expect(undoIds.indexOf(markerIds[2])).toBeLessThan(undoIds.indexOf(AddSheetTableMutation.id));
            expect(undoIds.indexOf(AddSheetTableMutation.id)).toBeLessThan(undoIds.indexOf(markerIds[3]));
            expect(undo.redoMutations.map(({ id }) => id)).toEqual(expect.arrayContaining([markerIds[0], DeleteSheetTableMutation.id, markerIds[1]]));
            expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
            expect(tables.getTable(unitId, 't1')?.getDisplayName()).toBe('Table1');
            expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
            expect(tables.getTable(unitId, 't1')).toBeUndefined();
        } finally {
            observation.dispose();
            registration.dispose();
        }
    });

    it('returns false for a missing table without recording history', async () => {
        const before = history.pitchTopUndoElement();
        expect(await commands.executeCommand(DeleteSheetTableCommand.id, { unitId, subUnitId, tableId: 'missing' })).toBe(false);
        expect(history.pitchTopUndoElement()).toBe(before);
    });

    it('rejects a name colliding with the owning worksheet', async () => {
        const table = addTable();
        const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const before = history.pitchTopUndoElement();
        try {
            expect(await commands.executeCommand(SetSheetTableCommand.id, { unitId, tableId: 't1', name: 'Grid' })).toBe(false);
            expect(table.getDisplayName()).toBe('Table1');
            expect(warning).toHaveBeenCalled();
            expect(history.pitchTopUndoElement()).toBe(before);
        } finally {
            warning.mockRestore();
        }
    });

    it('passes the old table name to Set interceptors and orders inverse mutations', async () => {
        const table = addTable('t1', 'OldName', { tableStyleId: 'theme-old' });
        const markerIds = ['set.redo.before', 'set.redo.after', 'set.undo.before', 'set.undo.after'];
        markerIds.forEach((id) => commands.registerCommand({ id, type: CommandType.MUTATION, handler: () => true }));
        const getMutations = vi.fn((info: { id: string }) => info.id === SetSheetTableCommand.id
            ? {
                preRedos: [{ id: markerIds[0], params: {} }],
                redos: [{ id: markerIds[1], params: {} }],
                preUndos: [{ id: markerIds[2], params: {} }],
                undos: [{ id: markerIds[3], params: {} }],
            }
            : { redos: [], undos: [] });
        const registration = univer.__getInjector().get(SheetInterceptorService).interceptCommand({ priority: 100, getMutations });
        const executed: string[] = [];
        const observation = commands.onCommandExecuted((command) => {
            if (command.type === CommandType.MUTATION) {
                executed.push(command.id);
            }
        });
        try {
            expect(await commands.executeCommand(SetSheetTableCommand.id, {
                unitId,
                tableId: 't1',
                name: 'NewName',
                theme: 'theme-new',
            })).toBe(true);
            expect(getMutations).toHaveBeenCalledWith({
                id: SetSheetTableCommand.id,
                params: expect.objectContaining({ unitId, tableId: 't1', name: 'NewName', oldTableName: 'OldName' }),
            });
            expect(table.getDisplayName()).toBe('NewName');
            expect(table.getTableStyleId()).toBe('theme-new');
            expect(executed).toEqual(expect.arrayContaining([markerIds[0], SetSheetTableMutation.id, markerIds[1]]));
            expect(executed.indexOf(markerIds[0])).toBeLessThan(executed.indexOf(SetSheetTableMutation.id));
            expect(executed.indexOf(SetSheetTableMutation.id)).toBeLessThan(executed.indexOf(markerIds[1]));
            const undo = history.pitchTopUndoElement()!;
            expect(undo.undoMutations).toEqual(expect.arrayContaining([
                expect.objectContaining({ id: markerIds[2] }),
                expect.objectContaining({
                    id: SetSheetTableMutation.id,
                    params: expect.objectContaining({ config: { name: 'OldName', theme: 'theme-old' } }),
                }),
                expect.objectContaining({ id: markerIds[3] }),
            ]));
            const undoIds = undo.undoMutations.map(({ id }) => id);
            expect(undoIds.indexOf(markerIds[2])).toBeLessThan(undoIds.indexOf(SetSheetTableMutation.id));
            expect(undoIds.indexOf(SetSheetTableMutation.id)).toBeLessThan(undoIds.indexOf(markerIds[3]));
            const redoIds = undo.redoMutations.map(({ id }) => id);
            expect(redoIds).toEqual(expect.arrayContaining([markerIds[0], SetSheetTableMutation.id, markerIds[1]]));
            expect(redoIds.indexOf(markerIds[0])).toBeLessThan(redoIds.indexOf(SetSheetTableMutation.id));
            expect(redoIds.indexOf(SetSheetTableMutation.id)).toBeLessThan(redoIds.indexOf(markerIds[1]));
            expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
            expect(table.getDisplayName()).toBe('OldName');
            expect(table.getTableStyleId()).toBe('theme-old');
        } finally {
            observation.dispose();
            registration.dispose();
        }
    });

    it('records the inverse column operation and original table range', async () => {
        const table = addTable();
        const originalRange = { ...table.getRange() };
        expect(await commands.executeCommand(SetSheetTableCommand.id, {
            unitId,
            tableId: 't1',
            rowColOperation: {
                operationType: IRangeOperationTypeEnum.Insert,
                rowColType: IRowColTypeEnum.Col,
                index: 1,
                count: 1,
            },
            updateRange: { newRange: { ...originalRange, endColumn: 2 } },
        })).toBe(true);
        expect(history.pitchTopUndoElement()?.undoMutations).toContainEqual({
            id: SetSheetTableMutation.id,
            params: expect.objectContaining({
                config: expect.objectContaining({
                    rowColOperation: expect.objectContaining({ operationType: IRangeOperationTypeEnum.Delete }),
                    updateRange: { newRange: originalRange },
                }),
            }),
        });
    });

    it('restores the previous manual filter on undo', async () => {
        const table = addTable();
        const previous: ITableManualFilterItem = { filterType: TableColumnFilterTypeEnum.manual, values: ['Old'] };
        table.getTableFilters().setColumnFilter(1, previous);
        expect(await commands.executeCommand(SetSheetTableFilterCommand.id, {
            unitId,
            tableId: 't1',
            column: 1,
            tableFilter: { filterType: TableColumnFilterTypeEnum.manual, values: ['New'] },
        })).toBe(true);
        expect(table.getTableFilters().getColumnFilter(1)).toEqual({ filterType: TableColumnFilterTypeEnum.manual, values: ['New'] });
        expect(history.pitchTopUndoElement()?.undoMutations).toContainEqual({
            id: SetSheetTableFilterMutation.id,
            params: expect.objectContaining({ tableFilter: previous, filterOutRows: [] }),
        });
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(table.getTableFilters().getColumnFilter(1)).toEqual(previous);
    });

    it('restores cached filtered rows when clearing a filter', async () => {
        const table = addTable();
        const previous: ITableManualFilterItem = { filterType: TableColumnFilterTypeEnum.manual, values: ['original'] };
        table.getTableFilters().setColumnFilter(0, previous);
        table.getTableFilters().setFilterOutRows([2, 5]);
        expect(await commands.executeCommand(SetSheetTableFilterCommand.id, {
            unitId,
            tableId: 't1',
            column: 0,
            tableFilter: undefined,
        })).toBe(true);
        expect(history.pitchTopUndoElement()?.undoMutations).toContainEqual({
            id: SetSheetTableFilterMutation.id,
            params: expect.objectContaining({ tableFilter: previous, filterOutRows: [2, 5] }),
        });
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(table.getTableFilters().getColumnFilter(0)).toEqual(previous);
        expect([...table.getTableFilters().getFilterOutRows()]).toEqual([2, 5]);
    });

    it('registers a custom theme and applies it to the table', async () => {
        const table = addTable('t1', 'Table1', { tableStyleId: 'table-default-1' });
        const theme = new RangeThemeStyle('table-custom-1');
        expect(await commands.executeCommand(AddTableThemeCommand.id, { unitId, tableId: 't1', themeStyle: theme })).toBe(true);
        expect(table.getTableStyleId()).toBe('table-custom-1');
        expect(univer.__getInjector().get(SheetRangeThemeModel).getALLRegisteredTheme(unitId)).toContain('table-custom-1');
        expect(history.pitchTopUndoElement()?.redoMutations.map(({ id }) => id)).toEqual(expect.arrayContaining([
            AddRangeThemeMutation.id,
            SetSheetTableMutation.id,
        ]));
    });

    it('removes a custom theme and selects the available built-in fallback', async () => {
        const table = addTable('t1', 'Table1', { tableStyleId: 'table-custom-1' });
        expect(commands.syncExecuteCommand(AddRangeThemeMutation.id, {
            unitId,
            subUnitId,
            styleJSON: new RangeThemeStyle('table-custom-1').toJson(),
        })).toBe(true);
        const themes = univer.__getInjector().get(SheetRangeThemeModel);
        expect(await commands.executeCommand(RemoveTableThemeCommand.id, {
            unitId,
            tableId: 't1',
            themeName: 'table-custom-1',
        })).toBe(true);
        const fallback = table.getTableStyleId();
        expect(fallback).not.toBe('table-custom-1');
        expect(themes.getRegisteredRangeThemes()).toContain(fallback);
        expect(themes.getALLRegisteredTheme(unitId)).not.toContain('table-custom-1');
        expect(history.pitchTopUndoElement()?.redoMutations.map(({ id }) => id)).toEqual([
            SetSheetTableMutation.id,
            RemoveRangeThemeMutation.id,
        ]);
    });

    it('records and applies inverse mutations when removing a built-in theme', async () => {
        const table = addTable('t1', 'Table1', { tableStyleId: 'table-default-1' });
        expect(await commands.executeCommand(RemoveTableThemeCommand.id, {
            unitId,
            tableId: 't1',
            themeName: 'table-default-1',
        })).toBe(true);
        const fallback = table.getTableStyleId();
        expect(fallback).not.toBe('table-default-1');
        expect(univer.__getInjector().get(SheetRangeThemeModel).getRegisteredRangeThemes()).toContain(fallback);
        expect(history.pitchTopUndoElement()?.undoMutations).toEqual([
            expect.objectContaining({ id: AddRangeThemeMutation.id }),
            expect.objectContaining({
                id: SetSheetTableMutation.id,
                params: expect.objectContaining({ config: { theme: 'table-default-1' } }),
            }),
        ]);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(table.getTableStyleId()).toBe('table-default-1');
    });
});
