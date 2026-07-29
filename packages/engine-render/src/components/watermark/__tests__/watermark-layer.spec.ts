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

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IWatermarkTypeEnum } from '../type';
import { WatermarkLayer } from '../watermark-layer';

const renderWatermarkMock = vi.fn();

vi.mock('../util', () => ({
    renderWatermark: (...args: unknown[]) => renderWatermarkMock(...args),
}));

function createScene() {
    return {
        getViewports: vi.fn(() => []),
        getParent: vi.fn(() => ({ classType: 'test-parent' })),
        getEngine: vi.fn(() => null),
    };
}

function createCtx(id = 'main') {
    return {
        getId: vi.fn(() => id),
        save: vi.fn(),
        restore: vi.fn(),
    } as any;
}

describe('WatermarkLayer', () => {
    beforeEach(() => {
        renderWatermarkMock.mockClear();
    });

    it('renders configured text watermark with the latest user info', () => {
        const layer = new WatermarkLayer(createScene() as never);
        const config = {
            type: IWatermarkTypeEnum.Text,
            config: {
                text: {
                    x: 1,
                    y: 2,
                    repeat: false,
                    spacingX: 0,
                    spacingY: 0,
                    rotate: 0,
                    opacity: 1,
                    content: 'confidential',
                    fontSize: 12,
                    color: '#000',
                    bold: false,
                    italic: false,
                    direction: 'inherit' as const,
                },
            },
        };
        const user = { name: 'Alice' };
        const ctx = createCtx();

        layer.updateConfig(config, user as never);
        layer.render(ctx);

        expect(renderWatermarkMock).toHaveBeenCalledWith(ctx, config, undefined, user);
    });

    it('creates an image element for image watermark config before rendering', () => {
        const layer = new WatermarkLayer(createScene() as never);
        const config = {
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
                    url: 'https://example.com/watermark.png',
                    width: 80,
                    height: 40,
                    maintainAspectRatio: true,
                    originRatio: 2,
                },
            },
        };
        const ctx = createCtx();

        layer.updateConfig(config);
        layer.render(ctx);

        const image = renderWatermarkMock.mock.calls[0][2] as HTMLImageElement;
        expect(image).toBeInstanceOf(Image);
        expect(image.src).toContain('https://example.com/watermark.png');
    });

    it('does not render watermark without config or a valid rendering context id', () => {
        const layer = new WatermarkLayer(createScene() as never);

        layer.render(createCtx(''));
        expect(renderWatermarkMock).not.toHaveBeenCalled();

        layer.updateConfig({
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
                    content: 'draft',
                    fontSize: 12,
                    color: '#000',
                    bold: false,
                    italic: false,
                    direction: 'inherit',
                },
            },
        });
        layer.render(createCtx(''));

        expect(renderWatermarkMock).not.toHaveBeenCalled();
    });
});
