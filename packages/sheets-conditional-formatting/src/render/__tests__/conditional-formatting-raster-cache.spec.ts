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

import { UniverRenderingContext } from '@univerjs/engine-render';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConditionalFormattingRasterCache } from '../conditional-formatting-raster-cache';

function nativeContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const smoothing: boolean[] = [];
    const context = {
        canvas,
        fillStyle: '#38bdf8',
        strokeStyle: '#2563eb',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'low',
        globalAlpha: 1,
        globalCompositeOperation: 'source-over',
        shadowColor: 'rgba(0, 0, 0, 0)',
        getTransform: () => ({ a: 3, b: 0, c: 0, d: 3, e: 0.5, f: 0.5 }),
        setTransform: vi.fn(),
        save: vi.fn(() => smoothing.push(context.imageSmoothingEnabled)),
        restore: vi.fn(() => { context.imageSmoothingEnabled = smoothing.pop()!; }),
        drawImage: vi.fn(),
        getLineDash: () => [],
        setLineDash: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    return context;
}

function fixture() {
    const native = nativeContext(document.createElement('canvas'));
    const context = new UniverRenderingContext(native);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
        return nativeContext(this);
    });
    return { native, context, cache: new ConditionalFormattingRasterCache() };
}

describe('conditional formatting immutable rasters', () => {
    afterEach(() => vi.restoreAllMocks());

    it('reuses equal physical phases, but separates geometry, content and style', () => {
        const { cache, context, native } = fixture();
        const draw = vi.fn();
        try {
            cache.draw(context, 10, 20, 24, 12, 'green', draw);
            cache.draw(context, 30, 40, 24, 12, 'green', draw);
            expect(draw).toHaveBeenCalledOnce();
            const first = vi.mocked(native.drawImage).mock.calls[0][0];
            expect(vi.mocked(native.drawImage).mock.calls[1][0]).toBe(first);
            cache.draw(context, 30.1, 40, 24, 12, 'green', draw);
            cache.draw(context, 30, 40, 25, 12, 'green', draw);
            cache.draw(context, 30, 40, 24, 12, 'red', draw);
            native.fillStyle = '#f43f5e';
            cache.draw(context, 30, 40, 24, 12, 'green', draw);
            expect(draw).toHaveBeenCalledTimes(5);
            expect(context.imageSmoothingEnabled).toBe(true);
        } finally {
            cache.dispose();
        }
    });

    it('does not resize, clear or repaint submitted sources when entries are evicted', () => {
        const { cache, context, native } = fixture();
        const draw = vi.fn();
        for (let i = 0; i < 140; i++) {
            cache.draw(context, 10, 20, 24, 12, String(i), draw);
        }
        const sources = vi.mocked(native.drawImage).mock.calls.map(([source]) => source as HTMLCanvasElement);
        expect(new Set(sources).size).toBe(140);
        expect(sources.every((source) => source.width === 77 && source.height === 41)).toBe(true);
        expect(Reflect.get(cache, '_bitmaps').size).toBe(128);
        expect(draw).toHaveBeenCalledTimes(140);
        cache.dispose();
        expect(sources.slice(0, 12).every((source) => source.width === 77 && source.height === 41)).toBe(true);
        expect(sources.slice(12).every((source) => source.width === 0 && source.height === 0)).toBe(true);
        expect(Reflect.get(cache, '_bitmaps').size).toBe(0);
        expect(Reflect.get(cache, '_pixels')).toBe(0);
        expect(() => cache.draw(context, 0, 0, 24, 12, '', draw)).toThrow('disposed');
    });

    it('bounds retained pixel memory independently of the number of entries', () => {
        const { cache, context } = fixture();
        for (let i = 0; i < 12; i++) {
            cache.draw(context, 0, 0, 100, 100, String(i), vi.fn());
        }
        expect(Reflect.get(cache, '_bitmaps').size).toBeLessThan(12);
        expect(Reflect.get(cache, '_pixels')).toBeLessThanOrEqual(512 * 1024);
        cache.dispose();
    });

    it('includes the entire physical stroke at high scale', () => {
        const { cache, context, native } = fixture();
        vi.spyOn(native, 'getTransform').mockReturnValue({ a: 6, b: 0, c: 0, d: 6, e: 60, f: 60 } as DOMMatrix);
        const draw = vi.fn();
        cache.draw(context, 0, 0, 24, 12, 'gradient', draw, 1);
        const [paint] = draw.mock.calls[0];
        expect([paint.canvas.width, paint.canvas.height]).toEqual([152, 80]);
        expect(paint._context.setTransform).toHaveBeenCalledWith(6, 0, 0, 6, 4, 4);
        expect(native.drawImage).toHaveBeenCalledWith(paint.canvas, 56, 56);
        cache.dispose();
    });

    it.each(['printing', 'alpha', 'composition', 'rotation', 'shadow', 'filter', 'gradient-style', 'oversized'])('retains native fallback for %s', (mode) => {
        const { cache, context, native } = fixture();
        if (mode === 'printing') context.__mode = 'printing';
        if (mode === 'alpha') native.globalAlpha = 0.5;
        if (mode === 'composition') native.globalCompositeOperation = 'destination-out';
        if (mode === 'rotation') vi.spyOn(native, 'getTransform').mockReturnValue({ a: 1, b: 1, c: 0, d: 1 } as DOMMatrix);
        if (mode === 'shadow') native.shadowBlur = 2;
        if (mode === 'filter') native.filter = 'blur(2px)';
        if (mode === 'gradient-style') native.fillStyle = {} as CanvasGradient;
        const draw = vi.fn();
        cache.draw(context, 10, 20, mode === 'oversized' ? 1_000_000 : 24, 12, '', draw);
        expect(draw).toHaveBeenCalledExactlyOnceWith(context, 10, 20);
        expect(native.drawImage).not.toHaveBeenCalled();
        cache.dispose();
    });

    it('does not retain a failed raster and restores destination state after a failed submission', () => {
        const { cache, context, native } = fixture();
        expect(() => cache.draw(context, 0, 0, 24, 12, '', () => {
            throw new Error('paint');
        })).toThrow('paint');
        expect(Reflect.get(cache, '_bitmaps').size).toBe(0);
        vi.mocked(native.drawImage).mockImplementation(() => {
            throw new Error('submit');
        });
        expect(() => cache.draw(context, 0, 0, 24, 12, '', vi.fn())).toThrow('submit');
        expect(native.restore).toHaveBeenCalledOnce();
        expect(context.imageSmoothingEnabled).toBe(true);
        cache.dispose();
    });
});
