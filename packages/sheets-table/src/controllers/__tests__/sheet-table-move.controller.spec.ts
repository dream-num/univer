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

import type { IMutationInfo, IWorkbookData, Workbook } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IPermissionService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    Tools,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { ISheetRowFilteredService, SheetRowFilteredService } from '@univerjs/engine-formula';
import {
    ExclusiveRangeService,
    IExclusiveRangeService,
    MoveRangeCommand,
    MoveRangeMutation,
    RangeProtectionRuleModel,
    SetSelectionsOperation,
    SheetInterceptorService,
    SheetRangeThemeModel,
    SheetRangeThemeService,
    SheetsSelectionsService,
    WorkbookPermissionService,
    WorksheetEditPermission,
    WorksheetPermissionService,
    WorksheetProtectionPointModel,
    WorksheetProtectionRuleModel,
    ZebraCrossingCacheController,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MoveSheetTableMutation } from '../../commands/mutations/move-sheet-table.mutation';
import { FEATURE_TABLE_ID } from '../../const';
import enUS from '../../locale/en-US';
import { TableManager } from '../../models/table-manager';
import { TableColumnFilterTypeEnum } from '../../types/enum';
import { SheetTableMoveController } from '../sheet-table-move.controller';
import { SheetTableRangeController } from '../sheet-table-range.controller';
import { SheetsTableThemeController } from '../sheet-table-theme.controller';
import { SheetsTableController } from '../sheets-table.controller';
import { TableFilterController } from '../table-filter.controller';

const SOURCE_RANGE = { startRow: 0, endRow: 3, startColumn: 0, endColumn: 1 };

