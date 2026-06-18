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
import { FEnum, FUniver } from '@univerjs/core/facade';
import { IWatermarkTypeEnum } from '@univerjs/engine-render';
import { WatermarkService, WatermarkTextBaseConfig } from '@univerjs/watermark';
import { describe, expect, it } from 'vitest';
import { FUniverWatermarkMixin, FWatermarkEnumMixin } from './f-univer';

class TestWatermarkService {
    readonly updatedConfigs: unknown[] = [];
    deleteCount = 0;

    updateWatermarkConfig(config: unknown): void {
        this.updatedConfigs.push(config);
    }

    deleteWatermarkConfig(): void {
        this.deleteCount += 1;
    }
}

describe('watermark facade', () => {
    it('adds text and image watermarks through the injected watermark service', () => {
        const injector = new Injector();
        injector.add([WatermarkService, { useClass: TestWatermarkService as never }]);
        const service = injector.get(WatermarkService) as unknown as TestWatermarkService;
        const thisArg = {
            _injector: injector,
        };
        const addWatermark = FUniverWatermarkMixin.prototype.addWatermark as (
            this: typeof thisArg,
            type: IWatermarkTypeEnum,
            config: unknown
        ) => FUniver;

        expect(addWatermark.call(
            thisArg,
            IWatermarkTypeEnum.Text,
            { content: 'Confidential' } as never
        )).toBe(thisArg);
        expect(service.updatedConfigs.at(-1)).toEqual({
            type: IWatermarkTypeEnum.Text,
            config: {
                text: {
                    ...WatermarkTextBaseConfig,
                    content: 'Confidential',
                },
            },
        });

        addWatermark.call(
            thisArg,
            IWatermarkTypeEnum.Image,
            { url: 'https://example.com/watermark.png', width: 320 } as never
        );
        expect(service.updatedConfigs.at(-1)).toMatchObject({
            type: IWatermarkTypeEnum.Image,
            config: {
                image: {
                    url: 'https://example.com/watermark.png',
                    width: 320,
                },
            },
        });
    });

    it('deletes watermark config, rejects unknown types and exposes watermark enum on real facade classes', () => {
        const injector = new Injector();
        injector.add([WatermarkService, { useClass: TestWatermarkService as never }]);
        const service = injector.get(WatermarkService) as unknown as TestWatermarkService;
        const thisArg = {
            _injector: injector,
        };
        const addWatermark = FUniverWatermarkMixin.prototype.addWatermark as (
            this: typeof thisArg,
            type: IWatermarkTypeEnum,
            config: unknown
        ) => FUniver;

        expect(() =>
            addWatermark.call(thisArg, 'unknown' as never, {} as never)
        ).toThrow('Unknown watermark type');
        expect(FUniverWatermarkMixin.prototype.deleteWatermark.call(thisArg as never)).toBe(thisArg);
        expect(service.deleteCount).toBe(1);
        expect(FEnum.get().IWatermarkTypeEnum).toBe(IWatermarkTypeEnum);
        expect(Object.create(FWatermarkEnumMixin.prototype).IWatermarkTypeEnum).toBe(IWatermarkTypeEnum);
        expect(typeof FUniver.prototype.addWatermark).toBe('function');
    });
});
