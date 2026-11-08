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
import type { Canvas } from '../../../canvas';
import type { UniverRenderingContext2D } from '../../../context';
import { UniverRenderingContext } from '../../../context';
import { Spreadsheet } from '../spreadsheet';

interface ISpreadsheetApplyCache {
    _repairGridlineStroke: (ctx: UniverRenderingContext2D, left: number, top: number, right: number, bottom: number, rectangle?: boolean) => void;
    _applyCache: (
        cacheCanvas: Canvas,
        ctx: UniverRenderingContext2D,
        sx?: number,
        sy?: number,
        sw?: number,
        sh?: number,
        dx?: number,
        dy?: number,
        dw?: number,
        dh?: number
    ) => void;
}

function createMockCtx() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        setTransform: vi.fn(),
        drawImage: vi.fn(),
        imageSmoothingEnabled: true,
    };
}

function createMockCacheCanvas(width: number, height: number, pixelRatio = 2) {
    const cacheCtx = createMockCtx();
    const canvasEle = {};
    return {
        canvasEle,
        getPixelRatio: () => pixelRatio,
        getWidth: () => width,
        getHeight: () => height,
        getContext: () => cacheCtx,
        getCanvasEle: () => canvasEle,
    };
}

function callApplyCache(
    cacheCanvas: ReturnType<typeof createMockCacheCanvas>,
    ctx: ReturnType<typeof createMockCtx>,
    ...rect: [number, number, number, number, number, number, number, number]
) {
    const spreadsheet = new Spreadsheet('sheet-apply-cache-test');
    (spreadsheet as unknown as ISpreadsheetApplyCache)._applyCache(
        cacheCanvas as unknown as Canvas,
        ctx as unknown as UniverRenderingContext2D,
        ...rect
    );
}

describe('spreadsheet _applyCache blit clipping', () => {
    it('clips the source rect to the cache canvas and shrinks the destination proportionally', () => {
        // Frozen column viewport (viewMainLeft): bufferEdgeX is 0, so the cache canvas is
        // exactly the viewport width (80), while renderByViewports requests a blit wider
        // by the row header margin (126 = 80 + 46).
        const cacheCanvas = createMockCacheCanvas(80, 480);
        const ctx = createMockCtx();

        callApplyCache(cacheCanvas, ctx, 0, 100, 126, 280, 46, 26, 126, 280);

        expect(ctx.drawImage).toHaveBeenCalledWith(
            cacheCanvas.canvasEle,
            0, // sx
            100 * 2, // sy
            80 * 2, // sw clipped from 126 to the canvas width
            280 * 2, // sh
            46 * 2, // dx
            26 * 2, // dy
            80 * 2, // dw shrunk by the same ratio as sw
            280 * 2 // dh
        );
    });

    it('passes the rect through unchanged when it already fits the cache canvas', () => {
        // Main viewport (viewMain): bufferEdge 100 on both axes leaves enough room for the
        // header margins, so nothing needs clipping.
        const cacheCanvas = createMockCacheCanvas(1000, 900);
        const ctx = createMockCtx();

        callApplyCache(cacheCanvas, ctx, 100, 100, 846, 726, 46, 26, 846, 726);

        expect(ctx.drawImage).toHaveBeenCalledWith(
            cacheCanvas.canvasEle,
            100 * 2,
            100 * 2,
            846 * 2,
            726 * 2,
            46 * 2,
            26 * 2,
            846 * 2,
            726 * 2
        );
    });

    it('clips the bottom overflow and keeps the vertical ratio', () => {
        // Frozen row viewport (viewMainTop): bufferEdgeY is 0, cache canvas is exactly the
        // viewport height (480), requested blit is taller by the column header margin (506).
        const cacheCanvas = createMockCacheCanvas(1200, 480);
        const ctx = createMockCtx();

        callApplyCache(cacheCanvas, ctx, 100, 0, 1100, 506, 0, 26, 1100, 506);

        expect(ctx.drawImage).toHaveBeenCalledWith(
            cacheCanvas.canvasEle,
            100 * 2,
            0,
            1100 * 2,
            480 * 2, // sh clipped from 506 to 480
            0,
            26 * 2,
            1100 * 2,
            480 * 2 // dh shrunk by the same ratio
        );
    });

    it('draws nothing when the source rect lies entirely outside the cache canvas', () => {
        const cacheCanvas = createMockCacheCanvas(80, 480);
        const ctx = createMockCtx();

        callApplyCache(cacheCanvas, ctx, 200, 0, 50, 800, 0, 0, 50, 800);

        expect(ctx.drawImage).not.toHaveBeenCalled();
    });

    it('clips a negative source offset and shifts the destination accordingly', () => {
        const cacheCanvas = createMockCacheCanvas(500, 500);
        const ctx = createMockCtx();

        callApplyCache(cacheCanvas, ctx, -20, 0, 100, 100, 0, 0, 100, 100);

        expect(ctx.drawImage).toHaveBeenCalledWith(
            cacheCanvas.canvasEle,
            0, // sx clipped to 0
            0,
            80 * 2, // sw reduced by the clipped 20px
            100 * 2,
            20 * 2, // dx shifted by the same proportion
            0,
            80 * 2, // dw reduced by the same proportion
            100 * 2
        );
    });

    it('keeps the previous behavior for zero-sized rects', () => {
        const cacheCanvas = createMockCacheCanvas(80, 480);
        const ctx = createMockCtx();

        callApplyCache(cacheCanvas, ctx, 0, 0, 0, 100, 0, 0, 0, 100);

        expect(ctx.drawImage).toHaveBeenCalledWith(
            cacheCanvas.canvasEle,
            0,
            0,
            0,
            200,
            0,
            0,
            0,
            200
        );
    });
});

