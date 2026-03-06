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
import { describe, expect, it, vi } from 'vitest';
import { GRAPHICS_EXTENSION_INDEX, UNIQUE_KEY } from './common/const';
import { defaultPluginConfig, PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { SheetGraphicsRenderController } from './controllers/graphics-render.controller';
import { UniverSheetsGraphicsPlugin as ReExportedPlugin } from './index';
import { UniverSheetsGraphicsPlugin } from './plugin';

describe('sheets-graphics plugin', () => {
    it('should expose exports and constants', () => {
        expect(ReExportedPlugin).toBe(UniverSheetsGraphicsPlugin);
        expect(UniverSheetsGraphicsPlugin.pluginName).toBe('UNIVER_SHEET_DRAWING_PLUGIN');
        expect(PLUGIN_CONFIG_KEY).toBe('graphics.config');
        expect(defaultPluginConfig).toEqual({});
        expect(UNIQUE_KEY).toBe('SheetGraphicsExtension');
        expect(GRAPHICS_EXTENSION_INDEX).toBe(35);
    });

    it('should set config and register render module on rendered', () => {
        const setConfig = vi.fn();
        const registerRenderModule = vi.fn();
        const plugin = new UniverSheetsGraphicsPlugin(
            { override: [['a', 'b']] as never },
            {} as never,
            { setConfig } as never,
            { registerRenderModule } as never
        );

        expect(setConfig).toHaveBeenCalledWith(PLUGIN_CONFIG_KEY, { override: [['a', 'b']] });

        plugin.onRendered();
        expect(registerRenderModule).toHaveBeenCalledWith(
            UniverInstanceType.UNIVER_SHEET,
            [SheetGraphicsRenderController]
        );
    });

    it('should use default config argument', () => {
        const setConfig = vi.fn();
        const plugin = new UniverSheetsGraphicsPlugin(
            undefined as never,
            {} as never,
            { setConfig } as never,
            { registerRenderModule: vi.fn() } as never
        );

        expect(plugin).toBeInstanceOf(UniverSheetsGraphicsPlugin);
        expect(setConfig).toHaveBeenCalledWith(PLUGIN_CONFIG_KEY, {});
    });
});
