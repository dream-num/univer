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

/* eslint-disable ts/no-explicit-any */

import { type Ctor, Inject, Injector } from '@wendellhu/redi';

import { LifecycleStages } from '../lifecycle/lifecycle';
import { LifecycleInitializerService, LifecycleService } from '../lifecycle/lifecycle.service';
import { Disposable } from '../../shared/lifecycle';
import { ILogService } from '../log/log.service';
import { type Plugin, type PluginCtor, PluginRegistry, PluginStore } from './plugin';

export class PluginHolder extends Disposable {
    protected _started: boolean = false;
    get started(): boolean { return this._started; }

    protected readonly _pluginRegistered = new Set<string>();
    protected readonly _pluginStore = new PluginStore();
    protected readonly _pluginRegistry = new PluginRegistry();

    constructor(
        @ILogService protected readonly _logService: ILogService,
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(LifecycleService) protected readonly _lifecycleService: LifecycleService,
        @Inject(LifecycleInitializerService) protected readonly _lifecycleInitializerService: LifecycleInitializerService
    ) {
        super();
    }

    override dispose(): void {
        super.dispose();

        this._pluginStore.forEachPlugin((plugin) => plugin.dispose());
        this._pluginStore.removePlugins();
        this._pluginRegistry.removePlugins();
        this._pluginRegistered.clear();
    }

    registerPlugin<T extends PluginCtor<Plugin>>(pluginCtor: T, config?: ConstructorParameters<T>[0]): void {
        const { pluginName } = pluginCtor;
        if (this._pluginRegistered.has(pluginName)) {
            this._logService.warn('[PluginService]', `plugin ${pluginName} has already been registered. This registration will be ignored.`);
            return;
        }

        this._pluginRegistered.add(pluginName);
        this._pluginRegistry.registerPlugin(pluginCtor, config);
    }

    start(): void {
        if (this._started) return;
        this._started = true;

        this.flush();
    }

    flush(): void {
        if (!this._started) return;

        const plugins = this._pluginRegistry.getRegisterPlugins().map(({ plugin, options }) => this._initPlugin(plugin, options));
        this._pluginRegistry.removePlugins();

        const lifecycleSubscription = this.disposeWithMe(this._lifecycleService.subscribeWithPrevious().subscribe((stage) => {
            this._pluginsRunLifecycle(plugins, stage);
            if (stage === LifecycleStages.Steady) {
                lifecycleSubscription.dispose();
            }
        }));
    }


    protected _pluginsRunLifecycle(plugins: Plugin[], lifecycle: LifecycleStages): void {
        plugins.forEach((p) => {
            switch (lifecycle) {
                case LifecycleStages.Starting:
                    p.onStarting(this._injector);
                    break;
                case LifecycleStages.Ready:
                    p.onReady();
                    break;
                case LifecycleStages.Rendered:
                    p.onRendered();
                    break;
                case LifecycleStages.Steady:
                    p.onSteady();
                    break;
            }
        });

        this._lifecycleInitializerService.initModulesOnStage(lifecycle);
    }

    protected _initPlugin<T extends Plugin>(plugin: PluginCtor<T>, options: any): Plugin {
        const pluginInstance: Plugin = this._injector.createInstance(plugin as unknown as Ctor<any>, options);
        return pluginInstance;
    }
}
