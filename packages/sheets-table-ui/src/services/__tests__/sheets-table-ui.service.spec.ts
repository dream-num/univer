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
import type { ITableRecordFilterItem } from '@univerjs/sheets-table';
import {
    FilterSelectionMode,
    ICommandService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    Plugin,
    RecordValueType,
    RedoCommand,
    ThemeColorType,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { SetRangeValuesMutation } from '@univerjs/sheets';
import {
    getTableRecordValueKey,
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
                        1: { v: 12, s: { bg: { rgb: '#ff0000' } } },
                    },
                    2: {
                        0: { v: 'pen' },
                        1: { v: '12', s: { bg: { rgb: '#0000ff' } } },
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

        expect(service.getTableFilterCheckedItems(testBed.workbook.getUnitId(), 'table-orders', 0))
            .toEqual(['book', '(Empty)']);
    });

    it('builds color filter state and candidates after applying other table filters', async () => {
        testBed = createTestBed();
        const service = testBed.get(SheetsTableUiService);
        await testBed.get(ICommandService).executeCommand(SetRangeValuesMutation.id, {
            unitId: testBed.workbook.getUnitId(),
            subUnitId: 'sheet1',
            cellValue: {
                1: {
                    1: { v: 12, s: { bg: { rgb: '#ff0000' }, cl: { rgb: null } } },
                },
            },
        });
        const table = testBed.get(TableManager).getTable(testBed.workbook.getUnitId(), 'table-orders')!;
        table.setTableFilterColumn(1, {
            filterType: TableColumnFilterTypeEnum.color,
            cellFillColors: ['rgb(255, 0, 0)'],
        });

        expect(service.getTableFilterPanelInitProps(
            testBed.workbook.getUnitId(),
            'sheet1',
            'table-orders',
            1
        ).currentFilterBy).toBe(FilterByEnum.Color);
        expect(service.getTableFilterColors(
            testBed.workbook.getUnitId(),
            'sheet1',
            'table-orders',
            1
        )).toEqual({
            cellFillColors: [
                { color: 'rgb(255,0,0)', checked: true },
                { color: null, checked: false },
            ],
            cellTextColors: [
                { color: 'rgb(0,0,0)', checked: false },
            ],
        });
    });

    it('includes theme colors in table filter candidates', async () => {
        testBed = createTestBed();
        const commandService = testBed.get(ICommandService);
        await commandService.executeCommand(SetRangeValuesMutation.id, {
            unitId: testBed.workbook.getUnitId(),
            subUnitId: 'sheet1',
            cellValue: {
                1: {
                    1: { v: 12, s: { bg: { th: ThemeColorType.ACCENT1 } } },
                },
            },
        });

        expect(testBed.get(SheetsTableUiService).getTableFilterColors(
            testBed.workbook.getUnitId(),
            'sheet1',
            'table-orders',
            1
        ).cellFillColors).toEqual([
            { color: 'rgb(68,114,196)', checked: false },
            { color: null, checked: false },
        ]);
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

    it('undoes and redoes a compact record filter without retaining the caller values array', async () => {
        testBed = createTestBed();
        const service = testBed.get(SheetsTableUiService);
        const commandService = testBed.get(ICommandService);
        const unitId = testBed.workbook.getUnitId();
        testBed.get(IUniverInstanceService).focusUnit(unitId);
        const requested = {
            filterType: TableColumnFilterTypeEnum.record,
            mode: FilterSelectionMode.Exclude as const,
            values: [{ type: RecordValueType.String as const, value: 'blocked' }],
        } satisfies ITableRecordFilterItem;

        expect(await service.setTableFilter(unitId, 'table-orders', 0, requested)).toBe(true);
        requested.values[0].value = 'mutated';
        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(testBed.get(TableManager).getTable(unitId, 'table-orders')!.getTableFilterColumn(0)).toEqual({
            filterType: TableColumnFilterTypeEnum.manual,
            values: ['book', TABLE_FILTER_EMPTY_VALUE],
        });
        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(testBed.get(TableManager).getTable(unitId, 'table-orders')!.getTableFilterColumn(0)).toEqual({
            filterType: TableColumnFilterTypeEnum.record,
            mode: 'exclude',
            values: [{ type: 'string', value: 'blocked' }],
        });
    });

    it('uses typed member keys and preserves compact unmatched exclusions when item selections are edited', async () => {
        testBed = createTestBed();
        const service = testBed.get(SheetsTableUiService);
        const unitId = testBed.workbook.getUnitId();
        const table = testBed.get(TableManager).getTable(unitId, 'table-orders')!;
        table.setTableFilterColumn(0, undefined as never);
        table.setTableFilterColumn(1, {
            filterType: TableColumnFilterTypeEnum.record,
            mode: FilterSelectionMode.Exclude,
            values: [
                { type: RecordValueType.Number, value: 12 },
                { type: RecordValueType.String, value: 'unmatched' },
            ],
        });
        const items = service.getTableFilterItems(unitId, 'sheet1', 'table-orders', 1);
        const numberKey = getTableRecordValueKey({ type: RecordValueType.Number, value: 12 });
        const stringKey = getTableRecordValueKey({ type: RecordValueType.String, value: '12' });
        const eightKey = getTableRecordValueKey({ type: RecordValueType.Number, value: 8 });
        expect(items.data.map((item) => ({ title: item.title, valueKey: item.valueKey }))).toEqual([
            { title: '12', valueKey: numberKey },
            { title: '12', valueKey: stringKey },
            { title: '8', valueKey: eightKey },
        ]);
        const initialChecked = service.getTableFilterCheckedItems(unitId, 'table-orders', 1);
        expect(initialChecked).toEqual([stringKey, eightKey]);
        expect(service.createItemFilter(unitId, 'table-orders', 1, items, new Set(initialChecked), false)).toEqual({
            filterType: TableColumnFilterTypeEnum.record,
            mode: 'exclude',
            values: [
                { type: 'number', value: 12 },
                { type: 'string', value: 'unmatched' },
            ],
        });

        const editedChecked = new Set(initialChecked);
        editedChecked.delete(eightKey);
        expect(service.createItemFilter(unitId, 'table-orders', 1, items, editedChecked, false)).toEqual({
            filterType: TableColumnFilterTypeEnum.record,
            mode: 'exclude',
            values: [
                { type: 'string', value: 'unmatched' },
                { type: 'number', value: 12 },
                { type: 'number', value: 8 },
            ],
        });
        expect(service.createItemFilter(unitId, 'table-orders', 1, items, new Set(items.data.map((item) => item.valueKey!)), true))
            .toBeUndefined();
    });

    it('scopes candidate caches by workbook and stable table column identity', () => {
        testBed = createTestBed();
        const service = testBed.get(SheetsTableUiService);
        const secondData = createWorkbookData();
        secondData.id = 'second-workbook';
        secondData.sheets.sheet1.cellData![1]![1] = { v: 99 };
        const secondWorkbook = testBed.univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, secondData);
        testBed.get(SheetTableService).addTable(
            secondWorkbook.getUnitId(),
            'sheet1',
            'Orders',
            { startRow: 0, endRow: 3, startColumn: 0, endColumn: 1 },
            ['Product', 'Amount'],
            'table-orders'
        );

        expect(service.getTableFilterItems(testBed.workbook.getUnitId(), 'sheet1', 'table-orders', 1).data[0].title).toBe(12);
        expect(service.getTableFilterItems(secondWorkbook.getUnitId(), 'sheet1', 'table-orders', 1).data[0].title).toBe(99);
    });

    it('keeps the legacy behavior of clearing a manual whitelist when every current candidate is selected', () => {
        testBed = createTestBed();
        const service = testBed.get(SheetsTableUiService);
        const unitId = testBed.workbook.getUnitId();
        const table = testBed.get(TableManager).getTable(unitId, 'table-orders')!;
        table.setTableFilterColumn(0, {
            filterType: TableColumnFilterTypeEnum.manual,
            values: ['book'],
        });
        const items = {
            data: [{ title: 'book', key: 'book', leaf: true }],
            itemsCountMap: new Map([['book', 1]]),
            allItemsCount: 1,
        };

        expect(service.createItemFilter(unitId, 'table-orders', 0, items, new Set(['book']), false)).toBeUndefined();
    });

    it('clears a manual whitelist when every candidate was explicitly selected', () => {
        testBed = createTestBed();
        const service = testBed.get(SheetsTableUiService);
        const unitId = testBed.workbook.getUnitId();
        const table = testBed.get(TableManager).getTable(unitId, 'table-orders')!;
        table.setTableFilterColumn(0, {
            filterType: TableColumnFilterTypeEnum.manual,
            values: ['book'],
        });
        const items = {
            data: [{ title: 'book', key: 'book', leaf: true }],
            itemsCountMap: new Map([['book', 1]]),
            allItemsCount: 1,
        };

        expect(service.createItemFilter(unitId, 'table-orders', 0, items, new Set(['book']), true)).toBeUndefined();
    });

    it('refreshes candidate key representations when filter mutations are undone and redone', async () => {
        testBed = createTestBed();
        const service = testBed.get(SheetsTableUiService);
        const commandService = testBed.get(ICommandService);
        const unitId = testBed.workbook.getUnitId();
        testBed.get(IUniverInstanceService).focusUnit(unitId);

        expect(service.getTableFilterItems(unitId, 'sheet1', 'table-orders', 0).data[0].valueKey).toBeUndefined();
        await service.setTableFilter(unitId, 'table-orders', 0, {
            filterType: TableColumnFilterTypeEnum.record,
            mode: FilterSelectionMode.Include,
            values: [{ type: RecordValueType.String, value: 'book' }],
        });
        expect(service.getTableFilterItems(unitId, 'sheet1', 'table-orders', 0).data[0].valueKey).toBe(
            getTableRecordValueKey({ type: RecordValueType.String, value: 'book' })
        );

        await commandService.executeCommand(UndoCommand.id);
        expect(service.getTableFilterItems(unitId, 'sheet1', 'table-orders', 0).data[0].valueKey).toBeUndefined();

        await commandService.executeCommand(RedoCommand.id);
        expect(service.getTableFilterItems(unitId, 'sheet1', 'table-orders', 0).data[0].valueKey).toBe(
            getTableRecordValueKey({ type: RecordValueType.String, value: 'book' })
        );
    });
});
