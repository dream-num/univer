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

import { describe, expect, it, vi } from 'vitest';
import { TableManager } from '../../../model/table-manager';
import { SheetTableService } from '../../../services/table-service';
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
    it('AddSheetTableMutation should delegate to SheetTableService.addTable', () => {
        const service = {
            addTable: vi.fn(),
        } as unknown as SheetTableService;

        const result = AddSheetTableMutation.handler(accessorForService(service), {
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            name: 'Table',
            header: ['A'],
            range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            options: { showHeader: true },
        });

        expect(result).toBe(true);
        expect(service.addTable).toHaveBeenCalledWith(
            'u1',
            's1',
            'Table',
            { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            ['A'],
            't1',
            { showHeader: true }
        );
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
        const tableManager = {
            addFilter: vi.fn(),
        } as unknown as TableManager;

        const result = SetSheetTableFilterMutation.handler(accessorForTableManager(tableManager), {
            unitId: 'u1',
            tableId: 't1',
            column: 0,
            tableFilter: { filterType: 'manual', values: ['A'] } as any,
        });

        expect(result).toBe(true);
        expect(tableManager.addFilter).toHaveBeenCalledWith('u1', 't1', 0, { filterType: 'manual', values: ['A'] });
    });
});