describe('SheetTableMoveController', () => {
    let univer: Univer;
    let workbook: Workbook;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([TableManager]);
        injector.add([SheetInterceptorService]);
        injector.add([SheetsSelectionsService]);
        injector.add([RangeProtectionRuleModel]);
        injector.add([WorksheetProtectionRuleModel]);
        injector.add([WorksheetProtectionPointModel]);
        injector.add([WorkbookPermissionService]);
        injector.add([WorksheetPermissionService]);
        injector.add([SheetTableMoveController]);
        injector.add([SheetTableRangeController]);
        injector.add([IExclusiveRangeService, { useClass: ExclusiveRangeService }]);
        injector.add([SheetRangeThemeModel]);
        injector.add([SheetRangeThemeService]);
        injector.add([SheetsTableThemeController]);
        injector.add([SheetsTableController]);
        injector.add([TableFilterController]);
        injector.add([ZebraCrossingCacheController]);
        injector.add([ISheetRowFilteredService, { useClass: SheetRowFilteredService }]);
        const locale = injector.get(LocaleService);
        locale.load({ enUS });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        injector.get(WorkbookPermissionService);
        injector.get(WorksheetPermissionService);
        injector.get(SheetInterceptorService);
        workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'test',
            appVersion: '1.0.3',
            locale: LocaleType.EN_US,
            name: 'Tables',
            styles: {},
            sheetOrder: ['sheet1', 'sheet2'],
            sheets: {
                sheet1: {
                    id: 'sheet1',
                    name: 'Source',
                    rowCount: 20,
                    columnCount: 20,
                    cellData: {
                        0: { 0: { v: 'Name' }, 1: { v: 'Amount' } },
                        1: { 0: { v: 'A' }, 1: { v: 10 } },
                        2: { 0: { v: 'B' }, 1: { v: 20 } },
                        3: { 0: { v: 'C' }, 1: { v: 30 } },
                    },
                },
                sheet2: { id: 'sheet2', name: 'Target', rowCount: 20, columnCount: 20, cellData: {} },
            },
        });
        injector.get(IUniverInstanceService).focusUnit('test');
        const commands = injector.get(ICommandService);
        commands.registerCommand(MoveRangeCommand);
        commands.registerCommand(MoveRangeMutation);
        commands.registerCommand(MoveSheetTableMutation);
        commands.registerCommand(SetSelectionsOperation);
    });

    afterEach(() => univer.dispose());

    it.each([
        { sheetId: 'sheet1', range: { startRow: 5, endRow: 8, startColumn: 6, endColumn: 7 } },
        { sheetId: 'sheet1', range: { startRow: 1, endRow: 4, startColumn: 1, endColumn: 2 } },
        { sheetId: 'sheet2', range: { startRow: 5, endRow: 8, startColumn: 6, endColumn: 7 } },
    ])('moves cells and table identity together to $sheetId at $range', async ({ sheetId, range }) => {
        const injector = univer.__getInjector();
        injector.get(SheetTableMoveController);
        injector.get(SheetTableRangeController);
        injector.get(SheetsTableThemeController);
        injector.get(SheetsTableController);
        const manager = injector.get(TableManager);
        const tableId = manager.addTable('test', 'sheet1', 'Orders', SOURCE_RANGE, ['Name', 'Amount']);
        const table = manager.getTableById('test', tableId)!;
        table.setTableMeta({ source: 'invoices' });
        table.getTableColumnByIndex(0)!.setMeta({ custom: true });
        table.getTableColumnByIndex(0)!.showFilterButton = false;
        const before = Tools.deepClone(table.toJSON());
        const values = workbook.getSheetBySheetId('sheet1')!.getRange(0, 0, 3, 1).getValues();
        const commands = injector.get(ICommandService);
        expect(await commands.executeCommand(MoveRangeCommand.id, {
            fromUnitId: 'test',
            fromSubUnitId: 'sheet1',
            fromRange: SOURCE_RANGE,
            toUnitId: 'test',
            toSubUnitId: sheetId,
            toRange: range,
        })).toBe(true);
        expect(manager.getTableById('test', tableId)).toBe(table);
        expect(table.toJSON()).toEqual({ ...before, range });
        expect(table.getSubunitId()).toBe(sheetId);
        expect(workbook.getSheetBySheetId(sheetId)!.getRange(range.startRow, range.startColumn, range.endRow, range.endColumn).getValues()).toEqual(values);
        expect(injector.get(IExclusiveRangeService).getExclusiveRanges('test', sheetId, FEATURE_TABLE_ID))
            .toEqual([{ groupId: tableId, range }]);
        expect(injector.get(SheetsTableController).getContainerTableWithRange('test', sheetId, range)).toBe(table);
        expect(injector.get(SheetRangeThemeService).getAppliedRangeThemeStyle({ unitId: 'test', subUnitId: sheetId, range }))
            .toBe(before.options.tableStyleId);
        if (sheetId !== 'sheet1') {
            expect(injector.get(IExclusiveRangeService).getExclusiveRanges('test', 'sheet1', FEATURE_TABLE_ID)).toEqual([]);
            expect(injector.get(SheetsTableController).getContainerTableWithRange('test', 'sheet1', SOURCE_RANGE)).toBeUndefined();
            expect(injector.get(SheetRangeThemeService).getAppliedRangeThemeStyle({ unitId: 'test', subUnitId: 'sheet1', range: SOURCE_RANGE }))
                .toBeUndefined();
        }
        const persisted = Tools.deepClone(manager.toJSON('test'));
        expect(persisted[sheetId].tables[0]).toEqual({ ...before, range });
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(table.toJSON()).toEqual(before);
        expect(table.getSubunitId()).toBe('sheet1');
        expect(workbook.getSheetBySheetId('sheet1')!.getRange(0, 0, 3, 1).getValues()).toEqual(values);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(manager.toJSON('test')).toEqual(persisted);
        manager.deleteUnitId('test');
        manager.fromJSON('test', persisted);
        expect(manager.getTableById('test', tableId)!.toJSON()).toEqual({ ...before, range });
        expect(manager.getTableById('test', tableId)!.getSubunitId()).toBe(sheetId);
    });

    it('moves multiple complete tables with their surrounding cells', async () => {
        const injector = univer.__getInjector();
        injector.get(SheetTableMoveController);
        const manager = injector.get(TableManager);
        const first = manager.addTable('test', 'sheet1', 'First', SOURCE_RANGE, ['Name', 'Amount']);
        const second = manager.addTable('test', 'sheet1', 'Second', { ...SOURCE_RANGE, startColumn: 3, endColumn: 4 }, ['Name', 'Amount']);
        const commands = injector.get(ICommandService);
        expect(await commands.executeCommand(MoveRangeCommand.id, {
            fromRange: { ...SOURCE_RANGE, endColumn: 4 },
            toRange: { startRow: 6, endRow: 9, startColumn: 5, endColumn: 9 },
        })).toBe(true);
        expect(manager.getTableById('test', first)!.getRange()).toEqual({ startRow: 6, endRow: 9, startColumn: 5, endColumn: 6 });
        expect(manager.getTableById('test', second)!.getRange()).toEqual({ startRow: 6, endRow: 9, startColumn: 8, endColumn: 9 });
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(manager.getTableById('test', first)!.getRange()).toEqual(SOURCE_RANGE);
        expect(manager.getTableById('test', second)!.getRange()).toEqual({ ...SOURCE_RANGE, startColumn: 3, endColumn: 4 });
    });

    it('preserves the calculated-column template when only a header and footer remain', async () => {
        const injector = univer.__getInjector();
        injector.get(SheetTableMoveController);
        const manager = injector.get(TableManager);
        const range = { ...SOURCE_RANGE, endRow: 1 };
        const id = manager.addTable('test', 'sheet1', 'Empty', range, ['Name', 'Amount'], undefined, { showFooter: true });
        const column = manager.getTableById('test', id)!.getTableColumnByIndex(1)!;
        column.formula = '=A2';
        workbook.getSheetBySheetId('sheet1')!.getCellMatrix().setValue(1, 1, { f: '=SUM(A1:A1)' });
        expect(await injector.get(ICommandService).executeCommand(MoveRangeCommand.id, {
            fromRange: range,
            toRange: { startRow: 5, endRow: 6, startColumn: 4, endColumn: 5 },
        })).toBe(true);
        expect(column.formula).toBe('=A2');
    });

    it('replays a cross-sheet movement changeset with the same persisted table identity', async () => {
        const injector = univer.__getInjector();
        injector.get(SheetTableMoveController);
        const manager = injector.get(TableManager);
        manager.addTable('test', 'sheet1', 'Orders', SOURCE_RANGE, ['Name', 'Amount'], 'orders');
        const originalCells = Tools.deepClone(workbook.getSnapshot());
        const originalTables = Tools.deepClone(manager.toJSON('test'));
        const mutations: IMutationInfo[] = [];
        const commands = injector.get(ICommandService);
        const listener = commands.onCommandExecuted((command) => {
            if (command.type === CommandType.MUTATION && command.params) {
                mutations.push({ id: command.id, type: CommandType.MUTATION, params: Tools.deepClone(command.params) });
            }
        });
        expect(await commands.executeCommand(MoveRangeCommand.id, {
            fromRange: SOURCE_RANGE,
            toSubUnitId: 'sheet2',
            toRange: { startRow: 5, endRow: 8, startColumn: 4, endColumn: 5 },
        })).toBe(true);
        listener.dispose();
        const instances = injector.get(IUniverInstanceService);
        const peer = instances.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            ...originalCells,
            id: 'peer',
        }, { makeCurrent: false });
        manager.fromJSON('peer', originalTables);
        for (const mutation of mutations) {
            expect(commands.syncExecuteCommand(mutation.id, {
                ...mutation.params,
                unitId: 'peer',
            }, { fromChangeset: true })).toBe(true);
        }
        expect(manager.toJSON('peer')).toEqual(manager.toJSON('test'));
        expect(peer.getSheetBySheetId('sheet1')!.getCellMatrix().getMatrix())
            .toEqual(workbook.getSheetBySheetId('sheet1')!.getCellMatrix().getMatrix());
        expect(peer.getSheetBySheetId('sheet2')!.getCellMatrix().getMatrix())
            .toEqual(workbook.getSheetBySheetId('sheet2')!.getCellMatrix().getMatrix());
    });

    it('moves filtered rows to the destination and clears the old worksheet cache on undo and redo', async () => {
        const injector = univer.__getInjector();
        injector.get(SheetTableMoveController);
        injector.get(TableFilterController);
        const manager = injector.get(TableManager);
        const id = manager.addTable('test', 'sheet1', 'Orders', SOURCE_RANGE, ['Name', 'Amount']);
        manager.addFilter('test', id, 0, { filterType: TableColumnFilterTypeEnum.manual, values: ['A'] });
        const source = workbook.getSheetBySheetId('sheet1')!;
        const target = workbook.getSheetBySheetId('sheet2')!;
        expect(source.getRowFiltered(2)).toBe(true);
        expect(source.getRowFiltered(3)).toBe(true);
        const commands = injector.get(ICommandService);
        expect(await commands.executeCommand(MoveRangeCommand.id, {
            fromRange: SOURCE_RANGE,
            toSubUnitId: 'sheet2',
            toRange: { startRow: 5, endRow: 8, startColumn: 4, endColumn: 5 },
        })).toBe(true);
        expect(source.getRowFiltered(2)).toBe(false);
        expect(source.getRowFiltered(3)).toBe(false);
        expect(target.getRowFiltered(6)).toBe(false);
        expect(target.getRowFiltered(7)).toBe(true);
        expect(target.getRowFiltered(8)).toBe(true);
        expect(manager.toJSON('test').sheet2.tableFilteredOutRows).toEqual([7, 8]);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(source.getRowFiltered(2)).toBe(true);
        expect(target.getRowFiltered(7)).toBe(false);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(source.getRowFiltered(2)).toBe(false);
        expect(target.getRowFiltered(7)).toBe(true);
    });

    it.each([
        { name: 'partial table outside its range', sheetId: 'sheet1', fromRange: { ...SOURCE_RANGE, startRow: 1 }, toRange: { startRow: 6, endRow: 8, startColumn: 5, endColumn: 6 } },
        { name: 'partial table across sheets', sheetId: 'sheet2', fromRange: { ...SOURCE_RANGE, startRow: 1 }, toRange: { startRow: 6, endRow: 8, startColumn: 5, endColumn: 6 } },
        { name: 'partial header', sheetId: 'sheet1', fromRange: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }, toRange: { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 } },
        { name: 'cells into a table header', sheetId: 'sheet1', fromRange: { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 }, toRange: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } },
    ])('moves $name as ordinary cells without relocating the table', async ({ sheetId, fromRange, toRange }) => {
        const injector = univer.__getInjector();
        injector.get(SheetTableMoveController);
        const manager = injector.get(TableManager);
        manager.addTable('test', 'sheet1', 'Orders', SOURCE_RANGE, ['Name', 'Amount']);
        const before = Tools.deepClone(workbook.getSnapshot());
        const tables = Tools.deepClone(manager.toJSON('test'));
        const source = workbook.getSheetBySheetId('sheet1')!;
        const values = source.getRange(fromRange.startRow, fromRange.startColumn, fromRange.endRow, fromRange.endColumn).getValues();
        const commands = injector.get(ICommandService);
        expect(await commands.executeCommand(MoveRangeCommand.id, { fromRange, toRange, toSubUnitId: sheetId })).toBe(true);
        expect(workbook.getSheetBySheetId(sheetId)!.getRange(toRange.startRow, toRange.startColumn, toRange.endRow, toRange.endColumn).getValues()).toEqual(values);
        expect(manager.toJSON('test')).toEqual(tables);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(workbook.getSnapshot()).toEqual(before);
        expect(manager.toJSON('test')).toEqual(tables);
    });

    it('rejects a complete table overlapping another table without moving cells or creating history', async () => {
        const injector = univer.__getInjector();
        injector.get(SheetTableMoveController);
        const manager = injector.get(TableManager);
        manager.addTable('test', 'sheet1', 'Orders', SOURCE_RANGE, ['Name', 'Amount']);
        const toRange = { startRow: 6, endRow: 9, startColumn: 5, endColumn: 6 };
        manager.addTable('test', 'sheet1', 'Other', toRange, ['Name', 'Amount']);
        const before = Tools.deepClone(workbook.getSnapshot());
        const tables = Tools.deepClone(manager.toJSON('test'));
        const history = injector.get(IUndoRedoService).getUndoRedoStatus('test');
        expect(await injector.get(ICommandService).executeCommand(MoveRangeCommand.id, { fromRange: SOURCE_RANGE, toRange })).toBe(false);
        expect(workbook.getSnapshot()).toEqual(before);
        expect(manager.toJSON('test')).toEqual(tables);
        expect(injector.get(IUndoRedoService).getUndoRedoStatus('test')).toEqual(history);
    });

    it('allows body edits and rejects migration to a protected worksheet', async () => {
        const injector = univer.__getInjector();
        injector.get(SheetTableMoveController);
        const manager = injector.get(TableManager);
        const id = manager.addTable('test', 'sheet1', 'Orders', SOURCE_RANGE, ['Name', 'Amount']);
        const commands = injector.get(ICommandService);
        expect(await commands.executeCommand(MoveRangeCommand.id, {
            fromRange: { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 },
            toRange: { startRow: 2, endRow: 2, startColumn: 0, endColumn: 0 },
        })).toBe(true);
        expect(manager.getTableById('test', id)!.getRange()).toEqual(SOURCE_RANGE);
        injector.get(IPermissionService).updatePermissionPoint(new WorksheetEditPermission('test', 'sheet2').id, false);
        expect(await commands.executeCommand(MoveRangeCommand.id, {
            fromRange: SOURCE_RANGE,
            toSubUnitId: 'sheet2',
            toRange: SOURCE_RANGE,
        })).toBe(false);
        expect(manager.getTableById('test', id)!.getSubunitId()).toBe('sheet1');
    });
});
