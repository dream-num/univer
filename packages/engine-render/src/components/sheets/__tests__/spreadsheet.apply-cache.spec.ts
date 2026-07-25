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

import type { Canvas } from '../../../canvas';
import type { UniverRenderingContext2D } from '../../../context';
import { describe, expect, it, vi } from 'vitest';
import { Spreadsheet } from '../spreadsheet';

interface ISpreadsheetApplyCache {
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
