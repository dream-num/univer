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

import { Rect, UniverRenderingContext } from '@univerjs/engine-render';
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
        getLineDash: () => [],
        setLineDash: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    return context;
}

describe('conditional formatting icon assets', () => {
    let images: HTMLImageElement[];

    beforeEach(() => {
        images = [];
        vi.spyOn(HTMLImageElement.prototype, 'src', 'set').mockImplementation(function (this: HTMLImageElement) {
            images.push(this);
        });
    });

    afterEach(() => vi.restoreAllMocks());

    it('invalidates the cached parent when icons finish loading', () => {
        const extension = new ConditionalFormattingIcon();
        const parent = new Rect('icon-parent');
        const dirty = vi.spyOn(parent, 'makeDirty');
        extension.parent = parent;
        try {
            expect(images.length).toBeGreaterThan(0);
            for (const image of images) {
                image.dispatchEvent(new Event('load'));
            }
            expect(dirty).toHaveBeenCalledTimes(images.length);
            expect(dirty).toHaveBeenLastCalledWith(true);
            for (const image of images) {
                image.dispatchEvent(new Event('load'));
            }
            expect(dirty).toHaveBeenCalledTimes(images.length);
        } finally {
            extension.dispose();
            parent.dispose();
        }
    });

    it('disconnects pending image loads when disposed', () => {
        const extension = new ConditionalFormattingIcon();
        const parent = new Rect('disposed-icon-parent');
        const dirty = vi.spyOn(parent, 'makeDirty');
        extension.parent = parent;
        extension.dispose();
        try {
            expect(images.length).toBeGreaterThan(0);
            for (const image of images) {
                expect(image.onload).toBeNull();
                image.dispatchEvent(new Event('load'));
            }
            expect(dirty).not.toHaveBeenCalled();
        } finally {
            parent.dispose();
        }
    });

    it('preserves native resolution and fractional placement, reuses one bitmap and releases it on disposal', () => {
        const native = nativeContext(document.createElement('canvas'));
        const context = new UniverRenderingContext(native);
        vi.spyOn(context, 'getSystemType').mockReturnValue('Linux');
        const contexts = new Map<HTMLCanvasElement, CanvasRenderingContext2D>();
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            const paint = contexts.get(this) ?? nativeContext(this);
            contexts.set(this, paint);
            return paint;
        });
        const extension = new ConditionalFormattingIcon();
        const image = images[0];
        try {
            const draw = Reflect.get(extension, '_drawIcon').bind(extension);
            draw(context, image, 10, 20);
            const bitmap = vi.mocked(native.drawImage).mock.calls[0][0] as HTMLCanvasElement;
            expect([bitmap.width, bitmap.height]).toEqual([50, 50]);
            expect(native.drawImage).toHaveBeenCalledWith(bitmap, -135, 158);
            const paint = bitmap.getContext('2d')!;
            expect(paint.setTransform).toHaveBeenCalledWith(3, 0, 0, 3, 2.5, 2.5);
            expect(paint.drawImage).toHaveBeenCalledWith(image, 0, 0, 15, 15);
            draw(context, image, 30, 40);
            expect(vi.mocked(native.drawImage).mock.calls[1][0]).toBe(bitmap);
            extension.dispose();
            expect([bitmap.width, bitmap.height]).toEqual([0, 0]);
        } finally {
            extension.dispose();
        }
    });

    it.each(['mac', 'printing', 'alpha', 'composition', 'color-space', 'shadow', 'filter', 'rotation', 'large', 'unavailable'])('keeps native icon drawing for %s', (mode) => {
        const native = nativeContext(document.createElement('canvas'));
        const context = new UniverRenderingContext(native);
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
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
        const extension = new ConditionalFormattingIcon();
        try {
            Reflect.get(extension, '_drawIcon').call(extension, context, images[0], 10, 20);
            expect(native.drawImage).toHaveBeenCalledExactlyOnceWith(images[0], 10, 20, 15, 15);
        } finally {
            extension.dispose();
        }
    });

    it('restores destination state when bitmap submission throws', () => {
        const native = nativeContext(document.createElement('canvas'));
        const context = new UniverRenderingContext(native);
        vi.spyOn(context, 'getSystemType').mockReturnValue('Linux');
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            return nativeContext(this);
        });
        vi.mocked(native.drawImage).mockImplementation(() => {
            throw new Error('Icon submission failed');
        });
        const extension = new ConditionalFormattingIcon();
        try {
            expect(() => Reflect.get(extension, '_drawIcon').call(extension, context, images[0], 10, 20)).toThrow('Icon submission failed');
            expect(native.save).toHaveBeenCalledOnce();
            expect(native.restore).toHaveBeenCalledOnce();
        } finally {
            extension.dispose();
        }
    });
});
