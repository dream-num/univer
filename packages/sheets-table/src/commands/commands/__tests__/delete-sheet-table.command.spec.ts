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

import type { IWorkbookData } from '@univerjs/core';
import {
    Direction,
    FilterSelectionMode,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RecordValueType,
    RedoCommand,
    Tools,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { InsertColCommand, SetRangeValuesCommand, UniverSheetsPlugin } from '@univerjs/sheets';
import sheetsEnUS from '@univerjs/sheets/locale/en-US';
import { describe, expect, it } from 'vitest';
import type { ITableJson } from '../../../types/type';
import { PLUGIN_NAME } from '../../../const';
import enUS from '../../../locale/en-US';
import { TableManager } from '../../../models/table-manager';
import { UniverSheetsTablePlugin } from '../../../plugin';
import { SheetsTableSortStateEnum, TableColumnDataTypeEnum, TableColumnFilterTypeEnum } from '../../../types/enum';
import { DeleteSheetTableCommand } from '../delete-sheet-table.command';
import { SetSheetTableFilterCommand } from '../set-table-filter.command';

function initialData(tableStyleId?: string): IWorkbookData {
    const table: ITableJson = {
        id: 'orders',
        name: 'SalesData',
        range: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 },
        options: { showHeader: true, showFooter: false, showAutoFilter: true, tableStyleId },
        meta: { owner: 'sales' },
        columns: [
            {
                id: 'status',
                displayName: 'Status',
                dataType: TableColumnDataTypeEnum.String,
                formula: '',
                meta: { role: 'selector' },
                style: { bl: 1 },
                showFilterButton: false,
            },
            {
                id: 'amount',
                displayName: 'Column9',
                dataType: TableColumnDataTypeEnum.Number,
                formula: '=2*3',
                formulaIsArray: false,
                totalsRowLabel: 'Amount',
                totalsRowFunction: 'sum',
                totalsRowFormula: '=SUM(SalesData[Column9])',
                meta: { role: 'amount' },
                style: { it: 1 },
            },
        ],
        filters: {
            tableColumnFilterList: [{ filterType: TableColumnFilterTypeEnum.record, mode: FilterSelectionMode.Include, values: [{ type: RecordValueType.String, value: 'Done' }] }],
            tableSortInfo: { columnIndex: 1, sortState: SheetsTableSortStateEnum.Asc },
        },
    };
    return {
        id: 'unit',
        name: 'Orders',
        appVersion: '3.0.0',
        locale: LocaleType.EN_US,
        styles: {},
        sheetOrder: ['source'],
        sheets: {
            source: {
                id: 'source',
                name: 'Source',
                rowCount: 20,
                columnCount: 10,
                cellData: {
                    0: { 0: { v: 'Status' } },
                    1: { 0: { v: 'Done' }, 1: { f: '=2*3' } },
                    2: { 0: { v: 'Pending' }, 1: { f: '=2*3' } },
                    8: { 8: { v: 'outside' } },
                },
            },
        },
        resources: [{ name: PLUGIN_NAME, data: JSON.stringify({ source: { tables: [table], tableFilteredOutRows: [2] } }) }],
    };
}

describe('DeleteSheetTableCommand', () => {
    it.each([
        { style: undefined, insert: false },
        { style: 'table-default-2', insert: false },
        { style: undefined, insert: true },
        { style: 'table-default-2', insert: true },
    ])('restores the complete table before publishing add and recomputes its filter ($style, inserted=$insert)', async ({ style, insert }) => {
        const univer = new Univer();
        try {
            const injector = univer.__getInjector();
            const locale = injector.get(LocaleService);
            locale.load({ [LocaleType.EN_US]: { ...sheetsEnUS, ...enUS } });
            locale.setLocale(LocaleType.EN_US);
            locale.setDirection('ltr');
            univer.registerPlugin(UniverFormulaEnginePlugin);
            univer.registerPlugin(UniverSheetsPlugin);
            univer.registerPlugin(UniverSheetsTablePlugin);
            univer.createUnit(UniverInstanceType.UNIVER_SHEET, initialData(style));
            const instances = injector.get(IUniverInstanceService);
            instances.focusUnit('unit');
            const manager = injector.get(TableManager);
            const commands = injector.get(ICommandService);
            if (insert) {
                expect(await commands.executeCommand(InsertColCommand.id, {
                    unitId: 'unit',
                    subUnitId: 'source',
                    direction: Direction.LEFT,
                    range: { startRow: 0, endRow: 19, startColumn: 1, endColumn: 1 },
                })).toBe(true);
            }
            const table = manager.getTable('unit', 'orders')!;
            const before = Tools.deepClone({ ...table.toJSON(), columns: table.getTableInfo().columns });
            expect(before.columns.map((column) => column.id)).toEqual(insert ? ['status', expect.any(String), 'amount'] : ['status', 'amount']);
            if (insert) {
                expect(before.columns[1].id).not.toBe('status');
                expect(before.columns[1].id).not.toBe('amount');
            }
            expect(manager.getTable('unit', 'orders')!.getTableFilters().getFilterOutRows()).toEqual(new Set([2]));
            const additions: ITableJson[] = [];
            const publishedFilters: Set<number>[] = [];
            const subscription = manager.tableAdd$.subscribe(() => {
                const table = manager.getTable('unit', 'orders')!;
                additions.push(Tools.deepClone(table.toJSON()));
                publishedFilters.push(new Set(table.getTableFilters().getFilterOutRows()));
            });
            try {
                expect(commands.syncExecuteCommand(DeleteSheetTableCommand.id, { unitId: 'unit', subUnitId: 'source', tableId: 'orders' })).toBe(true);
                expect(manager.getTable('unit', 'orders')).toBeUndefined();
                expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(true);
                expect(additions).toEqual([before]);
                expect(publishedFilters).toEqual([new Set([2])]);
                expect(manager.getTable('unit', 'orders')!.toJSON()).toEqual(before);
                expect(manager.getTable('unit', 'orders')!.getTableInfo().columns).toEqual(before.columns);
                expect(manager.getTable('unit', 'orders')!.getTableFilters().getFilterOutRows()).toEqual(new Set([2]));
                expect(commands.syncExecuteCommand(RedoCommand.id)).toBe(true);
                expect(manager.getTable('unit', 'orders')).toBeUndefined();
                expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(true);
                expect(manager.getTable('unit', 'orders')!.toJSON()).toEqual(before);
                expect(commands.syncExecuteCommand(SetRangeValuesCommand.id, { unitId: 'unit', subUnitId: 'source', range: { startRow: 2, endRow: 2, startColumn: 0, endColumn: 0 }, value: { v: 'Done' } })).toBe(true);
                expect(commands.syncExecuteCommand(SetSheetTableFilterCommand.id, {
                    unitId: 'unit',
                    subUnitId: 'source',
                    tableId: 'orders',
                    column: 0,
                    tableFilter: { filterType: TableColumnFilterTypeEnum.record, mode: FilterSelectionMode.Include, values: [{ type: RecordValueType.String, value: 'Done' }] },
                })).toBe(true);
                expect(manager.getTable('unit', 'orders')!.getTableFilters().getFilterOutRows()).toEqual(new Set());
                expect(manager.getTable('unit', 'orders')!.toJSON()).toEqual(before);
            } finally {
                subscription.unsubscribe();
            }
        } finally {
            univer.dispose();
        }
    });
});
