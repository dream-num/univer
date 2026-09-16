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

import {
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
import { FUniver } from '@univerjs/core/facade';
import {
    DefinedNamesService,
    FormulaDataModel,
    IDefinedNamesService,
    LexerTreeBuilder,
} from '@univerjs/engine-formula';
import {
    RangeProtectionRuleModel,
    SetRangeValuesMutation,
    SheetInterceptorService,
    SheetsSelectionsService,
    WorkbookEditablePermission,
    WorksheetEditPermission,
} from '@univerjs/sheets';
import {
    SetSheetTableCommand,
    SetSheetTableMutation,
    TableColumnFilterTypeEnum,
    TableManager,
} from '@univerjs/sheets-table';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import enUS from '../../../locale/en-US';
import { SheetTableSettingsDialog } from '../SheetTableSettingsDialog';
import '@univerjs/sheets/facade';
import '@univerjs/sheets-table/facade';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it('saves filter button settings through the command pipeline, supports undo and round trips, and rejects stale columns', async () => {
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.add([TableManager]);
    injector.add([LexerTreeBuilder]);
    injector.add([FormulaDataModel]);
    injector.add([RangeProtectionRuleModel]);
    injector.add([SheetInterceptorService]);
    injector.add([SheetsSelectionsService]);
    injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);
    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: enUS });
    localeService.setLocale(LocaleType.EN_US);
    univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
        id: 'book',
        sheetOrder: ['sheet'],
        sheets: { sheet: { id: 'sheet', name: 'Sheet', rowCount: 20, columnCount: 10 } },
    });
    injector.get(IUniverInstanceService).focusUnit('book');
    const manager = injector.get(TableManager);
    const commands = injector.get(ICommandService);
    commands.registerCommand(SetSheetTableCommand);
    commands.registerCommand(SetRangeValuesMutation);
    commands.registerCommand(SetSheetTableMutation);
    manager.addTable('book', 'sheet', 'Orders', { startRow: 0, endRow: 3, startColumn: 0, endColumn: 1 }, ['Product', 'Amount'], 'orders');
    const table = manager.getTableById('book', 'orders')!;
    const firstColumn = table.getTableColumnByIndex(0)!.id;
    const lastColumn = table.getTableColumnByIndex(1)!.id;
    table.getTableFilters().setFilterOutRows([2]);
    table.getTableFilters().setColumnFilter(1, { filterType: TableColumnFilterTypeEnum.manual, values: ['10'] });
    const initialFilters = table.getTableFilters().toJSON();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    let closed = 0;
    const worksheet = FUniver.newAPI(injector).getActiveWorkbook()!.getActiveSheet();

    try {
        act(() => root.render(
            <RediContext.Provider value={{ injector }}>
                <SheetTableSettingsDialog unitId="book" tableId="orders" onClose={() => { closed++; }} />
            </RediContext.Provider>
        ));
        const initialPermissions = injector.get(IPermissionService);
        initialPermissions.addPermissionPoint(new WorkbookEditablePermission('book'));
        initialPermissions.addPermissionPoint(new WorksheetEditPermission('book', 'sheet'));
        const input = container.querySelector('input:not([type="checkbox"])') as HTMLInputElement;
        act(() => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, '=$B2');
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        const applyButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent === 'Apply to entire column')!;
        act(() => applyButton.click());
        expect(worksheet.getRange('A2:A4').getFormulas()).toEqual([['=$B2'], ['=$B3'], ['=$B4']]);
        expect(table.getColumn(firstColumn)!.formula).toBe('=$B2');
        expect(worksheet.getRange('A1').getFormula()).toBe('');
        const checkboxes = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
        act(() => checkboxes[2].click());
        expect(table.getColumn(lastColumn)!.isShowFilterButton()).toBe(true);
        act(() => checkboxes[0].click());
        expect(checkboxes[1].disabled).toBe(true);
        const confirm = Array.from(container.querySelectorAll('button')).find((button) => button.textContent === 'Confirm')!;
        await act(async () => confirm.click());
        expect(closed).toBe(1);
        expect(table.isShowAutoFilter()).toBe(false);
        expect(table.getColumn(firstColumn)!.isShowFilterButton()).toBe(true);
        expect(table.getColumn(lastColumn)!.isShowFilterButton()).toBe(false);
        expect(table.getTableFilters().toJSON()).toEqual(initialFilters);
        expect(Array.from(table.getTableFilters().getFilterOutRows()!)).toEqual([2]);

        await commands.executeCommand(UndoCommand.id);
        expect(table.isShowAutoFilter()).toBe(true);
        expect(table.getColumn(lastColumn)!.isShowFilterButton()).toBe(true);
        await commands.executeCommand(RedoCommand.id);
        expect(table.isShowAutoFilter()).toBe(false);
        expect(table.getColumn(lastColumn)!.isShowFilterButton()).toBe(false);
        const saved = JSON.parse(JSON.stringify(manager.toJSON('book')));
        manager.fromJSON('book', saved);
        const restored = manager.getTableById('book', 'orders')!;
        expect(restored.isShowAutoFilter()).toBe(false);
        expect(restored.getColumn(lastColumn)!.isShowFilterButton()).toBe(false);
        expect(JSON.stringify(restored.getTableFilters().toJSON())).toBe(JSON.stringify(initialFilters));
        expect(Array.from(restored.getTableFilters().getFilterOutRows()!)).toEqual([2]);
        let mutationCompleted = false;
        const listener = commands.onCommandExecuted((command) => {
            if (command.id === SetSheetTableMutation.id) {
                mutationCompleted = true;
            }
        });
        try {
            const success: boolean = worksheet.setTableFilterButtons('orders', { showAutoFilter: true });
            expect(success).toBe(true);
            expect(mutationCompleted).toBe(true);
        } finally {
            listener.dispose();
        }
        expect(restored.isShowAutoFilter()).toBe(true);
        expect(restored.getColumn(lastColumn)!.isShowFilterButton()).toBe(false);
        expect(worksheet.setTableFilterButtons('orders', {
            showAutoFilter: false,
            columns: { missing: false },
        })).toBe(false);
        expect(restored.isShowAutoFilter()).toBe(true);
        expect(worksheet.setTableFilterButtons('missing', { showAutoFilter: false })).toBe(false);
        const permissions = injector.get(IPermissionService);
        permissions.addPermissionPoint(new WorkbookEditablePermission('book'));
        permissions.addPermissionPoint(new WorksheetEditPermission('book', 'sheet'));
        const dataRange = worksheet.getRange('B2:B4');
        commands.syncExecuteCommand(SetRangeValuesMutation.id, {
            unitId: 'book',
            subUnitId: 'sheet',
            cellValue: { 1: { 1: { v: 10 } }, 2: { 1: { v: 20 } }, 3: { 1: { v: 30 } } },
        });
        const oldCells = dataRange.getValues();
        expect(worksheet.setTableColumnFormula('orders', lastColumn, '=A2*2')).toBe(true);
        expect(dataRange.getFormulas()).toEqual([['=A2*2'], ['=A3*2'], ['=A4*2']]);
        expect(restored.getColumn(lastColumn)!.formula).toBe('=A2*2');
        await commands.executeCommand(UndoCommand.id);
        expect(dataRange.getValues()).toEqual(oldCells);
        expect(restored.getColumn(lastColumn)!.formula).toBe('');
        await commands.executeCommand(RedoCommand.id);
        expect(dataRange.getFormulas()).toEqual([['=A2*2'], ['=A3*2'], ['=A4*2']]);
        expect(worksheet.setTableColumnFormula('orders', lastColumn, '')).toBe(true);
        expect(restored.getColumn(lastColumn)!.formula).toBe('');
        expect(dataRange.getFormulas()).toEqual([['=A2*2'], ['=A3*2'], ['=A4*2']]);
        await commands.executeCommand(UndoCommand.id);
        expect(restored.getColumn(lastColumn)!.formula).toBe('=A2*2');
        expect(worksheet.setTableColumnFormula('orders', 'missing', '=1')).toBe(false);
        expect(worksheet.setTableColumnFormula('orders', lastColumn, '=')).toBe(false);
        manager.addTable('book', 'sheet', 'Totals', { startRow: 6, endRow: 9, startColumn: 0, endColumn: 1 }, ['Item', 'Total'], 'totals', { showFooter: true });
        const totalsColumn = manager.getTableById('book', 'totals')!.getTableColumnByIndex(1)!.id;
        expect(worksheet.setTableColumnFormula('totals', totalsColumn, '=A8')).toBe(true);
        expect(worksheet.getRange('B7:B10').getFormulas()).toEqual([[''], ['=A8'], ['=A9'], ['']]);
        permissions.updatePermissionPoint(new WorksheetEditPermission('book', 'sheet').id, false);
        expect(worksheet.setTableColumnFormula('orders', lastColumn, '=1')).toBe(false);
        permissions.updatePermissionPoint(new WorksheetEditPermission('book', 'sheet').id, true);
        const editable = new WorkbookEditablePermission('book');
        permissions.addPermissionPoint(editable);
        permissions.updatePermissionPoint(editable.id, false);
        expect(worksheet.setTableFilterButtons('orders', { showAutoFilter: false })).toBe(false);
        expect(restored.isShowAutoFilter()).toBe(true);
        manager.fromJSON('book', JSON.parse(JSON.stringify(manager.toJSON('book'))));
        expect(manager.getTableById('book', 'orders')!.getColumn(lastColumn)!.formula).toBe('=A2*2');
    } finally {
        act(() => root.unmount());
        container.remove();
        univer.dispose();
    }
});
