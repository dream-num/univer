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

import { Direction, ICommandService, IUniverInstanceService, LocaleService, LocaleType, RedoCommand, UndoCommand, Univer, UniverInstanceType } from '@univerjs/core';
import { InsertColCommand, InsertRowMutation, RemoveColCommand } from '@univerjs/sheets';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { AddSheetTableCommand } from '../../commands/commands/add-sheet-table.command';
import enUS from '../../locale/en-US';
import { TableManager } from '../../models/table-manager';
import { UniverSheetsTablePlugin } from '../../plugin';
import { SheetTableRefRangeController } from '../sheet-table-ref-range.controller';

describe('SheetTableRefRangeController', () => {
    it.each([
        { command: InsertColCommand, start: 4 },
        { command: RemoveColCommand, start: 2 },
    ])('preserves table column identity when $command.id shifts the table', async ({ command, start }) => {
        const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
        onTestFinished(() => univer.dispose());
        univer.registerPlugin(UniverSheetsTablePlugin);
        const unitId = 'book';
        const subUnitId = 'sheet';
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
            id: unitId,
            sheetOrder: [subUnitId],
            sheets: {
                [subUnitId]: { id: subUnitId, name: 'Sheet', rowCount: 20, columnCount: 20, cellData: {
                    0: { 3: { v: 'Region' }, 4: { v: 'Sales' } },
                } },
            },
        });
        const injector = univer.__getInjector();
        injector.get(LocaleService).setDirection('ltr');
        injector.get(IUniverInstanceService).focusUnit(unitId);
        const commands = injector.get(ICommandService);
        const tables = injector.get(TableManager);
        expect(await commands.executeCommand(AddSheetTableCommand.id, {
            unitId,
            subUnitId,
            id: 'table',
            name: 'Orders',
            range: { startRow: 0, endRow: 3, startColumn: 3, endColumn: 4 },
        })).toBe(true);
        const table = () => tables.getTable(unitId, 'table')!.toJSON();
        const columns = table().columns;
        const expectTableAt = (startColumn: number) => {
            expect(table()).toMatchObject({ range: { startColumn, endColumn: startColumn + 1 }, columns });
        };

        expect(await commands.executeCommand(command.id, {
            unitId,
            subUnitId,
            direction: Direction.LEFT,
            range: { startRow: 0, endRow: 19, startColumn: 0, endColumn: 0 },
        })).toBe(true);
        expectTableAt(start);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expectTableAt(3);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expectTableAt(start);
    });

    it('should return empty mutations for unsupported commands and update table range after row insertion', () => {
        let interceptCommandConfig: any;
        let commandExecutedListener: any;

        const table = {
            getId: () => 't1',
            getRange: () => ({ startRow: 5, endRow: 10, startColumn: 1, endColumn: 3 }),
        };

        const tableManager = {
            getTablesBySubunitId: vi.fn(() => [table]),
            updateTableRange: vi.fn(),
        };

        const controller = new SheetTableRefRangeController(
            {
                onCommandExecuted: vi.fn((listener: any) => {
                    commandExecutedListener = listener;
                    return { dispose: vi.fn() };
                }),
            } as any,
            {} as any,
            {} as any,
            {} as any,
            {
                interceptCommand: vi.fn((config: any) => {
                    interceptCommandConfig = config;
                    return { dispose: vi.fn() };
                }),
            } as any,
            tableManager as any,
            { t: () => 'Column' } as any
        );

        expect(interceptCommandConfig.getMutations({ id: 'unknown.command', params: {} })).toEqual({ redos: [], undos: [] });

        commandExecutedListener({
            id: InsertRowMutation.id,
            params: {
                unitId: 'u1',
                subUnitId: 's1',
                range: { startRow: 1, endRow: 2, startColumn: 0, endColumn: 10 },
            },
        });

        expect(tableManager.updateTableRange).toHaveBeenCalledWith('u1', 't1', {
            newRange: {
                startRow: 7,
                endRow: 12,
                startColumn: 1,
                endColumn: 3,
            },
        });

        controller.dispose();
    });

    it('should include table formula reference mutations when worksheet column removal deletes table columns', () => {
        let interceptCommandConfig: any;
        const tableColumn = {
            toJSON: () => ({ id: 'c1', displayName: '1' }),
        };
        const table = {
            getId: () => 't1',
            getRange: () => ({ startRow: 0, endRow: 5, startColumn: 1, endColumn: 3 }),
            getTableInfo: () => ({ name: 'Table' }),
            getTableColumnByIndex: vi.fn(() => tableColumn),
            toJSON: () => ({
                id: 't1',
                name: 'Table',
                range: { startRow: 0, endRow: 5, startColumn: 1, endColumn: 3 },
                options: { showHeader: true },
                filters: {},
                columns: [{ id: 'c1', displayName: '1' }, { id: 'c2', displayName: '2' }, { id: 'c3', displayName: '3' }],
            }),
        };
        const workbook = {
            getUnitId: () => 'u1',
            getActiveSheet: () => ({ getSheetId: () => 's1' }),
        };
        const onCommandExecute = vi.fn(() => ({
            preRedos: [{ id: 'formula.pre-redo', params: {} }],
            redos: [{ id: 'formula.redo', params: {} }],
            preUndos: [{ id: 'formula.pre-undo', params: {} }],
            undos: [{ id: 'formula.undo', params: {} }],
        }));

        const controller = new SheetTableRefRangeController(
            { onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })) } as any,
            {} as any,
            { getCurrentUnitOfType: () => workbook } as any,
            {} as any,
            {
                interceptCommand: vi.fn((config: any) => {
                    interceptCommandConfig = config;
                    return { dispose: vi.fn() };
                }),
                onCommandExecute,
            } as any,
            {
                getTablesBySubunitId: vi.fn(() => [table]),
            } as any,
            { t: () => 'Column' } as any
        );

        const result = interceptCommandConfig.getMutations({
            id: RemoveColCommand.id,
            params: {
                range: { startRow: 0, endRow: 99, startColumn: 1, endColumn: 1 },
            },
        });

        expect(onCommandExecute).toHaveBeenCalledWith({
            id: 'sheet.command.table-remove-col',
            params: {
                unitId: 'u1',
                subUnitId: 's1',
                tableId: 't1',
                tableName: 'Table',
                range: { startRow: 0, endRow: 99, startColumn: 1, endColumn: 1 },
                removedColumnNames: ['1'],
            },
        });
        expect(result.preRedos.map((mutation: any) => mutation.id)).toEqual([]);
        expect(result.redos.map((mutation: any) => mutation.id)).toEqual([
            'formula.pre-redo',
            'formula.redo',
            'sheet.mutation.set-sheet-table',
        ]);
        expect(result.preUndos.map((mutation: any) => mutation.id)).toEqual([
            'sheet.mutation.delete-table',
        ]);
        expect(result.undos.map((mutation: any) => mutation.id)).toEqual([
            'sheet.mutation.add-table',
            'formula.pre-undo',
            'formula.undo',
        ]);

        controller.dispose();
    });
});
