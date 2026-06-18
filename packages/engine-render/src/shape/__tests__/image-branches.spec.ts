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
import { Image } from '../image';

function createNativeImage(width = 120, height = 80) {
    const img = document.createElement('img');
    Object.defineProperty(img, 'width', { value: width, configurable: true });
    Object.defineProperty(img, 'height', { value: height, configurable: true });
    Object.defineProperty(img, 'complete', { value: true, configurable: true });
    return img;
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
        translate: vi.fn(),
        globalAlpha: 1,
    } as any;
}

describe('image branch coverage', () => {
    it('supports missing native image, geometry setters and image load fallback branches', () => {
        const success = vi.fn();
        const image = new Image('img4', {
            url: 'https://example.com/ok.png',
            left: 0,
            top: 0,
            width: 80,
            height: 40,
            success,
        });
        vi.spyOn(image, 'getEngine').mockReturnValue({ activeScene: { onFileLoaded$: { emitEvent: vi.fn() } } } as any);
        image.getNative()!.onload!(new Event('load'));
        expect(success).toHaveBeenCalled();

        image.getNative()!.onerror!(new Event('error'));
        expect(image.getNative()!.src).toContain('data:image/svg+xml;base64');

        image.setClipService(null);
        expect(image.getClipService()).toBeNull();
        image.setPrstGeom('ellipse');
        image.setPrstGeomAdjValues({ adj: 1 });
        expect(image.prstGeom).toBe('ellipse');
        expect(image.prstGeomAdjValues).toEqual({ adj: 1 });

        const noNative = new Image('img5', {
            left: 3,
            top: 4,
            width: 30,
            height: 20,
        });
        expect(noNative.getNativeSize()).toEqual({ width: 30, height: 20 });
        noNative.resetSize();
        noNative.changeSource('https://example.com/later.png');
        noNative.getNative()!.onload!(new Event('load'));
        expect(noNative.getNative()).toBeTruthy();
        noNative.openRenderByCropper();
        expect(noNative.calculateTransformWithSrcRect()).toEqual({
            left: 3,
            top: 4,
            width: 30,
            height: 20,
            angle: 0,
        });
    });

    it('clips preset geometry and handles render visibility and bounds branches', () => {
        const image = new Image('img6', {
            image: createNativeImage(100, 60),
            left: 10,
            top: 20,
            width: 100,
            height: 60,
            srcRect: { left: 10, top: 5, right: 20, bottom: 15 },
        });
        image.setPrstGeom('roundRect');
        image.setPrstGeomAdjValues({ r: 2 });
        image.setClipService({
            applyShapeClip: vi.fn(() => ({ left: -60, top: -40, width: 130, height: 90 })),
        } as any);

        const ctx = createCtxMock();
        image.render(ctx, { viewBound: { left: 0, top: 0, right: 200, bottom: 200 } } as any);
        expect(ctx.translate).toHaveBeenCalledWith(-50, -30);
        expect(ctx.drawImage).toHaveBeenCalledWith(expect.any(HTMLImageElement), -73, -47.5, 169, 120);

        const clipWithoutBounds = new Image('img7', {
            image: createNativeImage(20, 20),
            left: 0,
            top: 0,
            width: 20,
            height: 20,
        });
        clipWithoutBounds.setPrstGeom('custom');
        clipWithoutBounds.setClipService({ applyShapeClip: vi.fn(() => null) } as any);
        const noBoundsCtx = createCtxMock();
        clipWithoutBounds.render(noBoundsCtx);
        expect(noBoundsCtx.drawImage).toHaveBeenCalledWith(expect.any(HTMLImageElement), -10, -10, 20, 20);

        image.hide();
        expect(image.render(createCtxMock())).toBe(image);

        image.show();
        expect(image.render(createCtxMock(), { viewBound: { left: 500, top: 500, right: 600, bottom: 600 } } as any)).toBe(image);
    });
});
