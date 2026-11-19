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

import type { Dependency, IWorkbookData, Workbook } from '@univerjs/core';
import { BooleanNumber, ICommandService, IUniverInstanceService, LocaleService, LocaleType, UndoCommand, Univer, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { RangeThemeInterceptorId, RangeThemeStyle, SheetInterceptorService, SheetRangeThemeModel, SheetRangeThemeService, UniverSheetsPlugin } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DeleteSheetTableCommand } from '../../commands/commands/delete-sheet-table.command';
import { AddSheetTableMutation } from '../../commands/mutations/add-sheet-table.mutation';
import { DeleteSheetTableMutation } from '../../commands/mutations/delete-sheet-table.mutation';
import { PLUGIN_NAME } from '../../const';
import enUS from '../../locale/en-US';
import { Table } from '../../models/table';
import { TableManager } from '../../models/table-manager';
import { UniverSheetsTablePlugin } from '../../plugin';
import { SheetTableService } from '../../services/table.service';
import { SheetsTableThemeController } from '../sheet-table-theme.controller';
import { SheetsTableController } from '../sheets-table.controller';
import '@univerjs/sheets/facade';

describe('SheetsTableThemeController', () => {
    let univer: Univer;
    let workbook: Workbook;
    let manager: TableManager;
    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        const dependencies: Dependency[] = [
            [SheetTableService],
            [TableManager],
            [SheetInterceptorService],
            [SheetRangeThemeModel],
            [SheetRangeThemeService],
            [SheetsTableThemeController],
            [SheetsTableController],
        ];
        dependencies.forEach((dependency) => injector.add(dependency));
        const locale = injector.get(LocaleService);
        locale.load({ enUS });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        injector.get(SheetInterceptorService);
        injector.get(SheetRangeThemeModel);
        injector.get(SheetsTableThemeController);
        injector.get(SheetsTableController);
        workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'book',
            appVersion: '1.0.0',
            locale: LocaleType.EN_US,
            name: 'Tables',
            styles: {},
            sheetOrder: ['sheet'],
            sheets: { sheet: { id: 'sheet', name: 'Sheet', rowCount: 20, columnCount: 10, cellData: { 1: { 1: { v: 12 } }, 2: { 1: { v: 20, s: { bg: { rgb: '#abcdef' } } } } } } },
        });
        injector.get(IUniverInstanceService).focusUnit('book');
        manager = injector.get(TableManager);
    });
    afterEach(() => univer.dispose());

    it('keeps default themes and updates the registered range after moves and theme changes', () => {
        const id = manager.addTable('book', 'sheet', 'Orders', { startRow: 0, endRow: 3, startColumn: 0, endColumn: 1 }, ['Name', 'Amount']);
        const table = manager.getTable('book', id)!;
        const service = univer.__getInjector().get(SheetRangeThemeService);
        expect(table.getTableStyleId()).toBe('table-default-0');
        manager.setTableByConfig('book', id, { theme: 'table-default-1' });
        const range = { startRow: 5, endRow: 8, startColumn: 2, endColumn: 3 };
        manager.moveTable('book', id, 'sheet', range);
        expect(service.getAppliedRangeThemeStyle({ unitId: 'book', subUnitId: 'sheet', range })).toBe('table-default-1');
    });

    it('keeps unformatted tables and nonmatching regions on the ordinary theme path', () => {
        const id = manager.addTable('book', 'sheet', 'Orders', { startRow: 0, endRow: 3, startColumn: 0, endColumn: 1 }, ['Name', 'Amount']);
        const table = manager.getTable('book', id)!;
        const sheet = workbook.getActiveSheet();
        const model = univer.__getInjector().get(SheetRangeThemeModel);
        expect(table.toJSON().meta).toBeUndefined();
        expect(sheet.getCell(1, 1)?.themeStyle).toBe(model.getCellStyle('book', 'sheet', 1, 1));
        expect(sheet.getComposedCellStyle(2, 1).bg?.rgb).toBe('#abcdef');
        table.setTableMeta({ _xlsx: { options: { headerRowDxfStyle: { cl: { rgb: '#123456' } } } } });
        expect(sheet.getCell(1, 1)?.themeStyle).toBe(model.getCellStyle('book', 'sheet', 1, 1));
        expect(sheet.getCell(0, 1)?.themeStyle?.cl?.rgb).toBe('#123456');
        expect(sheet.getCellRaw(1, 1)).toEqual({ v: 12 });
    });

    it('composes themes and table/column dxf metadata while leaving raw cells unchanged', () => {
        univer.__getInjector().get(SheetRangeThemeModel).registerDefaultRangeTheme(new RangeThemeStyle('imported-theme', {
            wholeStyle: { bg: { rgb: '#eeeeee' }, bl: BooleanNumber.TRUE },
            headerRowStyle: { bg: { rgb: '#111111' } },
        }));
        const id = manager.addTable('book', 'sheet', 'Orders', { startRow: 0, endRow: 3, startColumn: 0, endColumn: 1 }, ['Name', 'Amount'], undefined, { tableStyleId: 'imported-theme' }, { _xlsx: { options: { dataDxfStyle: { cl: { rgb: '#123456' } } } } });
        const table = manager.getTable('book', id)!;
        table.getTableColumnByIndex(1)!.setMeta({ _xlsx: { dataDxfStyle: { n: { pattern: '0.00' }, bl: BooleanNumber.FALSE } } });
        const sheet = workbook.getActiveSheet();
        expect(sheet.getComposedCellStyle(1, 1)).toMatchObject({ bg: { rgb: '#eeeeee' }, cl: { rgb: '#123456' }, bl: BooleanNumber.FALSE, n: { pattern: '0.00' } });
        expect(sheet.getComposedCellStyle(2, 1).bg?.rgb).toBe('#abcdef');
        expect(sheet.getCellRaw(1, 1)).toEqual({ v: 12 });
        expect(sheet.getCellWithFilteredInterceptors(1, 1, RangeThemeInterceptorId, (interceptor) => interceptor.id !== RangeThemeInterceptorId)?.themeStyle).toBeUndefined();
        expect(sheet.getCellStyleOnly(1, 1)?.themeStyle?.n?.pattern).toBe('0.00');
        expect(manager.toJSON('book').sheet.tables[0].columns[1].meta._xlsx.dataDxfStyle.n.pattern).toBe('0.00');
        const range = { startRow: 5, endRow: 8, startColumn: 2, endColumn: 3 };
        manager.moveTable('book', id, 'sheet', range);
        expect(sheet.getComposedCellStyle(6, 3).n?.pattern).toBe('0.00');
        expect(sheet.getComposedCellStyle(1, 1).n).toBeUndefined();
    });

    it('does not add a default theme to an imported unstyled table with direct formats', () => {
        const id = manager.addTable('book', 'sheet', 'Orders', { startRow: 0, endRow: 3, startColumn: 0, endColumn: 1 }, ['Name', 'Amount'], undefined, {}, { _xlsx: { rawTableXml: '<table/>', options: { dataDxfStyle: { n: { pattern: '0.00' } } } } });
        expect(manager.getTable('book', id)!.getTableStyleId()).toBe('');
        manager.moveTable('book', id, 'sheet', { startRow: 5, endRow: 8, startColumn: 2, endColumn: 3 });
        expect(manager.getTable('book', id)!.getTableStyleId()).toBe('');
        expect(workbook.getActiveSheet().getComposedCellStyle(6, 3).n?.pattern).toBe('0.00');
    });
    it('preserves table and column dxf metadata through deletion and undo', async () => {
        const injector = univer.__getInjector();
        const commands = injector.get(ICommandService);
        commands.registerCommand(DeleteSheetTableCommand);
        commands.registerCommand(DeleteSheetTableMutation);
        commands.registerCommand(AddSheetTableMutation);
        const id = manager.addTable('book', 'sheet', 'Orders', { startRow: 0, endRow: 3, startColumn: 0, endColumn: 1 }, ['Name', 'Amount'], undefined, {}, { _xlsx: { options: { dataDxfStyle: { n: { pattern: '0.00' } } } } });
        manager.getTable('book', id)!.getTableColumnByIndex(1)!.setMeta({ _xlsx: { headerRowDxfStyle: { bl: BooleanNumber.FALSE } } });
        const before = JSON.parse(JSON.stringify(manager.getTable('book', id)!.toJSON()));
        expect(await commands.executeCommand(DeleteSheetTableCommand.id, { unitId: 'book', subUnitId: 'sheet', tableId: id })).toBe(true);
        expect(manager.getTable('book', id)).toBeUndefined();
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(manager.getTable('book', id)!.toJSON()).toMatchObject(before);
    });
    it('keeps theme identity and all region metadata through actual Facade structural edits and save', async () => {
        const headless = new Univer();
        try {
            const locale = headless.__getInjector().get(LocaleService);
            locale.load({ enUS });
            locale.setLocale(LocaleType.EN_US);
            locale.setDirection('ltr');
            headless.registerPlugin(UniverSheetsPlugin);
            headless.registerPlugin(UniverSheetsTablePlugin);
            const table = new Table('orders', 'Orders', { startRow: 0, endRow: 4, startColumn: 0, endColumn: 1 }, ['Name', 'Amount'], { tableStyleId: 'table-default-0', showFooter: true });
            table.setTableMeta({ _xlsx: { options: {
                dataDxfStyle: { n: { pattern: '0.00' } },
                headerRowDxfStyle: { bl: BooleanNumber.FALSE },
                totalsRowDxfStyle: { n: { pattern: '0.000' } },
            } } });
            table.getTableColumnByIndex(1)!.setMeta({ _xlsx: {
                dataDxfStyle: { n: { pattern: '0.0000' } },
                headerRowDxfStyle: { cl: { rgb: '#123456' } },
                totalsRowDxfStyle: { bl: BooleanNumber.TRUE },
            } });
            const before = JSON.parse(JSON.stringify(table.toJSON()));
            const api = FUniver.newAPI(headless);
            const book = api.createWorkbook({ id: 'facade-book', name: 'Facade', appVersion: '1.0.0', locale: LocaleType.EN_US, styles: {}, sheetOrder: ['data'], sheets: { data: { id: 'data', name: 'Data', rowCount: 20, columnCount: 10, cellData: { 0: { 0: { v: 'Name' }, 1: { v: 'Amount' } }, 1: { 0: { v: 'A' }, 1: { v: 10 } }, 2: { 0: { v: 'B' }, 1: { v: 20 } } } } }, resources: [{ name: PLUGIN_NAME, data: JSON.stringify({ data: { tables: [before], tableFilteredOutRows: [] } }) }] });
            headless.__getInjector().get(IUniverInstanceService).focusUnit('facade-book');
            book.getActiveSheet().insertRows(0, 1);
            book.getActiveSheet().deleteRows(2, 1);
            book.getActiveSheet().insertColumns(0, 1);
            book.getActiveSheet().deleteColumns(0, 1);
            book.getActiveSheet().deleteColumns(1, 1);
            expect(await headless.__getInjector().get(ICommandService).executeCommand(UndoCommand.id)).toBe(true);
            const saved = book.save();
            const resource = saved.resources!.find((item) => item.name === PLUGIN_NAME)!;
            const after = JSON.parse(resource.data).data.tables[0];
            expect(after.options.tableStyleId).toBe(before.options.tableStyleId);
            expect(after.meta).toEqual(before.meta);
            expect(after.columns.map((column: { meta: unknown }) => column.meta)).toEqual(before.columns.map((column: { meta: unknown }) => column.meta));
            expect(after.range).toMatchObject({ startRow: 1, endRow: 4, startColumn: 0, endColumn: 1 });
            const unit = headless.__getInjector().get(IUniverInstanceService).getUnit<Workbook>('facade-book')!;
            expect(unit.getActiveSheet().getComposedCellStyle(2, 1).n?.pattern).toBe('0.0000');
            expect(saved.sheets.data.cellData?.[2]?.[1]).toMatchObject({ v: 20 });
            expect(saved.sheets.data.cellData?.[2]?.[1]?.s).toBeUndefined();
        } finally {
            headless.dispose();
        }
    });
});
