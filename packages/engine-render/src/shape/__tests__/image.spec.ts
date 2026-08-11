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
import { Vector2 } from '../../basics/vector2';
import { Canvas } from '../../canvas';
import { UniverRenderingContext } from '../../context';
import { Image } from '../image';

function createNativeImage(width = 120, height = 80, source?: string) {
    const img = document.createElement('img');
    Object.defineProperty(img, 'width', { value: width, configurable: true });
    Object.defineProperty(img, 'height', { value: height, configurable: true });
    Object.defineProperty(img, 'complete', { value: true, configurable: true });
    if (source) {
        img.src = source;
    }
    return img;
}

function createSvgDataUrl(svg: string): string {
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function createCtxMock() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        drawImage: vi.fn(),
        transform: vi.fn(),
        globalAlpha: 1,
    } as any;
}

describe('image extra', () => {
    it('preserves the request mode of an already-loaded native image', () => {
        const native = createNativeImage();
        native.crossOrigin = 'use-credentials';

        const image = new Image('decoded-image', {
            image: native,
            left: 0,
            top: 0,
            width: 120,
            height: 80,
        });

        expect(image.getNative()).toBe(native);
        expect(native.crossOrigin).toBe('use-credentials');
    });

    it('handles srcRect transform and render branches', () => {
        const image = new Image('img1', {
            image: createNativeImage(100, 60),
            left: 20,
            top: 10,
            width: 100,
            height: 60,
            srcRect: { left: 5, top: 6, right: 7, bottom: 8 },
        });

        const calculated = image.calculateTransformWithSrcRect();
        expect(calculated).toEqual({
            left: 15,
            top: 4,
            width: 112,
            height: 74,
            angle: 0,
        });

        image.openRenderByCropper();
        image.closeRenderByCropper();
        image.setOpacity(0.6);
        expect(image.opacity).toBe(0.6);

        const ctx = createCtxMock();
        image.render(ctx);
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.drawImage).toHaveBeenCalled();
    });

    it('scales srcRect offsets with a group-resized render bound', () => {
        const native = createNativeImage(100, 60);
        const image = new Image('group-cropped-image', {
            image: native,
            left: 20,
            top: 10,
            width: 100,
            height: 60,
            srcRect: { left: 10, top: 12, right: 14, bottom: 16 },
        });
        vi.spyOn(image, 'getRealBound').mockReturnValue({
            left: 0,
            top: 0,
            width: 50,
            height: 30,
        });

        const ctx = createCtxMock();
        image.render(ctx);

        expect(ctx.drawImage).toHaveBeenCalledWith(native, -30, -21, 62, 44);
    });

    it('supports source switching, reset size and hit testing', () => {
        const image = new Image('img2', {
            image: createNativeImage(90, 50),
            left: 30,
            top: 40,
            width: 90,
            height: 50,
            srcRect: { left: 10, top: 10, right: 0, bottom: 0 },
        });

        image.changeSource('https://example.com/a.png');
        image.getNative()!.onload!(new Event('load'));
        image.setSrcRect({ left: 2, top: 3, right: 4, bottom: 5 });
        image.transformByState({
            width: 120,
            height: 70,
            left: 32,
            top: 41,
        });
        expect(image.srcRect).toMatchObject({
            left: expect.any(Number),
            top: expect.any(Number),
            right: expect.any(Number),
            bottom: expect.any(Number),
        });

        image.resetSize();
        expect(image.width).toBe(90);
        expect(image.height).toBe(50);

        expect(image.isHit(Vector2.FromArray([75, 65]))).toBe(true);
        expect(image.isHit(Vector2.FromArray([300, 260]))).toBe(false);
    });

    it('handles failure branch and close transform update path', () => {
        const image = new Image('img3', {
            url: 'https://example.com/404.png',
            left: 0,
            top: 0,
            width: 80,
            height: 40,
            srcRect: { left: 4, top: 4, right: 4, bottom: 4 },
            fail: vi.fn(),
        });
        image.getNative()!.onerror!(new Event('error'));
        expect(image.getProps().fail).toHaveBeenCalled();

        image.transformByStateCloseCropper({
            width: 100,
            height: 60,
            left: 10,
            top: 20,
        });
        expect(image.width).toBe(100);
        expect(image.height).toBe(60);
    });

    it('registers load handlers before assigning url image source', () => {
        const originalCreateElement = document.createElement.bind(document);
        const events: Array<{ hasOnload: boolean; value: string }> = [];
        let nativeSrc = '';
        const native = {
            crossOrigin: '',
            height: 60,
            onerror: undefined,
            onload: undefined,
            width: 100,
            get src() {
                return nativeSrc;
            },
            set src(value: string) {
                events.push({ hasOnload: typeof native.onload === 'function', value });
                nativeSrc = value;
                native.onload?.(new Event('load'));
            },
        } as unknown as HTMLImageElement;
        const createElement = vi.spyOn(document, 'createElement');
        createElement.mockImplementation((tagName: string) => {
            if (tagName === 'img') {
                return native;
            }
            return originalCreateElement(tagName);
        });
        const success = vi.fn();

        try {
            new Image('img-sync-load', {
                fail: vi.fn(),
                height: 60,
                left: 0,
                success,
                top: 0,
                url: 'data:image/png;base64,abc',
                width: 100,
            });
        } finally {
            createElement.mockRestore();
        }

        expect(events).toEqual([{ hasOnload: true, value: 'data:image/png;base64,abc' }]);
        expect(success).toHaveBeenCalled();
    });

    it('clips rendering to an absolute document page bound before applying image transform', () => {
        const image = new Image('img4', {
            image: createNativeImage(100, 60),
            left: -30,
            top: 10,
            width: 100,
            height: 60,
            clipBounds: { left: 0, top: 0, width: 80, height: 120 },
        });

        const ctx = createCtxMock();
        image.render(ctx);

        expect(ctx.rect).toHaveBeenCalledWith(0, 0, 80, 120);
        expect(ctx.clip).toHaveBeenCalledBefore(ctx.transform);
        expect(ctx.drawImage).toHaveBeenCalled();
    });

    it('automatically raster caches only expensive static inline SVG images', () => {
        const filteredSvg = createSvgDataUrl(`
            <svg xmlns="http://www.w3.org/2000/svg">
                <defs><filter id="noise"><feTurbulence /></filter></defs>
                <rect width="10" height="10" filter="url(#noise)" />
            </svg>
        `);
        const ordinarySvg = createSvgDataUrl('<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" /></svg>');
        const animatedSvg = createSvgDataUrl(`
            <svg xmlns="http://www.w3.org/2000/svg">
                <defs><filter id="noise"><feTurbulence /></filter></defs>
                <rect width="10" height="10" filter="url(#noise)"><animate attributeName="x" values="0;10" /></rect>
            </svg>
        `);
        const filteredNative = createNativeImage(10, 10, filteredSvg);
        const ordinaryNative = createNativeImage(10, 10, ordinarySvg);
        const animatedNative = createNativeImage(10, 10, animatedSvg);
        const filteredImage = new Image('filtered-svg', {
            image: filteredNative,
            left: 0,
            top: 0,
            width: 10,
            height: 10,
        });
        const ordinaryImage = new Image('ordinary-svg', {
            image: ordinaryNative,
            left: 0,
            top: 0,
            width: 10,
            height: 10,
        });
        const animatedImage = new Image('animated-svg', {
            image: animatedNative,
            left: 0,
            top: 0,
            width: 10,
            height: 10,
        });
        const canvas = new Canvas({ width: 20, height: 20, pixelRatio: 1 });
        const context = canvas.getContext();
        const drawImage = vi.spyOn(UniverRenderingContext.prototype, 'drawImage');

        for (const image of [filteredImage, ordinaryImage, animatedImage]) {
            image.render(context);
            image.render(context);
        }

        expect(drawImage.mock.calls.filter(([source]) => source === filteredNative)).toHaveLength(1);
        expect(drawImage.mock.calls.filter(([source]) => source === ordinaryNative)).toHaveLength(2);
        expect(drawImage.mock.calls.filter(([source]) => source === animatedNative)).toHaveLength(2);

        drawImage.mockRestore();
        filteredImage.dispose();
        ordinaryImage.dispose();
        animatedImage.dispose();
        canvas.dispose();
    });

    it('reuses an automatic SVG raster cache within a scale bucket', () => {
        const native = createNativeImage(100, 100, createSvgDataUrl(`
            <svg xmlns="http://www.w3.org/2000/svg">
                <defs><filter id="blur"><feGaussianBlur stdDeviation="10" /></filter></defs>
                <rect width="100" height="100" filter="url(#blur)" />
            </svg>
        `));
        const image = new Image('cached-image', {
            image: native,
            left: 0,
            top: 0,
            width: 100,
            height: 100,
        });
        const canvas = new Canvas({ width: 200, height: 100, pixelRatio: 1 });
        const context = canvas.getContext();
        const drawImage = vi.spyOn(UniverRenderingContext.prototype, 'drawImage');

        context.setTransform(1.1, 0, 0, 1.1, 0, 0);
        image.render(context);
        context.setTransform(1.4, 0, 0, 1.4, 0, 0);
        image.render(context);
        context.setTransform(1.6, 0, 0, 1.6, 0, 0);
        image.render(context);

        expect(drawImage.mock.calls.filter(([source]) => source === native)).toHaveLength(2);

        drawImage.mockRestore();
        image.dispose();
        canvas.dispose();
    });

    it('keeps using the capped cache at high zoom', () => {
        const native = createNativeImage(4_000, 2_000, createSvgDataUrl(`
            <svg xmlns="http://www.w3.org/2000/svg">
                <defs><filter id="blur"><feGaussianBlur stdDeviation="10" /></filter></defs>
                <rect width="4000" height="2000" filter="url(#blur)" />
            </svg>
        `));
        const image = new Image('cached-image', {
            image: native,
            left: 0,
            top: 0,
            width: 4_000,
            height: 2_000,
        });
        const canvas = new Canvas({ width: 200, height: 100, pixelRatio: 1 });
        const context = canvas.getContext();
        const drawImage = vi.spyOn(UniverRenderingContext.prototype, 'drawImage');

        context.setTransform(0.5, 0, 0, 0.5, 0, 0);
        image.render(context);
        context.setTransform(2, 0, 0, 2, 0, 0);
        image.render(context);

        expect(drawImage.mock.calls.filter(([source]) => source === native)).toHaveLength(1);
        const cacheCanvas = drawImage.mock.calls.find(([source]) => source instanceof HTMLCanvasElement)?.[0];
        if (!(cacheCanvas instanceof HTMLCanvasElement)) {
            throw new TypeError('Expected the SVG raster cache canvas to be rendered');
        }
        expect(cacheCanvas.width * cacheCanvas.height).toBeLessThanOrEqual(4_000_000);
        expect(drawImage.mock.calls.filter(([source]) => source === cacheCanvas)).toHaveLength(2);

        drawImage.mockRestore();
        image.dispose();
        canvas.dispose();
    });
});