describe('spreadsheet native cache gridline interiors', () => {
    it.each(['opaque', 'alpha', 'translucent', 'fractional', 'shadow', 'dash', 'filter', 'color-space'])('preserves native corners, style composition and texture bounds for %s', (mode) => {
        const spreadsheet = new Spreadsheet('native-grid-test');
        const native = document.createElement('canvas').getContext('2d')!;
        const ctx = new UniverRenderingContext(native);
        ctx.setTransform(1.5, 0, 0, 1.5, mode === 'fractional' ? 0.51 : 0.5, mode === 'fractional' ? 0.51 : 0.5);
        ctx.lineWidth = 2 / 3;
        native.strokeStyle = mode === 'translucent' ? 'rgba(29,78,216,0.5)' : '#1d4ed8';
        native.fillStyle = '#be123c';
        if (mode === 'alpha') {
            native.globalAlpha = 0.5;
        }
        if (mode === 'shadow') {
            native.shadowBlur = 2;
        }
        if (mode === 'dash') {
            native.setLineDash([2, 2]);
        }
        if (mode === 'filter') {
            native.filter = 'blur(2px)';
        }
        if (mode === 'color-space') {
            Object.defineProperty(native, 'getContextAttributes', { value: () => ({ colorSpace: 'display-p3' }) });
        }
        const fill = vi.spyOn(native, 'fillRect');
        const allocation = vi.spyOn(document, 'createElement');
        try {
            (spreadsheet as unknown as ISpreadsheetApplyCache)._repairGridlineStroke(ctx, 10, 20, 10000, 10000, true);
            expect(fill).toHaveBeenCalledTimes(mode === 'opaque' ? 4 : 0);
            if (mode === 'opaque') {
                expect(fill).toHaveBeenNthCalledWith(1, 20, 30, 14976, 1);
                for (const rect of fill.mock.calls) {
                    expect(rect.every(Number.isInteger)).toBe(true);
                    expect(Math.min(rect[2], rect[3])).toBe(1);
                }
            }
            expect(allocation).not.toHaveBeenCalled();
            expect(native.fillStyle).toBe('#be123c');
            expect(native.getTransform()).toMatchObject({ a: 1.5, d: 1.5, e: mode === 'fractional' ? 0.51 : 0.5 });
        } finally {
            allocation.mockRestore();
            spreadsheet.dispose();
        }
    });

    it('restores native drawing state when an interior repair throws', () => {
        const spreadsheet = new Spreadsheet('native-grid-error');
        const native = document.createElement('canvas').getContext('2d')!;
        const ctx = new UniverRenderingContext(native);
        ctx.setTransform(1, 0, 0, 1, 0.5, 0.5);
        native.strokeStyle = '#1d4ed8';
        native.fillStyle = '#be123c';
        vi.spyOn(native, 'fillRect').mockImplementation(() => {
            throw new Error('failed repair');
        });
        expect(() => (spreadsheet as unknown as ISpreadsheetApplyCache)._repairGridlineStroke(ctx, 10, 20, 100, 100)).toThrow('failed repair');
        expect(native.fillStyle).toBe('#be123c');
        expect(native.getTransform()).toMatchObject({ a: 1, d: 1, e: 0.5, f: 0.5 });
        spreadsheet.dispose();
    });
});
