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

import { Inject, Injector } from '@wendellhu/redi';
import { type UnitType, UniverInstanceType } from '../../common/unit';
import { LifecycleInitializerService, LifecycleService } from '../lifecycle/lifecycle.service';
import { LifecycleStages } from '../lifecycle/lifecycle';
import { ILogService } from '../log/log.service';
import { PluginHolder } from './plugin-holder';
import type { Plugin, PluginCtor } from './plugin';

const INIT_LAZY_PLUGINS_TIMEOUT = 200;

/**
 * This service manages plugin registration.
 */
export class PluginService extends PluginHolder {
    private _pluginHoldersForTypes = new Map<UnitType, PluginHolder>();

    constructor(
    @ILogService _logService: ILogService,
        @Inject(Injector) _injector: Injector,
        @Inject(LifecycleService) _lifecycleService: LifecycleService,
        @Inject(LifecycleInitializerService) _lifecycleInitializerService: LifecycleInitializerService
    ) {
        super(_logService, _injector, _lifecycleService, _lifecycleInitializerService);
    }

    override dispose(): void {
        this._clearFlushLazyPluginsTimer();

        // Dispose all plugin holders including self.
        super.dispose();
        for (const holder of this._pluginHoldersForTypes.values()) {
            holder.dispose();
        }
    }

    /** Register a plugin into univer. */
    registerPlugin<T extends PluginCtor<Plugin>>(plugin: T, config?: ConstructorParameters<T>[0]): void {
        this._assertPluginValid(plugin);

        const { type } = plugin;
        if (type === UniverInstanceType.UNIVER) {
            return this._registerPlugin(plugin, config);
        }

        // If it's type is for specific document, we should run them at specific time.
        const holder = this._ensurePluginHolderForType(type);
        holder._registerPlugin(plugin, config);
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

    override _registerPlugin<T extends PluginCtor<Plugin>>(pluginCtor: T, options?: ConstructorParameters<T>[0]): void {
        const { pluginName } = pluginCtor;
        if (this._pluginRegistered.has(pluginName)) {
            this._logService.warn('[PluginService]', `plugin ${pluginName} has already been registered. This registration will be ignored.`);
            return;
        }

        this._pluginRegistered.add(pluginName);

        if (this._started) {
            this._pluginRegistry.registerPlugin(pluginCtor, options);

            // If Univer has already started, we should manually call onStarting for the plugin.
            // We do that in an asynchronous way, because user may lazy load several plugins at the same time.
            return this._scheduleInitPluginAfterStarted();
        } else {
            // For plugins at Univer level. Plugins would be initialized immediately so they can register dependencies.
            const pluginInstance: Plugin = this._injector.createInstance(pluginCtor, options);
            this._pluginStore.addPlugin(pluginInstance);
            this._pluginsRunLifecycle([pluginInstance], LifecycleStages.Starting);
        }
    }

    _ensurePluginHolderForType(type: UnitType): PluginHolder {
        if (!this._pluginHoldersForTypes.has(type)) {
            const pluginHolder = this._injector.createInstance(PluginHolder);
            this._pluginHoldersForTypes.set(type, pluginHolder);
            return pluginHolder;
        }

        return this._pluginHoldersForTypes.get(type)!;
    }

    private _initLazyPluginsTimer?: number;
    private _scheduleInitPluginAfterStarted() {
        if (this._initLazyPluginsTimer === undefined) {
            this._initLazyPluginsTimer = setTimeout(
                () => this._flushLazyPlugins(),
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
        this._flush();

        for (const [_, holder] of this._pluginHoldersForTypes) {
            holder._flush();
        }
    }
}
