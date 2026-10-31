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

import type { IMutationInfo } from '@univerjs/core';
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
import { afterEach, describe, expect, it } from 'vitest';
import type { ITableOptions } from '../../../types/type';
import enUS from '../../../locale/en-US';
import { TableColumn } from '../../../models/table-column';
import { TableManager } from '../../../models/table-manager';
import { UniverSheetsTablePlugin } from '../../../plugin';
import { AddSheetTableMutation } from '../../mutations/add-sheet-table.mutation';
import { AddSheetTableCommand } from '../add-sheet-table.command';

const universes: Univer[] = [];

function createUniver() {
    const univer = new Univer();
    universes.push(univer);
    const injector = univer.__getInjector();
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
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
