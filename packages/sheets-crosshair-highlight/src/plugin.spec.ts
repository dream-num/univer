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
import { SHEETS_CROSSHAIR_HIGHLIGHT_Z_INDEX } from './const';
import {
    defaultPluginConfig,
    SHEETS_CROSSHAIR_HIGHLIGHT_PLUGIN_CONFIG_KEY,
} from './controllers/config.schema';
import { SheetsCrosshairHighlightController } from './controllers/crosshair.controller';
import {
    DisableCrosshairHighlightOperation,
    EnableCrosshairHighlightOperation,
    UniverSheetsCrosshairHighlightPlugin as ReExportedPlugin,
    SetCrosshairHighlightColorOperation,
    ToggleCrosshairHighlightOperation,
} from './index';
import { UniverSheetsCrosshairHighlightPlugin } from './plugin';
import { SheetsCrosshairHighlightService } from './services/crosshair.service';
import { SheetCrosshairHighlightRenderController } from './views/widgets/crosshair-highlight.render-controller';

describe('sheets-crosshair-highlight plugin', () => {
    it('should expose exports and plugin metadata', () => {
        expect(ReExportedPlugin).toBe(UniverSheetsCrosshairHighlightPlugin);
        expect(UniverSheetsCrosshairHighlightPlugin.pluginName).toBe('SHEET_CROSSHAIR_HIGHLIGHT_PLUGIN');
        expect(UniverSheetsCrosshairHighlightPlugin.type).toBe(UniverInstanceType.UNIVER_SHEET);
        expect(SHEETS_CROSSHAIR_HIGHLIGHT_PLUGIN_CONFIG_KEY).toBe('sheets-crosshair-highlight.config');
        expect(defaultPluginConfig).toEqual({});
        expect(SHEETS_CROSSHAIR_HIGHLIGHT_Z_INDEX).toBe(1);

        expect(ToggleCrosshairHighlightOperation.id).toBe('sheet.operation.toggle-crosshair-highlight');
        expect(SetCrosshairHighlightColorOperation.id).toBe('sheet.operation.set-crosshair-highlight-color');
        expect(EnableCrosshairHighlightOperation.id).toBe('sheet.operation.enable-crosshair-highlight');
        expect(DisableCrosshairHighlightOperation.id).toBe('sheet.operation.disable-crosshair-highlight');
    });

    it('should set config and register dependencies on starting/ready', () => {
        const add = vi.fn();
        const get = vi.fn(() => ({}));
        const setConfig = vi.fn();
        const registerRenderModule = vi.fn();
        const plugin = new UniverSheetsCrosshairHighlightPlugin(
            { menu: { a: 1 } as never },
            { add, get } as never,
            { registerRenderModule } as never,
            { setConfig } as never
        );

        expect(setConfig).toHaveBeenCalledWith(
            SHEETS_CROSSHAIR_HIGHLIGHT_PLUGIN_CONFIG_KEY,
            { menu: { a: 1 } }
        );

        plugin.onStarting();
        expect(add).toHaveBeenCalledWith([SheetsCrosshairHighlightService]);
        expect(add).toHaveBeenCalledWith([SheetsCrosshairHighlightController]);

        plugin.onReady();
        expect(add).toHaveBeenCalledWith([SheetCrosshairHighlightRenderController]);
        expect(get).toHaveBeenCalledWith(SheetsCrosshairHighlightController);
        expect(registerRenderModule).toHaveBeenCalledWith(
            UniverInstanceType.UNIVER_SHEET,
            [SheetCrosshairHighlightRenderController]
        );
    });

    it('should cover default config constructor branch', () => {
        const plugin = new UniverSheetsCrosshairHighlightPlugin(
            undefined as never,
            { add: vi.fn(), get: vi.fn() } as never,
            { registerRenderModule: vi.fn() } as never,
            { setConfig: vi.fn() } as never
        );
        expect(plugin).toBeInstanceOf(UniverSheetsCrosshairHighlightPlugin);
    });
});
