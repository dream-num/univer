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

import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { TableFilterController } from '../table-filter.controller';

describe('TableFilterController', () => {
    it('should merge filtered rows from table filter events and initialize intercept behavior', () => {
        const tableFilterChanged$ = new Subject<any>();
        const tableInitStatus$ = new BehaviorSubject(false);

        const mainFilter = {
            doFilter: vi.fn(),
            getFilterOutRows: () => new Set([4]),
        };
        const mainTable = {
            getTableFilters: () => mainFilter,
            getTableFilterRange: () => ({ startRow: 1, endRow: 10, startColumn: 1, endColumn: 2 }),
        };

        const extraTable = {
            getTableFilters: () => ({
                getFilterOutRows: () => new Set([8]),
            }),
        };

        const tableManager = {
            tableFilterChanged$,
            tableInitStatus$,
            getTable: vi.fn(() => mainTable),
            getTablesBySubunitId: vi.fn(() => [mainTable, extraTable]),
        };

        let rowFilteredHandler: any;
        const sheetInterceptorService = {
            intercept: vi.fn((_point: any, config: any) => {
                rowFilteredHandler = config.handler;
                return { dispose: vi.fn() };
            }),
        };

        const activeSheet$ = new Subject<any>();
        const workbook = {
            getUnitId: () => 'u1',
            getActiveSheet: () => ({ getSheetId: () => 's1' }),
            activeSheet$,
            getSheetBySheetId: vi.fn(() => ({ id: 'sheet1' })),
        };

        const workbookType$ = new Subject<any>();
        const univerInstanceService = {
            getCurrentTypeOfUnit$: vi.fn(() => workbookType$),
            getCurrentUnitOfType: vi.fn(() => workbook),
            getUnit: vi.fn(() => workbook),
        };

        const zebraCrossingCacheController = {
            updateZebraCrossingCache: vi.fn(),
        };

        const controller = new TableFilterController(
            tableManager as any,
            sheetInterceptorService as any,
            univerInstanceService as any,
            zebraCrossingCacheController as any
        );

        controller.tableFilteredOutRows = new Set([10]);
        expect(rowFilteredHandler(false, { row: 10 }, vi.fn(() => false))).toBe(true);
        expect(rowFilteredHandler(false, { row: 11 }, vi.fn(() => false))).toBe(false);

        tableFilterChanged$.next({ unitId: 'u1', subUnitId: 's1', tableId: 't1' });

        expect(mainFilter.doFilter).toHaveBeenCalledWith({ id: 'sheet1' }, { startRow: 1, endRow: 10, startColumn: 1, endColumn: 2 });
        expect(controller.tableFilteredOutRows.has(4)).toBe(true);
        expect(controller.tableFilteredOutRows.has(8)).toBe(true);
        expect(zebraCrossingCacheController.updateZebraCrossingCache).toHaveBeenCalledWith('u1', 's1');

        tableInitStatus$.next(true);
        workbookType$.next(workbook);
        activeSheet$.next({ getSheetId: () => 's1' });

        expect(controller.tableFilteredOutRows.has(4)).toBe(true);
        expect(controller.tableFilteredOutRows.has(8)).toBe(true);

        controller.dispose();
    });
});
