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
import { ICommandService, Inject, Injector, LocaleService, LocaleType, Plugin, Univer, UniverInstanceType } from '@univerjs/core';
import { SetRangeValuesMutation } from '@univerjs/sheets';
import {
    SetSheetTableFilterCommand,
    SetSheetTableFilterMutation,
    SheetTableService,
    TABLE_FILTER_EMPTY_VALUE,
    TableColumnFilterTypeEnum,
    TableManager,
} from '@univerjs/sheets-table';
import { afterEach, describe, expect, it } from 'vitest';
import { FilterByEnum } from '../../types';
import { SheetsTableUiService } from '../sheets-table-ui.service';

interface ITestBed {
    univer: Univer;
    get: Injector['get'];
    workbook: Workbook;
}

function createWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'test',
        sheetOrder: ['sheet1'],
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'Sheet1',
                rowCount: 20,
                columnCount: 20,
                cellData: {
                    0: {
                        0: { v: 'product' },
                        1: { v: 'amount' },
                    },
                    1: {
                        0: { v: 'book' },
                        1: { v: 12 },
                    },
                    2: {
                        0: { v: 'pen' },
                        1: { v: 3 },
                    },
                    3: {
                        1: { v: 8 },
                    },
                },
            },
        },
        styles: {},
    };
}

function createTestBed(): ITestBed {
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
            const dependencies: Dependency[] = [
                [TableManager],
                [SheetTableService],
                [SheetsTableUiService],
            ];
            dependencies.forEach((dependency) => this._injector.add(dependency));
        }
    }

    univer.registerPlugin(TestPlugin);
    const localeService = injector.get(LocaleService);
    localeService.load({
        [LocaleType.EN_US]: {
            'sheets-table-ui': {
                condition: {
                    empty: '(Empty)',
                },
            },
        },
    });
    localeService.setLocale(LocaleType.EN_US);

    const commandService = injector.get(ICommandService);
    [SetSheetTableFilterCommand, SetSheetTableFilterMutation, SetRangeValuesMutation].forEach((command) => {
        commandService.registerCommand(command);
    });

    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
    injector.get(SheetTableService).addTable(
        workbook.getUnitId(),
        'sheet1',
        'Orders',
        { startRow: 0, endRow: 3, startColumn: 0, endColumn: 1 },
        ['Product', 'Amount'],
        'table-orders',
        {
            filters: [
                { filterType: TableColumnFilterTypeEnum.manual, values: ['book', TABLE_FILTER_EMPTY_VALUE] },
            ],
        }
    );

    return {
        univer,
        get: injector.get.bind(injector),
        workbook,
    };
}

describe('SheetsTableUiService', () => {
    let testBed: ITestBed | undefined;

    afterEach(() => {
        testBed?.univer.dispose();
        testBed = undefined;
    });

    it('builds filter panel state from the selected table column', () => {
        testBed = createTestBed();
        const service = testBed.get(SheetsTableUiService);

        expect(service.getTableFilterPanelInitProps(testBed.workbook.getUnitId(), 'sheet1', 'table-orders', 0)).toEqual({
            unitId: testBed.workbook.getUnitId(),
            subUnitId: 'sheet1',
            tableFilter: { filterType: TableColumnFilterTypeEnum.manual, values: ['book', TABLE_FILTER_EMPTY_VALUE] },
            currentFilterBy: FilterByEnum.Items,
            tableId: 'table-orders',
            columnIndex: 0,
        });
    });

    it('localizes checked manual filter values for blank cells', () => {
        testBed = createTestBed();
        const service = testBed.get(SheetsTableUiService);

        expect(service.getTableFilterCheckedItems(testBed.workbook.getUnitId(), 'table-orders', 0)).toEqual(['book', '(Empty)']);
    });

    it('builds candidate values after applying filters from other table columns', () => {
        testBed = createTestBed();
        const service = testBed.get(SheetsTableUiService);

        const items = service.getTableFilterItems(testBed.workbook.getUnitId(), 'sheet1', 'table-orders', 1);

        expect(items.allItemsCount).toBe(2);
        expect(items.data).toEqual([
            { title: 12, key: '1_1', leaf: true },
            { title: 8, key: '1_3', leaf: true },
        ]);
        expect(items.itemsCountMap.get(12 as unknown as string)).toBe(1);
        expect(items.itemsCountMap.get(8 as unknown as string)).toBe(1);
    });

    it('refreshes cached candidates when table data changes inside the filter range', async () => {
        testBed = createTestBed();
        const service = testBed.get(SheetsTableUiService);
        const commandService = testBed.get(ICommandService);

        expect(service.getTableFilterItems(testBed.workbook.getUnitId(), 'sheet1', 'table-orders', 1).data).toEqual([
            { title: 12, key: '1_1', leaf: true },
            { title: 8, key: '1_3', leaf: true },
        ]);

        await commandService.executeCommand(SetRangeValuesMutation.id, {
            unitId: testBed.workbook.getUnitId(),
            subUnitId: 'sheet1',
            cellValue: {
                1: {
                    1: { v: 15 },
                },
            },
        });

        expect(service.getTableFilterItems(testBed.workbook.getUnitId(), 'sheet1', 'table-orders', 1).data).toEqual([
            { title: 15, key: '1_1', leaf: true },
            { title: 8, key: '1_3', leaf: true },
        ]);
    });

    it('updates the table through the filter command', async () => {
        testBed = createTestBed();
        const service = testBed.get(SheetsTableUiService);

        service.setTableFilter(testBed.workbook.getUnitId(), 'table-orders', 0, {
            filterType: TableColumnFilterTypeEnum.manual,
            values: ['pen'],
        });
        await Promise.resolve();

        const table = testBed.get(TableManager).getTable(testBed.workbook.getUnitId(), 'table-orders')!;
        expect(table.getTableFilterColumn(0)).toEqual({
            filterType: TableColumnFilterTypeEnum.manual,
            values: ['pen'],
        });
    });
});
