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

import { UniverInstanceType } from '@univerjs/core';
import { IWatermarkTypeEnum, UNIVER_WATERMARK_STORAGE_KEY } from '@univerjs/engine-render';
import { describe, expect, it, vi } from 'vitest';
import {
    WATERMARK_IMAGE_ALLOW_IMAGE_LIST,
    WatermarkImageBaseConfig,
    WatermarkTextBaseConfig,
    WatermarkUserInfoBaseConfig,
} from './common/const';
import { defaultPluginConfig, WATERMARK_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { WatermarkRenderController } from './controllers/watermark.render.controller';
import { UniverWatermarkPlugin as ReExportedPlugin, WatermarkService as ReExportedService } from './index';
import { UniverWatermarkPlugin } from './plugin';
import { WatermarkService } from './services/watermark.service';

function waitNextTick() {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, 0);
    });
}

describe('watermark plugin', () => {
    it('should expose exports and constants', () => {
        expect(ReExportedPlugin).toBe(UniverWatermarkPlugin);
        expect(ReExportedService).toBe(WatermarkService);
        expect(defaultPluginConfig).toEqual({});
        expect(WATERMARK_PLUGIN_CONFIG_KEY).toBe('watermark.config');
        expect(WATERMARK_IMAGE_ALLOW_IMAGE_LIST).toContain('image/png');
        expect(WatermarkTextBaseConfig.content).toBe('');
        expect(WatermarkImageBaseConfig.url).toBe('');
        expect(WatermarkUserInfoBaseConfig.name).toBe(true);
    });

    it('should initialize user watermark and render dependencies', async () => {
        const add = vi.fn();
        const get = vi.fn(() => ({}));
        const setConfig = vi.fn();
        const getConfig = vi.fn(() => ({
            userWatermarkSettings: { email: true },
        }));
        const setItem = vi.fn();
        const _plugin = new UniverWatermarkPlugin(
            {
                userWatermarkSettings: { email: true },
            },
            { add, get } as never,
            { setConfig, getConfig } as never,
            { registerRenderModule: vi.fn() } as never,
            { setItem, getItem: vi.fn(), removeItem: vi.fn() } as never
        );
        expect(_plugin).toBeDefined();

        await waitNextTick();

        expect(setConfig).toHaveBeenCalledWith(WATERMARK_PLUGIN_CONFIG_KEY, {
            userWatermarkSettings: { email: true },
        });
        expect(add).toHaveBeenCalledWith([WatermarkService]);
        expect(setItem).toHaveBeenCalledWith(UNIVER_WATERMARK_STORAGE_KEY, {
            type: IWatermarkTypeEnum.UserInfo,
            config: {
                userInfo: {
                    ...WatermarkUserInfoBaseConfig,
                    email: true,
                },
            },
        });

        const registerRenderModule = vi.fn();
        const onRenderedPlugin = new UniverWatermarkPlugin(
            undefined as never,
            { add: vi.fn(), get } as never,
            { setConfig: vi.fn(), getConfig: vi.fn(() => ({})) } as never,
            { registerRenderModule } as never,
            { setItem: vi.fn(), getItem: vi.fn(async () => undefined), removeItem: vi.fn() } as never
        );
        onRenderedPlugin.onRendered();
        expect(get).toHaveBeenCalledWith(WatermarkService);
        expect(registerRenderModule).toHaveBeenCalledWith(UniverInstanceType.UNIVER_SHEET, [WatermarkRenderController]);
        expect(registerRenderModule).toHaveBeenCalledWith(UniverInstanceType.UNIVER_DOC, [WatermarkRenderController]);
    });

    it('should initialize text/image watermark and fallback removal branch', async () => {
        const makeDeps = () => ({
            injector: { add: vi.fn(), get: vi.fn() },
            render: { registerRenderModule: vi.fn() },
            config: { setConfig: vi.fn(), getConfig: vi.fn() },
            storage: { setItem: vi.fn(), getItem: vi.fn(), removeItem: vi.fn() },
        });

        const textDeps = makeDeps();
        textDeps.config.getConfig.mockReturnValue({ textWatermarkSettings: { content: 'abc' } });
        const _textPlugin = new UniverWatermarkPlugin(
            { textWatermarkSettings: { content: 'abc' } },
            textDeps.injector as never,
            textDeps.config as never,
            textDeps.render as never,
            textDeps.storage as never
        );
        expect(_textPlugin).toBeDefined();
        await waitNextTick();
        expect(textDeps.storage.setItem).toHaveBeenCalledWith(UNIVER_WATERMARK_STORAGE_KEY, {
            type: IWatermarkTypeEnum.Text,
            config: {
                text: {
                    ...WatermarkTextBaseConfig,
                    content: 'abc',
                },
            },
        });

        const imageDeps = makeDeps();
        imageDeps.config.getConfig.mockReturnValue({ imageWatermarkSettings: { url: 'https://img' } });
        const _imagePlugin = new UniverWatermarkPlugin(
            { imageWatermarkSettings: { url: 'https://img' } },
            imageDeps.injector as never,
            imageDeps.config as never,
            imageDeps.render as never,
            imageDeps.storage as never
        );
        expect(_imagePlugin).toBeDefined();
        await waitNextTick();
        expect(imageDeps.storage.setItem).toHaveBeenCalledWith(UNIVER_WATERMARK_STORAGE_KEY, {
            type: IWatermarkTypeEnum.Image,
            config: {
                image: {
                    ...WatermarkImageBaseConfig,
                    url: 'https://img',
                },
            },
        });

        const fallbackDeps = makeDeps();
        fallbackDeps.config.getConfig.mockReturnValue({});
        fallbackDeps.storage.getItem.mockResolvedValue({ type: IWatermarkTypeEnum.UserInfo });
        const _fallbackPlugin = new UniverWatermarkPlugin(
            {},
            fallbackDeps.injector as never,
            fallbackDeps.config as never,
            fallbackDeps.render as never,
            fallbackDeps.storage as never
        );
        expect(_fallbackPlugin).toBeDefined();
        await waitNextTick();
        expect(fallbackDeps.storage.removeItem).toHaveBeenCalledWith(UNIVER_WATERMARK_STORAGE_KEY);

        const fallbackNoRemoveDeps = makeDeps();
        fallbackNoRemoveDeps.config.getConfig.mockReturnValue({});
        fallbackNoRemoveDeps.storage.getItem.mockResolvedValue({ type: IWatermarkTypeEnum.Text });
        const _fallbackNoRemovePlugin = new UniverWatermarkPlugin(
            {},
            fallbackNoRemoveDeps.injector as never,
            fallbackNoRemoveDeps.config as never,
            fallbackNoRemoveDeps.render as never,
            fallbackNoRemoveDeps.storage as never
        );
        expect(_fallbackNoRemovePlugin).toBeDefined();
        await waitNextTick();
        expect(fallbackNoRemoveDeps.storage.removeItem).not.toHaveBeenCalled();

        const noConfigDeps = makeDeps();
        noConfigDeps.config.getConfig.mockReturnValue(undefined);
        const _noConfigPlugin = new UniverWatermarkPlugin(
            {},
            noConfigDeps.injector as never,
            noConfigDeps.config as never,
            noConfigDeps.render as never,
            noConfigDeps.storage as never
        );
        expect(_noConfigPlugin).toBeDefined();
        await waitNextTick();
        expect(noConfigDeps.storage.setItem).not.toHaveBeenCalled();
        expect(noConfigDeps.storage.getItem).not.toHaveBeenCalled();
    });
});
