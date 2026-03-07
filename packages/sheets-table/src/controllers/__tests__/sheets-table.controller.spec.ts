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

import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SheetsTableController } from '../sheets-table.controller';

describe('SheetsTableController', () => {
    it('should resolve containing table by range and inject header cell content', () => {
        const tableAdd$ = new Subject<any>();
        const tableRangeChanged$ = new Subject<any>();
        const tableDelete$ = new Subject<any>();

        const tableRange = { startRow: 2, endRow: 6, startColumn: 1, endColumn: 4 };
        const table = {
            getRange: () => tableRange,
            getColumnNameByIndex: (index: number) => ['Name', 'Qty', 'Price', 'Note'][index],
        };

        const tableManager = {
            tableAdd$,
            tableRangeChanged$,
            tableDelete$,
            getTable: vi.fn((_unitId: string, tableId: string) => (tableId === 't1' ? table : undefined)),
            getTablesBySubunitId: vi.fn(() => []),
            toJSON: vi.fn(() => ({})),
            fromJSON: vi.fn(),
            deleteUnitId: vi.fn(),
        };

        let cellContentHandler: any;
        const sheetInterceptorService = {
            intercept: vi.fn((_point: any, config: any) => {
                cellContentHandler = config.handler;
                return { dispose: vi.fn() };
            }),
            interceptCommand: vi.fn(() => ({ dispose: vi.fn() })),
        };

        const resourceManagerService = {
            registerPluginResource: vi.fn(() => ({ dispose: vi.fn() })),
        };

        const controller = new SheetsTableController(
            {
                getCurrentUnitOfType: vi.fn(() => null),
            } as any,
            sheetInterceptorService as any,
            tableManager as any,
            resourceManagerService as any
        );

        tableAdd$.next({
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            range: tableRange,
        });

        expect(
            controller.getContainerTableWithRange('u1', 's1', { startRow: 3, endRow: 4, startColumn: 2, endColumn: 3 })
        ).toBe(table);

        expect(
            controller.getContainerTableWithRange('u1', 's1', { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 })
        ).toBeUndefined();

        const next = vi.fn((cell) => cell);
        const result = cellContentHandler(undefined, {
            row: 2,
            col: 2,
            unitId: 'u1',
            subUnitId: 's1',
            rawData: { s: 1 },
        }, next);

        expect(next).toHaveBeenCalledWith({ s: 1, v: 'Qty' });
        expect(result).toEqual({ s: 1, v: 'Qty' });

        const nextNonHeader = vi.fn((cell) => cell);
        cellContentHandler(undefined, {
            row: 3,
            col: 2,
            unitId: 'u1',
            subUnitId: 's1',
            rawData: { s: 1 },
        }, nextNonHeader);

        expect(nextNonHeader).toHaveBeenCalledWith(undefined);

        controller.dispose();
    });
});
