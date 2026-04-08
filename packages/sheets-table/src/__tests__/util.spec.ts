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
import { SheetsTableButtonStateEnum, SheetsTableSortStateEnum, TableColumnFilterTypeEnum } from '../types/enum';
import {
    convertCellDataToString,
    getColumnName,
    getExistingNamesSet,
    getStringFromDataStream,
    getTableFilterState,
    isConditionFilter,
    isManualTableFilter,
} from '../util';

describe('sheets-table util', () => {
    it('should format column names', () => {
        expect(getColumnName(3, 'Column')).toBe('Column 3');
    });

    it('should remove trailing CRLF from rich text stream', () => {
        expect(getStringFromDataStream({ body: { dataStream: 'A\r\n' } } as any)).toBe('A');
        expect(getStringFromDataStream({ body: { dataStream: 'B' } } as any)).toBe('B');
    });

    it('should convert different cell value types to string', () => {
        expect(convertCellDataToString(null)).toBe('');
        expect(convertCellDataToString({ p: { body: { dataStream: 'hello\r\n' } } as any } as any)).toBe('hello');
        expect(convertCellDataToString({ t: CellValueType.STRING, v: 'x' } as any)).toBe('x');
        expect(convertCellDataToString({ t: CellValueType.FORCE_STRING, v: 1 } as any)).toBe('1');
        expect(convertCellDataToString({ t: CellValueType.BOOLEAN, v: true } as any)).toBe('TRUE');
        expect(convertCellDataToString({ t: CellValueType.BOOLEAN, v: false } as any)).toBe('FALSE');
        expect(convertCellDataToString({ t: CellValueType.NUMBER, v: 12 } as any)).toBe('12');
        expect(convertCellDataToString({ v: true } as any)).toBe('TRUE');
        expect(convertCellDataToString({ v: undefined } as any)).toBe('');
    });

    it('should calculate filter button states from filter and sort state', () => {
        const manualFilter = { filterType: TableColumnFilterTypeEnum.manual, values: ['a'] } as any;

        expect(getTableFilterState(manualFilter, SheetsTableSortStateEnum.None)).toBe(SheetsTableButtonStateEnum.FilteredSortNone);
        expect(getTableFilterState(manualFilter, SheetsTableSortStateEnum.Asc)).toBe(SheetsTableButtonStateEnum.FilteredSortAsc);
        expect(getTableFilterState(manualFilter, SheetsTableSortStateEnum.Desc)).toBe(SheetsTableButtonStateEnum.FilteredSortDesc);

        expect(getTableFilterState(undefined, SheetsTableSortStateEnum.None)).toBe(SheetsTableButtonStateEnum.FilterNoneSortNone);
        expect(getTableFilterState(undefined, SheetsTableSortStateEnum.Asc)).toBe(SheetsTableButtonStateEnum.FilterNoneSortAsc);
        expect(getTableFilterState(undefined, SheetsTableSortStateEnum.Desc)).toBe(SheetsTableButtonStateEnum.FilterNoneSortDesc);
    });

    it('should detect condition/manual filter types', () => {
        const condition = { filterType: TableColumnFilterTypeEnum.condition } as any;
        const manual = { filterType: TableColumnFilterTypeEnum.manual, values: [] } as any;

        expect(isConditionFilter(condition)).toBe(true);
        expect(isConditionFilter(manual)).toBe(false);
        expect(isConditionFilter(undefined)).toBe(false);

        expect(isManualTableFilter(manual)).toBe(true);
        expect(isManualTableFilter(condition)).toBe(false);
        expect(isManualTableFilter(undefined)).toBe(false);
    });

    it('should collect existing names from sheets/tables/defined names as lowercase', () => {
        const workbook = {
            getSheets: () => [
                { getName: () => 'SheetA' },
                { getName: () => 'SheetB' },
            ],
        } as any;

        const names = getExistingNamesSet('unit-1', {
            univerInstanceService: {
                getUnit: () => workbook,
            } as any,
            tableManager: {
                getTableList: () => [
                    { name: 'Table_One' },
                    { name: 'Table_Two' },
                ],
            } as any,
            definedNamesService: {
                getDefinedNameMap: () => ({
                    d1: { name: 'BudgetRange' },
                }),
            } as any,
        });

        expect(names).toEqual(new Set(['sheeta', 'sheetb', 'table_one', 'table_two', 'budgetrange']));
    });
});
