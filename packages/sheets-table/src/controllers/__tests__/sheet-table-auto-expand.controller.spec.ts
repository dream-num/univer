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

import type { ICellData, IWorkbookData, Workbook } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IPermissionService,
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
    ExclusiveRangeService,
    IExclusiveRangeService,
    INumfmtService,
    NumfmtService,
    RangeProtectionRuleModel,
    SetNumfmtMutation,
    SetRangeValuesCommand,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SheetInterceptorService,
    SheetsSelectionsService,
    WorkbookEditablePermission,
    WorksheetEditPermission,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ApplyTableAutoExpandMutation } from '../../commands/mutations/apply-table-auto-expand.mutation';
import enUS from '../../locale/en-US';
import { TableManager } from '../../models/table-manager';
import { UniverSheetsTablePlugin } from '../../plugin';
import { SheetTableAutoExpandService } from '../../services/table-auto-expand.service';
import { TableColumnFilterTypeEnum } from '../../types/enum';
import { SheetTableAutoExpandController } from '../sheet-table-auto-expand.controller';

const original = { startRow: 2, endRow: 5, startColumn: 2, endColumn: 4 };

describe('SheetTableAutoExpandController', () => {
    let univer: Univer;
    let workbook: Workbook;
    let manager: TableManager;
    let commands: ICommandService;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([TableManager]);
        injector.add([INumfmtService, { useClass: NumfmtService }]);
        injector.add([SheetsSelectionsService]);
        injector.add([SheetInterceptorService]);
        injector.add([SheetTableAutoExpandController]);
        injector.add([RangeProtectionRuleModel]);
        injector.add([IExclusiveRangeService, { useClass: ExclusiveRangeService }]);
        injector.add([SheetTableAutoExpandService]);
        const locale = injector.get(LocaleService);
        locale.load({ enUS });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'book',
            name: 'Auto expansion',
            appVersion: '1.0.0',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['sheet'],
            sheets: { sheet: { id: 'sheet', name: 'Sheet', rowCount: 20, columnCount: 15, cellData: {} } },
        });
        const permissions = injector.get(IPermissionService);
        permissions.addPermissionPoint(new WorkbookEditablePermission('book'));
        permissions.addPermissionPoint(new WorksheetEditPermission('book', 'sheet'));
        injector.get(IUniverInstanceService).focusUnit('book');
        manager = injector.get(TableManager);
        manager.addTable('book', 'sheet', 'Orders', original, ['Item', 'Qty', 'Total'], 'orders');
        commands = injector.get(ICommandService);
        [SetRangeValuesCommand, SetRangeValuesMutation, SetNumfmtMutation, SetSelectionsOperation, ApplyTableAutoExpandMutation].forEach((command) => commands.registerCommand(command));
        injector.get(SheetTableAutoExpandController);
    });

    afterEach(() => univer.dispose());

    function input(row = 6, col = 2, source: 'editor' | null = 'editor', value: ICellData = { v: 'New' }) {
        return commands.syncExecuteCommand(SetRangeValuesCommand.id, { unitId: 'book', subUnitId: 'sheet', range: { startRow: row, endRow: row, startColumn: col, endColumn: col }, value, valueChangeSource: source ?? undefined });
    }

    it('expands editor input and undoes/redoes the input and range together', async () => {
        expect(input()).toBe(true);
        expect(manager.getTable('book', 'orders')!.getRange().endRow).toBe(6);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(manager.getTable('book', 'orders')!.getRange()).toEqual(original);
        expect(workbook.getActiveSheet()!.getCellRaw(6, 2)?.v).toBeFalsy();
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(manager.getTable('book', 'orders')!.getRange().endRow).toBe(6);
        expect(workbook.getActiveSheet()!.getCellRaw(6, 2)?.v).toBe('New');
    });

    it('routes successful envelopes to the sheet collaboration unit without broadcasting a rejected group', () => {
        const sent: unknown[] = [];
        commands.onMutationExecutedForCollab((command, options) => {
            if (command.id === ApplyTableAutoExpandMutation.id && !options?.onlyLocal) sent.push(command.params);
        });
        expect(input()).toBe(true);
        expect(sent).toMatchObject([{ unitId: 'book', subUnitId: 'sheet', direction: 'redo' }]);
        univer.__getInjector().get(SheetTableAutoExpandService).registerContribution({ id: 'failure', getMutations: () => ({ redos: [{ id: 'missing-effect', params: { unitId: 'book', subUnitId: 'sheet' } }], undos: [] }) });
        expect(input(7)).toBe(true);
        expect(sent).toHaveLength(1);
    });

    it('prepares editor effects with final native number-format writes and the original input snapshot', () => {
        const interceptor = univer.__getInjector().get(SheetInterceptorService);
        const formatted = { startRow: 6, endRow: 6, startColumn: 3, endColumn: 3 };
        interceptor.interceptCommand({ getMutations: () => ({ redos: [{ id: SetNumfmtMutation.id, params: { unitId: 'book', subUnitId: 'sheet', values: { 0: { ranges: [formatted] } }, refMap: { 0: { pattern: '0%' } } } }], undos: [] }) });
        let captured = false;
        interceptor.interceptValueChange((context) => {
            captured = true;
            expect(context.beforeCells[6][2]).toBeNull();
            expect(context.explicitStyleRanges).toEqual([formatted]);
            return [];
        });
        expect(input()).toBe(true);
        expect(captured).toBe(true);
    });

    it('appends columns on the right with stable metadata through undo/redo', async () => {
        expect(input(3, 5)).toBe(true);
        const table = manager.getTable('book', 'orders')!;
        expect(table.getRange().endColumn).toBe(5);
        const id = table.getTableInfo().columns[3].id;
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(table.getTableInfo().columns[3].id).toBe(id);
    });

    it('keeps an appended row visible until the existing Table filter is explicitly refreshed', () => {
        const table = manager.getTable('book', 'orders')!;
        table.setTableFilterColumn(0, { filterType: TableColumnFilterTypeEnum.manual, values: ['Keep'] });
        const filters = table.getTableFilters();
        filters.doFilter(workbook.getActiveSheet()!, table.getTableFilterRange());
        expect(input()).toBe(true);
        expect(filters.getFilterOutRows().has(6)).toBe(false);
        filters.doFilter(workbook.getActiveSheet()!, table.getTableFilterRange());
        expect(filters.getFilterOutRows().has(6)).toBe(true);
    });

    it('leaves facade-style calls, clearing and formatting without automatic expansion', () => {
        expect(input(6, 2, null)).toBe(true);
        expect(input(6, 2, 'editor', { v: null, f: null, p: null })).toBe(true);
        expect(input(6, 2, 'editor', { s: { bl: 1 } })).toBe(true);
        expect(manager.getTable('book', 'orders')!.getRange()).toEqual(original);
    });

    it('retains legal input and its undo history when a contribution fails', async () => {
        commands.registerCommand({ id: 'sheet.mutation.failing-contribution', type: CommandType.MUTATION, handler: () => false });
        univer.__getInjector().get(SheetTableAutoExpandService).registerContribution({ id: 'failure', getMutations: () => ({ redos: [{ id: 'sheet.mutation.failing-contribution', params: { unitId: 'book', subUnitId: 'sheet' } }], undos: [] }) });
        expect(input()).toBe(true);
        expect(manager.getTable('book', 'orders')!.getRange()).toEqual(original);
        expect(workbook.getActiveSheet()!.getCellRaw(6, 2)?.v).toBe('New');
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(workbook.getActiveSheet()!.getCellRaw(6, 2)?.v).toBeFalsy();
    });

    it('does not compensate unexecuted contributions or lose input history when expansion fails', async () => {
        let uncreatedCompensations = 0;
        commands.registerCommand({ id: 'test.mutation.reject-resource', type: CommandType.MUTATION, handler: () => false });
        commands.registerCommand({ id: 'test.mutation.remove-uncreated-resource', type: CommandType.MUTATION, handler: () => {
            uncreatedCompensations++;
            return false;
        } });
        const service = univer.__getInjector().get(SheetTableAutoExpandService);
        service.registerContribution({ id: 'first', getMutations: () => ({
            redos: [{ id: SetRangeValuesMutation.id, params: { unitId: 'book', subUnitId: 'sheet', cellValue: { 6: { 4: { f: '=D7*10' } } } } }],
            undos: [{ id: SetRangeValuesMutation.id, params: { unitId: 'book', subUnitId: 'sheet', cellValue: { 6: { 4: { f: null } } } } }],
        }) });
        service.registerContribution({ id: 'second', getMutations: () => ({
            redos: [{ id: 'test.mutation.reject-resource', params: { unitId: 'book', subUnitId: 'sheet' } }],
            undos: [{ id: 'test.mutation.remove-uncreated-resource', params: { unitId: 'book', subUnitId: 'sheet' } }],
        }) });
        expect(input()).toBe(true);
        expect(uncreatedCompensations).toBe(0);
        expect(workbook.getActiveSheet()!.getCellRaw(6, 4)?.f).toBeFalsy();
        expect(manager.getTable('book', 'orders')!.getRange()).toEqual(original);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(workbook.getActiveSheet()!.getCellRaw(6, 2)?.v).toBeFalsy();
    });
    it('keeps legal input when preparing an optional contribution throws', async () => {
        univer.__getInjector().get(SheetTableAutoExpandService).registerContribution({ id: 'throws', getMutations: () => {
            throw new Error('Unavailable optional extension');
        } });
        expect(input()).toBe(true);
        expect(manager.getTable('book', 'orders')!.getRange()).toEqual(original);
        expect(workbook.getActiveSheet()!.getCellRaw(6, 2)?.v).toBe('New');
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(workbook.getActiveSheet()!.getCellRaw(6, 2)?.v).toBeFalsy();
    });
});

