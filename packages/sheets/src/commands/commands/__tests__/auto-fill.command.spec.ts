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

import type { IAccessor } from '@univerjs/core';
import { ICommandService, IUniverInstanceService } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { IAutoFillService } from '../../../services/auto-fill/auto-fill.service';
import { AUTO_FILL_APPLY_TYPE } from '../../../services/auto-fill/type';
import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import { AutoFillCommand, SheetCopyDownCommand, SheetCopyRightCommand } from '../auto-fill.command';

function createAccessor(pairs: Array<[unknown, unknown]>): IAccessor {
    const map = new Map<unknown, unknown>(pairs);

    return {
        get(token: unknown) {
            if (!map.has(token)) {
                throw new Error(`Unknown token: ${String(token)}`);
            }

            return map.get(token);
        },
    } as IAccessor;
}

function createCommandAccessor(range?: { startRow: number; endRow: number; startColumn: number; endColumn: number }, executeResult = true) {
    const executeCommand = vi.fn(async () => executeResult);
    const setShowMenu = vi.fn();
    const worksheet = { getSheetId: () => 'sheet-1' };
    const workbook = {
        getUnitId: () => 'unit-1',
        getActiveSheet: () => worksheet,
    };

    const accessor = createAccessor([
        [SheetsSelectionsService, { getCurrentLastSelection: () => (range ? { range } : null) }],
        [IUniverInstanceService, { getCurrentUnitOfType: () => workbook }],
        [ICommandService, { executeCommand }],
        [IAutoFillService, { setShowMenu }],
    ]);

    return {
        accessor,
        executeCommand,
        setShowMenu,
    };
}

describe('Sheet copy fill commands', () => {
    it('copies down from the row above for a single-row selection', async () => {
        const { accessor, executeCommand, setShowMenu } = createCommandAccessor({
            startRow: 2,
            endRow: 2,
            startColumn: 1,
            endColumn: 3,
        });

        expect(await SheetCopyDownCommand.handler(accessor)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(AutoFillCommand.id, {
            sourceRange: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 3 },
            targetRange: { startRow: 1, endRow: 2, startColumn: 1, endColumn: 3 },
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            applyType: AUTO_FILL_APPLY_TYPE.COPY,
        });
        expect(setShowMenu).toHaveBeenCalledWith(false);
    });

    it('copies down from the first selected row for a multi-row selection', async () => {
        const { accessor, executeCommand } = createCommandAccessor({
            startRow: 1,
            endRow: 4,
            startColumn: 0,
            endColumn: 2,
        });

        expect(await SheetCopyDownCommand.handler(accessor)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(AutoFillCommand.id, {
            sourceRange: { startRow: 1, endRow: 1, startColumn: 0, endColumn: 2 },
            targetRange: { startRow: 1, endRow: 4, startColumn: 0, endColumn: 2 },
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            applyType: AUTO_FILL_APPLY_TYPE.COPY,
        });
    });

    it('copies right from the column to the left for a single-column selection', async () => {
        const { accessor, executeCommand, setShowMenu } = createCommandAccessor({
            startRow: 1,
            endRow: 3,
            startColumn: 2,
            endColumn: 2,
        });

        expect(await SheetCopyRightCommand.handler(accessor)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(AutoFillCommand.id, {
            sourceRange: { startRow: 1, endRow: 3, startColumn: 1, endColumn: 1 },
            targetRange: { startRow: 1, endRow: 3, startColumn: 1, endColumn: 2 },
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            applyType: AUTO_FILL_APPLY_TYPE.COPY,
        });
        expect(setShowMenu).toHaveBeenCalledWith(false);
    });

    it('copies right from the first selected column for a multi-column selection', async () => {
        const { accessor, executeCommand } = createCommandAccessor({
            startRow: 2,
            endRow: 4,
            startColumn: 1,
            endColumn: 3,
        });

        expect(await SheetCopyRightCommand.handler(accessor)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(AutoFillCommand.id, {
            sourceRange: { startRow: 2, endRow: 4, startColumn: 1, endColumn: 1 },
            targetRange: { startRow: 2, endRow: 4, startColumn: 1, endColumn: 3 },
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            applyType: AUTO_FILL_APPLY_TYPE.COPY,
        });
    });

    it('returns false for top-row and leftmost-column no-op selections', async () => {
        const topRow = createCommandAccessor({
            startRow: 0,
            endRow: 0,
            startColumn: 1,
            endColumn: 1,
        });
        const leftColumn = createCommandAccessor({
            startRow: 1,
            endRow: 1,
            startColumn: 0,
            endColumn: 0,
        });

        expect(await SheetCopyDownCommand.handler(topRow.accessor)).toBe(false);
        expect(topRow.executeCommand).not.toHaveBeenCalled();
        expect(topRow.setShowMenu).not.toHaveBeenCalled();

        expect(await SheetCopyRightCommand.handler(leftColumn.accessor)).toBe(false);
        expect(leftColumn.executeCommand).not.toHaveBeenCalled();
        expect(leftColumn.setShowMenu).not.toHaveBeenCalled();
    });
});
