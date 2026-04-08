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
import { IEditorBridgeService } from '../../../services/editor-bridge.service';
import { IFormatPainterService } from '../../../services/format-painter/format-painter.service';
import { SetActivateCellEditOperation } from '../activate-cell-edit.operation';
import { ScrollToRangeOperation } from '../scroll-to-range.operation';
import { SetScrollOperation } from '../scroll.operation';
import { SetFormatPainterOperation } from '../set-format-painter.operation';
import { SetZoomRatioOperation } from '../set-zoom-ratio.operation';

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

describe('sheets-ui basic operations', () => {
    it('SetFormatPainterOperation should guard empty params and update service', () => {
        const setStatus = vi.fn();
        const accessor = createAccessor([[IFormatPainterService, { setStatus }]]);

        expect(SetFormatPainterOperation.handler(accessor, undefined as any)).toBe(false);
        expect(SetFormatPainterOperation.handler(accessor, { status: 'ONCE' as any })).toBe(true);
        expect(setStatus).toHaveBeenCalledWith('ONCE');
    });

    it('SetActivateCellEditOperation should update current edit cell state', () => {
        const setEditCell = vi.fn();
        const accessor = createAccessor([[IEditorBridgeService, { setEditCell }]]);

        expect(SetActivateCellEditOperation.handler(accessor, { unitId: 'u1' } as any)).toBe(true);
        expect(setEditCell).toHaveBeenCalledWith({ unitId: 'u1' });
    });

    it('SetScrollOperation should compute final offsets with screen ratios', () => {
        const emitRawScrollParam = vi.fn();
        const renderUnit = {
            with: vi.fn(() => ({ emitRawScrollParam })),
            engine: { width: 200, height: 100 },
        };

        const renderManagerService = {
            getRenderById: vi.fn()
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
        const accessor = createAccessor([[IRenderManagerService, { getRenderById: vi.fn() }]]);
        expect(SetScrollOperation.handler(accessor, undefined as any)).toBe(false);

        const renderManagerService = {
            getRenderById: vi.fn()
                .mockReturnValueOnce({ with: () => ({ emitRawScrollParam: vi.fn() }) })
                .mockReturnValueOnce(null),
        };
        const accessor2 = createAccessor([[IRenderManagerService, renderManagerService]]);
        expect(SetScrollOperation.handler(accessor2, { unitId: 'u1', sheetId: 's1' } as any)).toBe(false);
    });

    it('SetZoomRatioOperation should delegate to zoom controller', () => {
        const updateZoom = vi.fn(() => true);
        const renderManagerService = {
            getRenderById: vi.fn(() => ({ with: () => ({ updateZoom }) })),
        };
        const accessor = createAccessor([[IRenderManagerService, renderManagerService]]);

        expect(SetZoomRatioOperation.handler(accessor, {
            unitId: 'u1',
            subUnitId: 's1',
            zoomRatio: 1.25,
        })).toBe(true);
        expect(updateZoom).toHaveBeenCalledWith('s1', 1.25);

        const accessor2 = createAccessor([[IRenderManagerService, { getRenderById: () => null }]]);
        expect(SetZoomRatioOperation.handler(accessor2, { unitId: 'u1', subUnitId: 's1', zoomRatio: 1 } as any)).toBe(false);
    });

    it('ScrollToRangeOperation should guard params and call scroll controller', () => {
        const scrollToRange = vi.fn(() => true);
        const accessor = createAccessor([
            [IUniverInstanceService, { getCurrentUnitForType: () => ({ getUnitId: () => 'u1' }) }],
            [IRenderManagerService, { getRenderById: () => ({ with: () => ({ scrollToRange }) }) }],
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
    });
});
