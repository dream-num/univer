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

import { LifecycleStages } from '../services/lifecycle/lifecycle';
import { LifecycleInitializerService, LifecycleService } from '../services/lifecycle/lifecycle.service';
import { Disposable } from '../shared/lifecycle';
import { type Plugin, type PluginCtor, PluginRegistry, PluginStore } from './plugin';

export class PluginHolder extends Disposable {
    protected _started: boolean = false;

    protected readonly _univerPluginStore = new PluginStore();
    protected readonly _pluginRegistry = new PluginRegistry();

    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(LifecycleService) protected readonly _lifecycleService: LifecycleService,
        @Inject(LifecycleInitializerService) protected readonly _lifecycleInitializerService: LifecycleInitializerService
    ) {
        super();
    }

    _registerPlugin<T extends PluginCtor<Plugin>>(pluginCtor: T, config?: ConstructorParameters<T>[0]): void {
        this._pluginRegistry.registerPlugin(pluginCtor, config);
    }

    _start(): void {
        if (this._started) return;
        this._started = true;

        this._flush();
    }

    _flush(): void {
        if (!this._started) return;

        const plugins = this._pluginRegistry.getRegisterPlugins().map(({ plugin, options }) => this._initPlugin(plugin, options));
        this._pluginRegistry.clearPlugins();

        this.disposeWithMe(this._lifecycleService.subscribeWithPrevious().subscribe((stage) => {
            this._pluginsRunLifecycle(plugins, stage);
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
