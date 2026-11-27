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

import { describe, expect, it } from 'vitest';
import { DeleteRangeMoveUpConfirmCommand } from '../delete-range-move-up-confirm.command';
import { createRangeMoveConfirmTestBed } from './range-move-confirm-test-bed';

describe('DeleteRangeMoveUpConfirmCommand', () => {
    it.each([true, false])('blocks shifts through privately filtered rows when the warning returns %s', async (acknowledged) => {
        const bed = createRangeMoveConfirmTestBed(DeleteRangeMoveUpConfirmCommand);
        bed.confirm.mockResolvedValue(acknowledged);
        bed.skeleton.setProjection({ isRowFiltered: (row) => row === 2, getCell: () => undefined });
        expect(bed.worksheet.getRowFiltered(2)).toBe(false);
        expect(await bed.commands.executeCommand(DeleteRangeMoveUpConfirmCommand.id)).toBe(false);
        expect(bed.values()).toEqual(['first', 'second', 'third']);
        expect(bed.confirm).toHaveBeenCalled();
    });

    it('checks the last selection used by the shift command', async () => {
        const bed = createRangeMoveConfirmTestBed(DeleteRangeMoveUpConfirmCommand);
        bed.selectRanges([
            { startRow: 3, endRow: 3, startColumn: 1, endColumn: 1 },
            { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 },
        ]);
        bed.skeleton.setProjection({ isRowFiltered: (row) => row === 2, getCell: () => undefined });
        expect(await bed.commands.executeCommand(DeleteRangeMoveUpConfirmCommand.id)).toBe(false);
        expect(bed.values()).toEqual(['first', 'second', 'third']);
    });

    it('blocks shifts while the focused projection is pending', async () => {
        const bed = createRangeMoveConfirmTestBed(DeleteRangeMoveUpConfirmCommand);
        bed.skeletonService.setDisplayProjectionPending(bed.companion.scene, 'sheet', true);
        expect(await bed.commands.executeCommand(DeleteRangeMoveUpConfirmCommand.id)).toBe(false);
        expect(bed.values()).toEqual(['first', 'second', 'third']);
    });

    it.each(['pending', 'selection', 'focus', 'projection', 'worksheet', 'public-filter'])('rejects a %s change during merge confirmation', async (change) => {
        const bed = createRangeMoveConfirmTestBed(DeleteRangeMoveUpConfirmCommand, [{ startRow: 1, endRow: 1, startColumn: 0, endColumn: 1 }]);
        bed.confirm.mockImplementationOnce(async () => {
            if (change === 'pending') {
                bed.skeletonService.setDisplayProjectionPending(bed.companion.scene, 'sheet', true);
            } else if (change === 'selection') {
                bed.select(2);
            } else if (change === 'focus') {
                bed.renders.focusRender?.(bed.primary.renderId!);
            } else if (change === 'public-filter') {
                bed.filterPublicRows();
            } else if (change === 'worksheet') {
                bed.switchSheet();
            } else {
                bed.skeleton.setProjection({ isRowFiltered: (row) => row === 2, getCell: () => undefined });
            }
            return true;
        });
        expect(await bed.commands.executeCommand(DeleteRangeMoveUpConfirmCommand.id)).toBe(false);
        expect(bed.values()).toEqual(['first', 'second', 'third']);
    });

    it('shifts rows exposed by the focused view and supports undo and redo', async () => {
        const bed = createRangeMoveConfirmTestBed(DeleteRangeMoveUpConfirmCommand);
        bed.filterPublicRows();
        bed.skeleton.setProjection({ isRowFiltered: () => false, getCell: () => undefined });
        expect(await bed.commands.executeCommand(DeleteRangeMoveUpConfirmCommand.id)).toBe(true);
        expect(bed.values()).toEqual(['second', 'third', undefined]);
        expect(await bed.undo()).toBe(true);
        expect(bed.values()).toEqual(['first', 'second', 'third']);
        expect(await bed.redo()).toBe(true);
        expect(bed.values()).toEqual(['second', 'third', undefined]);
    });

    it('keeps public filter protection when the primary display is focused', async () => {
        const bed = createRangeMoveConfirmTestBed(DeleteRangeMoveUpConfirmCommand);
        bed.filterPublicRows();
        bed.skeleton.setProjection({ isRowFiltered: () => false, getCell: () => undefined });
        bed.renders.focusRender?.(bed.primary.renderId!);
        expect(await bed.commands.executeCommand(DeleteRangeMoveUpConfirmCommand.id)).toBe(false);
        expect(bed.values()).toEqual(['first', 'second', 'third']);
    });

    it.each([false, true])('preserves merge confirmation before shifting: %s', async (approved) => {
        const bed = createRangeMoveConfirmTestBed(DeleteRangeMoveUpConfirmCommand, [{ startRow: 1, endRow: 1, startColumn: 0, endColumn: 1 }]);
        bed.confirm.mockResolvedValue(approved);
        expect(await bed.commands.executeCommand(DeleteRangeMoveUpConfirmCommand.id)).toBe(true);
        expect(bed.values()).toEqual(approved ? ['second', 'third', undefined] : ['first', 'second', 'third']);
    });
});
