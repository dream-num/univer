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

import { SetRangeValuesMutation } from '@univerjs/sheets';
import { SetSheetTableFilterCommand, TableColumnFilterTypeEnum } from '@univerjs/sheets-table';
import { describe, expect, it, vi } from 'vitest';
import { FilterByEnum } from '../../types';
import { SheetsTableUiService } from '../sheets-table-ui-service';

describe('SheetsTableUiService', () => {
    it('should build panel props, compute cached filter items and clear cache on related commands', () => {
        const listeners: Array<(command: any) => void> = [];
        const executeCommand = vi.fn();

        const commandService = {
            onCommandExecuted: vi.fn((listener: (command: any) => void) => {
                listeners.push(listener);
                return { dispose: vi.fn() };
            }),
            executeCommand,
        };

        const table = {
            getId: () => 't1',
            getSubunitId: () => 's1',
            getRange: () => ({ startRow: 0, endRow: 3, startColumn: 1, endColumn: 2 }),
            getTableFilterRange: () => ({ startRow: 1, endRow: 3, startColumn: 1, endColumn: 2 }),
            getTableFilterColumn: (index: number) => {
                if (index === 0) {
                    return { filterType: TableColumnFilterTypeEnum.condition, condition: [] };
                }
                return { filterType: TableColumnFilterTypeEnum.manual, values: ['A', 'B'] };
            },
        };

        const tableManager = {
            getTable: vi.fn(() => table),
            getTablesBySubunitId: vi.fn(() => [table]),
        };

        const getCellValueWithConditionType = vi.fn((worksheet, row: number, col: number) => {
            if (row === 1 && col === 2) {
                return 'A';
            }
            if (row === 3 && col === 2) {
                return undefined;
            }
            return 'B';
        });

        const worksheet = {
            isRowFiltered: (row: number) => row === 2,
        };

        const univerInstanceService = {
            getUnit: vi.fn(() => ({
                getSheetBySheetId: vi.fn(() => worksheet),
            })),
        };

        const service = new SheetsTableUiService(
            tableManager as any,
            { getCellValueWithConditionType } as any,
            univerInstanceService as any,
            commandService as any,
            { t: (key: string) => (key === 'sheets-table.condition.empty' ? '(empty)' : key) } as any
        );

        expect(service.getTableFilterPanelInitProps('u1', 's1', 't1', 1)).toEqual({
            unitId: 'u1',
            subUnitId: 's1',
            tableFilter: { filterType: TableColumnFilterTypeEnum.condition, condition: [] },
            currentFilterBy: FilterByEnum.Condition,
            tableId: 't1',
            columnIndex: 0,
        });

        expect(service.getTableFilterCheckedItems('u1', 't1', 1)).toEqual(['A', 'B']);

        const first = service.getTableFilterItems('u1', 's1', 't1', 1);
        expect(first.allItemsCount).toBe(2);
        expect(first.data.map((item) => item.title)).toEqual(['A', '(empty)']);
        expect(first.itemsCountMap.get('A')).toBe(1);
        expect(first.itemsCountMap.get('(empty)')).toBe(1);
        const countAfterFirstBuild = getCellValueWithConditionType.mock.calls.length;

        const second = service.getTableFilterItems('u1', 's1', 't1', 1);
        expect(second).toEqual(first);
        expect(getCellValueWithConditionType).toHaveBeenCalledTimes(countAfterFirstBuild);

        listeners.forEach((listener) => listener({
            id: SetRangeValuesMutation.id,
            params: {
                unitId: 'u1',
                subUnitId: 's1',
                cellValue: {
                    1: {
                        2: { v: 'updated' },
                    },
                },
            },
        }));

        service.getTableFilterItems('u1', 's1', 't1', 1);
        expect(getCellValueWithConditionType.mock.calls.length).toBeGreaterThan(countAfterFirstBuild);

        const countAfterRangeUpdate = getCellValueWithConditionType.mock.calls.length;
        listeners.forEach((listener) => listener({
            id: SetSheetTableFilterCommand.id,
            params: {
                unitId: 'u1',
                tableId: 't1',
            },
        }));

        service.getTableFilterItems('u1', 's1', 't1', 1);
        expect(getCellValueWithConditionType.mock.calls.length).toBeGreaterThan(countAfterRangeUpdate);

        service.setTableFilter('u1', 't1', 1, { filterType: TableColumnFilterTypeEnum.manual, values: ['A'] } as any);
        expect(executeCommand).toHaveBeenCalledWith(SetSheetTableFilterCommand.id, {
            unitId: 'u1',
            tableId: 't1',
            column: 1,
            tableFilter: { filterType: TableColumnFilterTypeEnum.manual, values: ['A'] },
        });

        service.dispose();
    });
});
