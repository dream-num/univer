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
import { IWatermarkTypeEnum } from '../type';
import { renderImageWatermark, renderTextWatermark, renderUserInfoWatermark, renderWatermark } from '../util';

function createCtx() {
    return {
        canvas: { width: 120, height: 80 },
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        fillText: vi.fn(),
        drawImage: vi.fn(),
        measureText: vi.fn(() => ({ width: 12 })),
        globalAlpha: 1,
        direction: 'inherit',
        font: '',
        fillStyle: '',
    } as any;
}

describe('watermark util extra', () => {
    it('renders user watermark in both repeat and single mode', () => {
        const ctx = createCtx();
        const user = { name: 'alice' } as any;

        renderUserInfoWatermark(ctx, {
            x: 0,
            y: 0,
            repeat: true,
            spacingX: 4,
            spacingY: 6,
            rotate: 30,
            opacity: 0.5,
            name: true,
            email: false,
            phone: false,
            uid: false,
            fontSize: 10,
            color: '#111',
            bold: true,
            italic: true,
            direction: 'ltr',
        }, user);

        renderUserInfoWatermark(ctx, {
            x: 2,
            y: 2,
            repeat: false,
            spacingX: 4,
            spacingY: 6,
            rotate: 0,
            opacity: 1,
            name: true,
            email: false,
            phone: false,
            uid: false,
            fontSize: 12,
            color: '#111',
            bold: false,
            italic: false,
            direction: 'inherit',
        }, user);

        renderUserInfoWatermark(ctx, {
            x: 0,
            y: 0,
            repeat: false,
            spacingX: 1,
            spacingY: 1,
            rotate: 0,
            opacity: 1,
            name: true,
            email: false,
            phone: false,
            uid: false,
            fontSize: 12,
            color: '#111',
            bold: false,
            italic: false,
            direction: 'inherit',
        }, null);

        expect(ctx.fillText).toHaveBeenCalled();
        expect(ctx.save).toHaveBeenCalled();
    });

    it('renders text and image watermark dispatch path', () => {
        const ctx = createCtx();
        const image = document.createElement('img');
        Object.defineProperty(image, 'complete', { value: true, configurable: true });

        renderTextWatermark(ctx, {
            x: 1,
            y: 1,
            repeat: true,
            spacingX: 5,
            spacingY: 5,
            rotate: 15,
            opacity: 0.7,
            content: 'W',
            fontSize: 10,
            color: '#333',
            bold: false,
            italic: false,
            direction: 'rtl',
        });
        renderTextWatermark(ctx, {
            x: 1,
            y: 1,
            repeat: false,
            spacingX: 5,
            spacingY: 5,
            rotate: 0,
            opacity: 1,
            content: 'S',
            fontSize: 10,
            color: '#333',
            bold: false,
            italic: false,
            direction: 'inherit',
        });

        renderImageWatermark(ctx, {
            x: 0,
            y: 0,
            repeat: true,
            spacingX: 2,
            spacingY: 2,
            rotate: 20,
            opacity: 0.8,
            url: '',
            width: 24,
            height: 12,
            maintainAspectRatio: true,
            originRatio: 2,
        }, image);
        renderImageWatermark(ctx, {
            x: 0,
            y: 0,
            repeat: false,
            spacingX: 2,
            spacingY: 2,
            rotate: 0,
            opacity: 1,
            url: '',
            width: 24,
            height: 12,
            maintainAspectRatio: false,
            originRatio: 2,
        }, image);

        renderImageWatermark(ctx, {
            x: 0,
            y: 0,
            repeat: false,
            spacingX: 2,
            spacingY: 2,
            rotate: 0,
            opacity: 1,
            url: '',
            width: 24,
            height: 12,
            maintainAspectRatio: false,
            originRatio: 2,
        }, null);

        renderWatermark(ctx, {
            type: IWatermarkTypeEnum.UserInfo,
            config: {
                userInfo: {
                    x: 0,
                    y: 0,
                    repeat: false,
                    spacingX: 0,
                    spacingY: 0,
                    rotate: 0,
                    opacity: 1,
                    name: true,
                    email: false,
                    phone: false,
                    uid: false,
                    fontSize: 10,
                    color: '#000',
                    bold: false,
                    italic: false,
                    direction: 'inherit',
                },
            },
        }, image, { name: 'u' } as any);

        renderWatermark(ctx, {
            type: IWatermarkTypeEnum.Image,
            config: {
                image: {
                    x: 0,
                    y: 0,
                    repeat: false,
                    spacingX: 0,
                    spacingY: 0,
                    rotate: 0,
                    opacity: 1,
                    url: '',
                    width: 12,
                    height: 8,
                    maintainAspectRatio: false,
                    originRatio: 1.5,
                },
            },
        }, image, null);

        renderWatermark(ctx, {
            type: IWatermarkTypeEnum.Text,
            config: {
                text: {
                    x: 0,
                    y: 0,
                    repeat: false,
                    spacingX: 0,
                    spacingY: 0,
                    rotate: 0,
                    opacity: 1,
                    content: 'TXT',
                    fontSize: 11,
                    color: '#000',
                    bold: false,
                    italic: false,
                    direction: 'inherit',
                },
            },
        }, image, null);

        expect(ctx.drawImage).toHaveBeenCalled();
        expect(ctx.fillText).toHaveBeenCalled();
    });
});
