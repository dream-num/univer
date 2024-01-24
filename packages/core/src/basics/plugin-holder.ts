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

import type { Ctor, Injector } from '@wendellhu/redi';

import type { Plugin, PluginCtor } from '../plugin/plugin';
import { LifecycleStages } from '../services/lifecycle/lifecycle';
import type { LifecycleInitializerService, LifecycleService } from '../services/lifecycle/lifecycle.service';
import { Disposable, toDisposable } from '../shared/lifecycle';

export abstract class PluginHolder extends Disposable {
    protected abstract get _lifecycleService(): LifecycleService;
    protected abstract get _lifecycleInitializerService(): LifecycleInitializerService;
    protected abstract get _injector(): Injector;

    protected _started: boolean = false;

    addPlugins(plugins: Array<[PluginCtor<any>, any]>): void {
        if (!this._started) {
            const pluginInstances = plugins.map(([plugin, options]) => this._initPlugin(plugin, options));
            this._takePluginsThroughLifecycle(pluginInstances);
            this._started = true;
        } else {
            const lazyPlugins = plugins.map(([plugin, options]) => this._initPlugin(plugin, options));
            this._pluginsRunLifecycle(lazyPlugins, LifecycleStages.Starting);

            setTimeout(() => this._takePluginsThroughLifecycle(lazyPlugins, true));
        }
    }

    protected _takePluginsThroughLifecycle(plugins: Plugin[], skipStarting = false): void {
        this.disposeWithMe(
            toDisposable(
                this._lifecycleService.subscribeWithPrevious().subscribe((stage) => {
                    if (skipStarting && stage === LifecycleStages.Starting) {
                        return;
                    }

                    this._pluginsRunLifecycle(plugins, stage);
                })
            )
        );
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
