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
import { DataBar } from '../data-bar.render';

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
        setLineDash: vi.fn(),
        getLineDash: () => [],
    } as unknown as CanvasRenderingContext2D;
    return context;
}

describe('data bar local rasterization', () => {
    afterEach(() => vi.restoreAllMocks());

    it('keeps physical resolution and fractional geometry, then releases the owned bitmap', () => {
        const canvas = document.createElement('canvas');
        const native = nativeContext(canvas);
        const context = new UniverRenderingContext(native);
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            return nativeContext(this);
        });
        const bar = new DataBar();
        const draw = vi.fn();
        Reflect.get(bar, '_drawAtLocalOrigin').call(bar, context, 10, 20, 54, 25, draw);

        expect(draw).toHaveBeenCalledOnce();
        const [paint, x, y] = draw.mock.calls[0];
        expect(paint).not.toBe(context);
        expect([x, y]).toEqual([0, 0]);
        expect(paint.canvas.width).toBe(167);
        expect(paint.canvas.height).toBe(80);
        expect(paint._context.setTransform).toHaveBeenCalledWith(3, 0, 0, 3, 2.5, 2.5);
        expect(native.drawImage).toHaveBeenCalledWith(paint.canvas, -135, 158);
        bar.dispose();
        expect(paint.canvas.width).toBe(0);
        expect(paint.canvas.height).toBe(0);
    });

    it('restores the destination context when submitting a bar bitmap throws', () => {
        const native = nativeContext(document.createElement('canvas'));
        const context = new UniverRenderingContext(native);
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            return nativeContext(this);
        });
        const failure = new Error('Data bar bitmap submission failed');
        vi.mocked(native.drawImage).mockImplementation(() => {
            throw failure;
        });
        const bar = new DataBar();
        try {
            expect(() => Reflect.get(bar, '_drawAtLocalOrigin').call(bar, context, 10, 20, 54, 25, vi.fn()))
                .toThrow(failure);
            expect(native.save).toHaveBeenCalledOnce();
            expect(native.restore).toHaveBeenCalledOnce();
        } finally {
            bar.dispose();
        }
    });

    it.each(['printing', 'alpha', 'large'])('preserves native drawing for %s', (mode) => {
        const native = nativeContext(document.createElement('canvas'));
        const context = new UniverRenderingContext(native);
        if (mode === 'printing') {
            context.__mode = 'printing';
        } else if (mode === 'alpha') {
            context.globalAlpha = 0.5;
        }
        const bar = new DataBar();
        const draw = vi.fn();
        const width = mode === 'large' ? 1_000_000 : 54;
        Reflect.get(bar, '_drawAtLocalOrigin').call(bar, context, 10, 20, width, 25, draw);
        expect(draw).toHaveBeenCalledWith(context, 10, 20);
        expect(native.drawImage).not.toHaveBeenCalled();
        bar.dispose();
    });
});