describe('Table auto expansion plugin lifecycle', () => {
    it('activates automatic expansion through normal plugin setup', () => {
        const app = new Univer();
        try {
            const locale = app.__getInjector().get(LocaleService);
            locale.load({ enUS });
            locale.setLocale(LocaleType.EN_US);
            locale.setDirection('ltr');
            app.registerPlugin(UniverFormulaEnginePlugin);
            app.registerPlugin(UniverSheetsTablePlugin);
            const book = app.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
                id: 'lifecycle',
                name: 'Lifecycle',
                appVersion: '1',
                locale: LocaleType.EN_US,
                styles: {},
                sheetOrder: ['sheet'],
                sheets: { sheet: { id: 'sheet', name: 'Sheet', rowCount: 20, columnCount: 15, cellData: {} } },
            });
            const injector = app.__getInjector();
            injector.get(TableManager).addTable('lifecycle', 'sheet', 'Orders', original, ['A', 'B', 'C'], 'orders');
            expect(injector.get(ICommandService).syncExecuteCommand(SetRangeValuesCommand.id, {
                unitId: book.getUnitId(),
                subUnitId: 'sheet',
                range: { startRow: 6, endRow: 6, startColumn: 2, endColumn: 2 },
                value: { v: 'New' },
                valueChangeSource: 'editor',
            })).toBe(true);
            expect(injector.get(TableManager).getTable('lifecycle', 'orders')!.getRange().endRow).toBe(6);
        } finally {
            app.dispose();
        }
    });
});
