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
import { SetSheetFilterRangeCommand, SetSheetsFilterCriteriaCommand } from '../../commands/commands/sheets-filter.command';
import { SheetsFilterPermissionController } from '../sheets-filter-permission.controller';

describe('SheetsFilterPermissionController', () => {
    function createController() {
        let beforeCommandExecuted: ((command: { id: string; params?: unknown }) => void) | undefined;
        const permissionCheckWithRanges = vi.fn(() => false);
        const blockExecuteWithoutPermission = vi.fn();
        const worksheet = { getSheetId: () => 'sheet-1' };
        const workbook = {
            getUnitId: () => 'unit-1',
            getSheetBySheetId: () => worksheet,
        };
        const filterRange = { startRow: 2, endRow: 8, startColumn: 1, endColumn: 3 };

        const controller = new SheetsFilterPermissionController(
            { getFilterModel: () => ({ getRange: () => filterRange }) } as never,
            { t: (key: string) => key } as never,
            {
                beforeCommandExecuted: vi.fn((handler) => {
                    beforeCommandExecuted = handler;
                    return { dispose: vi.fn() };
                }),
            } as never,
            { permissionCheckWithRanges, blockExecuteWithoutPermission } as never,
            { getUnit: () => workbook } as never
        );

        return { controller, beforeCommandExecuted, permissionCheckWithRanges, blockExecuteWithoutPermission, filterRange };
    }

    it('checks the final set-range command, including the expanded toolbar range', () => {
        const bed = createController();
        const range = { startRow: 3, endRow: 9, startColumn: 0, endColumn: 2 };

        bed.beforeCommandExecuted?.({
            id: SetSheetFilterRangeCommand.id,
            params: { unitId: 'unit-1', subUnitId: 'sheet-1', range },
        });

        expect(bed.permissionCheckWithRanges).toHaveBeenCalledWith(expect.objectContaining({
            worksheetTypes: expect.any(Array),
            rangeTypes: expect.any(Array),
        }), [range], 'unit-1', 'sheet-1');
        expect(bed.blockExecuteWithoutPermission).toHaveBeenCalledWith('sheets-filter.permission.filterErr');
        bed.controller.dispose();
    });

    it('checks criteria changes against the existing filter range', () => {
        const bed = createController();

        bed.beforeCommandExecuted?.({
            id: SetSheetsFilterCriteriaCommand.id,
            params: { unitId: 'unit-1', subUnitId: 'sheet-1', col: 2, criteria: null },
        });

        expect(bed.permissionCheckWithRanges).toHaveBeenCalledWith(expect.anything(), [bed.filterRange], 'unit-1', 'sheet-1');
        bed.controller.dispose();
    });
});
