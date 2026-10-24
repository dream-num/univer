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

import type { ICommandInfo, IMutationInfo, IWorkbookData, Workbook } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IResourceManagerService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    SheetTypes,
    Tools,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { SetSuperTableMutation, UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { RangeThemeStyle, SheetsSelectionsService, UniverSheetsPlugin } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ITableOptions } from '../../../types/type';
import enUS from '../../../locale/en-US';
import { TableColumn } from '../../../models/table-column';
import { TableManager } from '../../../models/table-manager';
import { UniverSheetsTablePlugin } from '../../../plugin';
import { SheetsTableSortStateEnum } from '../../../types/enum';
import { AddSheetTableMutation } from '../../mutations/add-sheet-table.mutation';
import { AddSheetTableCommand } from '../add-sheet-table.command';
import { AddTableThemeCommand } from '../add-table-theme.command';
import { DeleteSheetTableCommand } from '../delete-sheet-table.command';
import { RemoveTableThemeCommand } from '../remove-table-theme.command';
import { SetSheetTableCommand } from '../set-sheet-table.command';
import { SetSheetTableFilterCommand } from '../set-table-filter.command';
import { SetSheetTableSortStateCommand } from '../set-table-sort-state.command';
import {
    SheetTableInsertColCommand,
    SheetTableInsertColumnAtCommand,
    SheetTableInsertRowAtCommand,
    SheetTableInsertRowCommand,
    SheetTableRemoveColCommand,
    SheetTableRemoveColumnAtCommand,
    SheetTableRemoveRowCommand,
} from '../sheet-table-row-col.command';

const range = { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 };

describe('Chart Sheet sheets-table edit boundary', () => {
    let univer: Univer;
    let workbook: Workbook;
    let commands: ICommandService;
    let history: IUndoRedoService;
    let mutations: ICommandInfo[];
    let observer: { dispose(): void };

    beforeEach(() => {
        univer = new Univer();
        univer.registerPlugin(UniverFormulaEnginePlugin);
        univer.registerPlugin(UniverSheetsPlugin);
        univer.registerPlugin(UniverSheetsTablePlugin);
        workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'feature-workbook',
            appVersion: '1.0.0',
            locale: LocaleType.EN_US,
            name: 'Feature boundary',
            sheetOrder: ['grid', 'chart'],
            styles: {},
            sheets: {
                grid: { id: 'grid', name: 'Grid', cellData: { 0: { 0: { v: 2 } }, 1: { 0: { v: 1 } } } },
                chart: { id: 'chart', name: 'Chart', type: SheetTypes.CHART, cellData: {} },
            },
        });
        const injector = univer.__getInjector();
        injector.get(IUniverInstanceService).focusUnit(workbook.getUnitId());
        injector.get(LocaleService).load({ [LocaleType.EN_US]: enUS });
        injector.get(LocaleService).setLocale(LocaleType.EN_US);
        injector.get(LocaleService).setDirection('ltr');
        commands = injector.get(ICommandService);
        history = injector.get(IUndoRedoService);
        mutations = [];
        observer = commands.onCommandExecuted((command) => {
            if (command.type === CommandType.MUTATION) {
                mutations.push(command);
            }
        });
    });

    afterEach(() => {
        observer.dispose();
        univer.dispose();
    });

    async function expectRefused(id: string, params?: object) {
        const before = JSON.parse(JSON.stringify(workbook.save()));
        const resources = JSON.parse(JSON.stringify(univer.__getInjector().get(IResourceManagerService).getResources(workbook.getUnitId(), UniverInstanceType.UNIVER_SHEET)));
        const undo = history.pitchTopUndoElement();
        const redo = history.pitchTopRedoElement();
        const count = mutations.length;
        expect(await commands.executeCommand(id, params)).toBe(false);
        expect(JSON.parse(JSON.stringify(workbook.save()))).toEqual(before);
        expect(univer.__getInjector().get(IResourceManagerService).getResources(workbook.getUnitId(), UniverInstanceType.UNIVER_SHEET)).toEqual(resources);
        expect(history.pitchTopUndoElement()).toBe(undo);
        expect(history.pitchTopRedoElement()).toBe(redo);
        expect(mutations.slice(count)).toEqual([]);
    }

    it('refuses Chart tables and table-owned edits independently of the active Grid host', async () => {
        const chart = { unitId: workbook.getUnitId(), subUnitId: 'chart', tableId: 'historical-table' };
        await expectRefused(AddSheetTableCommand.id, { ...chart, id: chart.tableId, range, name: 'ChartTable' });
        let stopObserving = () => {};
        const tableRegistered = new Promise<void>((done) => {
            const registration = commands.onCommandExecuted((command) => {
                if (command.id === SetSuperTableMutation.id) {
                    done();
                }
            });
            stopObserving = () => registration.dispose();
        });
        try {
            expect(commands.syncExecuteCommand(AddSheetTableMutation.id, { ...chart, range, name: 'ChartTable', header: ['A', 'B'] })).toBe(true);
            await tableRegistered;
        } finally {
            stopObserving();
        }
        await expectRefused(SetSheetTableCommand.id, { unitId: chart.unitId, tableId: chart.tableId, name: 'Changed' });
        await expectRefused(SetSheetTableFilterCommand.id, { unitId: chart.unitId, tableId: chart.tableId, column: 0 });
        await expectRefused(SetSheetTableSortStateCommand.id, { unitId: chart.unitId, tableId: chart.tableId, sortInfo: { columnIndex: 0, sortState: SheetsTableSortStateEnum.Asc } });
        await expectRefused(AddTableThemeCommand.id, { unitId: chart.unitId, tableId: chart.tableId, themeStyle: new RangeThemeStyle('feature-theme') });
        await expectRefused(RemoveTableThemeCommand.id, { unitId: chart.unitId, tableId: chart.tableId, themeName: 'feature-theme' });
        await expectRefused(SheetTableInsertRowAtCommand.id, { ...chart, index: 1 });
        await expectRefused(SheetTableInsertColumnAtCommand.id, { ...chart, index: 1 });
        await expectRefused(SheetTableRemoveColumnAtCommand.id, { ...chart, index: 1 });
        await expectRefused(SheetTableRemoveRowCommand.id, chart);
        await expectRefused(SheetTableRemoveColCommand.id, chart);
        workbook.setActiveSheet(workbook.getSheetBySheetId('chart')!);
        univer.__getInjector().get(SheetsSelectionsService).setSelections(chart.unitId, 'chart', [{ range: { ...range, startRow: 1 }, primary: null, style: null }]);
        await expectRefused(SheetTableInsertRowCommand.id);
        await expectRefused(SheetTableInsertColCommand.id);
        await expectRefused(DeleteSheetTableCommand.id, chart);
        expect(await commands.executeCommand(AddSheetTableCommand.id, { unitId: chart.unitId, subUnitId: 'grid', id: 'grid-table', range, name: 'GridTable' })).toBe(true);
    });
});

