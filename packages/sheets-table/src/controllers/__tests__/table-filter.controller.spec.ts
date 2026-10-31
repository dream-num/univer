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
    BooleanNumber,
    DateSystem,
    ICommandService,
    IConfigService,
    IResourceLoaderService,
    IUniverInstanceService,
    LifecycleService,
    LifecycleStages,
    LocaleService,
    LocaleType,
    RedoCommand,
    toDisposable,
    Tools,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { ISheetRowFilteredService, SheetRowFilteredService } from '@univerjs/engine-formula';
import {
    CopySheetCommand,
    INTERCEPTOR_POINT,
    SheetInterceptorService,
    SheetLazyExecuteScheduleService,
    SheetRangeThemeModel,
    SHEETS_PLUGIN_CONFIG_KEY,
    ZebraCrossingCacheController,
} from '@univerjs/sheets';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import formulaEnUS from '@univerjs/sheets-formula/locale/en-US';
import sheetsEnUS from '@univerjs/sheets/locale/en-US';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ITableJson } from '../../types/type';
import { DeleteSheetTableCommand } from '../../commands/commands/delete-sheet-table.command';
import { SetSheetTableCommand } from '../../commands/commands/set-sheet-table.command';
import { SetSheetTableFilterCommand } from '../../commands/commands/set-table-filter.command';
import { AddSheetTableMutation } from '../../commands/mutations/add-sheet-table.mutation';
import { DeleteSheetTableMutation } from '../../commands/mutations/delete-sheet-table.mutation';
import { SetSheetTableFilterMutation } from '../../commands/mutations/set-table-filter.mutation';
import { PLUGIN_NAME } from '../../const';
import enUS from '../../locale/en-US';
import { TableManager } from '../../models/table-manager';
import { UniverSheetsTablePlugin } from '../../plugin';
import { SheetTableService } from '../../services/table.service';
import { TableColumnFilterTypeEnum } from '../../types/enum';
import { TableFilterController } from '../table-filter.controller';
import '@univerjs/engine-formula/facade';
import '@univerjs/sheets/facade';
import '@univerjs/sheets-formula/facade';
import '../../facade/f-workbook';
import '../../facade/f-worksheet';

function getComparableSnapshot(snapshot: IWorkbookData, table: ITableJson) {
    const result = Tools.deepClone(snapshot);
    const themeResource = result.resources?.find((resource) => resource.name === 'SHEET_RANGE_THEME_MODEL_PLUGIN');
    if (themeResource) {
        const theme: Parameters<SheetRangeThemeModel['fromJSON']>[1] = JSON.parse(themeResource.data);
        const derivedRules = [];
        for (const [id, rule] of Object.entries(theme.rangeThemeStyleRuleMap)) {
            const { rangeInfo, themeName } = rule;
            const range = rangeInfo.range;
            if (rangeInfo.unitId === snapshot.id && rangeInfo.subUnitId === 'orders'
                && themeName === table.options.tableStyleId
                && range.startRow === table.range.startRow && range.endRow === table.range.endRow
                && range.startColumn === table.range.startColumn && range.endColumn === table.range.endColumn) {
                derivedRules.push(rule);
                delete theme.rangeThemeStyleRuleMap[id];
            }
        }
        expect(derivedRules).toHaveLength(1);
        // Only this resized Table re-registers its derived rule with a fresh key.
        themeResource.data = JSON.stringify({
            ...theme,
            resizedTableRules: derivedRules,
        });
    }
    return result;
}

