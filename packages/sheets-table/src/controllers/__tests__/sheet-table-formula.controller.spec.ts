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

import { RemoveSuperTableMutation, SetSuperTableMutation } from '@univerjs/engine-formula';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SheetTableFormulaController } from '../sheet-table-formula.controller';

describe('SheetTableFormulaController', () => {
    it('should sync super table metadata on add/range/name/delete events', () => {
        const tableAdd$ = new Subject<any>();
        const tableRangeChanged$ = new Subject<any>();
        const tableDelete$ = new Subject<any>();
        const tableNameChanged$ = new Subject<any>();

        const table = {
            getTableInfo: () => ({
                name: 'Orders',
                subUnitId: 's1',
                range: { startRow: 0, endRow: 5, startColumn: 0, endColumn: 2 },
                columns: [
                    { displayName: 'id' },
                    { displayName: 'amount' },
                ],
            }),
        };

        const tableManager = {
            tableAdd$,
            tableRangeChanged$,
            tableDelete$,
            tableNameChanged$,
            getTableById: vi.fn(() => table),
        };

        const executeCommand = vi.fn();
        const commandService = { executeCommand };

        const controller = new SheetTableFormulaController(tableManager as any, commandService as any);

        tableAdd$.next({ unitId: 'u1', tableId: 't1' });

        expect(executeCommand).toHaveBeenCalledWith(SetSuperTableMutation.id, expect.objectContaining({
            unitId: 'u1',
            tableName: 'Orders',
            reference: expect.objectContaining({
                sheetId: 's1',
                range: { startRow: 0, endRow: 5, startColumn: 0, endColumn: 2 },
            }),
        }));

        const titleMap = executeCommand.mock.calls[0][1].reference.titleMap as Map<string, number>;
        expect(titleMap.get('id')).toBe(0);
        expect(titleMap.get('amount')).toBe(1);

        tableRangeChanged$.next({ unitId: 'u1', tableId: 't1' });
        expect(executeCommand).toHaveBeenCalledTimes(2);

        tableNameChanged$.next({ unitId: 'u1', tableId: 't1', oldTableName: 'Orders_Old' });
        expect(executeCommand).toHaveBeenNthCalledWith(3, RemoveSuperTableMutation.id, {
            unitId: 'u1',
            tableName: 'Orders_Old',
        });
        expect(executeCommand).toHaveBeenCalledTimes(4);

        tableDelete$.next({ unitId: 'u1', tableName: 'Orders' });
        expect(executeCommand).toHaveBeenLastCalledWith(RemoveSuperTableMutation.id, {
            unitId: 'u1',
            tableName: 'Orders',
        });

        controller.dispose();
    });
});
