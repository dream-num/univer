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

import { Tools } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { UniverPrintingContext, UniverRenderingContext2D } from '../context';

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

describe('context extra', () => {
    it('forwards style and basic drawing calls', () => {
        const nativeCtx = createNativeContext();
        const renderCtx = new UniverRenderingContext2D(nativeCtx, {
            canvasColorService: {
                getRenderColor: (color: string) => `render-${color}`,
            } as any,
        });

        renderCtx.setId('ctx-id');
        expect(renderCtx.getId()).toBe('ctx-id');
        expect(renderCtx.isContextLost()).toBe(false);

        renderCtx.fillStyle = '#111111';
        renderCtx.strokeStyle = '#222222';
        expect(nativeCtx.fillStyle).toBe('render-#111111');
        expect(nativeCtx.strokeStyle).toBe('render-#222222');

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
        const renderCtx = new UniverRenderingContext2D(nativeCtx);

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

        const browserSpy = vi.spyOn(Tools, 'getBrowserType').mockReturnValue('Chrome' as any);
        const systemSpy = vi.spyOn(Tools, 'getSystemType').mockReturnValue('Mac' as any);
        renderCtx.closePathByEnv();
        expect(nativeCtx.closePath).not.toHaveBeenCalled();
        browserSpy.mockReturnValue('Firefox' as any);
        (renderCtx as any)._browserType = '';
        renderCtx.closePathByEnv();
        expect(nativeCtx.closePath).toHaveBeenCalledTimes(1);
        systemSpy.mockRestore();
        browserSpy.mockRestore();
    });

    it('covers fallback line dash branches and printing context', () => {
        const nativeCtx = createNativeContext() as any;
        delete nativeCtx.setLineDash;
        nativeCtx.mozDash = [];
        const renderCtx = new UniverRenderingContext2D(nativeCtx as CanvasRenderingContext2D);
        renderCtx.setLineDash([4, 1]);
        expect(nativeCtx.mozDash).toEqual([4, 1]);

        const printingCtx = new UniverPrintingContext(createNativeContext());
        printingCtx.clearRect(1, 2, 3, 4);
        printingCtx.clearRectForTexture(1, 2, 3, 4);
        printingCtx.setGlobalCompositeOperation('lighter');
        expect(printingCtx.__mode).toBe('printing');
    });
});
