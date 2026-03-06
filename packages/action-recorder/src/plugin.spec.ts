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
import { ActionRecorderController } from './controllers/action-recorder.controller';
import { ACTION_RECORDER_PLUGIN_CONFIG_KEY, defaultPluginConfig } from './controllers/config.schema';
import { UniverActionRecorderPlugin as ReExportedPlugin } from './index';
import { UniverActionRecorderPlugin } from './plugin';
import { ActionRecorderService } from './services/action-recorder.service';
import { ActionReplayService } from './services/replay.service';

describe('action-recorder plugin', () => {
    it('should expose plugin/config exports', () => {
        expect(ReExportedPlugin).toBe(UniverActionRecorderPlugin);
        expect(UniverActionRecorderPlugin.pluginName).toBe('UNIVER_ACTION_RECORDER_PLUGIN');
        expect(ACTION_RECORDER_PLUGIN_CONFIG_KEY).toBe('action-recorder.config');
        expect(defaultPluginConfig).toEqual({});
    });

    it('should set config and register all dependencies when replayOnly is false', () => {
        const add = vi.fn();
        const get = vi.fn(() => ({}));
        const setConfig = vi.fn();
        const plugin = new UniverActionRecorderPlugin(
            { menu: { x: 1 } as never, replayOnly: false },
            { add, get } as never,
            { setConfig } as never
        );

        expect(setConfig).toHaveBeenCalledWith('menu', { x: 1 }, { merge: true });
        expect(setConfig).toHaveBeenCalledWith(ACTION_RECORDER_PLUGIN_CONFIG_KEY, { replayOnly: false });

        plugin.onStarting();
        expect(add).toHaveBeenCalledWith([ActionRecorderService]);
        expect(add).toHaveBeenCalledWith([ActionReplayService]);
        expect(add).toHaveBeenCalledWith([ActionRecorderController]);

        plugin.onSteady();
        expect(get).toHaveBeenCalledWith(ActionRecorderController);
    });

    it('should register replay dependencies only when replayOnly is true', () => {
        const add = vi.fn();
        const get = vi.fn();
        const plugin = new UniverActionRecorderPlugin(
            { replayOnly: true },
            { add, get } as never,
            { setConfig: vi.fn() } as never
        );

        plugin.onStarting();
        expect(add).toHaveBeenCalledTimes(1);
        expect(add).toHaveBeenCalledWith([ActionReplayService]);

        plugin.onSteady();
        expect(get).not.toHaveBeenCalled();
    });

    it('should cover default constructor config branch', () => {
        const plugin = new UniverActionRecorderPlugin(
            undefined as never,
            { add: vi.fn(), get: vi.fn() } as never,
            { setConfig: vi.fn() } as never
        );
        expect(plugin).toBeInstanceOf(UniverActionRecorderPlugin);
    });
});
