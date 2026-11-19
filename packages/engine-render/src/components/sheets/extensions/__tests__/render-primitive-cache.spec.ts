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

import { createIdentifier, Injector } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UniverRenderingContext } from '../../../../context';
import { FontCache } from '../../../docs/layout/shaping-engine/font-cache';
import { Border } from '../border';
import { Font } from '../font';
import { RenderPrimitiveCache } from '../render-primitive-cache';

const IFontPrimitiveCache = createIdentifier<RenderPrimitiveCache>('render.test.font-primitive-cache');

describe('render primitive raster cache', () => {
    let injector: Injector;
    let cache: RenderPrimitiveCache;
    let native: CanvasRenderingContext2D;
    let ctx: UniverRenderingContext;
    let fonts: EventTarget & { status: string };
    let fontsDescriptor: PropertyDescriptor | undefined;

    beforeEach(() => {
        native = document.createElement('canvas').getContext('2d')!;
        injector = new Injector([
            [RenderPrimitiveCache],
            [Border],
            [Font],
            [IFontPrimitiveCache, {
                useFactory: (font: Font) => Reflect.get(font, '_primitiveCache') as RenderPrimitiveCache,
                deps: [Font],
            }],
            [EventTarget],
            [CanvasRenderingContext2D, { useValue: native }],
            [UniverRenderingContext, {
                useFactory: (container: Injector, context: CanvasRenderingContext2D) =>
                    container.createInstance(UniverRenderingContext, context),
                deps: [Injector, CanvasRenderingContext2D],
            }],
        ]);
        cache = injector.get(RenderPrimitiveCache);
        ctx = injector.get(UniverRenderingContext);
        ctx.strokeStyle = '#1d4ed8';
        native.canvas.dir = 'ltr';
        fonts = Object.assign(injector.get(EventTarget), { status: 'loaded' });
        fontsDescriptor = Object.getOwnPropertyDescriptor(document, 'fonts');
        Object.defineProperty(document, 'fonts', { configurable: true, value: fonts });
    });

    afterEach(() => {
        cache.dispose();
        injector.dispose();
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

    it.each(['horizontal', 'vertical', 'reverse', 'fractional-width', 'dash', 'round-cap', 'round-join', 'zero'])('retains native stroke semantics for %s lines', (mode) => {
        const image = vi.spyOn(native, 'drawImage');
        if (mode === 'fractional-width') ctx.lineWidth = 2;
        if (mode === 'dash') ctx.setLineDash([2, 2]);
        if (mode === 'round-cap') ctx.lineCap = 'round';
        if (mode === 'round-join') ctx.lineJoin = 'round';
        cache.draw(ctx, () => {
            ctx.beginPath();
            ctx.moveTo(10.5, 20.5);
            ctx.lineTo(mode === 'vertical' || mode === 'zero' ? 10.5 : mode === 'reverse' ? 2.5 : 64.5, mode === 'vertical' ? 64.5 : 20.5);
            ctx.closePath();
            ctx.stroke();
        });
        const paint = (image.mock.calls[0][0] as HTMLCanvasElement).getContext('2d')!;
        const usesRectangle = ['horizontal', 'vertical', 'reverse'].includes(mode);
        expect(paint.fillRect).toHaveBeenCalledTimes(usesRectangle ? 1 : 0);
        expect(paint.stroke).toHaveBeenCalledTimes(usesRectangle ? 0 : 1);
        expect(native.strokeStyle).toBe('#1d4ed8');
        expect(native.getTransform()).toMatchObject({ a: 1, d: 1, e: 0, f: 0 });
    });

    it.each([20, 21, 30])('repairs only antialiased text edges culled by the damage clip at %s', (top) => {
        const text = vi.spyOn(native, 'fillText');
        const image = vi.spyOn(native, 'drawImage');
        vi.spyOn(native, 'measureText').mockReturnValue({
            actualBoundingBoxLeft: 0,
            actualBoundingBoxRight: 10,
            actualBoundingBoxAscent: 10,
            actualBoundingBoxDescent: 0.2,
        } as TextMetrics);
        cache.draw(ctx, () => ctx.fillText('tail', 2.5, 20.5), { left: 0, top, right: 100, bottom: 40 });

        expect(image).toHaveBeenCalledTimes(top === 21 ? 1 : 0);
        expect(text).toHaveBeenCalledTimes(top === 21 ? 0 : 1);
    });

    it.each(['left', 'right', 'top', 'bottom'])('repairs a culled %s text edge in transformed physical pixels', (edge) => {
        ctx.setTransform(2, 0, 0, 2, 10, 14);
        const text = vi.spyOn(native, 'fillText');
        const image = vi.spyOn(native, 'drawImage');
        vi.spyOn(native, 'measureText').mockReturnValue({
            actualBoundingBoxLeft: 0,
            actualBoundingBoxRight: 10,
            actualBoundingBoxAscent: 10,
            actualBoundingBoxDescent: 0.2,
        } as TextMetrics);
        const clip = { left: 0, top: 0, right: 100, bottom: 100 };
        if (edge === 'left') clip.left = 36;
        if (edge === 'right') clip.right = 14;
        if (edge === 'top') clip.top = 56;
        if (edge === 'bottom') clip.bottom = 34;
        cache.draw(ctx, () => ctx.fillText('tail', 2.5, 20.5), clip);

        expect(image).toHaveBeenCalledOnce();
        expect(text).not.toHaveBeenCalled();
        expect(native.getTransform()).toMatchObject({ a: 2, d: 2, e: 10, f: 14 });
    });

    it('preserves native glyph coordinates at a clipped antialiasing edge', () => {
        native.canvas.width = 600;
        native.canvas.height = 400;
        ctx.setTransform(2, 0, 0, 2, 10, 14);
        const image = vi.spyOn(native, 'drawImage');
        vi.spyOn(native, 'measureText').mockReturnValue({
            actualBoundingBoxLeft: 0,
            actualBoundingBoxRight: 10,
            actualBoundingBoxAscent: 10,
            actualBoundingBoxDescent: 0.2,
        } as TextMetrics);
        cache.draw(ctx, () => ctx.fillText('tail', 2.5, 20.5), { left: 0, top: 56, right: 100, bottom: 100 });

        const surface = image.mock.calls[0][0] as HTMLCanvasElement;
        const paint = surface.getContext('2d')!;
        expect([surface.width, surface.height]).toEqual([600, 400]);
        expect(paint.fillText).toHaveBeenCalledWith('tail', 2.5, 20.5);
        expect(paint.getTransform()).toMatchObject({ a: 2, d: 2, e: 10, f: 14 });
        expect(native.getTransform()).toMatchObject({ a: 2, d: 2, e: 10, f: 14 });
    });

    it('reuses one clipped-text repair surface and releases it when the cache is cleared', () => {
        const image = vi.spyOn(native, 'drawImage');
        vi.spyOn(native, 'measureText').mockReturnValue({
            actualBoundingBoxLeft: 0,
            actualBoundingBoxRight: 10,
            actualBoundingBoxAscent: 10,
            actualBoundingBoxDescent: 0.2,
        } as TextMetrics);
        const repair = () => cache.draw(ctx, () => ctx.fillText('tail', 2.5, 20.5), {
            left: 0,
            top: 21,
            right: 100,
            bottom: 40,
        });
        repair();
        ctx.fillStyle = '#be123c';
        repair();
        const first = image.mock.calls[0][0] as HTMLCanvasElement;
        expect(image.mock.calls[1][0]).toBe(first);
        cache.clear();
        expect([first.width, first.height]).toEqual([0, 0]);
        repair();
        const afterClear = image.mock.calls[2][0] as HTMLCanvasElement;
        expect(afterClear).not.toBe(first);
        cache.dispose();
        expect([afterClear.width, afterClear.height]).toEqual([0, 0]);
    });

    it('resizes the clipped-text surface with its native viewport', () => {
        const image = vi.spyOn(native, 'drawImage');
        vi.spyOn(native, 'measureText').mockReturnValue({
            actualBoundingBoxLeft: 0,
            actualBoundingBoxRight: 10,
            actualBoundingBoxAscent: 10,
            actualBoundingBoxDescent: 0.2,
        } as TextMetrics);
        for (const [width, height] of [[600, 400], [200, 100]]) {
            native.canvas.width = width;
            native.canvas.height = height;
            cache.draw(ctx, () => ctx.fillText('tail', 2.5, 20.5), {
                left: 0,
                top: 21,
                right: 100,
                bottom: 40,
            });
            const surface = image.mock.calls[image.mock.calls.length - 1][0] as HTMLCanvasElement;
            expect([surface.width, surface.height]).toEqual([width, height]);
            expect(surface).toBe(image.mock.calls[0][0]);
        }
    });

    it('restores native state if clipped-text repair submission fails', () => {
        native.save();
        ctx.setTransform(2, 0, 0, 2, 10, 14);
        ctx.globalAlpha = 0.6;
        ctx.imageSmoothingEnabled = true;
        vi.spyOn(native, 'measureText').mockReturnValue({
            actualBoundingBoxLeft: 0,
            actualBoundingBoxRight: 10,
            actualBoundingBoxAscent: 10,
            actualBoundingBoxDescent: 0.2,
        } as TextMetrics);
        vi.spyOn(native, 'drawImage').mockImplementation(() => {
            throw new Error('Clipped text submission failed');
        });
        expect(() => cache.draw(ctx, () => ctx.fillText('tail', 2.5, 20.5), {
            left: 0,
            top: 56,
            right: 100,
            bottom: 100,
        })).toThrow('Clipped text submission failed');
        expect(ctx._context).toBe(native);
        expect(native.getTransform()).toMatchObject({ a: 2, d: 2, e: 10, f: 14 });
        expect(native.globalAlpha).toBe(0.6);
        expect(native.imageSmoothingEnabled).toBe(true);
        native.restore();
        expect(native.getTransform()).toMatchObject({ a: 1, d: 1, e: 0, f: 0 });
    });

    it('keeps text decorations native and releases the damage bound after exceptions', () => {
        const stroke = vi.spyOn(native, 'stroke');
        const image = vi.spyOn(native, 'drawImage');
        expect(() => cache.draw(ctx, () => {
            ctx.beginPath();
            ctx.moveTo(10, 20);
            ctx.lineTo(64, 20);
            ctx.stroke();
            throw new Error('failed repair');
        }, { left: 0, top: 21, right: 100, bottom: 40 })).toThrow('failed repair');
        expect(stroke).toHaveBeenCalledOnce();
        expect(image).not.toHaveBeenCalled();

        line();
        expect(stroke).toHaveBeenCalledOnce();
        expect(image).toHaveBeenCalledOnce();
        expect(ctx._context).toBe(native);
    });

    it.each([1e-8, -1e-8, 1e-4])('distinguishes Float32 stroke drift from intentional fractional edges: %s', (drift) => {
        const scale = 1.340000033378601;
        ctx.setTransform(scale, 0, 0, scale, 0.5, 0.5 + drift);
        ctx.lineWidth = 0.999999989146616 / scale;
        const image = vi.spyOn(native, 'drawImage');
        cache.draw(ctx, () => {
            ctx.beginPath();
            ctx.moveTo(10 / scale, 20 / scale);
            ctx.lineTo(64 / scale, 20 / scale);
            ctx.stroke();
        });
        const paint = (image.mock.calls[0][0] as HTMLCanvasElement).getContext('2d')!;
        if (Math.abs(drift) < 1e-6) {
            expect(paint.fillRect).toHaveBeenCalledWith(expect.any(Number), 3, expect.any(Number), 1);
            expect(paint.stroke).not.toHaveBeenCalled();
        } else {
            expect(paint.fillRect).not.toHaveBeenCalled();
            expect(paint.stroke).toHaveBeenCalledOnce();
        }
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

    it('retains a mixed-border working set beyond the default entry limit', () => {
        cache.dispose();
        cache = Reflect.get(injector.get(Border), '_strokeCache') as RenderPrimitiveCache;
        const image = vi.spyOn(native, 'drawImage');
        const paint = () => cache.draw(ctx, () => {
            ctx.beginPath();
            ctx.moveTo(0.5, 0.5);
            ctx.lineTo(4.5, 0.5);
            ctx.stroke();
        });
        for (let i = 0; i < 512; i++) {
            ctx.strokeStyle = `#${i.toString(16).padStart(6, '0')}`;
            paint();
        }
        const first = image.mock.calls[0][0] as HTMLCanvasElement;
        ctx.strokeStyle = '#000000';
        paint();
        expect(image.mock.calls[512][0]).toBe(first);
        expect(first.width).toBeGreaterThan(0);

        ctx.strokeStyle = '#abcdef';
        paint();
        expect(first.width).toBe(0);
        cache.dispose();
        expect(image.mock.calls.every(([bitmap]) => (bitmap as HTMLCanvasElement).width === 0)).toBe(true);
    });

    it('keeps the original pixel budget and releases rasters with a larger entry allowance', () => {
        cache.dispose();
        cache = Reflect.get(injector.get(Border), '_strokeCache') as RenderPrimitiveCache;
        const image = vi.spyOn(native, 'drawImage');
        const paint = () => cache.draw(ctx, () => {
            ctx.beginPath();
            ctx.moveTo(0.5, 0.5);
            ctx.lineTo(10_000.5, 0.5);
            ctx.stroke();
        });
        for (let i = 0; i < 10; i++) {
            ctx.strokeStyle = `#${i.toString(16).padStart(6, '0')}`;
            paint();
        }
        const bitmaps = image.mock.calls.map(([bitmap]) => bitmap as HTMLCanvasElement);
        expect(bitmaps[0].width).toBe(0);
        expect(bitmaps[bitmaps.length - 1].width).toBeGreaterThan(0);
        expect(bitmaps.reduce((pixels, bitmap) => pixels + bitmap.width * bitmap.height, 0)).toBeLessThanOrEqual(512 * 1024);
        cache.clear();
        expect(bitmaps.every((bitmap) => bitmap.width === 0 && bitmap.height === 0)).toBe(true);
        paint();
        const afterClear = image.mock.calls[image.mock.calls.length - 1][0] as HTMLCanvasElement;
        expect(afterClear.width).toBeGreaterThan(0);
        cache.dispose();
        cache.dispose();
        expect(afterClear.width).toBe(0);
        expect(afterClear.height).toBe(0);
        expect(ctx._context).toBe(native);
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

    it('preserves the native text transform when matrix readback loses precision', () => {
        const implementation = vi.mocked(native.getTransform).getMockImplementation()!;
        const getTransform = implementation.bind(native);
        const image = vi.spyOn(native, 'drawImage');
        native.setTransform(1.1, 0, 0, 1.1, 10.123456789, 20.987654321);
        const before = getTransform();
        // Native Canvas matrix readback can round values retained by its save stack.
        const readback = vi.spyOn(native, 'getTransform').mockImplementation(() => {
            const matrix = getTransform();
            return {
                a: Math.fround(matrix.a),
                b: matrix.b,
                c: matrix.c,
                d: Math.fround(matrix.d),
                e: Math.fround(matrix.e),
                f: Math.fround(matrix.f),
            } as DOMMatrix;
        });

        try {
            for (let index = 0; index < 2; index++) {
                text();
                expect(getTransform()).toEqual(before);
            }
            expect(image).toHaveBeenCalledTimes(2);
        } finally {
            readback.mockImplementation(implementation);
        }
    });

    it.each([[-40, 20], [340, 20], [20, -40], [20, 190]])('skips glyph rasters outside the physical canvas at %s, %s', (x, y) => {
        const image = vi.spyOn(native, 'drawImage');
        const fill = vi.spyOn(native, 'fillText');
        vi.spyOn(native, 'measureText').mockReturnValue({
            actualBoundingBoxLeft: 0,
            actualBoundingBoxRight: 10,
            actualBoundingBoxAscent: 10,
            actualBoundingBoxDescent: 2,
        } as TextMetrics);
        cache.draw(ctx, () => ctx.fillText('outside', x, y));
        expect(image).not.toHaveBeenCalled();
        expect(fill).not.toHaveBeenCalled();
    });

    it('skips cached glyphs outside the physical damage bound without changing raster coordinates', () => {
        const image = vi.spyOn(native, 'drawImage');
        vi.spyOn(native, 'measureText').mockReturnValue({
            actualBoundingBoxLeft: 0,
            actualBoundingBoxRight: 10,
            actualBoundingBoxAscent: 10,
            actualBoundingBoxDescent: 2,
        } as TextMetrics);
        const draw = () => ctx.fillText('visible', 20, 30);
        cache.draw(ctx, draw);
        const bitmap = image.mock.calls[0][0] as HTMLCanvasElement;
        const size = [bitmap.width, bitmap.height];
        const destination = image.mock.calls[0].slice(1);
        ctx.setTransform(2, 0, 0, 2, 10, 14);
        cache.draw(ctx, draw, undefined, { left: 100, top: 0, right: 200, bottom: 150 });
        expect(image).toHaveBeenCalledOnce();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        cache.draw(ctx, draw, undefined, { left: 0, top: 0, right: 100, bottom: 150 });
        expect(image).toHaveBeenCalledTimes(2);
        expect(image.mock.calls[1].slice(3, 5)).toEqual(size);
        expect(image.mock.calls[1].slice(5, 7)).toEqual(destination);
    });

    it('retains overhanging ink and the two physical pixel antialiasing halo', () => {
        const image = vi.spyOn(native, 'drawImage');
        vi.spyOn(native, 'measureText').mockReturnValue({
            actualBoundingBoxLeft: 8,
            actualBoundingBoxRight: 10,
            actualBoundingBoxAscent: 10,
            actualBoundingBoxDescent: 2,
        } as TextMetrics);
        cache.draw(ctx, () => ctx.fillText('overhang', 107, 30), undefined, { left: 0, top: 0, right: 100, bottom: 100 });
        cache.draw(ctx, () => ctx.fillText('halo', 110, 30), undefined, { left: 0, top: 0, right: 100, bottom: 100 });
        expect(image).toHaveBeenCalledTimes(2);
    });

    it('restores the outer glyph damage bound after nested drawing fails', () => {
        const image = vi.spyOn(native, 'drawImage');
        vi.spyOn(native, 'measureText').mockReturnValue({
            actualBoundingBoxLeft: 0,
            actualBoundingBoxRight: 10,
            actualBoundingBoxAscent: 10,
            actualBoundingBoxDescent: 2,
        } as TextMetrics);
        cache.draw(ctx, () => {
            expect(() => cache.draw(ctx, () => {
                throw new Error('inner draw');
            }, undefined, {
                left: 100,
                top: 0,
                right: 200,
                bottom: 150,
            })).toThrow('inner draw');
            ctx.fillText('outer', 20, 30);
        }, undefined, { left: 0, top: 0, right: 100, bottom: 150 });
        expect(image).toHaveBeenCalledOnce();
        expect(ctx._context).toBe(native);
    });

    it('retains a visible rich-text glyph working set beyond 128 entries within the original pixel budget', () => {
        cache.dispose();
        cache = injector.get(IFontPrimitiveCache);
        const image = vi.spyOn(native, 'drawImage');
        for (let i = 0; i < 512; i++) {
            cache.draw(ctx, () => ctx.fillText(`glyph-${i}`, 10, 20));
        }
        cache.draw(ctx, () => ctx.fillText('glyph-0', 10, 20));
        cache.draw(ctx, () => ctx.fillText('glyph-0', 10, 20));
        expect(image.mock.calls[513]).toEqual(image.mock.calls[512]);
        expect((image.mock.calls[512][0] as HTMLCanvasElement).width).toBeGreaterThan(0);
        const bitmaps = new Set(image.mock.calls.map(([bitmap]) => bitmap as HTMLCanvasElement));
        expect([...bitmaps].reduce((pixels, bitmap) => pixels + bitmap.width * bitmap.height, 0)).toBeLessThanOrEqual(512 * 1024);
        cache.dispose();
        expect([...bitmaps].every((bitmap) => bitmap.width === 0 && bitmap.height === 0)).toBe(true);
    });

    it('evicts large font rasters within the original pixel budget and releases them on clear', () => {
        cache.dispose();
        cache = injector.get(IFontPrimitiveCache);
        const image = vi.spyOn(native, 'drawImage');
        vi.spyOn(native, 'measureText').mockReturnValue({
            actualBoundingBoxLeft: 0,
            actualBoundingBoxRight: 10_000,
            actualBoundingBoxAscent: 6,
            actualBoundingBoxDescent: 0,
        } as TextMetrics);
        for (let i = 0; i < 20; i++) {
            cache.draw(ctx, () => ctx.fillText(`wide-glyph-${i}`, 10, 20));
        }
        const bitmaps = image.mock.calls.map(([bitmap]) => bitmap as HTMLCanvasElement);
        expect(bitmaps[0].width).toBe(0);
        expect(bitmaps[bitmaps.length - 1].width).toBeGreaterThan(0);
        expect(bitmaps.reduce((pixels, bitmap) => pixels + bitmap.width * bitmap.height, 0)).toBeLessThanOrEqual(512 * 1024);
        cache.clear();
        expect(bitmaps.every((bitmap) => bitmap.width === 0 && bitmap.height === 0)).toBe(true);
    });

    it('retains thousands of glyphs in bounded shared storage without rerasterizing the first glyph', () => {
        cache.dispose();
        cache = injector.get(IFontPrimitiveCache);
        const image = vi.spyOn(native, 'drawImage');
        for (let i = 0; i < 2400; i++) {
            cache.draw(ctx, () => ctx.fillText(`glyph-${i}`, 10, 20));
        }
        cache.draw(ctx, () => ctx.fillText('glyph-0', 10, 20));
        expect(image.mock.calls[2400]).toHaveLength(9);
        cache.draw(ctx, () => ctx.fillText('glyph-0', 10, 20));
        expect(image.mock.calls[2401]).toEqual(image.mock.calls[2400]);
        const bitmaps = Reflect.get(cache, '_bitmaps') as Map<string, { canvas: HTMLCanvasElement }>;
        const pages = Reflect.get(cache, '_textPages') as Set<{ canvas: HTMLCanvasElement }>;
        const pool = Reflect.get(cache, '_textRasterPool') as HTMLCanvasElement[];
        const surfaces = new Set([...Array.from(bitmaps.values(), (bitmap) => bitmap.canvas), ...Array.from(pages, (page) => page.canvas), ...pool]);
        expect([...surfaces].reduce((pixels, canvas) => pixels + canvas.width * canvas.height, 0)).toBeLessThanOrEqual(512 * 1024);
        expect(surfaces.size).toBeLessThan(128);
        cache.clear();
        expect([...surfaces].every((canvas) => canvas.width === 0 && canvas.height === 0)).toBe(true);
    });

    it('keeps standalone decoration surfaces bounded when shared text has a larger entry allowance', () => {
        cache.dispose();
        cache = injector.get(IFontPrimitiveCache);
        const image = vi.spyOn(native, 'drawImage');
        for (let i = 0; i < 1100; i++) {
            ctx.strokeStyle = `#${i.toString(16).padStart(6, '0')}`;
            cache.draw(ctx, () => {
                ctx.beginPath();
                ctx.moveTo(0.5, 0.5);
                ctx.lineTo(1.5, 0.5);
                ctx.stroke();
            });
        }
        const surfaces = image.mock.calls.map(([canvas]) => canvas as HTMLCanvasElement);
        expect(surfaces[0].width).toBe(0);
        expect(surfaces[surfaces.length - 1].width).toBeGreaterThan(0);
        expect(surfaces.filter((canvas) => canvas.width > 0)).toHaveLength(1024);
        expect(surfaces.reduce((pixels, canvas) => pixels + canvas.width * canvas.height, 0)).toBeLessThanOrEqual(512 * 1024);
    });

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
        const rasterStates: Array<{ color: string | CanvasGradient | CanvasPattern; font: string }> = [];
        const image = vi.spyOn(native, 'drawImage').mockImplementation((source: CanvasImageSource, ...args: number[]) => {
            if (args.length === 2) {
                const paint = (source as HTMLCanvasElement).getContext('2d')!;
                rasterStates.push({ color: paint.fillStyle, font: paint.font });
            }
        });
        ctx.setTransform(1, 0, 0, 1, 200, 0);
        text();
        ctx.setTransform(1, 0, 0, 1, 38, 100);
        text();
        ctx.fillStyle = '#be123c';
        text();
        ctx.font = 'bold 16px Arial';
        text();
        expect(fill).not.toHaveBeenCalled();
        expect(image).toHaveBeenCalledTimes(4);
        expect(image.mock.calls[1].slice(3, 5)).toEqual(image.mock.calls[1].slice(7, 9));
        expect(rasterStates).toHaveLength(3);
        expect(rasterStates[0].color).not.toBe(rasterStates[1].color);
        expect(rasterStates[1].font).not.toBe(rasterStates[2].font);
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
        const languages: string[] = [];
        const image = vi.spyOn(native, 'drawImage').mockImplementation((source: CanvasImageSource, ...args: number[]) => {
            if (args.length === 2) {
                languages.push((source as HTMLCanvasElement).lang);
            }
        });
        text();
        container.lang = 'ja';
        text();
        text();
        expect(image).toHaveBeenCalledTimes(3);
        expect(languages).toEqual(['zh-CN', 'ja']);
    });

    it('keeps shared text pages unchanged until the outer draw finishes, including a failed nested draw', () => {
        const image = vi.spyOn(native, 'drawImage');
        cache.draw(ctx, () => {
            ctx.fillText('first', 10, 20);
            ctx.fillText('second', 10, 20);
        });
        cache.draw(ctx, () => {
            ctx.fillText('first', 10, 20);
            ctx.fillText('second', 10, 20);
        });
        const first = image.mock.calls[2];
        const second = image.mock.calls[3];
        expect(first[0]).toBe(second[0]);
        expect(first.slice(1, 3)).not.toEqual(second.slice(1, 3));
        const page = (first[0] as HTMLCanvasElement).getContext('2d')!;
        const upload = vi.spyOn(page, 'drawImage');
        const before = upload.mock.calls.length;
        cache.draw(ctx, () => {
            ctx.fillText('first', 10, 20);
            expect(() => cache.draw(ctx, () => {
                ctx.fillText('third', 10, 20);
                throw new Error('nested draw');
            })).toThrow('nested draw');
            expect(upload).toHaveBeenCalledTimes(before);
            ctx.fillText('second', 10, 20);
        });
        expect(upload).toHaveBeenCalledTimes(before + 1);
        expect(ctx._context).toBe(native);
    });

    it('reuses evicted text slots without changing surviving glyph locations', () => {
        cache.dispose();
        const child = injector.createChild([[RenderPrimitiveCache, {
            useFactory: (container: Injector) => container.createInstance(RenderPrimitiveCache, 2),
            deps: [Injector],
        }]]);
        try {
            cache = child.get(RenderPrimitiveCache);
            const image = vi.spyOn(native, 'drawImage');
            const draw = (value: string) => cache.draw(ctx, () => ctx.fillText(value, 10, 20));
            draw('first');
            draw('second');
            draw('second');
            const survivor = image.mock.calls[2];
            draw('third');
            draw('second');
            expect(image.mock.calls[4]).toEqual(survivor);
            draw('first');
            const raster = image.mock.calls[5][0] as HTMLCanvasElement;
            expect(raster.getContext('2d')!.fillText).toHaveBeenLastCalledWith('first', 0, 0);
            expect(image.mock.calls[5]).toHaveLength(3);
        } finally {
            child.dispose();
        }
    });

    it('retains a warm glyph when the canvas budget only permits its original raster', () => {
        const child = injector.createChild([[RenderPrimitiveCache, {
            useFactory: (container: Injector) => container.createInstance(RenderPrimitiveCache, 1),
            deps: [Injector],
        }]]);
        try {
            const single = child.get(RenderPrimitiveCache);
            const image = vi.spyOn(native, 'drawImage');
            const draw = () => single.draw(ctx, () => ctx.fillText('cached', 10, 20));
            draw();
            const raster = image.mock.calls[0][0] as HTMLCanvasElement;
            expect(raster.width).toBeGreaterThan(0);
            draw();
            expect(image.mock.calls[1]).toEqual(image.mock.calls[0]);
            expect(raster.getContext('2d')!.fillText).toHaveBeenCalledOnce();
            expect(ctx._context).toBe(native);
            single.dispose();
            expect([raster.width, raster.height]).toEqual([0, 0]);
        } finally {
            child.dispose();
        }
    });

    it('retains the original glyph when the native platform cannot upload a shared page', () => {
        const original = vi.mocked(HTMLCanvasElement.prototype.getContext).getMockImplementation()!;
        const pages: HTMLCanvasElement[] = [];
        const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            const context = original.call(this, '2d') as CanvasRenderingContext2D;
            if (this.width === 256 && this.height === 64) {
                pages.push(this);
                vi.spyOn(context, 'drawImage').mockImplementation(() => {
                    throw new Error('Native page upload failed');
                });
            }
            return context;
        });
        try {
            const image = vi.spyOn(native, 'drawImage');
            text();
            const raster = image.mock.calls[0][0] as HTMLCanvasElement;
            text();
            expect(pages.length).toBeGreaterThan(0);
            expect(pages.every((page) => page.width === 0 && page.height === 0)).toBe(true);
            expect(image.mock.calls[1]).toEqual(image.mock.calls[0]);
            expect(raster.getContext('2d')!.fillText).toHaveBeenCalledOnce();
            expect(ctx._context).toBe(native);
            cache.clear();
            expect([raster.width, raster.height]).toEqual([0, 0]);
        } finally {
            getContext.mockImplementation(original);
        }
    });

    it('releases shared and temporary text surfaces and keeps disposal terminal', () => {
        const create = vi.spyOn(document, 'createElement');
        const image = vi.spyOn(native, 'drawImage');
        text();
        text();
        const surfaces = create.mock.results.map((result) => result.value as HTMLCanvasElement);
        expect(surfaces.some((canvas) => canvas.width > 0)).toBe(true);
        cache.dispose();
        expect(surfaces.every((canvas) => canvas.width === 0 && canvas.height === 0)).toBe(true);
        const allocated = create.mock.calls.length;
        const submitted = image.mock.calls.length;
        const fill = vi.spyOn(native, 'fillText');
        text();
        expect(fill).toHaveBeenCalledWith('Merged title', 10, 20);
        expect(create).toHaveBeenCalledTimes(allocated);
        expect(image).toHaveBeenCalledTimes(submitted);
    });

    it.each(['context', 'paint'])('releases a temporary text raster when native %s creation fails', (failure) => {
        const original = vi.mocked(HTMLCanvasElement.prototype.getContext).getMockImplementation()!;
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementationOnce(function (this: HTMLCanvasElement) {
            if (failure === 'context') {
                throw new Error('Native context failed');
            }
            const context = original.call(this, '2d') as CanvasRenderingContext2D;
            vi.spyOn(context, 'fillText').mockImplementationOnce(() => {
                throw new Error('Native paint failed');
            });
            return context;
        });
        expect(text).toThrow(failure === 'context' ? 'Native context failed' : 'Native paint failed');
        expect(ctx._context).toBe(native);
        expect(Reflect.get(cache, '_pixels')).toBe(0);
        expect(Reflect.get(cache, '_canvasCount')).toBe(0);
        const image = vi.spyOn(native, 'drawImage');
        text();
        text();
        expect(image.mock.calls[1]).toHaveLength(9);
    });

    it.each(['null', 'throw'])('retains the original text raster if shared page creation returns %s', (failure) => {
        const original = vi.mocked(HTMLCanvasElement.prototype.getContext).getMockImplementation()!;
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
            .mockImplementationOnce(function (this: HTMLCanvasElement) {
                return original.call(this, '2d');
            })
            .mockImplementationOnce(() => {
                if (failure === 'throw') {
                    throw new Error('No shared context');
                }
                return null;
            });
        const image = vi.spyOn(native, 'drawImage');
        text();
        text();
        const first = image.mock.calls[0][0] as HTMLCanvasElement;
        expect(image.mock.calls[1][0]).toBe(first);
        expect(first.getContext('2d')!.fillText).toHaveBeenCalledOnce();
        expect(Reflect.get(cache, '_pixels')).toBe(first.width * first.height);
        cache.clear();
        expect([first.width, first.height]).toEqual([0, 0]);
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