const universes: Univer[] = [];

function createUniver() {
    const univer = new Univer();
    universes.push(univer);
    const injector = univer.__getInjector();
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    univer.registerPlugin(UniverFormulaEnginePlugin);
    univer.registerPlugin(UniverSheetsPlugin);
    univer.registerPlugin(UniverSheetsTablePlugin);
    univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
        id: 'unit',
        sheetOrder: ['sheet'],
        sheets: {
            sheet: {
                id: 'sheet',
                name: 'Source',
                rowCount: 20,
                columnCount: 10,
                cellData: {
                    0: { 2: { v: 'Region' }, 3: { v: 'Amount' } },
                    1: { 2: { v: 'North' }, 3: { v: 10 } },
                    2: { 2: { v: 'South' }, 3: { v: 20 } },
                },
            },
        },
    });
    injector.get(IUniverInstanceService).focusUnit('unit');
    return injector;
}

afterEach(() => universes.splice(0).forEach((univer) => univer.dispose()));

describe('AddSheetTableCommand', () => {
    it.each([false, true])('preserves column identities during replay and undo/redo with partial definitions: %s', (partial) => {
        const main = createUniver();
        const replica = createUniver();
        const commands = main.get(ICommandService);
        const manager = main.get(TableManager);
        const replicaManager = replica.get(TableManager);
        const mutations: IMutationInfo[] = [];
        const subscription = commands.onCommandExecuted((command) => {
            if (command.id === AddSheetTableMutation.id && command.params) {
                mutations.push({ id: command.id, params: Tools.deepClone(command.params) });
            }
        });
        const options: ITableOptions = partial
            ? { columns: [new TableColumn('authored-region', 'Authored region').toJSON()] }
            : {};
        const originalOptions = Tools.deepClone(options);
        expect(commands.syncExecuteCommand(AddSheetTableCommand.id, {
            unitId: 'unit',
            subUnitId: 'sheet',
            id: 'table',
            name: 'Sales',
            range: { startRow: 0, endRow: 2, startColumn: 2, endColumn: 3 },
            options,
        })).toBe(true);
        subscription.dispose();
        const columns = manager.getTable('unit', 'table')!.toJSON().columns;
        const mutation = mutations[0];
        expect(replica.get(ICommandService).syncExecuteCommand(mutation.id, mutation.params)).toBe(true);
        expect(replicaManager.getTable('unit', 'table')!.toJSON().columns).toEqual(columns);
        expect(options).toEqual(originalOptions);
        if (partial) {
            expect(columns[0]).toMatchObject({ id: 'authored-region', displayName: 'Authored region' });
            options.columns![0].id = 'caller-changed';
        }
        expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(true);
        expect(manager.getTable('unit', 'table')).toBeUndefined();
        expect(commands.syncExecuteCommand(RedoCommand.id)).toBe(true);
        expect(manager.getTable('unit', 'table')!.toJSON().columns).toEqual(columns);
    });

    it('generates a unique name for a conflicting name and leaves no table for missing parameters', () => {
        const injector = createUniver();
        const commands = injector.get(ICommandService);
        const manager = injector.get(TableManager);
        expect(commands.syncExecuteCommand(AddSheetTableCommand.id)).toBe(false);
        expect(manager.getTableList('unit')).toHaveLength(0);
        expect(commands.syncExecuteCommand(AddSheetTableCommand.id, {
            unitId: 'unit',
            subUnitId: 'sheet',
            id: 'table',
            name: 'Source',
            range: { startRow: 0, endRow: 2, startColumn: 2, endColumn: 3 },
        })).toBe(true);
        expect(manager.getTable('unit', 'table')!.getDisplayName()).toBe('Table1');
    });
});
