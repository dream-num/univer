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

import type { Dependency, IWorkbookData, UnitModel } from '@univerjs/core';
import {
    ICommandService,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import {
    DefinedNamesService,
    FormulaDataModel,
    FunctionService,
    IDefinedNamesService,
    IFunctionService,
    ISuperTableService,
    LexerTreeBuilder,
    SuperTableService,
} from '@univerjs/engine-formula';
import {
    AddRangeThemeMutation,
    RefRangeService,
    RemoveRangeThemeMutation,
    SheetInterceptorService,
    SheetRangeThemeModel,
    SheetSkeletonService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import {
    AddSheetTableCommand,
    AddSheetTableMutation,
    AddTableThemeCommand,
    DeleteSheetTableCommand,
    DeleteSheetTableMutation,
    SetSheetTableCommand,
    SetSheetTableFilterCommand,
    SetSheetTableFilterMutation,
    SetSheetTableMutation,
    SheetTableService,
    TableColumnFilterTypeEnum,
    TableConditionTypeEnum,
    TableManager,
    TableNumberCompareTypeEnum,
} from '@univerjs/sheets-table';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import enUS from '../../locale/en-US';
import '@univerjs/sheets/facade';
import '@univerjs/sheets-table/facade';

function createWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'sheet1',
                cellData: {},
                rowCount: 100,
                columnCount: 100,
            },
        },
        locale: LocaleType.EN_US,
        name: '',
        sheetOrder: ['sheet1'],
        styles: {},
    };
}

function createTableFacadeTestBed(dependencies: Dependency[]) {
    const univer = new Univer();
    const injector = univer.__getInjector();

    class TestPlugin extends Plugin {
        static override pluginName = 'test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            const injector = this._injector;
            injector.add([SheetsSelectionsService]);
            injector.add([SheetInterceptorService]);
            injector.add([IFunctionService, { useClass: FunctionService }]);
            injector.add([SheetSkeletonService]);
            injector.add([SheetRangeThemeModel]);
            injector.add([FormulaDataModel]);
            injector.add([LexerTreeBuilder]);
            injector.add([RefRangeService]);
            injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);
            injector.add([ISuperTableService, { useClass: SuperTableService }]);
            dependencies.forEach((dependency) => injector.add(dependency));

            const localeService = injector.get(LocaleService);
            localeService.load({ [LocaleType.EN_US]: enUS });
            localeService.setLocale(LocaleType.EN_US);

            this._injector.get(SheetInterceptorService);
        }
    }

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUnit<IWorkbookData, UnitModel<IWorkbookData>>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
    injector.get(IUniverInstanceService).focusUnit(sheet.getUnitId());
    injector.get(ILogService).setLogLevel(LogLevel.SILENT);

    return {
        univer,
        get: injector.get.bind(injector),
        univerAPI: FUniver.newAPI(injector),
    };
}

