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

import { Injector } from '@univerjs/core';
import { UniverRenderingContext } from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConditionalFormattingIcon } from '../icon.render';

function nativeContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const smoothing: boolean[] = [];
    const context = {
        canvas,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'low',
        fillStyle: '#38bdf8',
        strokeStyle: '#38bdf8',
        globalAlpha: 1,
        globalCompositeOperation: 'source-over',
        shadowColor: 'rgba(0, 0, 0, 0)',
        getTransform: () => ({ a: 3, b: 0, c: 0, d: 3, e: -162.5, f: 100.5 }),
        setTransform: vi.fn(),
        save: vi.fn(() => smoothing.push(context.imageSmoothingEnabled)),
        restore: vi.fn(() => { context.imageSmoothingEnabled = smoothing.pop()!; }),
        drawImage: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        getLineDash: () => [],
        setLineDash: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    return context;
}

describe('conditional formatting icon assets', () => {
    let injector: Injector;

    beforeEach(() => {
        injector = new Injector([[ConditionalFormattingIcon]]);
        vi.stubGlobal('Path2D', class {});
    });

    afterEach(() => {
        injector.dispose();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    function createContext(native: CanvasRenderingContext2D): UniverRenderingContext {
        injector.add([UniverRenderingContext, {
            useFactory: () => injector.createInstance(UniverRenderingContext, native),
        }]);
        return injector.get(UniverRenderingContext);
    }

    it('preserves native resolution and fractional placement, reuses one bitmap and releases it on disposal', () => {
        const native = nativeContext(document.createElement('canvas'));
        const context = createContext(native);
        vi.spyOn(context, 'getSystemType').mockReturnValue('Linux');
        const contexts = new Map<HTMLCanvasElement, CanvasRenderingContext2D>();
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            const paint = contexts.get(this) ?? nativeContext(this);
            contexts.set(this, paint);
            return paint;
        });
        const extension = injector.get(ConditionalFormattingIcon);

        try {
            const draw = Reflect.get(extension, '_drawIcon').bind(extension);
            draw(context, '3Arrows_0', 10, 20);
            const bitmap = vi.mocked(native.drawImage).mock.calls[0][0] as HTMLCanvasElement;
            expect([bitmap.width, bitmap.height]).toEqual([50, 50]);
            expect(native.drawImage).toHaveBeenCalledWith(bitmap, -135, 158);
            const paint = bitmap.getContext('2d')!;
            expect(paint.setTransform).toHaveBeenCalledWith(3, 0, 0, 3, 2.5, 2.5);
            expect(paint.stroke).toHaveBeenCalledOnce();
            expect(paint.strokeStyle).toBe('#59D01E');
            draw(context, '3Arrows_0', 30, 40);
            expect(vi.mocked(native.drawImage).mock.calls[1][0]).toBe(bitmap);
            extension.dispose();
            expect([bitmap.width, bitmap.height]).toEqual([0, 0]);
        } finally {
            extension.dispose();
        }
    });

    it.each(['mac', 'printing', 'alpha', 'composition', 'color-space', 'shadow', 'filter', 'rotation', 'large', 'unavailable'])('keeps native icon drawing for %s', (mode) => {
        const native = nativeContext(document.createElement('canvas'));
        const context = createContext(native);
        vi.spyOn(context, 'getSystemType').mockReturnValue(mode === 'mac' ? 'Mac' : 'Linux');
        if (mode === 'printing') {
            context.__mode = 'printing';
        }
        if (mode === 'alpha') {
            native.globalAlpha = 0.5;
        }
        if (mode === 'composition') {
            native.globalCompositeOperation = 'destination-out';
        }
        if (mode === 'color-space') {
            Object.defineProperty(native, 'getContextAttributes', { value: () => ({ colorSpace: 'display-p3' }) });
        }
        if (mode === 'shadow') {
            native.shadowBlur = 2;
        }
        if (mode === 'filter') {
            native.filter = 'blur(2px)';
        }
        if (mode === 'rotation') {
            vi.spyOn(native, 'getTransform').mockReturnValue({ a: 1, b: 1, c: 0, d: 1 } as DOMMatrix);
        }
        if (mode === 'large') {
            vi.spyOn(native, 'getTransform').mockReturnValue({ a: 1000, b: 0, c: 0, d: 1000, e: 0, f: 0 } as DOMMatrix);
        }
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            return mode === 'unavailable' ? null : nativeContext(this);
        });
        const extension = injector.get(ConditionalFormattingIcon);
        try {
            Reflect.get(extension, '_drawIcon').call(extension, context, '3Arrows_0', 10, 20);
            expect(native.translate).toHaveBeenCalledWith(10, 20);
            expect(native.stroke).toHaveBeenCalledOnce();
            expect(native.drawImage).not.toHaveBeenCalled();
        } finally {
            extension.dispose();
        }
    });

    it('restores destination state when bitmap submission throws', () => {
        const native = nativeContext(document.createElement('canvas'));
        const context = createContext(native);
        vi.spyOn(context, 'getSystemType').mockReturnValue('Linux');
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            return nativeContext(this);
        });
        vi.mocked(native.drawImage).mockImplementation(() => {
            throw new Error('Icon submission failed');
        });
        const extension = injector.get(ConditionalFormattingIcon);
        try {
            expect(() => Reflect.get(extension, '_drawIcon').call(extension, context, '3Arrows_0', 10, 20)).toThrow('Icon submission failed');
            expect(native.save).toHaveBeenCalledOnce();
            expect(native.restore).toHaveBeenCalledOnce();
        } finally {
            extension.dispose();
        }
    });
});
