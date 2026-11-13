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

import { Disposable } from '@univerjs/core';
import { UniverRenderingContext } from '@univerjs/engine-render';

interface IConditionalFormattingBitmap {
    canvas: HTMLCanvasElement;
    pixels: number;
}

const MAX_ENTRIES = 128;
const MAX_PIXELS = 512 * 1024;
const MAX_BITMAP_PIXELS = 128 * 1024;

/** Retain physical pixels without mutating image sources already submitted to the destination. */
export class ConditionalFormattingRasterCache extends Disposable {
    private readonly _bitmaps = new Map<string, IConditionalFormattingBitmap>();
    private _pixels = 0;

    draw(
        ctx: UniverRenderingContext,
        x: number,
        y: number,
        width: number,
        height: number,
        variant: string,
        draw: (paint: UniverRenderingContext, x: number, y: number) => void,
        strokeWidth = 0
    ): void {
        this.ensureNotDisposed();
        const native = ctx._context;
        const m = native?.getTransform();
        const colorSpace = native?.getContextAttributes?.()?.colorSpace;
        if (!m || ctx.__mode === 'printing' || typeof document === 'undefined'
            || m.a !== m.d || m.a <= 0 || m.b || m.c || native.globalAlpha !== 1
            || native.globalCompositeOperation !== 'source-over' || (colorSpace && colorSpace !== 'srgb')
            || native.shadowBlur || native.shadowOffsetX || native.shadowOffsetY
            || !['rgba(0, 0, 0, 0)', 'transparent', '#00000000'].includes(native.shadowColor)
            || (native.filter && native.filter !== 'none') || width <= 0 || height <= 0
            || typeof native.fillStyle !== 'string' || typeof native.strokeStyle !== 'string') {
            draw(ctx, x, y);
            return;
        }
        const px = x * m.a + m.e;
        const py = y * m.d + m.f;
        const padding = Math.max(2, Math.ceil(strokeWidth * m.a / 2) + 1);
        const left = Math.floor(px) - padding;
        const top = Math.floor(py) - padding;
        const pixelWidth = Math.ceil(px + width * m.a) - left + padding;
        const pixelHeight = Math.ceil(py + height * m.d) - top + padding;
        const pixels = pixelWidth * pixelHeight;
        if (!Number.isFinite(pixels) || pixels > MAX_BITMAP_PIXELS) {
            draw(ctx, x, y);
            return;
        }
        const localX = px - left;
        const localY = py - top;
        const dash = native.getLineDash();
        const key = JSON.stringify([
            variant,
            width,
            height,
            m.a,
            localX,
            localY,
            strokeWidth,
            native.fillStyle,
            native.strokeStyle,
            dash,
            native.lineDashOffset,
            native.lineCap,
            native.lineJoin,
            native.miterLimit,
            native.imageSmoothingEnabled,
            native.imageSmoothingQuality,
        ]);
        let bitmap = this._bitmaps.get(key);
        if (!bitmap) {
            const canvas = document.createElement('canvas');
            canvas.width = pixelWidth;
            canvas.height = pixelHeight;
            const context = canvas.getContext('2d');
            if (!context) {
                draw(ctx, x, y);
                return;
            }
            const paint = new UniverRenderingContext(context);
            paint.setTransform(m.a, 0, 0, m.d, localX, localY);
            paint.setLineDash(dash);
            paint.lineDashOffset = native.lineDashOffset;
            paint.lineCap = native.lineCap;
            paint.lineJoin = native.lineJoin;
            paint.miterLimit = native.miterLimit;
            paint.imageSmoothingEnabled = native.imageSmoothingEnabled;
            paint.imageSmoothingQuality = native.imageSmoothingQuality;
            draw(paint, 0, 0);
            while (this._bitmaps.size >= MAX_ENTRIES || this._pixels + pixels > MAX_PIXELS) {
                const oldestKey = this._bitmaps.keys().next().value;
                if (oldestKey === undefined) {
                    break;
                }
                this._pixels -= this._bitmaps.get(oldestKey)!.pixels;
                // A submitted image may still be consumed by WebKit; release our reference without resizing it.
                this._bitmaps.delete(oldestKey);
            }
            bitmap = { canvas, pixels };
            this._bitmaps.set(key, bitmap);
            this._pixels += pixels;
        }
        ctx.save();
        try {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(bitmap.canvas, left, top);
        } finally {
            ctx.restore();
        }
    }

    override dispose(): void {
        for (const { canvas } of this._bitmaps.values()) {
            canvas.width = 0;
            canvas.height = 0;
        }
        this._bitmaps.clear();
        this._pixels = 0;
        super.dispose();
    }
}
