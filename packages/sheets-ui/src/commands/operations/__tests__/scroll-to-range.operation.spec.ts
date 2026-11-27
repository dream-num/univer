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

import { IUniverInstanceService } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { describe, expect, it, vi } from 'vitest';
import { createChartRenderTestBed } from '../../../controllers/render-controllers/__tests__/chart-render-test-bed';
import { SheetsScrollRenderController } from '../../../controllers/render-controllers/scroll.render-controller';
import { SheetScrollManagerService } from '../../../services/scroll-manager.service';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';
import { ScrollCommand, ScrollToCellCommand } from '../../commands/set-scroll.command';
import { ScrollToRangeOperation } from '../scroll-to-range.operation';
import { SetScrollOperation } from '../scroll.operation';

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

describe('ScrollToRangeOperation', () => {
    it('ScrollToRangeOperation should guard params and call scroll controller', () => {
        const scrollToRange = vi.fn(() => true);
        const getRenderUnitById = vi.fn(() => ({ with: () => ({ scrollToRange }) }));
        const accessor = createAccessor([
            [IUniverInstanceService, { getCurrentUnitOfType: () => ({ getUnitId: () => 'u1' }) }],
            [IRenderManagerService, { getRenderUnitById }],
        ]);

        expect(ScrollToRangeOperation.handler(accessor, undefined as any)).toBe(false);

        expect(ScrollToRangeOperation.handler(accessor, {
            range: { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 },
            forceTop: true,
            forceLeft: false,
        } as any)).toBe(true);

        expect(scrollToRange).toHaveBeenCalledWith(
            { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 },
            true,
            false
        );
        expect(getRenderUnitById).toHaveBeenCalledWith('u1');

        expect(ScrollToRangeOperation.handler(accessor, {
            unitId: 'embedded-u1',
            range: { startRow: 2, endRow: 3, startColumn: 2, endColumn: 3 },
        } as any)).toBe(true);
        expect(getRenderUnitById).toHaveBeenLastCalledWith('embedded-u1');

        const missingRenderAccessor = createAccessor([
            [IUniverInstanceService, { getCurrentUnitOfType: () => ({ getUnitId: () => 'missing' }) }],
            [IRenderManagerService, { getRenderUnitById: () => null }],
        ]);
        expect(ScrollToRangeOperation.handler(missingRenderAccessor, {
            range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
        } as any)).toBe(false);
    });
});

it('reveals a range in the focused pane through both scroll entry points', () => {
    const bed = createChartRenderTestBed([[SheetScrollManagerService], [SheetsScrollRenderController]], false, {
        rowCount: 1000,
        freeze: { startRow: 0, startColumn: 0, xSplit: 0, ySplit: 0 },
    });
    const renders = bed.injector.get(IRenderManagerService);
    const companion = renders.createRender(bed.workbook.getUnitId(), undefined, 'range-companion');
    companion.engine.resizeBySize(400, 300);
    companion.with(SheetSkeletonManagerService).setCurrent({ sheetId: 'grid' });
    bed.manager.setCurrent({ sheetId: 'grid' });
    renders.focusRender?.('range-companion');
    for (const command of [ScrollCommand, SetScrollOperation, ScrollToRangeOperation, ScrollToCellCommand]) {
        bed.commands.registerCommand(command);
    }
    const primary = bed.render.with(SheetScrollManagerService);
    const focused = companion.with(SheetScrollManagerService);
    const original = primary.getCurrentScrollState();
    let row = 40;
    for (const command of [ScrollToRangeOperation, ScrollToCellCommand]) {
        expect(bed.commands.syncExecuteCommand(command.id, {
            unitId: bed.workbook.getUnitId(),
            range: { startRow: row, endRow: row, startColumn: 0, endColumn: 0 },
            forceTop: true,
        })).toBe(true);
        expect(focused.getCurrentScrollState().sheetViewStartRow).toBeGreaterThan(0);
        expect(primary.getCurrentScrollState()).toEqual(original);
        row += 20;
    }
});
