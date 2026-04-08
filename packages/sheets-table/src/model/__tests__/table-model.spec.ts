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

import { CellValueType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import {
    SheetsTableButtonStateEnum,
    SheetsTableSortStateEnum,
    TableColumnDataTypeEnum,
    TableColumnFilterTypeEnum,
    TableConditionTypeEnum,
    TableNumberCompareTypeEnum,
} from '../../types/enum';
import { Table } from '../table';
import { TableColumn } from '../table-column';
import { TableFilters } from '../table-filter';

describe('Table model', () => {
    it('builds a table from headers, tracks metadata, and serializes user changes', () => {
        const table = new Table(
            'table-1',
            'QuarterlySales',
            { startRow: 0, endRow: 4, startColumn: 0, endColumn: 1 },
            ['Region', 'Amount'],
            {
                showHeader: true,
                tableStyleId: 'theme-2',
                columns: [
                    { id: 'column-region', displayName: 'Region', dataType: TableColumnDataTypeEnum.String, formula: '', meta: {}, style: {} },
                    { id: 'column-amount', displayName: 'Amount', dataType: TableColumnDataTypeEnum.String, formula: '', meta: {}, style: {} },
                ],
            }
        );

        table.setSubunitId('sheet-1');
        table.setTableMeta({ owner: 'ops' });
        table.insertColumn(2, new TableColumn('column-margin', 'Margin'));
        table.removeColumn(2);
        table.setDisplayName('FY Sales');
        table.setRange({ startRow: 1, endRow: 6, startColumn: 0, endColumn: 1 });

        expect(table.getTableFilterRange()).toEqual({
            startRow: 2,
            endRow: 6,
            startColumn: 0,
            endColumn: 1,
        });
        expect(table.getColumnsCount()).toBe(2);
        expect(table.getColumnNameByIndex(1)).toBe('Amount');
        expect(table.getTableInfo()).toEqual(expect.objectContaining({
            id: 'table-1',
            subUnitId: 'sheet-1',
            name: 'FY Sales',
            range: { startRow: 1, endRow: 6, startColumn: 0, endColumn: 1 },
            meta: { owner: 'ops' },
            showHeader: true,
            columns: expect.arrayContaining([
                expect.objectContaining({ id: 'column-region', displayName: 'Region' }),
                expect.objectContaining({ id: 'column-amount', displayName: 'Amount' }),
            ]),
        }));
        expect(table.getTableConfig()).toEqual({
            name: 'FY Sales',
            range: { startRow: 1, endRow: 6, startColumn: 0, endColumn: 1 },
            options: {
                showHeader: true,
                showFooter: false,
            },
            tableStyleId: 'theme-2',
        });

        const snapshot = table.toJSON();
        const restored = new Table('placeholder', 'Placeholder', { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }, []);
        restored.fromJSON(snapshot);

        expect(restored.getDisplayName()).toBe('FY Sales');
        expect(restored.getRangeInfo()).toEqual({ startRow: 1, endRow: 6, startColumn: 0, endColumn: 1 });
        expect(restored.getTableMeta()).toEqual({ owner: 'ops' });
        expect(restored.toJSON().columns).toEqual(expect.arrayContaining([
            expect.objectContaining({ id: 'column-region', displayName: 'Region' }),
            expect.objectContaining({ id: 'column-amount', displayName: 'Amount' }),
        ]));

        restored.dispose();
        expect(restored.getColumnsCount()).toBe(0);
    });
});

describe('TableFilters', () => {
    it('filters rows by manual lists and condition rules like a real table filter popup', () => {
        const filters = new TableFilters();
        const sheet = {
            getCell(row: number, column: number) {
                const cells = [
                    [{ v: 'East' }, { v: 12, t: CellValueType.NUMBER }],
                    [{ v: 'West' }, { v: 5, t: CellValueType.NUMBER }],
                    [{ v: 'East' }, { v: 20, t: CellValueType.NUMBER }],
                ];

                return cells[row]?.[column] ?? null;
            },
            getCellRaw(row: number, column: number) {
                return this.getCell(row, column);
            },
        };
        const range = { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 };

        filters.setColumnFilter(0, {
            filterType: TableColumnFilterTypeEnum.manual,
            values: ['East'],
        } as never);
        filters.setColumnFilter(1, {
            filterType: TableColumnFilterTypeEnum.condition,
            filterInfo: {
                conditionType: TableConditionTypeEnum.Number,
                compareType: TableNumberCompareTypeEnum.GreaterThan,
                expectedValue: [10],
            },
        } as never);
        filters.setSortState(0, SheetsTableSortStateEnum.Asc);

        const filteredOutRows = filters.doFilter(sheet as never, range);

        expect([...filteredOutRows]).toEqual([1]);
        expect(filters.getColumnFilter(0)).toEqual({
            filterType: TableColumnFilterTypeEnum.manual,
            values: ['East'],
        });
        expect(filters.getFilterState(0)).toBe(SheetsTableButtonStateEnum.FilteredSortAsc);
        expect(filters.getFilterStates(range)).toEqual([
            SheetsTableButtonStateEnum.FilteredSortAsc,
            SheetsTableButtonStateEnum.FilteredSortNone,
        ]);
        expect(filters.getFilterOutRows()).toBe(filteredOutRows);
        expect(filters.toJSON()).toEqual({
            tableColumnFilterList: [
                { filterType: TableColumnFilterTypeEnum.manual, values: ['East'] },
                {
                    filterType: TableColumnFilterTypeEnum.condition,
                    filterInfo: {
                        conditionType: TableConditionTypeEnum.Number,
                        compareType: TableNumberCompareTypeEnum.GreaterThan,
                        expectedValue: [10],
                    },
                },
            ],
            tableSortInfo: { columnIndex: 0, sortState: SheetsTableSortStateEnum.Asc },
        });

        filters.dispose();
        expect(filters.toJSON().tableColumnFilterList).toEqual([]);
    });
});
