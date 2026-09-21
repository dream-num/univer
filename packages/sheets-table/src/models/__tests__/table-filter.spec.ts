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
import type { ITableRecordFilterItem } from '../../types/type';
import {
    CellValueType,
    FilterSelectionMode,
    LocaleType,
    RecordValueType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import { TableColumnFilterTypeEnum } from '../../types/enum';
import { TableFilters } from '../table-filter';

function createSparseWorkbookData(): IWorkbookData {
    return {
        id: 'table-filter-test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'table-filter-test',
        sheetOrder: ['sheet-1'],
        sheets: {
            'sheet-1': {
                id: 'sheet-1',
                name: 'Sheet1',
                rowCount: 100_002,
                columnCount: 2,
                cellData: {
                    1: { 0: { v: 'blocked-a', t: CellValueType.STRING }, 1: { v: true, t: CellValueType.BOOLEAN } },
                    2: { 0: { v: 'allowed', t: CellValueType.STRING }, 1: { v: false, t: CellValueType.BOOLEAN } },
                    100000: { 0: { v: 'blocked-b', t: CellValueType.STRING }, 1: { v: true, t: CellValueType.BOOLEAN } },
                },
            },
        },
        styles: {},
    };
}

describe('TableFilters record filters', () => {
    let univer: Univer | undefined;

    afterEach(() => {
        univer?.dispose();
        univer = undefined;
    });

    it('keeps a two-value exclusion compact while filtering 100,001 real worksheet rows', () => {
        univer = new Univer();
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createSparseWorkbookData());
        const sheet = workbook.getSheetBySheetId('sheet-1')!;
        const filters = new TableFilters();
        filters.setColumnFilter(0, {
            filterType: TableColumnFilterTypeEnum.record,
            mode: FilterSelectionMode.Exclude,
            values: [
                { type: RecordValueType.String, value: 'blocked-a' },
                { type: RecordValueType.String, value: 'blocked-b' },
            ],
        });

        expect(Array.from(filters.doFilter(sheet, {
            startRow: 0,
            endRow: 100_000,
            startColumn: 0,
            endColumn: 0,
        }))).toEqual([1, 100_000]);
        expect(filters.getColumnFilter(0)).toEqual({
            filterType: TableColumnFilterTypeEnum.record,
            mode: 'exclude',
            values: [
                { type: 'string', value: 'blocked-a' },
                { type: 'string', value: 'blocked-b' },
            ],
        });
    });

    it('ANDs record filters and gives include and exclude modes stable new-row semantics', () => {
        univer = new Univer();
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createSparseWorkbookData());
        const sheet = workbook.getSheetBySheetId('sheet-1')!;
        const filters = new TableFilters();
        filters.setColumnFilter(0, {
            filterType: TableColumnFilterTypeEnum.record,
            mode: FilterSelectionMode.Exclude,
            values: [{ type: RecordValueType.String, value: 'blocked-a' }],
        });
        filters.setColumnFilter(1, {
            filterType: TableColumnFilterTypeEnum.record,
            mode: FilterSelectionMode.Include,
            values: [{ type: RecordValueType.Boolean, value: true }],
        });

        expect(Array.from(filters.doFilter(sheet, {
            startRow: 1,
            endRow: 3,
            startColumn: 0,
            endColumn: 1,
        }))).toEqual([1, 2, 3]);

        filters.setColumnFilter(1, {
            filterType: TableColumnFilterTypeEnum.record,
            mode: FilterSelectionMode.Include,
            values: [{ type: RecordValueType.String, value: 'missing' }],
        });
        expect(filters.doFilter(sheet, {
            startRow: 1,
            endRow: 3,
            startColumn: 0,
            endColumn: 1,
        }).size).toBe(3);

        filters.setColumnFilter(0, {
            filterType: TableColumnFilterTypeEnum.record,
            mode: FilterSelectionMode.Exclude,
            values: [{ type: RecordValueType.String, value: 'blocked-a' }],
        });
        filters.setColumnFilter(1, undefined);
        expect(Array.from(filters.doFilter(sheet, {
            startRow: 1,
            endRow: 3,
            startColumn: 0,
            endColumn: 1,
        }))).toEqual([1]);
    });

    it('round-trips compact filters without retaining mutable aliases', () => {
        const filters = new TableFilters();
        const original: ITableRecordFilterItem = {
            filterType: TableColumnFilterTypeEnum.record,
            mode: FilterSelectionMode.Exclude,
            values: [{ type: RecordValueType.String, value: 'blocked' }],
        };
        filters.setColumnFilter(0, original);
        original.values[0] = { type: RecordValueType.String, value: 'mutated-input' };

        const snapshot = filters.toJSON();
        snapshot.tableColumnFilterList![0] = undefined;
        expect(filters.getColumnFilter(0)).toEqual({
            filterType: TableColumnFilterTypeEnum.record,
            mode: 'exclude',
            values: [{ type: 'string', value: 'blocked' }],
        });

        const restored = new TableFilters();
        restored.fromJSON(filters.toJSON());
        const restoredFilter = restored.getColumnFilter(0) as ITableRecordFilterItem;
        restoredFilter.values.push({ type: RecordValueType.String, value: 'mutated-output' });
        expect(restored.getColumnFilter(0)).toEqual({
            filterType: TableColumnFilterTypeEnum.record,
            mode: 'exclude',
            values: [{ type: 'string', value: 'blocked' }],
        });
    });
});