describe('TableFilterController', () => {
    it('should merge filtered rows from table filter events and initialize intercept behavior', () => {
        const tableFilterChanged$ = new Subject<any>();
        const tableInitStatus$ = new BehaviorSubject(false);

        const mainFilter = {
            doFilter: vi.fn(),
            getFilterOutRows: () => new Set([4]),
        };
        const mainTable = {
            getTableFilters: () => mainFilter,
            getTableFilterRange: () => ({ startRow: 1, endRow: 10, startColumn: 1, endColumn: 2 }),
        };

        const extraTable = {
            getTableFilters: () => ({
                getFilterOutRows: () => new Set([8]),
            }),
        };

        const tableManager = {
            tableFilterChanged$,
            tableRangeChanged$: new Subject(),
            tableDelete$: new Subject(),
            tableInitStatus$,
            getTable: vi.fn(() => mainTable),
            getTablesBySubunitId: vi.fn((_unitId, subUnitId) => subUnitId === 's1' ? [mainTable, extraTable] : []),
        };

        let rowFilteredHandler: any;
        const sheetInterceptorService = {
            intercept: vi.fn((_point: any, config: any) => {
                rowFilteredHandler = config.handler;
                return { dispose: vi.fn() };
            }),
        };

        const activeSheet$ = new Subject<any>();
        const workbook = {
            getUnitId: () => 'u1',
            getActiveSheet: () => ({ getSheetId: () => 's1' }),
            activeSheet$,
            getSheetBySheetId: vi.fn(() => ({ id: 'sheet1' })),
            getDateSystem: () => DateSystem.Date1904,
        };

        const workbookType$ = new Subject<any>();
        const univerInstanceService = {
            getCurrentTypeOfUnit$: vi.fn(() => workbookType$),
            getCurrentUnitOfType: vi.fn(() => workbook),
            getUnit: vi.fn(() => workbook),
        };

        const zebraCrossingCacheController = {
            updateZebraCrossingCache: vi.fn(),
        };

        let formulaRowFiltered: ((unitId: string, subUnitId: string, row: number) => boolean) | undefined;
        const sheetRowFilteredService = {
            register: vi.fn((callback) => {
                formulaRowFiltered = callback;
                return toDisposable(() => {
                    formulaRowFiltered = undefined;
                });
            }),
        };

        const controller = new TableFilterController(
            tableManager as any,
            sheetInterceptorService as any,
            univerInstanceService as any,
            sheetRowFilteredService as any,
            zebraCrossingCacheController as any
        );

        tableFilterChanged$.next({ unitId: 'u1', subUnitId: 's1', tableId: 't1' });

        expect(mainFilter.doFilter).toHaveBeenCalledWith(
            { id: 'sheet1' },
            { startRow: 1, endRow: 10, startColumn: 1, endColumn: 2 },
            DateSystem.Date1904
        );
        expect(zebraCrossingCacheController.updateZebraCrossingCache).toHaveBeenCalledWith('u1', 's1');
        expect(rowFilteredHandler(false, { unitId: 'u1', subUnitId: 's1', row: 4 }, vi.fn(() => false))).toBe(true);
        expect(formulaRowFiltered?.('u1', 's1', 4)).toBe(true);
        expect(rowFilteredHandler(false, { unitId: 'u1', subUnitId: 's2', row: 4 }, vi.fn(() => false))).toBe(false);
        expect(rowFilteredHandler(false, { unitId: 'u1', subUnitId: 's1', row: 9 }, vi.fn(() => false))).toBe(false);

        tableInitStatus$.next(true);
        workbookType$.next(workbook);
        activeSheet$.next({ getSheetId: () => 's1' });

        expect(rowFilteredHandler(false, { unitId: 'u1', subUnitId: 's1', row: 8 }, vi.fn(() => false))).toBe(true);

        controller.dispose();
    });
});

