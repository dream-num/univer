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

import type { ICommandInfo, IWorkbookData, Workbook } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IResourceManagerService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    SheetTypes,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { SetSuperTableMutation, UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { RangeThemeStyle, SheetsSelectionsService, UniverSheetsPlugin } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import enUS from '../../../locale/en-US';
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
