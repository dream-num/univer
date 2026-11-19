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
import { LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { TableManager } from '../../../models/table-manager';
import { SheetTableService } from '../../../services/table.service';
import { AddSheetTableMutation } from '../add-sheet-table.mutation';
import { DeleteSheetTableMutation } from '../delete-sheet-table.mutation';
import { SetSheetTableMutation } from '../set-sheet-table.mutation';
import { SetSheetTableFilterMutation } from '../set-table-filter.mutation';

function accessorForService(service: SheetTableService) {
    return {
        get(token: unknown) {
            if (token === SheetTableService) {
                return service;
            }
            throw new Error(`Unknown token: ${String(token)}`);
        },
    } as any;
}

function accessorForTableManager(tableManager: TableManager) {
    return {
        get(token: unknown) {
            if (token === TableManager) {
                return tableManager;
            }
            throw new Error(`Unknown token: ${String(token)}`);
        },
    } as any;
}

describe('sheets-table mutations', () => {
    it('AddSheetTableMutation preserves table metadata through the real service and model', () => {
        const univer = new Univer();
        try {
            const injector = univer.__getInjector();
            injector.add([TableManager]);
            injector.add([SheetTableService]);
            univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
                id: 'u1',
                name: 'Tables',
                appVersion: '1.0.0',
                locale: LocaleType.EN_US,
                sheetOrder: ['s1'],
                styles: {},
                sheets: { s1: { id: 's1', name: 'Sheet', rowCount: 10, columnCount: 4, cellData: {} } },
            });
            const meta = { _xlsx: { options: { dataDxfStyle: { n: { pattern: '0.00' } } } } };
            expect(AddSheetTableMutation.handler(injector, {
                unitId: 'u1',
                subUnitId: 's1',
                tableId: 't1',
                name: 'Table',
                header: ['A', 'B'],
                range: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 },
                options: { showHeader: true },
                meta,
            })).toBe(true);
            expect(injector.get(TableManager).getTable('u1', 't1')!.toJSON().meta).toEqual(meta);
        } finally {
            univer.dispose();
        }
    });

    it('DeleteSheetTableMutation should delegate to SheetTableService.deleteTable', () => {
        const service = {
            deleteTable: vi.fn(),
        } as unknown as SheetTableService;

        const result = DeleteSheetTableMutation.handler(accessorForService(service), {
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
        });

        expect(result).toBe(true);
        expect(service.deleteTable).toHaveBeenCalledWith('u1', 's1', 't1');
    });

    it('SetSheetTableMutation should return false without params and set config otherwise', () => {
        const tableManager = {
            setTableByConfig: vi.fn(),
        } as unknown as TableManager;

        expect(SetSheetTableMutation.handler(accessorForTableManager(tableManager), undefined as any)).toBe(false);

        const result = SetSheetTableMutation.handler(accessorForTableManager(tableManager), {
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            config: { name: 'NewName' },
        });

        expect(result).toBe(true);
        expect(tableManager.setTableByConfig).toHaveBeenCalledWith('u1', 't1', { name: 'NewName' });
    });

    it('SetSheetTableFilterMutation should delegate to TableManager.addFilter', () => {
        const params = {
            unitId: 'u1',
            tableId: 't1',
            column: 0,
            tableFilter: { filterType: 'manual', values: ['A'] } as any,
        };
        const setFilterOutRows = vi.fn();
        const getFilterOutRows = vi.fn(() => new Set([2, 4]));
        const tableManager = {
            addFilter: vi.fn(),
            getTable: vi.fn(() => ({
                getSubunitId: () => 's1',
                getTableFilters: () => ({ getFilterOutRows, setFilterOutRows }),
            })),
            toJSON: vi.fn(() => ({ s1: { tables: [], tableFilteredOutRows: [2, 4] } })),
        } as unknown as TableManager;

        const result = SetSheetTableFilterMutation.handler(accessorForTableManager(tableManager), params);

        expect(result).toBe(true);
        expect(tableManager.addFilter).toHaveBeenCalledWith('u1', 't1', 0, { filterType: 'manual', values: ['A'] });
        expect(params).toMatchObject({ filterOutRows: [2, 4], subUnitId: 's1', tableFilteredOutRows: [2, 4] });
        expect(setFilterOutRows).not.toHaveBeenCalled();
    });

    it('SetSheetTableFilterMutation should restore cached rows during undo', () => {
        const setFilterOutRows = vi.fn();
        const params = {
            unitId: 'u1',
            tableId: 't1',
            column: 0,
            tableFilter: { filterType: 'manual', values: ['old'] } as any,
            filterOutRows: [2, 5],
        };
        const tableManager = {
            addFilter: vi.fn(),
            getTable: vi.fn(() => ({
                getSubunitId: () => 's1',
                getTableFilters: () => ({ getFilterOutRows: () => new Set([3]), setFilterOutRows }),
            })),
            toJSON: vi.fn(() => ({ s1: { tables: [], tableFilteredOutRows: [2, 5] } })),
        } as unknown as TableManager;

        expect(SetSheetTableFilterMutation.handler(accessorForTableManager(tableManager), params)).toBe(true);
        expect(setFilterOutRows).toHaveBeenCalledWith([2, 5]);
        expect(params).toMatchObject({ subUnitId: 's1', tableFilteredOutRows: [2, 5] });
    });
});