describe('TableFilterController range updates through real commands', () => {
    it.each([
        { legacySnapshot: false, adjacentDataRows: false },
        { legacySnapshot: true, adjacentDataRows: false },
        { legacySnapshot: true, adjacentDataRows: true },
    ])('restores independent table filters after reopening, legacy=$legacySnapshot adjacent=$adjacentDataRows', async ({ legacySnapshot, adjacentDataRows }) => {
        const univer = new Univer();
        const injector = univer.__getInjector();
        const locale = injector.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: { ...sheetsEnUS, ...formulaEnUS, ...enUS } });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        univer.registerPlugin(UniverSheetsFormulaPlugin);
        univer.registerPlugin(UniverSheetsTablePlugin);
        try {
            const api = FUniver.newAPI(univer);
            const workbook = api.createWorkbook({
                id: 'overlapping-rows',
                name: 'overlapping-rows',
                appVersion: '1.0.0',
                locale: LocaleType.EN_US,
                styles: {},
                sheetOrder: ['orders'],
                sheets: {
                    orders: {
                        id: 'orders',
                        name: 'Orders',
                        rowCount: 10,
                        columnCount: 10,
                        cellData: {
                            0: { 0: { v: 'Status' }, 5: { v: 'Status' } },
                            1: { 0: { v: 'Keep' }, 5: { v: 'Keep' } },
                            2: { 0: { v: 'Hide' }, 5: { v: 'Keep' } },
                            3: { 0: { v: 'Keep' }, 5: { v: adjacentDataRows ? 'Status' : 'Keep' } },
                            4: { 5: { v: 'Hide' } },
                            5: { 5: { v: 'Keep' } },
                        },
                    },
                },
            });
            const sheet = workbook.getSheetByName('Orders')!;
            expect(await sheet.addTable('Filtered', sheet.getRange('A1:A4').getRange(), 'filtered')).toBe(true);
            expect(await sheet.addTable('Unfiltered', sheet.getRange(adjacentDataRows ? 'F4:F6' : 'F1:F4').getRange(), 'unfiltered')).toBe(true);
            const commands = injector.get(ICommandService);
            expect(await commands.executeCommand(SetSheetTableFilterCommand.id, {
                unitId: 'overlapping-rows',
                tableId: 'filtered',
                column: 0,
                tableFilter: { filterType: TableColumnFilterTypeEnum.manual, values: ['Keep'] },
            })).toBe(true);
            if (adjacentDataRows) {
                expect(await commands.executeCommand(SetSheetTableFilterCommand.id, {
                    unitId: 'overlapping-rows',
                    tableId: 'unfiltered',
                    column: 0,
                    tableFilter: { filterType: TableColumnFilterTypeEnum.manual, values: ['Keep'] },
                })).toBe(true);
            }
            const loader = injector.get(IResourceLoaderService);
            const snapshot = loader.saveUnit<IWorkbookData>('overlapping-rows')!;
            if (legacySnapshot) {
                const resource = snapshot.resources?.find((item) => item.name === PLUGIN_NAME);
                expect(resource).toBeDefined();
                const data = JSON.parse(resource!.data);
                delete data.orders.tableFilteredOutRowsByTable;
                resource!.data = JSON.stringify(data);
                if (adjacentDataRows) {
                    snapshot.sheets.orders.cellData![4][5].v = 'Keep';
                }
            } else {
                // Preserve the cached result even if cell values change before formula recalculation on reopen.
                snapshot.sheets.orders.cellData![2][0].v = 'Keep';
            }
            injector.get(IUniverInstanceService).disposeUnit('overlapping-rows');
            api.createWorkbook(JSON.parse(JSON.stringify(snapshot)));
            const manager = injector.get(TableManager);
            const restoredSheet = injector.get(IUniverInstanceService).getUnit<Workbook>('overlapping-rows')!.getSheetBySheetId('orders')!;
            expect([...manager.getTable('overlapping-rows', 'unfiltered')!.getTableFilters().getFilterOutRows()]).toEqual(adjacentDataRows ? [4] : []);
            expect(restoredSheet.getRowFiltered(2)).toBe(true);
            if (adjacentDataRows) {
                expect(restoredSheet.getRowFiltered(4)).toBe(true);
            }
            expect(await commands.executeCommand(SetSheetTableCommand.id, {
                unitId: 'overlapping-rows',
                tableId: 'filtered',
                updateRange: { newRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 } },
            })).toBe(true);
            expect(restoredSheet.getRowFiltered(2)).toBe(false);
            if (adjacentDataRows) {
                expect(restoredSheet.getRowFiltered(4)).toBe(true);
            }
        } finally {
            univer.dispose();
        }
    });

    it.each([false, true])('recalculates resized filters and row visibility with foreign workbook focused=%s', async (foreignFocus) => {
        const univer = new Univer();
        const injector = univer.__getInjector();
        const locale = injector.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: { ...sheetsEnUS, ...formulaEnUS, ...enUS } });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        univer.registerPlugin(UniverSheetsFormulaPlugin);
        univer.registerPlugin(UniverSheetsTablePlugin);
        try {
            const api = FUniver.newAPI(univer);
            const commands = injector.get(ICommandService);
            for (const unitId of ['resized-table', 'independent']) {
                const workbook = api.createWorkbook({
                    id: unitId,
                    name: unitId,
                    appVersion: '1.0.0',
                    locale: LocaleType.EN_US,
                    styles: {},
                    sheetOrder: ['orders', 'summary'],
                    sheets: {
                        orders: {
                            id: 'orders',
                            name: 'Orders',
                            rowCount: 20,
                            columnCount: 12,
                            cellData: {
                                0: { 0: { v: 'Status' }, 1: { v: 'Amount' } },
                                1: { 0: { v: 'Keep' }, 1: { v: 10 } },
                                2: { 0: { v: 'Hide' }, 1: { v: 20 } },
                                3: { 0: { v: 'Keep' }, 1: { v: 30 } },
                                4: { 0: { v: 'Hide' }, 1: { v: 40 } },
                                6: { 5: { v: 'Status' }, 6: { v: 'Amount' } },
                                7: { 5: { v: 'Keep' }, 6: { v: 70 } },
                                8: { 5: { v: 'Hide' }, 6: { v: 80 } },
                            },
                        },
                        summary: {
                            id: 'summary',
                            name: 'Summary',
                            rowCount: 20,
                            columnCount: 12,
                            cellData: {
                                6: { 5: { v: 'Status' }, 6: { v: 'Amount' } },
                                7: { 5: { v: 'Keep' }, 6: { v: 70 } },
                                8: { 5: { v: 'Hide' }, 6: { v: 80 } },
                            },
                        },
                    },
                });
                for (const [sheetName, tableName, tableId, range] of [
                    ['Orders', 'SalesData', 'sales', 'A1:B5'],
                    ['Orders', 'OtherSales', 'other', 'F7:G9'],
                    ['Summary', 'SummarySales', 'summary-sales', 'F7:G9'],
                ]) {
                    const sheet = workbook.getSheetByName(sheetName)!;
                    expect(await sheet.addTable(tableName, sheet.getRange(range).getRange(), tableId)).toBe(true);
                    expect(await commands.executeCommand(SetSheetTableFilterCommand.id, {
                        unitId,
                        tableId,
                        column: 0,
                        tableFilter: { filterType: TableColumnFilterTypeEnum.manual, values: ['Keep'] },
                    })).toBe(true);
                }
                workbook.getSheetByName('Summary')!.getRange('A1:B1').setValues([[
                    { f: '=SUBTOTAL(109,Orders!B2:B5)' },
                    { f: '=SUBTOTAL(109,SalesData[Amount])' },
                ]]);
            }
            const applied = api.getFormula().onCalculationResultApplied(5_000);
            injector.get(LifecycleService).stage = LifecycleStages.Rendered;
            await applied;
            injector.get(TableFilterController);
            const manager = injector.get(TableManager);
            const instances = injector.get(IUniverInstanceService);
            const loader = injector.get(IResourceLoaderService);
            api.getWorkbook('resized-table')!.getSheetByName('Orders')!.getRange('J12:K14').useThemeStyle('table-default-1');
            const themes = injector.get(SheetRangeThemeModel);
            const getThemeRules = () => {
                const resource: Parameters<SheetRangeThemeModel['fromJSON']>[1] = JSON.parse(themes.toJson('resized-table'));
                return resource.rangeThemeStyleRuleMap;
            };
            const userRules = Object.entries(getThemeRules())
                .filter(([, rule]) => rule.rangeInfo.subUnitId === 'orders' && rule.rangeInfo.range.startRow === 11);
            expect(userRules).toHaveLength(1);
            const [userRuleId, userRule] = Tools.deepClone(userRules[0]);
            const original = loader.saveUnit<IWorkbookData>('resized-table')!;
            const independent = loader.saveUnit<IWorkbookData>('independent')!;
            const otherTables = ['other', 'summary-sales'].map((id) => Tools.deepClone(manager.getTable('resized-table', id)!.toJSON()));
            const summary = api.getWorkbook('resized-table')!.getSheetByName('Summary')!;
            const worksheet = instances.getUnit<Workbook>('resized-table')!.getSheetBySheetId('orders')!;
            const sales = manager.getTable('resized-table', 'sales')!;
            const originalTable = Tools.deepClone(sales.toJSON());
            expect([...sales.getTableFilters().getFilterOutRows()]).toEqual([2, 4]);
            expect([1, 2, 3, 4].map((row) => worksheet.getRowFiltered(row))).toEqual([false, true, false, true]);
            expect(summary.getRange('A1:B1').getValues()).toEqual([[40, 40]]);
            instances.focusUnit(foreignFocus ? 'independent' : 'resized-table');
            const resized = api.getFormula().onCalculationResultApplied(5_000);
            expect(await commands.executeCommand(SetSheetTableCommand.id, {
                unitId: 'resized-table',
                tableId: 'sales',
                updateRange: { newRange: { startRow: 0, endRow: 3, startColumn: 0, endColumn: 1 } },
            })).toBe(true);
            expect.soft([...sales.getTableFilters().getFilterOutRows()]).toEqual([2]);
            expect.soft([1, 2, 3, 4].map((row) => worksheet.getRowFiltered(row))).toEqual([false, true, false, false]);
            await resized;
            expect(summary.getRange('A1:B1').getValues()).toEqual([[80, 40]]);
            expect(worksheet.getRowFiltered(8)).toBe(true);
            expect(['other', 'summary-sales'].map((id) => manager.getTable('resized-table', id)!.toJSON())).toEqual(otherTables);
            expect(loader.saveUnit<IWorkbookData>('independent')).toEqual(independent);
            const changed = loader.saveUnit<IWorkbookData>('resized-table')!;
            const changedTable = Tools.deepClone(sales.toJSON());
            expect(getThemeRules()[userRuleId]).toEqual(userRule);
            instances.focusUnit('resized-table');
            const undone = api.getFormula().onCalculationResultApplied(5_000);
            expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
            await undone;
            expect([...sales.getTableFilters().getFilterOutRows()]).toEqual([2, 4]);
            expect(worksheet.getRowFiltered(4)).toBe(true);
            expect(getComparableSnapshot(loader.saveUnit<IWorkbookData>('resized-table')!, originalTable))
                .toEqual(getComparableSnapshot(original, originalTable));
            expect(getThemeRules()[userRuleId]).toEqual(userRule);
            const redone = api.getFormula().onCalculationResultApplied(5_000);
            expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
            await redone;
            expect(getComparableSnapshot(loader.saveUnit<IWorkbookData>('resized-table')!, changedTable))
                .toEqual(getComparableSnapshot(changed, changedTable));
            expect(getThemeRules()[userRuleId]).toEqual(userRule);
            expect(worksheet.getRowFiltered(4)).toBe(false);
            instances.disposeUnit('resized-table');
            const restored = api.createWorkbook(JSON.parse(JSON.stringify(changed)));
            const reopened = api.getFormula().onCalculationResultApplied(5_000);
            api.getFormula().executeCalculation();
            await reopened;
            expect([...manager.getTable('resized-table', 'sales')!.getTableFilters().getFilterOutRows()]).toEqual([2]);
            expect(restored.getSheetByName('Summary')!.getRange('A1:B1').getValues()).toEqual([[80, 40]]);
            const edited = api.getFormula().onCalculationResultApplied(5_000);
            restored.getSheetByName('Orders')!.getRange('B2').setValue(15);
            await edited;
            expect(restored.getSheetByName('Summary')!.getRange('A1:B1').getValues()).toEqual([[85, 45]]);
            expect([...manager.getTable('resized-table', 'sales')!.getTableFilters().getFilterOutRows()]).toEqual([2]);
            restored.getSheetByName('Orders')!.getRange('A6:B6').setValues([['Hide', 50]]);
            expect(await commands.executeCommand(SetSheetTableCommand.id, {
                unitId: 'resized-table',
                tableId: 'sales',
                updateRange: { newRange: { startRow: 0, endRow: 5, startColumn: 0, endColumn: 1 } },
            })).toBe(true);
            expect([...manager.getTable('resized-table', 'sales')!.getTableFilters().getFilterOutRows()]).toEqual([2, 4, 5]);
            const reopenedWorksheet = instances.getUnit<Workbook>('resized-table')!.getSheetBySheetId('orders')!;
            expect([4, 5].map((row) => reopenedWorksheet.getRowFiltered(row))).toEqual([true, true]);
            expect(loader.saveUnit<IWorkbookData>('independent')).toEqual(independent);
        } finally {
            univer.dispose();
        }
    });

    it('refreshes a copied Table filter after delayed cell batches', async () => {
        const univer = new Univer();
        const injector = univer.__getInjector();
        const locale = injector.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: { ...sheetsEnUS, ...enUS } });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        univer.registerPlugin(UniverSheetsTablePlugin);
        try {
            const workbook = FUniver.newAPI(univer).createWorkbook({
                id: 'copy-table',
                name: 'Copy Table',
                appVersion: '1.0.0',
                locale: LocaleType.EN_US,
                styles: {},
                sheetOrder: ['orders'],
                sheets: {
                    orders: {
                        id: 'orders',
                        name: 'Orders',
                        rowCount: 10,
                        columnCount: 2,
                        cellData: {
                            0: { 0: { v: 'Status' } },
                            1: { 0: { v: 'Keep' } },
                            2: { 0: { v: 'Hide' } },
                            3: { 0: { v: 'Keep' } },
                            4: { 0: { v: 'Hide' } },
                        },
                    },
                },
            });
            const sheet = workbook.getSheetByName('Orders')!;
            expect(await sheet.addTable('SalesData', sheet.getRange('A1:A5').getRange(), 'sales')).toBe(true);
            const commands = injector.get(ICommandService);
            expect(await commands.executeCommand(SetSheetTableFilterCommand.id, {
                unitId: 'copy-table',
                tableId: 'sales',
                column: 0,
                tableFilter: { filterType: TableColumnFilterTypeEnum.manual, values: ['Keep'] },
            })).toBe(true);
            injector.get(IConfigService).setConfig(SHEETS_PLUGIN_CONFIG_KEY, {
                largeSheetOperation: { largeSheetCellCountThreshold: 1, batchSize: 2 },
            });
            const idleCallbacks: Array<(deadline: IdleDeadline) => void> = [];
            vi.stubGlobal('requestIdleCallback', (callback: (deadline: IdleDeadline) => void) => {
                idleCallbacks.push(callback);
                return idleCallbacks.length;
            });
            vi.stubGlobal('cancelIdleCallback', vi.fn());
            const schedule = injector.get(SheetLazyExecuteScheduleService);
            const completed: string[] = [];
            schedule.completed$.subscribe(({ subUnitId }) => completed.push(subUnitId));
            expect(await commands.executeCommand(CopySheetCommand.id, {
                unitId: 'copy-table',
                subUnitId: 'orders',
            })).toBe(true);
            const copiedId = workbook.getSheets()[1].getSheetId();
            expect(schedule.hasPendingTasks()).toBe(true);
            const table = injector.get(TableManager).getTablesBySubunitId('copy-table', copiedId)[0];
            expect(table).toBeDefined();
            expect([...table.getTableFilters().getFilterOutRows()]).toContain(3);
            expect(idleCallbacks).toHaveLength(1);
            idleCallbacks[0]({ didTimeout: true, timeRemaining: () => 0 } as IdleDeadline);
            expect(completed).toContain(copiedId);
            expect(schedule.hasPendingTasks()).toBe(false);
            expect([...table.getTableFilters().getFilterOutRows()]).toEqual([2, 4]);
            const copiedWorkbook = injector.get(IUniverInstanceService).getUnit<Workbook>('copy-table')!;
            const copiedWorksheet = copiedWorkbook.getSheetBySheetId(copiedId)!;
            expect([1, 2, 3, 4].map((row) => copiedWorksheet.getRowFiltered(row)))
                .toEqual([false, true, false, true]);
        } finally {
            univer.dispose();
            vi.unstubAllGlobals();
        }
    });
});

