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

import { IWatermarkTypeEnum, UNIVER_WATERMARK_STORAGE_KEY } from '@univerjs/engine-render';
import { Subject } from 'rxjs';

import { describe, expect, it, vi } from 'vitest';
import { WatermarkRenderController } from './watermark.render.controller';

const layerInstances: Array<{ updateConfig: ReturnType<typeof vi.fn> }> = [];

vi.mock('@univerjs/engine-render', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/engine-render')>('@univerjs/engine-render');

    class WatermarkLayer {
        readonly updateConfig = vi.fn();

        constructor() {
            layerInstances.push(this);
        }
    }

    return {
        ...actual,
        IWatermarkTypeEnum: {
            UserInfo: 'userInfo',
            Text: 'text',
            Image: 'image',
        },
        UNIVER_WATERMARK_LAYER_INDEX: 1000,
        UNIVER_WATERMARK_STORAGE_KEY: 'UNIVER_WATERMARK_STORAGE_KEY',
        WatermarkLayer,
    };
});

function waitNextTick() {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, 0);
    });
}

describe('WatermarkRenderController', () => {
    it('should init layer, load config and react to updates', async () => {
        layerInstances.length = 0;

        const updateConfig$ = new Subject<unknown>();
        const updateWatermarkConfig = vi.fn();
        const scene = {
            addLayer: vi.fn(),
        };
        const makeDirty = vi.fn();
        const localStorageService = {
            getItem: vi.fn(async () => ({
                type: IWatermarkTypeEnum.Text,
                config: { text: { content: 'init' } },
            })),
        };
        const userManagerService = {
            getCurrentUser: vi.fn(() => ({ id: 'u1' })),
        };

        const controller = new WatermarkRenderController(
            {
                scene,
                mainComponent: { makeDirty },
            } as never,
            {
                updateConfig$: updateConfig$.asObservable(),
                updateWatermarkConfig,
            } as never,
            localStorageService as never,
            userManagerService as never
        );

        expect(scene.addLayer).toHaveBeenCalledTimes(1);
        expect(localStorageService.getItem).toHaveBeenCalledWith(UNIVER_WATERMARK_STORAGE_KEY);

        await waitNextTick();
        expect(updateWatermarkConfig).toHaveBeenCalledWith({
            type: IWatermarkTypeEnum.Text,
            config: { text: { content: 'init' } },
        });
        expect(makeDirty).toHaveBeenCalled();

        const layer = layerInstances[0];
        expect(layer).toBeDefined();

        updateConfig$.next(null);
        expect(layer.updateConfig).toHaveBeenCalledWith();

        updateConfig$.next({
            type: IWatermarkTypeEnum.UserInfo,
            config: { userInfo: { name: true } },
        });
        expect(layer.updateConfig).toHaveBeenCalledWith(
            { type: IWatermarkTypeEnum.UserInfo, config: { userInfo: { name: true } } },
            { id: 'u1' }
        );

        updateConfig$.next({
            type: IWatermarkTypeEnum.Image,
            config: { image: { url: 'img' } },
        });
        expect(layer.updateConfig).toHaveBeenCalledWith({
            type: IWatermarkTypeEnum.Image,
            config: { image: { url: 'img' } },
        });

        await controller.dispose();
    });

    it('should skip init config update when storage is empty', async () => {
        layerInstances.length = 0;

        const updateConfig$ = new Subject<unknown>();
        const updateWatermarkConfig = vi.fn();
        const makeDirty = vi.fn();
        const _controller = new WatermarkRenderController(
            {
                scene: { addLayer: vi.fn() },
                mainComponent: { makeDirty },
            } as never,
            {
                updateConfig$: updateConfig$.asObservable(),
                updateWatermarkConfig,
            } as never,
            { getItem: vi.fn(async () => undefined) } as never,
            { getCurrentUser: vi.fn(() => ({ id: 'u1' })) } as never
        );
        expect(_controller).toBeDefined();

        await waitNextTick();
        expect(updateWatermarkConfig).not.toHaveBeenCalled();
        expect(makeDirty).not.toHaveBeenCalled();
    });
});
