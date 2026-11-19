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

import { Injector, ThemeService } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UniverPrintingContext, UniverRenderingContext2D } from '../context';
import { CanvasColorService, ICanvasColorService } from '../services/canvas-color.service';

let injector: Injector;

function createNativeContext() {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 100;

    const ctx = {
        canvas,
        globalAlpha: 1,
        globalCompositeOperation: 'source-over',
        fillStyle: '#000000',
        strokeStyle: '#000000',
        filter: 'none',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'low',
        lineCap: 'butt',
        lineDashOffset: 0,
        lineJoin: 'miter',
        lineWidth: 1,
        miterLimit: 10,
        shadowBlur: 0,
        shadowColor: '#000000',
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        direction: 'inherit',
        font: '10px serif',
        fontKerning: 'auto',
        fontStretch: 'condensed',
        fontVariantCaps: 'small-caps',
        lang: 'inherit',
        letterSpacing: '1px',
        textRendering: 'optimizeLegibility',
        wordSpacing: '2px',
        textAlign: 'start',
        textBaseline: 'alphabetic',
        getTransform: vi.fn(() => ({ a: 2, b: 0, c: 0, d: 4, e: 1, f: 1 })),
        getContextAttributes: vi.fn(() => ({})),
        isContextLost: vi.fn(() => false),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        arc: vi.fn(),
        arcTo: vi.fn(),
        bezierCurveTo: vi.fn(),
        clearRect: vi.fn(),
        clip: vi.fn(),
        createConicGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        createImageData: vi.fn((a: any, b?: any) => {
            if (typeof a === 'number') {
                return { data: new Uint8ClampedArray(4), width: a, height: b ?? a };
            }
            return { data: new Uint8ClampedArray(4), width: a.width, height: a.height };
        }),
        createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        createPattern: vi.fn(() => ({})),
        createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        drawFocusIfNeeded: vi.fn(),
        drawImage: vi.fn(),
        ellipse: vi.fn(),
        fill: vi.fn(),
        fillRect: vi.fn(),
        fillText: vi.fn(),
        getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })),
        isPointInPath: vi.fn(() => false),
        isPointInStroke: vi.fn(() => false),
        lineTo: vi.fn(),
        measureText: vi.fn(() => ({ width: 42 })),
        moveTo: vi.fn(),
        putImageData: vi.fn(),
        quadraticCurveTo: vi.fn(),
        rect: vi.fn(),
        resetTransform: vi.fn(),
        reset: vi.fn(),
        rotate: vi.fn(),
        roundRect: vi.fn(),
        scale: vi.fn(),
        setLineDash: vi.fn(),
        getLineDash: vi.fn(() => [1, 2]),
        setTransform: vi.fn(),
        stroke: vi.fn(),
        strokeRect: vi.fn(),
        strokeText: vi.fn(),
        transform: vi.fn(),
        translate: vi.fn(),
    };

    return ctx as any as CanvasRenderingContext2D;
}

