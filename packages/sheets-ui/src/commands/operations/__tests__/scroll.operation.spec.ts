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

import { IRenderManagerService } from '@univerjs/engine-render';
import { describe, expect, it, vi } from 'vitest';
import { createChartRenderTestBed } from '../../../controllers/render-controllers/__tests__/chart-render-test-bed';
import { SheetScrollManagerService } from '../../../services/scroll-manager.service';
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

describe('SetScrollOperation', () => {
    it('SetScrollOperation should compute final offsets with screen ratios', () => {
        const emitRawScrollParam = vi.fn();
        const renderUnit = {
            with: vi.fn(() => ({ emitRawScrollParam })),
            engine: { width: 200, height: 100 },
        };

        const renderManagerService = {
            getRenderUnitById: vi.fn()
                .mockReturnValueOnce(renderUnit)
                .mockReturnValueOnce(renderUnit),
        };

        const accessor = createAccessor([[IRenderManagerService, renderManagerService]]);

        expect(SetScrollOperation.handler(accessor, {
            unitId: 'u1',
            sheetId: 's1',
            offsetX: 10,
            offsetY: 20,
            screenRatioX: 0.5,
            screenRatioY: 0.25,
        } as any)).toBe(true);

        expect(emitRawScrollParam).toHaveBeenCalledWith(expect.objectContaining({
            unitId: 'u1',
            sheetId: 's1',
            offsetX: 110,
            offsetY: 45,
        }));
    });

    it('SetScrollOperation should return false for empty params or missing render unit', () => {
        const accessor = createAccessor([[IRenderManagerService, { getRenderUnitById: vi.fn() }]]);
        expect(SetScrollOperation.handler(accessor, undefined as any)).toBe(false);

        const renderManagerService = {
            getRenderUnitById: vi.fn(() => null),
        };
        const accessor2 = createAccessor([[IRenderManagerService, renderManagerService]]);
        expect(SetScrollOperation.handler(accessor2, { unitId: 'u1', sheetId: 's1' } as any)).toBe(false);
    });
});

it('uses the focused pane screen size without scrolling the primary pane', () => {
    const bed = createChartRenderTestBed([[SheetScrollManagerService]]);
    const renders = bed.injector.get(IRenderManagerService);
    const companion = renders.createRender(bed.workbook.getUnitId(), undefined, 'scroll-companion');
    companion.engine.resizeBySize(400, 300);
    renders.focusRender?.('scroll-companion');
    bed.commands.registerCommand(SetScrollOperation);
    let primaryPosition: unknown;
    let companionPosition: unknown;
    const first = bed.render.with(SheetScrollManagerService).rawScrollInfo$.subscribe((value) => {
        primaryPosition = value;
    });
    const second = companion.with(SheetScrollManagerService).rawScrollInfo$.subscribe((value) => {
        companionPosition = value;
    });
    try {
        expect(bed.commands.syncExecuteCommand(SetScrollOperation.id, {
            unitId: bed.workbook.getUnitId(),
            sheetId: 'grid',
            screenRatioX: 0.5,
        })).toBe(true);
        expect(companionPosition).toMatchObject({ offsetX: 200 });
        expect(primaryPosition).toBeNull();
    } finally {
        first.unsubscribe();
        second.unsubscribe();
    }
});