describe('sheets-table facade', () => {
    let testBed: ReturnType<typeof createTableFacadeTestBed>;

    beforeEach(() => {
        const dependencies: Dependency[] = [
            [TableManager],
            [SheetTableService],
        ];

        testBed = createTableFacadeTestBed(dependencies);

        const commandService = testBed.get(ICommandService);
        [
            AddSheetTableCommand,
            AddSheetTableMutation,
            AddTableThemeCommand,
            AddRangeThemeMutation,
            DeleteSheetTableCommand,
            DeleteSheetTableMutation,
            RemoveRangeThemeMutation,
            SetSheetTableCommand,
            SetSheetTableMutation,
            SetSheetTableFilterCommand,
            SetSheetTableFilterMutation,
        ].forEach((command) => commandService.registerCommand(command));
    });

    afterEach(() => {
        testBed.univer.dispose();
    });

    it('manages worksheet tables through workbook and worksheet facades', async () => {
        const workbook = testBed.univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet();
        const range = worksheet.getRange('A1:B3').getRange();
        const sheetTableService = testBed.get(SheetTableService);

        sheetTableService.addTable(
            workbook.getId(),
            worksheet.getSheetId(),
            'Orders',
            range,
            ['Name', 'Quantity'],
            'table-orders',
            { tableStyleId: 'table-default-1' }
        );
        expect(workbook.getTableInfo('table-orders')).toMatchObject({
            id: 'table-orders',
            name: 'Orders',
            subUnitId: worksheet.getSheetId(),
            range,
            unitId: workbook.getId(),
        });
        expect(workbook.getTableInfoByName('Orders')?.id).toBe('table-orders');
        expect(worksheet.getSubTableInfos().map((table) => table.id)).toEqual(['table-orders']);
        expect(worksheet.getTableByCell(1, 1)?.id).toBe('table-orders');

        await expect(worksheet.setTableName('table-orders', 'Orders2026')).resolves.toBe(true);
        expect(workbook.getTableInfoByName('Orders2026')?.id).toBe('table-orders');

        await expect(workbook.removeTable('table-orders')).resolves.toBe(true);
        expect(workbook.getTableList()).toEqual([]);
        await expect(workbook.removeTable('missing-table')).resolves.toBe(false);
    });

    it('sets and clears table filters and exposes table enums on the facade', async () => {
        const workbook = testBed.univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet();
        testBed.get(SheetTableService).addTable(
            workbook.getId(),
            worksheet.getSheetId(),
            'Inventory',
            worksheet.getRange('A1:B3').getRange(),
            ['Name', 'Quantity'],
            'table-inventory'
        );

        expect(testBed.univerAPI.Enum.TableColumnFilterTypeEnum.condition).toBe(TableColumnFilterTypeEnum.condition);
        await expect(workbook.setTableFilter('table-inventory', 1, {
            filterType: TableColumnFilterTypeEnum.condition,
            filterInfo: {
                conditionType: TableConditionTypeEnum.Number,
                compareType: TableNumberCompareTypeEnum.GreaterThan,
                expectedValue: 10,
            },
        })).resolves.toBe(true);
        await expect(worksheet.resetFilter('table-inventory', 1)).resolves.toBe(true);
    });

    it('adds and resizes tables through workbook and worksheet facades', async () => {
        const workbook = testBed.univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet();
        const invoiceRange = worksheet.getRange('A1:B3').getRange();

        await expect(workbook.addTable(worksheet.getSheetId(), 'Invoices', invoiceRange, 'table-invoices', {
            tableStyleId: 'table-default-2',
        })).resolves.toBe('table-invoices');
        expect(workbook.getTableInfo('table-invoices')).toMatchObject({
            id: 'table-invoices',
            name: 'Invoices',
            range: invoiceRange,
        });

        const resizedRange = worksheet.getRange('A1:B4').getRange();
        await expect(worksheet.setTableRange('table-invoices', resizedRange)).resolves.toBe(true);
        expect(workbook.getTableInfo('table-invoices')?.range).toEqual(resizedRange);
        expect(worksheet.setTableName('table-invoices', 'sheet1')).toBe(false);

        await expect(workbook.removeTable('table-invoices')).resolves.toBe(true);

        await expect(worksheet.addTable('Receipts', worksheet.getRange('E1:F3').getRange(), 'table-receipts')).resolves.toBe(true);
        expect(workbook.getTableInfoByName('Receipts')?.id).toBe('table-receipts');
        await expect(worksheet.removeTable('table-receipts')).resolves.toBe(true);
    });

    it('styles and removes tables through worksheet facade commands', async () => {
        const workbook = testBed.univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet();
        const range = worksheet.getRange('C1:D4').getRange();
        const sheetTableService = testBed.get(SheetTableService);
        const tableManager = testBed.get(TableManager);

        sheetTableService.addTable(
            workbook.getId(),
            worksheet.getSheetId(),
            'Shipments',
            range,
            ['Carrier', 'Count'],
            'table-shipments',
            { tableStyleId: 'table-default-1' }
        );
        expect(workbook.getTableInfo('table-shipments')).toMatchObject({
            id: 'table-shipments',
            name: 'Shipments',
            range,
        });

        await expect(worksheet.addTableTheme('table-shipments', {
            name: 'table-custom',
            headerRowStyle: {
                bg: { rgb: '#111111' },
                cl: { rgb: '#ffffff' },
            },
            firstRowStyle: {
                bg: { rgb: '#ffffff' },
            },
            secondRowStyle: {
                bg: { rgb: '#eeeeee' },
            },
        })).resolves.toBe(true);
        expect(tableManager.getTableById(workbook.getId(), 'table-shipments')?.getTableStyleId()).toBe('table-custom');

        await expect(worksheet.removeTable('table-shipments')).resolves.toBe(true);
        expect(worksheet.getSubTableInfos()).toEqual([]);
    });
});
