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
import { BooleanNumber, BorderStyleTypes, ICommandService, IResourceLoaderService, IUniverInstanceService, LocaleType, RedoCommand, UndoCommand, Univer, UniverInstanceType } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import enUS from '../../../locale/en-US';
import { TableManager } from '../../../models/table-manager';
import { UniverSheetsTablePlugin } from '../../../plugin';
import { AddSheetTableCommand } from '../add-sheet-table.command';
import { SetSheetTableCommand } from '../set-sheet-table.command';

const universes: Univer[] = [];

function openWorkbook(data: Partial<IWorkbookData>) {
    const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
    universes.push(univer);
    univer.registerPlugin(UniverSheetsTablePlugin);
    const injector = univer.__getInjector();
    const workbook = univer.createUnit<Partial<IWorkbookData>, Workbook>(UniverInstanceType.UNIVER_SHEET, data);
    injector.get(IUniverInstanceService).focusUnit(workbook.getUnitId());
    return { injector, workbook };
}

afterEach(() => universes.splice(0).forEach((univer) => univer.dispose()));

describe('SetSheetTableCommand', () => {
    it('stores gridlines per table, restores inheritance on undo, and reopens both overrides with cell borders intact', () => {
        const border = { r: { s: BorderStyleTypes.THICK, cl: { rgb: '#FF0000' } } };
        const { injector, workbook } = openWorkbook({
            id: 'unit',
            sheetOrder: ['sheet'],
            sheets: {
                sheet: {
                    id: 'sheet',
                    name: 'Sheet1',
                    showGridlines: BooleanNumber.FALSE,
                    cellData: { 1: { 0: { v: 'Entry', s: { bd: border } } } },
                },
            },
        });
        const commands = injector.get(ICommandService);
        const manager = injector.get(TableManager);
        const unitId = workbook.getUnitId();
        for (const [id, column] of [['TableA', 0], ['TableB', 3]] as const) {
            expect(commands.syncExecuteCommand(AddSheetTableCommand.id, {
                unitId,
                subUnitId: 'sheet',
                id,
                name: id,
                range: { startRow: 0, endRow: 3, startColumn: column, endColumn: column + 1 },
            })).toBe(true);
        }
        const first = manager.getTableById(unitId, 'TableA')!;
        const second = manager.getTableById(unitId, 'TableB')!;
        expect(commands.syncExecuteCommand(SetSheetTableCommand.id, { unitId, tableId: first.getId(), showGridlines: true })).toBe(true);
        expect(first.getShowGridlines()).toBe(true);
        expect(second.getShowGridlines()).toBeUndefined();
        expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(true);
        expect(first.getShowGridlines()).toBeUndefined();
        expect(commands.syncExecuteCommand(RedoCommand.id)).toBe(true);
        expect(first.getShowGridlines()).toBe(true);
        expect(commands.syncExecuteCommand(SetSheetTableCommand.id, { unitId, tableId: second.getId(), showGridlines: false })).toBe(true);
        expect(commands.syncExecuteCommand(SetSheetTableCommand.id, {
            unitId,
            tableId: first.getId(),
            theme: 'table-default-1',
            updateRange: { newRange: { ...first.getRange(), endRow: 5 } },
        })).toBe(true);

        const snapshot = injector.get(IResourceLoaderService).saveUnit<IWorkbookData>(unitId)!;
        const reopened = openWorkbook(JSON.parse(JSON.stringify(snapshot)));
        const reopenedManager = reopened.injector.get(TableManager);
        expect(reopenedManager.getTableById(unitId, first.getId())?.getTableInfo()).toMatchObject({
            showGridlines: true,
            range: { endRow: 5 },
        });
        expect(reopenedManager.getTableById(unitId, second.getId())?.getShowGridlines()).toBe(false);
        expect(reopened.workbook.getActiveSheet().getConfig().showGridlines).toBe(BooleanNumber.FALSE);
        expect(reopened.workbook.getActiveSheet().getCellRaw(1, 0)?.s).toEqual({ bd: border });
    });
});
