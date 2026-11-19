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

import type { IWatermarkConfigWithType } from '@univerjs/engine-render';
import { ILocalStorageService, Injector } from '@univerjs/core';
import { IWatermarkTypeEnum } from '@univerjs/engine-render';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WatermarkService } from '../watermark.service';

describe('WatermarkService', () => {
    let injector: Injector;

    afterEach(() => injector.dispose());

    it('reads, updates and deletes the persisted watermark and notifies subscribers', async () => {
        const config: IWatermarkConfigWithType = { type: IWatermarkTypeEnum.Text, config: {} };
        const storage: ILocalStorageService = {
            getItem: vi.fn().mockResolvedValue(config),
            setItem: vi.fn().mockResolvedValue(config),
            removeItem: vi.fn().mockResolvedValue(undefined),
            clear: vi.fn().mockResolvedValue(undefined),
            key: vi.fn().mockResolvedValue(null),
            keys: vi.fn().mockResolvedValue([]),
            iterate: vi.fn().mockResolvedValue(undefined),
        };
        injector = new Injector();
        injector.add([ILocalStorageService, { useValue: storage }]);
        injector.add([WatermarkService]);
        const service = injector.get(WatermarkService);

        await expect(service.getWatermarkConfig()).resolves.toEqual(config);
        expect(storage.getItem).toHaveBeenCalledWith('UNIVER_WATERMARK_STORAGE_KEY');

        const updateValues: unknown[] = [];
        const refreshValues: number[] = [];
        service.updateConfig$.subscribe((value) => updateValues.push(value));
        service.refresh$.subscribe((value) => refreshValues.push(value));

        service.updateWatermarkConfig(config);
        expect(storage.setItem).toHaveBeenCalledWith('UNIVER_WATERMARK_STORAGE_KEY', config);

        service.deleteWatermarkConfig();
        expect(storage.removeItem).toHaveBeenCalledWith('UNIVER_WATERMARK_STORAGE_KEY');
        expect(updateValues).toEqual([config, null]);

        service.refresh();
        expect(refreshValues.length).toBe(1);
        expect(refreshValues[0]).toBeTypeOf('number');
    });
});