describe('TableFilterController deletion', () => {
    let univer: Univer;
    let workbook: Workbook;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([TableManager]);
        injector.add([SheetTableService]);
        injector.add([SheetInterceptorService]);
        injector.add([SheetRangeThemeModel]);
        injector.add([ZebraCrossingCacheController]);
        injector.add([ISheetRowFilteredService, { useClass: SheetRowFilteredService }]);
        injector.add([TableFilterController]);
        const locale = injector.get(LocaleService);
        locale.load({ enUS });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
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
                    columnCount: 10,
                    rowData: { 2: { hd: BooleanNumber.TRUE } },
                    cellData: {
                        0: { 0: { v: 'Name' }, 2: { v: 'Other' } },
                        1: { 0: { v: 'A' }, 2: { v: 'X' } },
                        2: { 0: { v: 'B' }, 2: { v: 'Y' } },
                        3: { 0: { v: 'C' }, 2: { v: 'Z' } },
                    },
                },
                sheet2: { id: 'sheet2', name: 'Other', rowCount: 20, columnCount: 10 },
            },
        });
        injector.get(IUniverInstanceService).focusUnit('test');
        injector.get(TableFilterController);
        const commands = injector.get(ICommandService);
        [DeleteSheetTableCommand, DeleteSheetTableMutation, AddSheetTableMutation, SetSheetTableFilterCommand, SetSheetTableFilterMutation].forEach((command) => commands.registerCommand(command));
    });

    afterEach(() => univer.dispose());

    it('releases filtered rows on deletion and restores filters on undo and redo', async () => {
        const injector = univer.__getInjector();
        const manager = injector.get(TableManager);
        const unitId = workbook.getUnitId();
        const sheet = workbook.getSheetBySheetId('sheet1')!;
        const formulaRows = injector.get(ISheetRowFilteredService);
        const commands = injector.get(ICommandService);
        const tableId = manager.addTable(unitId, 'sheet1', 'Orders', {
            startRow: 0,
            endRow: 3,
            startColumn: 0,
            endColumn: 0,
        });
        const filter = { filterType: TableColumnFilterTypeEnum.manual, values: ['A'] };
        expect(await commands.executeCommand(SetSheetTableFilterCommand.id, {
            unitId,
            tableId,
            column: 0,
            tableFilter: filter,
        })).toBe(true);
        expect(sheet.isRowFiltered(1)).toBe(false);
        expect(sheet.isRowFiltered(3)).toBe(true);
        expect(formulaRows.getRowFiltered(unitId, 'sheet1', 3)).toBe(true);
        expect(manager.toJSON(unitId).sheet1.tableFilteredOutRows).toEqual([2, 3]);

        expect(await commands.executeCommand(DeleteSheetTableCommand.id, {
            unitId,
            subUnitId: 'sheet1',
            tableId,
        })).toBe(true);
        expect(sheet.isRowFiltered(3)).toBe(false);
        expect(sheet.getRowVisible(3)).toBe(true);
        expect(sheet.getRowVisible(2)).toBe(false);
        expect(formulaRows.getRowFiltered(unitId, 'sheet1', 3)).toBe(false);

        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(manager.getTable(unitId, tableId)?.getTableFilterColumn(0)).toEqual(filter);
        expect(sheet.isRowFiltered(3)).toBe(true);
        expect(formulaRows.getRowFiltered(unitId, 'sheet1', 3)).toBe(true);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(sheet.isRowFiltered(3)).toBe(false);
        expect(formulaRows.getRowFiltered(unitId, 'sheet1', 3)).toBe(false);
    });

    it('retains other table and sheet filters when a filtered table is deleted', () => {
        const injector = univer.__getInjector();
        const manager = injector.get(TableManager);
        const unitId = workbook.getUnitId();
        const sheet = workbook.getSheetBySheetId('sheet1')!;
        const first = manager.addTable(unitId, 'sheet1', 'First', {
            startRow: 0,
            endRow: 3,
            startColumn: 0,
            endColumn: 0,
        }, undefined, undefined, {
            filters: [{ filterType: TableColumnFilterTypeEnum.manual, values: ['A'] }],
        });
        manager.addTable(unitId, 'sheet1', 'Second', {
            startRow: 0,
            endRow: 3,
            startColumn: 2,
            endColumn: 2,
        }, undefined, undefined, {
            filters: [{ filterType: TableColumnFilterTypeEnum.manual, values: ['Z'] }],
        });
        const intercept = injector.get(SheetInterceptorService).intercept(INTERCEPTOR_POINT.ROW_FILTERED, {
            priority: 0,
            handler: (filtered, location, next) => location.row === 5 ? true : next(filtered),
        });
        expect(sheet.isRowFiltered(3)).toBe(true);
        expect(sheet.isRowFiltered(1)).toBe(true);
        manager.deleteTable(unitId, first);
        expect(sheet.isRowFiltered(3)).toBe(false);
        expect(sheet.isRowFiltered(1)).toBe(true);
        expect(sheet.isRowFiltered(5)).toBe(true);
        expect(workbook.getSheetBySheetId('sheet2')!.isRowFiltered(1)).toBe(false);
        expect(injector.get(ISheetRowFilteredService).getRowFiltered(unitId, 'sheet1', 1)).toBe(true);
        intercept.dispose();
    });
});
