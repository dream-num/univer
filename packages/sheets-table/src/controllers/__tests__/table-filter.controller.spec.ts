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
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { ISheetRowFilteredService, SheetRowFilteredService } from '@univerjs/engine-formula';
import {
    INTERCEPTOR_POINT,
    SheetInterceptorService,
    SheetRangeThemeModel,
    ZebraCrossingCacheController,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DeleteSheetTableCommand } from '../../commands/commands/delete-sheet-table.command';
import { SetSheetTableFilterCommand } from '../../commands/commands/set-table-filter.command';
import { AddSheetTableMutation } from '../../commands/mutations/add-sheet-table.mutation';
import { DeleteSheetTableMutation } from '../../commands/mutations/delete-sheet-table.mutation';
import { SetSheetTableFilterMutation } from '../../commands/mutations/set-table-filter.mutation';
import enUS from '../../locale/en-US';
import { TableManager } from '../../models/table-manager';
import { SheetTableService } from '../../services/table.service';
import { TableColumnFilterTypeEnum } from '../../types/enum';
import { TableFilterController } from '../table-filter.controller';

describe('TableFilterController', () => {
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
