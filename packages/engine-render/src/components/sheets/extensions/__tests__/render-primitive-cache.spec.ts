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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UniverRenderingContext } from '../../../../context';
import { FontCache } from '../../../docs/layout/shaping-engine/font-cache';
import { RenderPrimitiveCache } from '../render-primitive-cache';

describe('render primitive raster cache', () => {
    let cache: RenderPrimitiveCache;
    let native: CanvasRenderingContext2D;
    let ctx: UniverRenderingContext;
    let fonts: EventTarget & { status: string };
    let fontsDescriptor: PropertyDescriptor | undefined;

    beforeEach(() => {
        cache = new RenderPrimitiveCache();
        native = document.createElement('canvas').getContext('2d')!;
        ctx = new UniverRenderingContext(native);
        ctx.strokeStyle = '#1d4ed8';
        native.canvas.dir = 'ltr';
        fonts = Object.assign(new EventTarget(), { status: 'loaded' });
        fontsDescriptor = Object.getOwnPropertyDescriptor(document, 'fonts');
        Object.defineProperty(document, 'fonts', { configurable: true, value: fonts });
    });

    afterEach(() => {
        cache.dispose();
        vi.restoreAllMocks();
        if (fontsDescriptor) {
            Object.defineProperty(document, 'fonts', fontsDescriptor);
        } else {
            Reflect.deleteProperty(document, 'fonts');
        }
    });

    function line(): void {
        cache.draw(ctx, () => {
            ctx.beginPath();
            ctx.moveToByPrecision(10, 20);
            ctx.lineToByPrecision(64, 45);
            ctx.stroke();
        });
    }

    it('reuses identical physical strokes after integral translations and restores the native context', () => {
        const stroke = vi.spyOn(native, 'stroke');
        const image = vi.spyOn(native, 'drawImage');
        line();
        ctx.setTransform(1, 0, 0, 1, -162, 100);
        line();

        expect(stroke).not.toHaveBeenCalled();
        expect(image).toHaveBeenCalledTimes(2);
        expect(image.mock.calls[1][0]).toBe(image.mock.calls[0][0]);
        expect(ctx._context).toBe(native);
        expect(native.getTransform().e).toBe(-162);
    });

    it('keeps color, dash, width, fractional phase and physical scale in the bitmap identity', () => {
        const image = vi.spyOn(native, 'drawImage');
        line();
        ctx.strokeStyle = '#be123c';
        line();
        ctx.setLineDash([2, 5, 2]);
        line();
        ctx.lineWidth = 2;
        line();
        ctx.setTransform(1, 0, 0, 1, 0.5, 0.5);
        line();
        ctx.setTransform(3, 0, 0, 3, 0.5, 0.5);
        line();

        const bitmaps = image.mock.calls.map((call) => call[0] as HTMLCanvasElement);
        expect(new Set(bitmaps).size).toBe(6);
        expect(bitmaps[5].width).toBeGreaterThan(bitmaps[4].width * 2);
        expect(bitmaps[5].height).toBeGreaterThan(bitmaps[4].height * 2);
    });

    it.each(['source-over', 'destination-out'] as const)('preserves %s composition and caller state', (operation) => {
        ctx.globalCompositeOperation = operation;
        ctx.globalAlpha = 0.6;
        ctx.imageSmoothingEnabled = true;
        ctx.setTransform(2, 0, 0, 2, 4, 8);
        line();

        expect(native.globalCompositeOperation).toBe(operation);
        expect(native.globalAlpha).toBe(0.6);
        expect(native.imageSmoothingEnabled).toBe(true);
        expect(native.getTransform()).toMatchObject({ a: 2, d: 2, e: 4, f: 8 });
    });

    it.each(['printing', 'rotation', 'nonuniform', 'shadow', 'large', 'curve'])('retains native drawing for %s', (mode) => {
        const stroke = vi.spyOn(native, 'stroke');
        const image = vi.spyOn(native, 'drawImage');
        if (mode === 'printing') {
            ctx.__mode = 'printing';
        } else if (mode === 'rotation') {
            ctx.setTransform(1, 0.2, 0, 1, 0, 0);
        } else if (mode === 'nonuniform') {
            ctx.setTransform(2, 0, 0, 1, 0, 0);
        } else if (mode === 'shadow') {
            ctx.shadowBlur = 2;
        }
        cache.draw(ctx, () => {
            ctx.beginPath();
            ctx.moveToByPrecision(10, 20);
            ctx.lineToByPrecision(mode === 'large' ? 1_000_000 : 64, 45);
            if (mode === 'curve') {
                ctx.arc(30, 30, 5, 0, Math.PI);
            }
            ctx.stroke();
        });

        expect(stroke).toHaveBeenCalledOnce();
        expect(image).not.toHaveBeenCalled();
    });

    it('bounds memory and releases retained canvases on disposal', () => {
        const image = vi.spyOn(native, 'drawImage');
        for (let i = 0; i < 300; i++) {
            ctx.strokeStyle = `#${i.toString(16).padStart(6, '0')}`;
            line();
        }
        const bitmaps = image.mock.calls.map((call) => call[0] as HTMLCanvasElement);
        expect(bitmaps[0].width).toBe(0);
        expect(bitmaps[bitmaps.length - 1].width).toBeGreaterThan(0);
        cache.dispose();
        expect(bitmaps.every((bitmap) => bitmap.width === 0 && bitmap.height === 0)).toBe(true);
    });

    it('restores the original native context if drawing throws', () => {
        expect(() => cache.draw(ctx, () => {
            throw new Error('failed draw');
        })).toThrow('failed draw');
        expect(ctx._context).toBe(native);
    });

    it('restores raster state when a bitmap submission fails', () => {
        ctx.setTransform(2, 0, 0, 2, 4, 8);
        ctx.imageSmoothingEnabled = true;
        ctx.globalAlpha = 0.6;
        vi.spyOn(native, 'drawImage').mockImplementation(() => {
            throw new Error('Bitmap submission failed');
        });
        expect(line).toThrow('Bitmap submission failed');
        expect(ctx._context).toBe(native);
        expect(native.getTransform()).toMatchObject({ a: 2, d: 2, e: 4, f: 8 });
        expect(native.imageSmoothingEnabled).toBe(true);
        expect(native.globalAlpha).toBe(0.6);
    });

    it.each(['disconnected', 'transformed'])('retains native geometry for a %s path', (mode) => {
        const stroke = vi.spyOn(native, 'stroke');
        const image = vi.spyOn(native, 'drawImage');
        cache.draw(ctx, () => {
            ctx.beginPath();
            ctx.moveToByPrecision(10, 20);
            if (mode === 'disconnected') {
                ctx.moveToByPrecision(64, 45);
            } else {
                ctx.translate(8, 0);
                ctx.lineToByPrecision(64, 45);
            }
            ctx.stroke();
        });
        expect(stroke).toHaveBeenCalledOnce();
        expect(image).not.toHaveBeenCalled();
    });

    function text(): void {
        cache.draw(ctx, () => ctx.fillText('Merged title', 10, 20));
    }

    it('restores text raster state and the caller save stack when a bitmap submission fails', () => {
        native.save();
        ctx.setTransform(2, 0, 0, 2, 4, 8);
        ctx.imageSmoothingEnabled = true;
        ctx.globalAlpha = 0.6;
        vi.spyOn(native, 'drawImage').mockImplementation(() => {
            throw new Error('Text bitmap submission failed');
        });

        expect(text).toThrow('Text bitmap submission failed');
        expect(ctx._context).toBe(native);
        expect(native.getTransform()).toMatchObject({ a: 2, d: 2, e: 4, f: 8 });
        expect(native.imageSmoothingEnabled).toBe(true);
        expect(native.globalAlpha).toBe(0.6);
        native.restore();
        expect(native.getTransform()).toMatchObject({ a: 1, d: 1, e: 0, f: 0 });
    });

    it('reuses physical text bitmaps after integral translations and invalidates for color and font changes', () => {
        const fill = vi.spyOn(native, 'fillText');
        const image = vi.spyOn(native, 'drawImage');
        text();
        ctx.setTransform(1, 0, 0, 1, -162, 100);
        text();
        ctx.fillStyle = '#be123c';
        text();
        ctx.font = 'bold 16px Arial';
        text();
        expect(fill).not.toHaveBeenCalled();
        expect(image).toHaveBeenCalledTimes(4);
        expect(image.mock.calls[1][0]).toBe(image.mock.calls[0][0]);
        expect(new Set(image.mock.calls.map((call) => call[0])).size).toBe(3);
    });

    it.each(['loadingdone', 'loadingerror', 'metrics'])('repaints glyphs after %s and releases font listeners', (event) => {
        const image = vi.spyOn(native, 'drawImage');
        const remove = vi.spyOn(fonts, 'removeEventListener');
        text();
        const before = image.mock.calls[0][0] as HTMLCanvasElement;
        if (event === 'metrics') {
            FontCache.invalidateMetrics(() => false);
        } else {
            fonts.dispatchEvent(new Event(event));
        }
        text();
        expect(before.width).toBe(0);
        expect(image.mock.calls[1][0]).not.toBe(before);
        cache.dispose();
        expect(remove).toHaveBeenCalledTimes(2);
    });

    it('keeps inherited text language in the raster identity', () => {
        const container = document.createElement('div');
        container.lang = 'zh-CN';
        container.append(native.canvas);
        const image = vi.spyOn(native, 'drawImage');
        text();
        container.lang = 'ja';
        text();
        const before = image.mock.calls[0][0] as HTMLCanvasElement;
        const after = image.mock.calls[1][0] as HTMLCanvasElement;
        expect(before.lang).toBe('zh-CN');
        expect(after.lang).toBe('ja');
        expect(after).not.toBe(before);
    });

    it.each(['loading', 'maxWidth', 'rotation', 'shadow', 'metrics', 'direction'])('retains native text rendering for %s', (mode) => {
        const fill = vi.spyOn(native, 'fillText');
        const image = vi.spyOn(native, 'drawImage');
        if (mode === 'loading') {
            fonts.status = 'loading';
        } else if (mode === 'rotation') {
            ctx.setTransform(1, 0.2, 0, 1, 0, 0);
        } else if (mode === 'shadow') {
            ctx.shadowColor = '#ff0000';
        } else if (mode === 'metrics') {
            vi.spyOn(native, 'measureText').mockReturnValue({ width: 10 } as TextMetrics);
        } else if (mode === 'direction') {
            ctx.direction = 'inherit';
            native.canvas.dir = 'auto';
        }
        cache.draw(ctx, () => {
            if (mode === 'maxWidth') {
                ctx.fillText('Merged title', 10, 20, 12);
            } else {
                ctx.fillText('Merged title', 10, 20);
            }
        });
        expect(fill).toHaveBeenCalledOnce();
        expect(image).not.toHaveBeenCalled();
    });
});
