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
import { UniverRenderingContext2D } from '../context';

function createNativeContext() {
    const canvas = document.createElement('canvas');
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
        letterSpacing: '1px',
        textRendering: 'optimizeLegibility',
        wordSpacing: '2px',
        textAlign: 'start',
        textBaseline: 'alphabetic',
        getTransform: vi.fn(() => ({ a: 2, b: 0, c: 0, d: 4, e: 0, f: 0 })),
        resetTransform: vi.fn(),
        reset: vi.fn(),
        createConicGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        createPattern: vi.fn(() => ({})),
        createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        fillText: vi.fn(),
        measureText: vi.fn(() => ({ width: 42 })),
        stroke: vi.fn(),
        setLineDash: undefined,
        getLineDash: vi.fn(() => []),
        setTransform: vi.fn(),
    } as any;

    return ctx as CanvasRenderingContext2D;
}

describe('context proxy branches', () => {
    it('reads proxied state and helper factories from the native context', () => {
        const nativeCtx = createNativeContext() as any;
        const renderCtx = new UniverRenderingContext2D(nativeCtx);

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

        renderCtx.fontStretch = 'expanded' as any;
        renderCtx.fontVariantCaps = 'all-small-caps' as any;
        renderCtx.letterSpacing = '3px';
        renderCtx.textRendering = 'geometricPrecision' as any;
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

    it('uses webkit line dash fallback when standard dash APIs are missing', () => {
        const nativeCtx = createNativeContext() as any;
        nativeCtx.webkitLineDash = [];
        const renderCtx = new UniverRenderingContext2D(nativeCtx as CanvasRenderingContext2D);

        renderCtx.setLineDash([3, 2]);

        expect(nativeCtx.webkitLineDash).toEqual([3, 2]);
    });
});
