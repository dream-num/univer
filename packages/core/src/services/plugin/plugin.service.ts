/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { type UnitType, UniverInstanceType } from '../../common/unit';
import { PluginHolder } from './plugin-holder';
import type { Plugin, PluginCtor } from './plugin';

const INIT_LAZY_PLUGINS_TIMEOUT = 4;

/**
 * This service manages plugin registration.
 */
export class PluginService implements IDisposable {
    private readonly _pluginHolderForUniver: PluginHolder;
    private readonly _pluginHoldersForTypes = new Map<UnitType, PluginHolder>();

    constructor(
        @Inject(Injector) private readonly _injector: Injector
    ) {
        this._pluginHolderForUniver = this._injector.createInstance(PluginHolder);
        this._pluginHolderForUniver.start();
    }

    dispose(): void {
        this._clearFlushTimer();

        for (const holder of this._pluginHoldersForTypes.values()) {
            holder.dispose();
        }

        this._pluginHolderForUniver.dispose();
    }

    /** Register a plugin into univer. */
    registerPlugin<T extends PluginCtor<Plugin>>(plugin: T, config?: ConstructorParameters<T>[0]): void {
        this._assertPluginValid(plugin);

        this._scheduleInitPlugin();

        const { type } = plugin;
        if (type === UniverInstanceType.UNIVER_UNKNOWN) {
            this._pluginHolderForUniver.registerPlugin(plugin, config);
            this._pluginHolderForUniver.flush();
        } else {
            // If it's type is for specific document, we should run them at specific time.
            const holder = this._ensurePluginHolderForType(type);
            holder.registerPlugin(plugin, config);
        }
    }

    startPluginForType(type: UniverInstanceType): void {
        const holder = this._ensurePluginHolderForType(type);
        holder.start();
    }

    _ensurePluginHolderForType(type: UnitType): PluginHolder {
        if (!this._pluginHoldersForTypes.has(type)) {
            const pluginHolder = this._injector.createInstance(PluginHolder);
            this._pluginHoldersForTypes.set(type, pluginHolder);
            return pluginHolder;
        }

        return this._pluginHoldersForTypes.get(type)!;
    }

    private _assertPluginValid(plugin: PluginCtor<Plugin>): void {
        const { type, pluginName } = plugin;

        if (type === UniverInstanceType.UNRECOGNIZED) {
            throw new Error(`[PluginService]: invalid plugin type for ${plugin}. Please assign a "type" to your plugin.`);
        }

        if (pluginName === '') {
            throw new Error(`[PluginService]: no plugin name for ${plugin}. Please assign a "pluginName" to your plugin.`);
        }
    }

    private _flushTimer?: number;
    private _scheduleInitPlugin() {
        if (this._flushTimer === undefined) {
            this._flushTimer = setTimeout(
                () => {
                    if (!this._pluginHolderForUniver.started) {
                        this._pluginHolderForUniver.start();
                    }

                    this._flushPlugins();
                    this._clearFlushTimer();
                },
                INIT_LAZY_PLUGINS_TIMEOUT
            ) as unknown as number;
        }
    }

    private _clearFlushTimer() {
        if (this._flushTimer) {
            clearTimeout(this._flushTimer);
            this._flushTimer = undefined;
        }
    }

    private _flushPlugins() {
        this._pluginHolderForUniver.flush();
        for (const [_, holder] of this._pluginHoldersForTypes) {
            if (holder.started) {
                holder.flush();
            }
        }
    }
}
