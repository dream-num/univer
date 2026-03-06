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

import { UNIVER_WATERMARK_STORAGE_KEY } from '@univerjs/engine-render';
import { describe, expect, it, vi } from 'vitest';
import { WatermarkService } from './watermark.service';

describe('WatermarkService', () => {
    it('should get/update/delete/refresh and dispose', async () => {
        const getItem = vi.fn(async () => ({ type: 'text' }));
        const setItem = vi.fn();
        const removeItem = vi.fn();
        const service = new WatermarkService({
            getItem,
            setItem,
            removeItem,
        } as never);

        await expect(service.getWatermarkConfig()).resolves.toEqual({ type: 'text' });
        expect(getItem).toHaveBeenCalledWith(UNIVER_WATERMARK_STORAGE_KEY);

        const updateValues: unknown[] = [];
        const refreshValues: number[] = [];
        service.updateConfig$.subscribe((value) => updateValues.push(value));
        service.refresh$.subscribe((value) => refreshValues.push(value));

        service.updateWatermarkConfig({ type: 'image', config: { image: { url: 'x' } } } as never);
        expect(setItem).toHaveBeenCalledWith(UNIVER_WATERMARK_STORAGE_KEY, {
            type: 'image',
            config: { image: { url: 'x' } },
        });

        service.deleteWatermarkConfig();
        expect(removeItem).toHaveBeenCalledWith(UNIVER_WATERMARK_STORAGE_KEY);
        expect(updateValues).toEqual([
            { type: 'image', config: { image: { url: 'x' } } },
            null,
        ]);

        service.refresh();
        expect(refreshValues.length).toBe(1);
        expect(refreshValues[0]).toBeTypeOf('number');

        service.dispose();
    });
});
