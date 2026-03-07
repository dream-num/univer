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

const mocked = vi.hoisted(() => ({
    extendUniver: vi.fn(),
    extendEnum: vi.fn(),
    IWatermarkTypeEnum: {
        Text: 'text',
        Image: 'image',
    },
}));

vi.mock('@univerjs/core/facade', () => {
    class FUniver {
        static extend = mocked.extendUniver;
    }
    class FEnum {
        static extend = mocked.extendEnum;
    }

    return {
        FUniver,
        FEnum,
    };
});

vi.mock('@univerjs/engine-render', () => ({
    IWatermarkTypeEnum: mocked.IWatermarkTypeEnum,
}));

class MockWatermarkService {}

vi.mock('@univerjs/watermark', () => ({
    WatermarkTextBaseConfig: { content: '', repeat: true },
    WatermarkImageBaseConfig: { url: '', width: 100 },
    WatermarkService: MockWatermarkService,
}));

describe('watermark facade', () => {
    it('should register facade mixins and support add/delete watermark', async () => {
        const module = await import('./f-univer');

        expect(mocked.extendUniver).toHaveBeenCalledWith(module.FUniverWatermarkMixin);
        expect(mocked.extendEnum).toHaveBeenCalledWith(module.FWatermarkEnum);

        const updateWatermarkConfig = vi.fn();
        const deleteWatermarkConfig = vi.fn();
        const thisArg = {
            _injector: {
                get: vi.fn(() => ({ updateWatermarkConfig, deleteWatermarkConfig })),
            },
        };

        const textResult = module.FUniverWatermarkMixin.prototype.addWatermark.call(
            thisArg,
            mocked.IWatermarkTypeEnum.Text as never,
            { content: 'hello' } as never
        );
        expect(textResult).toBe(thisArg);
        expect(updateWatermarkConfig).toHaveBeenCalledWith({
            type: mocked.IWatermarkTypeEnum.Text,
            config: { text: { content: 'hello', repeat: true } },
        });

        module.FUniverWatermarkMixin.prototype.addWatermark.call(
            thisArg,
            mocked.IWatermarkTypeEnum.Image as never,
            { url: 'https://img' } as never
        );
        expect(updateWatermarkConfig).toHaveBeenCalledWith({
            type: mocked.IWatermarkTypeEnum.Image,
            config: { image: { url: 'https://img', width: 100 } },
        });

        expect(() =>
            module.FUniverWatermarkMixin.prototype.addWatermark.call(thisArg, 'unknown' as never, {} as never)
        ).toThrow('Unknown watermark type');

        const deleteResult = module.FUniverWatermarkMixin.prototype.deleteWatermark.call(thisArg);
        expect(deleteResult).toBe(thisArg);
        expect(deleteWatermarkConfig).toHaveBeenCalledTimes(1);

        const enumObj = new module.FWatermarkEnum();
        expect(enumObj.IWatermarkTypeEnum).toBe(mocked.IWatermarkTypeEnum);
    });

    it('should run facade entry export', async () => {
        await expect(import('./index')).resolves.toBeDefined();
    });
});
