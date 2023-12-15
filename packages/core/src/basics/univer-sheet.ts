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

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Ctor, Dependency, IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import type { Plugin, PluginCtor } from '../plugin/plugin';
import { PluginStore } from '../plugin/plugin';
import { LifecycleStages } from '../services/lifecycle/lifecycle';
import { LifecycleInitializerService, LifecycleService } from '../services/lifecycle/lifecycle.service';
import { Disposable, toDisposable } from '../shared/lifecycle';
import { Workbook } from '../sheets/workbook';
import type { IWorkbookData } from '../types/interfaces/i-workbook-data';

/**
 * Externally provided UniverSheet root instance
 */
export class UniverSheet extends Disposable implements IDisposable {
    /** This store stores plugins that are register before `UniverSheet` starts. */
    private readonly _preRegisteredPluginStore = new PluginStore();

    /** If `UniverSheet` has get started. */
    private _started: boolean = false;

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LifecycleService) private readonly _lifecycleService: LifecycleService,
        @Inject(LifecycleInitializerService) private readonly _lifecycleInitializerService: LifecycleInitializerService
    ) {
        super();

        this._initDependencies(_injector);
    }

    createSheet(workbookConfig: Partial<IWorkbookData>): Workbook {
        const workbook = this._injector.createInstance(Workbook, workbookConfig);
        return workbook;
    }

    override dispose(): void {
        super.dispose();

        this._preRegisteredPluginStore.removePlugins();
    }

    addPlugins(plugins: Array<[PluginCtor<any>, any]>): void {
        if (!this._started) {
            const pluginInstances = plugins.map(([plugin, options]) => this._initPlugin(plugin, options));
            this._takePluginsThroughLifecycle(pluginInstances);
            this._started = true;
        } else {
            const lazyPlugins = plugins.map(([plugin, options]) => this._initPlugin(plugin, options));
            this._pluginsRunLifecycle(lazyPlugins, LifecycleStages.Starting);
            setTimeout(() => this._takePluginsThroughLifecycle(lazyPlugins));
        }
    }

    private _initPlugin<T extends Plugin>(plugin: PluginCtor<T>, options: any): Plugin {
        const pluginInstance: Plugin = this._injector.createInstance(plugin as unknown as Ctor<any>, options);
        return pluginInstance;
    }

    private _takePluginsThroughLifecycle(plugins: Plugin[], skipStarting = false): void {
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

    private _pluginsRunLifecycle(plugins: Plugin[], lifecycle: LifecycleStages): void {
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

    private _initDependencies(injector: Injector): void {
        const dependencies: Dependency[] = [];
        dependencies.forEach((d) => injector.add(d));
    }
}
