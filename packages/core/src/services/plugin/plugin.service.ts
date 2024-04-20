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
import type { UniverType } from '@univerjs/protocol';
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
        this._pluginHolderForUniver = this._injector.createInstance(PluginHolder, true);
    }

    dispose(): void {
        this._clearFlushLazyPluginsTimer();

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
        if (type === UniverInstanceType.UNIVER) {
            this._pluginHolderForUniver.registerPlugin(plugin, config);
        } else {
            // If it's type is for specific document, we should run them at specific time.
            const holder = this._ensurePluginHolderForType(type);
            holder.registerPlugin(plugin, config);
        }
    }

    start(): void {
        this._pluginHolderForUniver.start();
    }

    startPluginForType(type: UniverType): void {
        const holder = this._ensurePluginHolderForType(type);
        holder.start();
    }

    _ensurePluginHolderForType(type: UnitType): PluginHolder {
        if (!this._pluginHoldersForTypes.has(type)) {
            const pluginHolder = this._injector.createInstance(PluginHolder, false);
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

    private _initLazyPluginsTimer?: number;
    private _scheduleInitPlugin() {
        if (this._initLazyPluginsTimer === undefined) {
            this._initLazyPluginsTimer = setTimeout(
                () => {
                    this._flushLazyPlugins();
                    this._clearFlushLazyPluginsTimer();
                },
                INIT_LAZY_PLUGINS_TIMEOUT
            ) as unknown as number;
        }
    }

    private _clearFlushLazyPluginsTimer() {
        if (this._initLazyPluginsTimer) {
            clearTimeout(this._initLazyPluginsTimer);
            this._initLazyPluginsTimer = undefined;
        }
    }

    private _flushLazyPlugins() {
        this._pluginHolderForUniver.flush();
        for (const [_, holder] of this._pluginHoldersForTypes) {
            if (holder.started) {
                holder.flush();
            }
        }
    }
}
