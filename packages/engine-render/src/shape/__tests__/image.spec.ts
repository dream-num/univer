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
        globalAlpha: 1,
    } as any;
}

describe('image extra', () => {
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
});
