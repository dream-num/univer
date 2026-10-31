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
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    Tools,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import sheetsEnUS from '@univerjs/sheets/locale/en-US';
import { describe, expect, it } from 'vitest';
import type { ITableOptions } from '../../../types/type';
import enUS from '../../../locale/en-US';
import { TableManager } from '../../../models/table-manager';
import { UniverSheetsTablePlugin } from '../../../plugin';
import { TableColumnDataTypeEnum } from '../../../types/enum';
import { AddSheetTableCommand } from '../../commands/add-sheet-table.command';
import { AddSheetTableMutation } from '../add-sheet-table.mutation';
import { DeleteSheetTableMutation } from '../delete-sheet-table.mutation';

function createRuntime() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: { ...sheetsEnUS, ...enUS } });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    univer.registerPlugin(UniverFormulaEnginePlugin);
    univer.registerPlugin(UniverSheetsPlugin);
    univer.registerPlugin(UniverSheetsTablePlugin);
    univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
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
                    0: { 0: { v: 'Region' }, 1: { v: 'Amount' } },
                    1: { 0: { v: 'West' }, 1: { v: 20 } },
                    2: { 0: { v: 'East' }, 1: { v: 30 } },
                },
            },
        },
    });
    injector.get(IUniverInstanceService).focusUnit('unit');
    return { univer, commands: injector.get(ICommandService), tables: injector.get(TableManager) };
}

describe('AddSheetTableMutation', () => {
    it.each([false, true])('keeps column identity across real replay and command undo/redo (explicit first column=%s)', (explicit) => {
        const primary = createRuntime();
        const replica = createRuntime();
        const options: ITableOptions | undefined = explicit
            ? {
                columns: [{ id: 'region-column', displayName: 'CustomRegion', dataType: TableColumnDataTypeEnum.String, formula: '', meta: {}, style: {} }],
            }
            : undefined;
        const subscription = primary.commands.onCommandExecuted((command) => {
            if (command.id === AddSheetTableMutation.id || command.id === DeleteSheetTableMutation.id) {
                expect(replica.commands.syncExecuteCommand(command.id, Tools.deepClone(command.params), { fromSync: true })).toBe(true);
            }
        });
        try {
            expect(primary.commands.syncExecuteCommand(AddSheetTableCommand.id, {
                unitId: 'unit',
                subUnitId: 'source',
                id: 'sales',
                name: 'SalesData',
                options,
                range: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 },
            })).toBe(true);
            const first = Tools.deepClone(primary.tables.getTable('unit', 'sales')!.getTableInfo());
            expect(first.columns.map((column) => column.displayName)).toEqual([explicit ? 'CustomRegion' : 'Region', 'Amount']);
            expect(new Set(first.columns.map((column) => column.id)).size).toBe(2);
            if (explicit) {
                expect(first.columns[0].id).toBe('region-column');
            }
            expect(replica.tables.getTable('unit', 'sales')!.getTableInfo()).toEqual(first);
            const fieldId = first.columns[0].id;
            expect(replica.tables.getTable('unit', 'sales')!.getColumn(fieldId)?.getDisplayName()).toBe(explicit ? 'CustomRegion' : 'Region');
            expect(primary.commands.syncExecuteCommand(UndoCommand.id)).toBe(true);
            expect(primary.tables.getTable('unit', 'sales')).toBeUndefined();
            expect(replica.tables.getTable('unit', 'sales')).toBeUndefined();
            expect(primary.commands.syncExecuteCommand(RedoCommand.id)).toBe(true);
            expect(primary.tables.getTable('unit', 'sales')!.getTableInfo()).toEqual(first);
            expect(replica.tables.getTable('unit', 'sales')!.getTableInfo()).toEqual(first);
            expect(replica.tables.getTable('unit', 'sales')!.getColumn(fieldId)?.getDisplayName()).toBe(explicit ? 'CustomRegion' : 'Region');
        } finally {
            subscription.dispose();
            primary.univer.dispose();
            replica.univer.dispose();
        }
    });
});
