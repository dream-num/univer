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

import { TableManager } from '@univerjs/sheets-table';
import { describe, expect, it, vi } from 'vitest';
import { SheetsTableComponentController } from '../../../controllers/sheet-table-component.controller';
import { OpenTableFilterPanelOperation } from '../open-table-filter-dialog.opration';

function createAccessor(pairs: Array<[unknown, unknown]>) {
    const map = new Map<unknown, unknown>(pairs);
    return {
        get(token: unknown) {
            if (!map.has(token)) {
                throw new Error(`Unknown token: ${String(token)}`);
            }
            return map.get(token);
        },
    } as any;
}

describe('OpenTableFilterPanelOperation', () => {
    it('should return false for missing params or missing table', async () => {
        const accessor = createAccessor([
            [TableManager, { getTable: () => undefined }],
            [SheetsTableComponentController, { openOrToggleFilterPanel: vi.fn() }],
        ]);

        await expect(OpenTableFilterPanelOperation.handler(accessor, undefined as any)).resolves.toBe(false);
        await expect(OpenTableFilterPanelOperation.handler(accessor, {
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 'missing',
            row: 1,
            col: 1,
        })).resolves.toBe(false);
    });

    it('should delegate panel toggle to component controller', async () => {
        const openOrToggleFilterPanel = vi.fn();

        const accessor = createAccessor([
            [TableManager, { getTable: () => ({ id: 't1' }) }],
            [SheetsTableComponentController, {
                openOrToggleFilterPanel,
            }],
        ]);

        const result = await OpenTableFilterPanelOperation.handler(accessor, {
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            row: 6,
            col: 3,
        });

        expect(result).toBe(true);
        expect(openOrToggleFilterPanel).toHaveBeenCalledWith({ unitId: 'u1', subUnitId: 's1', row: 6, tableId: 't1', column: 3 });
    });
});
