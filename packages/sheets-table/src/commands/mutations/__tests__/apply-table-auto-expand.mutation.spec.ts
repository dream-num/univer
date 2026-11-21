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
import { CommandType, ICommandService, LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { SetRangeValuesMutation } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ITableAutoExpandPatch } from '../../../types/auto-expand';
import { TableManager } from '../../../models/table-manager';
import { ApplyTableAutoExpandMutation } from '../apply-table-auto-expand.mutation';

describe('ApplyTableAutoExpandMutation', () => {
    let univer: Univer;
    let workbook: Workbook;
    let manager: TableManager;
    let commands: ICommandService;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([TableManager]);
        workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'book',
            name: 'Auto expansion',
            appVersion: '1.0.0',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['sheet'],
            sheets: { sheet: { id: 'sheet', name: 'Sheet', rowCount: 20, columnCount: 15, cellData: {} } },
        });
        manager = injector.get(TableManager);
        manager.addTable('book', 'sheet', 'Orders', { startRow: 2, endRow: 5, startColumn: 2, endColumn: 4 }, ['Item', 'Qty', 'Total'], 'orders');
        commands = injector.get(ICommandService);
        commands.registerCommand(SetRangeValuesMutation);
        commands.registerCommand(ApplyTableAutoExpandMutation);
    });

    afterEach(() => univer.dispose());

    function patch(): ITableAutoExpandPatch {
        const table = manager.getTable('book', 'orders')!;
        const before = { range: table.getRange(), columns: table.getTableInfo().columns };
        return JSON.parse(JSON.stringify({
            operationId: 'operation',
            showHeader: true,
            unitId: 'book',
            subUnitId: 'sheet',
            tableId: 'orders',
            before,
            after: { range: { ...before.range, endColumn: 5 }, columns: [...before.columns, { ...before.columns[0], id: 'extra-column', displayName: 'Extra' }] },
            redoEffects: [],
            undoEffects: [],
        }));
    }

    it('applies stable column metadata across redo, undo, JSON serialization and resource reload', () => {
        const change = patch();
        expect(commands.syncExecuteCommand(ApplyTableAutoExpandMutation.id, { unitId: 'book', subUnitId: 'sheet', patch: change, direction: 'redo' })).toBe(true);
        expect(manager.getTable('book', 'orders')!.getTableInfo().columns.map((column) => column.id)).toEqual(change.after.columns.map((column) => column.id));
        expect(commands.syncExecuteCommand(ApplyTableAutoExpandMutation.id, { unitId: 'book', subUnitId: 'sheet', patch: change, direction: 'undo' })).toBe(true);
        expect(manager.getTable('book', 'orders')!.getRange()).toEqual(change.before.range);
        expect(commands.syncExecuteCommand(ApplyTableAutoExpandMutation.id, { unitId: 'book', subUnitId: 'sheet', patch: JSON.parse(JSON.stringify(change)), direction: 'redo' })).toBe(true);
        const resource = JSON.parse(JSON.stringify(manager.toJSON('book')));
        manager.fromJSON('book', resource);
        expect(manager.getTable('book', 'orders')!.getTableInfo().columns).toEqual(change.after.columns);
    });

    it.each([null, [{ startRow: -1, endRow: 6, startColumn: 2, endColumn: 4 }], [{ startRow: 6, endRow: 5, startColumn: 2, endColumn: 4 }], [{ startRow: 0, endRow: 20, startColumn: 2, endColumn: 4 }]].map((claims) => ({ claims })))('rejects invalid ownership strips before changing the model: $claims', ({ claims }) => {
        const change = patch();
        change.claimedRanges = claims as unknown as ITableAutoExpandPatch['claimedRanges'];
        expect(commands.syncExecuteCommand(ApplyTableAutoExpandMutation.id, { unitId: 'book', subUnitId: 'sheet', patch: change, direction: 'redo' })).toBe(false);
        expect(manager.getTable('book', 'orders')!.getRange()).toEqual(change.before.range);
    });

    it.each([undefined, '', 9])('rejects an invalid operation identity: %o', (operationId) => {
        const change = patch();
        change.operationId = operationId as string;
        expect(commands.syncExecuteCommand(ApplyTableAutoExpandMutation.id, { unitId: 'book', subUnitId: 'sheet', patch: change, direction: 'redo' })).toBe(false);
        expect(manager.getTable('book', 'orders')!.getRange()).toEqual(change.before.range);
    });

    it('does not overwrite a newer structural state with an obsolete patch', () => {
        const change = patch();
        manager.updateTableRange('book', 'orders', { newRange: { ...change.before.range, endRow: 7 } });
        expect(commands.syncExecuteCommand(ApplyTableAutoExpandMutation.id, { unitId: 'book', subUnitId: 'sheet', patch: change, direction: 'redo' })).toBe(false);
        expect(manager.getTable('book', 'orders')!.getRange().endRow).toBe(7);
    });

    it('rejects duplicate IDs or a range/column-count mismatch before changing the model', () => {
        const change = patch();
        change.after.columns[3].id = change.after.columns[0].id;
        expect(commands.syncExecuteCommand(ApplyTableAutoExpandMutation.id, { unitId: 'book', subUnitId: 'sheet', patch: change, direction: 'redo' })).toBe(false);
        change.after.columns.pop();
        expect(commands.syncExecuteCommand(ApplyTableAutoExpandMutation.id, { unitId: 'book', subUnitId: 'sheet', patch: change, direction: 'redo' })).toBe(false);
        expect(manager.getTable('book', 'orders')!.getRange()).toEqual(change.before.range);
    });

    it('rejects a command disguised as a mutation before running its effects', () => {
        let executed = false;
        commands.registerCommand({ id: 'sheet.mutation.disguised-command', type: CommandType.COMMAND, handler: () => {
            executed = true;
            return true;
        } });
        const change = patch();
        change.redoEffects = [{ id: 'sheet.mutation.disguised-command', params: { unitId: 'book', subUnitId: 'sheet' } }];
        expect(commands.syncExecuteCommand(ApplyTableAutoExpandMutation.id, { unitId: 'book', subUnitId: 'sheet', patch: change, direction: 'redo' })).toBe(false);
        expect(executed).toBe(false);
    });

    it('rolls back a failed inherited write while keeping the original legal input', () => {
        const change = patch();
        change.after = { range: { ...change.before.range, endRow: 6 }, columns: change.before.columns };
        const sheet = workbook.getActiveSheet()!;
        sheet.getCellMatrix().setValue(6, 2, { v: 'Input' });
        let observedFormula: string | null | undefined;
        commands.registerCommand({
            id: 'sheet.mutation.failing-contribution',
            type: CommandType.MUTATION,
            handler: () => {
                observedFormula = sheet.getCellRaw(6, 4)?.f ?? undefined;
                return false;
            },
        });
        change.redoEffects = [
            { id: SetRangeValuesMutation.id, params: { unitId: 'book', subUnitId: 'sheet', cellValue: { 6: { 4: { f: '=D7*10' } } } } },
            { id: 'sheet.mutation.failing-contribution', params: { unitId: 'book', subUnitId: 'sheet' } },
        ];
        change.undoEffects = [{ id: SetRangeValuesMutation.id, params: { unitId: 'book', subUnitId: 'sheet', cellValue: { 6: { 4: null } } } }];
        expect(commands.syncExecuteCommand(ApplyTableAutoExpandMutation.id, { unitId: 'book', subUnitId: 'sheet', patch: change, direction: 'redo' })).toBe(false);
        expect(observedFormula).toBe('=D7*10');
        expect(sheet.getCellRaw(6, 2)?.v).toBe('Input');
        expect(sheet.getCellRaw(6, 4)).toBeFalsy();
        expect(manager.getTable('book', 'orders')!.getRange()).toEqual(change.before.range);
    });

    it('replays inherited effects and their inverses with the table in one patch', () => {
        const change = patch();
        change.redoEffects = [{ id: SetRangeValuesMutation.id, params: { unitId: 'book', subUnitId: 'sheet', cellValue: { 3: { 5: { f: '=E4*10' } } } } }];
        change.undoEffects = [{ id: SetRangeValuesMutation.id, params: { unitId: 'book', subUnitId: 'sheet', cellValue: { 3: { 5: { f: null, v: null } } } } }];
        expect(commands.syncExecuteCommand(ApplyTableAutoExpandMutation.id, { unitId: 'book', subUnitId: 'sheet', patch: change, direction: 'redo' })).toBe(true);
        expect(workbook.getActiveSheet()!.getCellRaw(3, 5)?.f).toBe('=E4*10');
        expect(commands.syncExecuteCommand(ApplyTableAutoExpandMutation.id, { unitId: 'book', subUnitId: 'sheet', patch: change, direction: 'undo' })).toBe(true);
        expect(workbook.getActiveSheet()!.getCellRaw(3, 5)?.f).toBeFalsy();
    });
});
