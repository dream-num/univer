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
import * as conditionUtil from '../../model/filter-util/condition';
import { TableConditionTypeEnum } from '../../types/enum';
import { SheetTableService } from '../table-service';

describe('SheetTableService', () => {
    it('should proxy table CRUD and metadata calls to table manager', () => {
        const setMeta = vi.fn();
        const setColumnMeta = vi.fn();
        const column = {
            getMeta: vi.fn(() => ({ key: 'column-meta' })),
            setMeta: setColumnMeta,
        };
        const table = {
            getTableInfo: vi.fn(() => ({ id: 'table-1', name: 'Table 1' })),
            getTableMeta: vi.fn(() => ({ key: 'table-meta' })),
            setTableMeta: setMeta,
            getTableColumnByIndex: vi.fn(() => column),
        };

        const tableManager = {
            getTable: vi.fn(() => table),
            getTableList: vi.fn(() => [{ id: 'table-1' }]),
            addTable: vi.fn(() => 'table-1'),
            deleteTable: vi.fn(),
            addFilter: vi.fn(),
        };

        const service = new SheetTableService(tableManager as any);

        expect(service.getTableInfo('u1', 'table-1')).toEqual({
            unitId: 'u1',
            id: 'table-1',
            name: 'Table 1',
        });
        expect(service.getTableList('u1')).toEqual([{ id: 'table-1' }]);
        expect(service.addTable('u1', 's1', 'Table 1', { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 } as any)).toBe('table-1');

        service.deleteTable('u1', 's1', 'table-1');
        expect(tableManager.deleteTable).toHaveBeenCalledWith('u1', 'table-1');

        expect(service.getTableMeta('u1', 'table-1')).toEqual({ key: 'table-meta' });
        service.setTableMeta('u1', 'table-1', { updated: true } as any);
        expect(setMeta).toHaveBeenCalledWith({ updated: true });

        expect(service.getTableColumnMeta('u1', 'table-1', 0)).toEqual({ key: 'column-meta' });
        service.selTableColumnMeta('u1', 'table-1', 0, { updated: true } as any);
        expect(setColumnMeta).toHaveBeenCalledWith({ updated: true });

        service.addFilter('u1', 'table-1', 1, { filterType: 'manual', values: ['A'] } as any);
        expect(tableManager.addFilter).toHaveBeenCalledWith('u1', 'table-1', 1, { filterType: 'manual', values: ['A'] });
    });

    it('should return undefined when table does not exist', () => {
        const service = new SheetTableService({ getTable: () => undefined } as any);
        expect(service.getTableInfo('u1', 'missing')).toBeUndefined();
        expect(service.getTableMeta('u1', 'missing')).toBeUndefined();
        expect(service.getTableColumnMeta('u1', 'missing', 0)).toBeUndefined();
    });

    it('should delegate cell value extraction by condition type', () => {
        const spy = vi.spyOn(conditionUtil, 'getCellValueWithConditionType').mockReturnValue('ok' as any);
        const service = new SheetTableService({} as any);

        const worksheet = { id: 'sheet' } as any;
        const value = service.getCellValueWithConditionType(worksheet, 2, 3, TableConditionTypeEnum.Number);

        expect(value).toBe('ok');
        expect(spy).toHaveBeenCalledWith(worksheet, 2, 3, TableConditionTypeEnum.Number);
    });
});
