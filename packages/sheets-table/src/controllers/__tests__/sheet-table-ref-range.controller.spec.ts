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

import type { IRange, IWorkbookData, Workbook } from '@univerjs/core';
import {
    Direction,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { InsertColCommand, InsertRowMutation, RemoveColCommand, SetRangeValuesCommand, SheetInterceptorService } from '@univerjs/sheets';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { describe, expect, it, onTestFinished } from 'vitest';
import { AddSheetTableCommand } from '../../commands/commands/add-sheet-table.command';
import enUS from '../../locale/en-US';
import { TableManager } from '../../models/table-manager';
import { UniverSheetsTablePlugin } from '../../plugin';
import { SheetTableRefRangeController } from '../sheet-table-ref-range.controller';

const unitId = 'book';
const subUnitId = 'sheet';

async function createTableTestBed(range: IRange) {
    const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
    onTestFinished(() => univer.dispose());
    univer.registerPlugin(UniverSheetsFormulaPlugin);
    univer.registerPlugin(UniverSheetsTablePlugin);
    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
        id: unitId,
        sheetOrder: [subUnitId],
        sheets: {
            [subUnitId]: {
                id: subUnitId,
                name: 'Sheet',
                rowCount: 20,
                columnCount: 20,
                cellData: {
                    [range.startRow]: { [range.startColumn]: { v: 'Region' }, [range.startColumn + 1]: { v: 'Sales' } },
                },
            },
        },
    });
    const injector = univer.__getInjector();
    injector.get(LocaleService).setDirection('ltr');
    injector.get(IUniverInstanceService).focusUnit(unitId);
    injector.get(SheetTableRefRangeController);
    const commands = injector.get(ICommandService);
    const tables = injector.get(TableManager);
    expect(await commands.executeCommand(AddSheetTableCommand.id, {
        unitId,
        subUnitId,
        id: 'table',
        name: 'Orders',
        range,
    })).toBe(true);
    const table = () => tables.getTable(unitId, 'table')!.toJSON();
    return { commands, injector, table, worksheet: workbook.getActiveSheet() };
}

describe('SheetTableRefRangeController', () => {
    it.each([
        { command: InsertColCommand, start: 4 },
        { command: RemoveColCommand, start: 2 },
    ])('preserves table column identity when $command.id shifts the table', async ({ command, start }) => {
        const { commands, table } = await createTableTestBed({ startRow: 0, endRow: 3, startColumn: 3, endColumn: 4 });
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

    it('leaves the table unchanged for unrelated commands and moves it after a row insertion mutation', async () => {
        const range = { startRow: 5, endRow: 10, startColumn: 1, endColumn: 2 };
        const { commands, injector, table } = await createTableTestBed(range);
        const interceptor = injector.get(SheetInterceptorService);
        const before = table();

        expect(interceptor.onCommandExecute({ id: 'unknown.command' })).toMatchObject({ redos: [], undos: [] });
        expect(table()).toEqual(before);

        expect(commands.syncExecuteCommand(InsertRowMutation.id, {
            unitId,
            subUnitId,
            range: { startRow: 1, endRow: 2, startColumn: 0, endColumn: 19 },
        })).toBe(true);
        expect(table()).toEqual({ ...before, range: { ...range, startRow: 7, endRow: 12 } });
    });

    it('updates and restores structured references when deleting the first table column', async () => {
        const { commands, table, worksheet } = await createTableTestBed({ startRow: 0, endRow: 5, startColumn: 1, endColumn: 2 });
        const expression = '=SUM(Orders[Region],Orders[Sales])';
        expect(await commands.executeCommand(SetRangeValuesCommand.id, {
            unitId,
            subUnitId,
            range: { startRow: 7, endRow: 7, startColumn: 5, endColumn: 5 },
            value: { f: expression },
        })).toBe(true);
        const before = table();

        expect(await commands.executeCommand(RemoveColCommand.id, {
            unitId,
            subUnitId,
            range: { startRow: 0, endRow: 19, startColumn: 1, endColumn: 1 },
        })).toBe(true);
        expect(table().columns).toEqual(before.columns.slice(1));
        expect(worksheet.getCellRaw(7, 4)?.f).toBe('=SUM(#REF!,Orders[Sales])');

        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(table()).toEqual(before);
        expect(worksheet.getCellRaw(7, 5)?.f).toBe(expression);

        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(table().columns).toEqual(before.columns.slice(1));
        expect(worksheet.getCellRaw(7, 4)?.f).toBe('=SUM(#REF!,Orders[Sales])');
    });
});