describe('canvas context', () => {
    beforeEach(() => {
        injector = new Injector([[ThemeService], [ICanvasColorService, { useClass: CanvasColorService }]]);
    });

    afterEach(() => injector.dispose());

    afterEach(() => vi.restoreAllMocks());

    it('reuses scale during a drawing scope without sharing mutable public transform snapshots', () => {
        const native = createNativeContext();
        const ctx = injector.createChild([[UniverRenderingContext2D, { useFactory: function createTestInstance() {
            return injector.createInstance(UniverRenderingContext2D, native);
        } }]]).get(UniverRenderingContext2D);
        ctx.withCachedScale(() => {
            expect(ctx.getScale()).toEqual({ scaleX: 2, scaleY: 4 });
            ctx.moveToByPrecision(1.2, 2.3);
            ctx.lineToByPrecision(3.4, 4.5);
            expect(native.getTransform).toHaveBeenCalledTimes(1);
            const snapshot = ctx.getTransform();
            snapshot.a = 99;
            expect(ctx.getTransform().a).toBe(2);
            expect(ctx.getScale()).toEqual({ scaleX: 2, scaleY: 4 });
        });
        expect(native.moveTo).toHaveBeenCalledWith(1, 2.25);
        expect(native.lineTo).toHaveBeenCalledWith(3.5, 4.5);
        vi.mocked(native.getTransform).mockReturnValue({ a: 3, b: 4, c: 0, d: 6 } as DOMMatrix);
        expect(ctx.getScale()).toEqual({ scaleX: 5, scaleY: 6 });
    });

    it.each([
        (ctx: UniverRenderingContext2D) => ctx.restore(),
        (ctx: UniverRenderingContext2D) => ctx.reset(),
        (ctx: UniverRenderingContext2D) => ctx.resetTransform(),
        (ctx: UniverRenderingContext2D) => ctx.rotate(0.3),
        (ctx: UniverRenderingContext2D) => ctx.scale(2, 3),
        (ctx: UniverRenderingContext2D) => ctx.setTransform(1, 0, 0, 1, 2, 3),
        (ctx: UniverRenderingContext2D) => ctx.transform(1, 0, 0, 1, 2, 3),
        (ctx: UniverRenderingContext2D) => ctx.translate(2, 3),
        (ctx: UniverRenderingContext2D) => ctx.translateWithPrecision(2, 3),
        (ctx: UniverRenderingContext2D) => ctx.translateWithPrecisionRatio(2, 3),
    ])('refreshes scoped scale after a context transformation (%#)', (transform) => {
        const native = createNativeContext();
        const ctx = injector.createChild([[UniverRenderingContext2D, { useFactory: function createTestInstance() {
            return injector.createInstance(UniverRenderingContext2D, native);
        } }]]).get(UniverRenderingContext2D);
        ctx.withCachedScale(() => {
            expect(ctx.getScale()).toEqual({ scaleX: 2, scaleY: 4 });
            vi.mocked(native.getTransform).mockReturnValue({ a: 0, b: 3, c: 5, d: 0 } as DOMMatrix);
            transform(ctx);
            expect(ctx.getScale()).toEqual({ scaleX: 3, scaleY: 5 });
        });
    });

    it('clears nested and failed drawing scopes and leaves ordinary scale reads live', () => {
        const native = createNativeContext();
        const ctx = injector.createChild([[UniverRenderingContext2D, { useFactory: function createTestInstance() {
            return injector.createInstance(UniverRenderingContext2D, native);
        } }]]).get(UniverRenderingContext2D);
        ctx.withCachedScale(() => {
            expect(ctx.getScale().scaleX).toBe(2);
            expect(() => ctx.withCachedScale(() => {
                expect(ctx.getScale().scaleX).toBe(2);
                throw new Error('draw failed');
            })).toThrow('draw failed');
            vi.mocked(native.getTransform).mockReturnValue({ a: 7, b: 0, c: 0, d: 8 } as DOMMatrix);
            expect(ctx.getScale()).toEqual({ scaleX: 7, scaleY: 8 });
            ctx.getScale();
            expect(native.getTransform).toHaveBeenCalledTimes(3);
        });
        ctx.getScale();
        ctx.getScale();
        expect(native.getTransform).toHaveBeenCalledTimes(5);
        expect(() => ctx.withCachedScale(() => {
            ctx.getScale();
            throw new Error('outer draw failed');
        })).toThrow('outer draw failed');
        vi.mocked(native.getTransform).mockReturnValue({ a: 9, b: 0, c: 0, d: 10 } as DOMMatrix);
        expect(ctx.getScale()).toEqual({ scaleX: 9, scaleY: 10 });
    });

    it('forwards style and basic drawing calls', () => {
        const nativeCtx = createNativeContext();
        const renderCtx = injector.createChild([[UniverRenderingContext2D, { useFactory: function createTestInstance() {
            return injector.createInstance(UniverRenderingContext2D, nativeCtx, {
                canvasColorService: injector.get(ICanvasColorService),
            });
        } }]]).get(UniverRenderingContext2D);

        renderCtx.setId('ctx-id');
        expect(renderCtx.getId()).toBe('ctx-id');
        expect(renderCtx.isContextLost()).toBe(false);

        renderCtx.fillStyle = 'primary.500';
        renderCtx.strokeStyle = 'gray.700';
        const theme = injector.get(ThemeService).getCurrentTheme();
        expect(nativeCtx.fillStyle).toBe(theme.primary[500]);
        expect(nativeCtx.strokeStyle).toBe(theme.gray[700]);

        renderCtx.globalAlpha = 0.7;
        renderCtx.globalCompositeOperation = 'multiply';
        renderCtx.lineCap = 'round';
        renderCtx.lineJoin = 'bevel';
        renderCtx.lineDashOffset = 3;
        renderCtx.lineWidth = 2;
        renderCtx.miterLimit = 5;
        renderCtx.shadowBlur = 4;
        renderCtx.shadowColor = '#333';
        renderCtx.shadowOffsetX = 6;
        renderCtx.shadowOffsetY = 8;
        renderCtx.direction = 'ltr';
        renderCtx.font = '12px Arial';
        renderCtx.fontKerning = 'none';
        renderCtx.textAlign = 'center';
        renderCtx.textBaseline = 'middle';
        renderCtx.filter = 'blur(1px)';
        renderCtx.imageSmoothingEnabled = false;
        renderCtx.imageSmoothingQuality = 'high';
        renderCtx.setLineWidthByPrecision(12);

        expect(nativeCtx.globalAlpha).toBe(0.7);
        expect(nativeCtx.globalCompositeOperation).toBe('multiply');
        expect(nativeCtx.lineWidth).toBe(3);

        renderCtx.beginPath();
        renderCtx.closePath();
        renderCtx.arc(1, 2, -10, 0, Math.PI);
        renderCtx.arcTo(1, 2, 3, 4, 5);
        renderCtx.bezierCurveTo(1, 2, 3, 4, 5, 6);
        renderCtx.clearRect(1, 2, 3, 4);
        renderCtx.clip();
        renderCtx.ellipse(1, 2, 3, 4, 0, 0, Math.PI);
        renderCtx.fill();
        renderCtx.fillRect(1, 2, 3, 4);
        renderCtx.fillText('hello', 3, 4);
        renderCtx.getImageData(0, 0, 1, 1);
        renderCtx.isPointInPath(1, 1);
        renderCtx.isPointInStroke(1, 1);
        renderCtx.lineTo(1, 2);
        renderCtx.moveTo(1, 2);
        renderCtx.putImageData({} as ImageData, 1, 2);
        renderCtx.quadraticCurveTo(1, 2, 3, 4);
        renderCtx.rect(1, 2, 3, 4);
        renderCtx.rotate(0.2);
        renderCtx.save();
        renderCtx.scale(2, 3);
        renderCtx.setLineDash([2, 2]);
        renderCtx.stroke();
        renderCtx.strokeRect(1, 2, 3, 4);
        renderCtx.strokeText('text', 1, 2);
        renderCtx.transform(1, 0, 0, 1, 1, 2);
        renderCtx.translate(3, 4);
        renderCtx.restore();
        renderCtx.drawFocusIfNeeded(document.body);

        expect(nativeCtx.beginPath).toHaveBeenCalled();
        expect(nativeCtx.strokeText).toHaveBeenCalled();
        expect(renderCtx.getLineDash()).toEqual([1, 2]);
        expect(renderCtx.getContextAttributes()).toEqual({});
    });

    it('covers precision, drawImage, createImageData and env branches', () => {
        const nativeCtx = createNativeContext();
        const renderCtx = injector.createChild([[UniverRenderingContext2D, { useFactory: function createTestInstance() {
            return injector.createInstance(UniverRenderingContext2D, nativeCtx);
        } }]]).get(UniverRenderingContext2D);

        renderCtx.roundRectByPrecision(1, 2, 3, 4, 2);
        renderCtx.arcByPrecision(1, 2, 5, 0, Math.PI);
        renderCtx.arcToByPrecision(1, 2, 3, 4, 5);
        renderCtx.bezierCurveToByPrecision(1, 2, 3, 4, 5, 6);
        renderCtx.clearRectByPrecision(1, 2, 3, 4);
        renderCtx.fillRectByPrecision(1, 2, 3, 4);
        renderCtx.strokeRectPrecision(1, 2, 3, 4);
        renderCtx.fillTextPrecision('abc', 1, 2, 40);
        renderCtx.lineToByPrecision(1, 2);
        renderCtx.moveToByPrecision(1, 2);
        renderCtx.moveToByPrecisionLog(1, 2);
        renderCtx.rectByPrecision(1, 2, 3, 4);
        renderCtx.strokeTextByPrecision('abc', 1, 2, 30);
        renderCtx.translateWithPrecision(1, 2);
        renderCtx.translateWithPrecisionRatio(10, 20);
        renderCtx.clearRectForTexture(1, 2, 3, 4);
        renderCtx.setGlobalCompositeOperation('source-over');

        const image = document.createElement('canvas');
        renderCtx.drawImage(image, 1, 2);
        renderCtx.drawImage(image, 1, 2, 3, 4);
        renderCtx.drawImage(image, 1, 2, 3, 4, 5, 6, 7, 8);

        expect(() => (renderCtx as any).createImageData()).toThrow('arguments is zero');
        expect((renderCtx as any).createImageData(3, 4)).toBeTruthy();
        expect((renderCtx as any).createImageData({ width: 2, height: 2 })).toBeTruthy();
        expect((renderCtx as any).createImageData(3, 4, { colorSpace: 'srgb' })).toBeTruthy();

        const userAgentSpy = vi.spyOn(navigator, 'userAgent', 'get')
            .mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36');
        vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');
        renderCtx.closePathByEnv();
        expect(nativeCtx.closePath).not.toHaveBeenCalled();
        userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X) Gecko/20100101 Firefox/130.0');
        injector.createChild([[UniverRenderingContext2D, { useFactory: function createTestInstance() {
            return injector.createInstance(UniverRenderingContext2D, nativeCtx);
        } }]]).get(UniverRenderingContext2D).closePathByEnv();
        expect(nativeCtx.closePath).toHaveBeenCalledTimes(1);
    });

    it('forwards text language in both directions', () => {
        const nativeCtx = createNativeContext();
        const renderCtx = injector.createChild([[UniverRenderingContext2D, { useFactory: function createTestInstance() {
            return injector.createInstance(UniverRenderingContext2D, nativeCtx);
        } }]]).get(UniverRenderingContext2D);

        nativeCtx.lang = 'ja';
        expect(renderCtx.lang).toBe('ja');

        renderCtx.lang = 'zh-CN';
        expect(nativeCtx.lang).toBe('zh-CN');
    });

    it('inherits text language when the native context has no language property', () => {
        const nativeCtx = createNativeContext();
        delete (nativeCtx as Partial<CanvasRenderingContext2D>).lang;
        const renderCtx = injector.createChild([[UniverRenderingContext2D, { useFactory: function createTestInstance() {
            return injector.createInstance(UniverRenderingContext2D, nativeCtx);
        } }]]).get(UniverRenderingContext2D);

        expect(renderCtx.lang).toBe('inherit');

        renderCtx.lang = 'zh-CN';
        expect(renderCtx.lang).toBe('zh-CN');
        expect(nativeCtx.lang).toBe('zh-CN');
    });

    it.each([
        { radius: 4, expectedRadius: 4 },
        { radius: 100, expectedRadius: 10 },
    ])('draws rounded corners with radius $radius without native roundRect on Chrome 88', ({ radius, expectedRadius }) => {
        const nativeCtx = createNativeContext();
        delete (nativeCtx as Partial<CanvasRenderingContext2D>).roundRect;
        const renderCtx = injector.createChild([[UniverRenderingContext2D, { useFactory: function createTestInstance() {
            return injector.createInstance(UniverRenderingContext2D, nativeCtx);
        } }]]).get(UniverRenderingContext2D);

        renderCtx.roundRect(10, 20, 40, 20, radius);

        expect(nativeCtx.moveTo).toHaveBeenCalledWith(10 + expectedRadius, 20);
        expect(vi.mocked(nativeCtx.quadraticCurveTo).mock.calls).toEqual([
            [50, 20, 50, 20 + expectedRadius],
            [50, 40, 50 - expectedRadius, 40],
            [10, 40, 10, 40 - expectedRadius],
            [10, 20, 10 + expectedRadius, 20],
        ]);
        expect(nativeCtx.closePath).toHaveBeenCalledTimes(1);
    });

    it.each([undefined, 0])('draws a rectangle with radius %s without native roundRect on Chrome 88', (radius) => {
        const nativeCtx = createNativeContext();
        delete (nativeCtx as Partial<CanvasRenderingContext2D>).roundRect;
        const renderCtx = injector.createChild([[UniverRenderingContext2D, { useFactory: function createTestInstance() {
            return injector.createInstance(UniverRenderingContext2D, nativeCtx);
        } }]]).get(UniverRenderingContext2D);

        renderCtx.roundRect(10, 20, 40, 20, radius);

        expect(nativeCtx.rect).toHaveBeenCalledWith(10, 20, 40, 20);
        expect(nativeCtx.quadraticCurveTo).not.toHaveBeenCalled();
    });

    it('forwards native rounded rectangles and line dashes', () => {
        const nativeCtx = createNativeContext();
        const renderCtx = injector.createChild([[UniverRenderingContext2D, { useFactory: function createTestInstance() {
            return injector.createInstance(UniverRenderingContext2D, nativeCtx);
        } }]]).get(UniverRenderingContext2D);
        const radii = [{ x: 4, y: 2 }, 8];

        renderCtx.roundRect(10, 20, 40, 20, radii);
        renderCtx.setLineDash([4, 1]);

        expect(nativeCtx.roundRect).toHaveBeenCalledWith(10, 20, 40, 20, radii);
        expect(nativeCtx.setLineDash).toHaveBeenCalledWith([4, 1]);
    });

    it('clears the printing context without changing its compositing mode', () => {
        const nativeCtx = createNativeContext();
        const printingCtx = injector.createChild([[UniverPrintingContext, { useFactory: function createTestInstance() {
            return injector.createInstance(UniverPrintingContext, nativeCtx);
        } }]]).get(UniverPrintingContext);
        printingCtx.clearRect(1, 2, 3, 4);
        printingCtx.clearRectForTexture(1, 2, 3, 4);
        printingCtx.setGlobalCompositeOperation('lighter');
        expect(printingCtx.__mode).toBe('printing');
        expect(nativeCtx.fillRect).toHaveBeenCalledTimes(1);
        expect(nativeCtx.clearRect).not.toHaveBeenCalled();
        expect(nativeCtx.save).toHaveBeenCalledTimes(1);
        expect(nativeCtx.restore).toHaveBeenCalledTimes(1);
        expect(nativeCtx.globalCompositeOperation).toBe('source-over');
    });

    it('reads proxied state and helper factories from the native context', () => {
        const nativeCtx = createNativeContext();
        const renderCtx = injector.createChild([[UniverRenderingContext2D, { useFactory: function createTestInstance() {
            return injector.createInstance(UniverRenderingContext2D, nativeCtx);
        } }]]).get(UniverRenderingContext2D);

        expect(renderCtx.globalAlpha).toBe(1);
        expect(renderCtx.globalCompositeOperation).toBe('source-over');
        expect(renderCtx.fillStyle).toBe('#000000');
        expect(renderCtx.strokeStyle).toBe('#000000');
        expect(renderCtx.filter).toBe('none');
        expect(renderCtx.imageSmoothingEnabled).toBe(true);
        expect(renderCtx.imageSmoothingQuality).toBe('low');
        expect(renderCtx.lineCap).toBe('butt');
        expect(renderCtx.lineDashOffset).toBe(0);
        expect(renderCtx.lineJoin).toBe('miter');
        expect(renderCtx.lineWidth).toBe(1);
        expect(renderCtx.miterLimit).toBe(10);
        expect(renderCtx.shadowBlur).toBe(0);
        expect(renderCtx.shadowColor).toBe('#000000');
        expect(renderCtx.shadowOffsetX).toBe(0);
        expect(renderCtx.shadowOffsetY).toBe(0);
        expect(renderCtx.direction).toBe('inherit');
        expect(renderCtx.font).toBe('10px serif');
        nativeCtx.font = '12px serif';
        expect(renderCtx.font).toBe('10px serif');
        renderCtx.font = '14px serif';
        expect(renderCtx.font).toBe('14px serif');
        expect(renderCtx.fontKerning).toBe('auto');
        expect(renderCtx.fontStretch).toBe('condensed');
        expect(renderCtx.fontVariantCaps).toBe('small-caps');
        expect(renderCtx.letterSpacing).toBe('1px');
        expect(renderCtx.textRendering).toBe('optimizeLegibility');
        expect(renderCtx.wordSpacing).toBe('2px');
        expect(renderCtx.textAlign).toBe('start');
        expect(renderCtx.textBaseline).toBe('alphabetic');

        renderCtx.fontStretch = 'expanded';
        renderCtx.fontVariantCaps = 'all-small-caps';
        renderCtx.letterSpacing = '3px';
        renderCtx.textRendering = 'geometricPrecision';
        renderCtx.wordSpacing = '4px';
        expect(nativeCtx.fontStretch).toBe('expanded');
        expect(nativeCtx.fontVariantCaps).toBe('all-small-caps');
        expect(nativeCtx.letterSpacing).toBe('3px');
        expect(nativeCtx.textRendering).toBe('geometricPrecision');
        expect(nativeCtx.wordSpacing).toBe('4px');

        expect(renderCtx.getScale()).toEqual({ scaleX: 2, scaleY: 4 });
        expect(renderCtx.createConicGradient(0, 1, 2)).toBeTruthy();
        expect(renderCtx.createLinearGradient(0, 0, 1, 1)).toBeTruthy();
        expect(renderCtx.createPattern(document.createElement('canvas'), 'repeat')).toBeTruthy();
        expect(renderCtx.createRadialGradient(0, 0, 1, 2, 2, 3)).toBeTruthy();
        expect(renderCtx.measureText('abc')).toEqual({ width: 42 });

        renderCtx.resetTransform();
        renderCtx.reset();
        renderCtx.fillText('with width', 1, 2, 3);
        renderCtx.fillTextPrecision('without width', 1, 2);
        renderCtx.stroke(new Path2D());
        expect(nativeCtx.resetTransform).toHaveBeenCalled();
        expect(nativeCtx.reset).toHaveBeenCalled();
        expect(nativeCtx.fillText).toHaveBeenCalledWith('with width', 1, 2, 3);
        expect(nativeCtx.stroke).toHaveBeenCalledWith(expect.any(Path2D));
    });
});
