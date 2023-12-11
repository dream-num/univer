/**
 * Copyright 2023 DreamNum Inc.
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
    private readonly _pluginStore = new PluginStore();

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LifecycleInitializerService) private readonly _initService: LifecycleInitializerService
    ) {
        super();

        this._initDependencies(_injector);
    }

    start(): void {
        this._pluginStore.forEachPlugin((p) => p.onStarting(this._injector));
        this._initService.initModulesOnStage(LifecycleStages.Starting);
    }

    ready(): void {
        this.disposeWithMe(
            toDisposable(
                this._injector
                    .get(LifecycleService)
                    .subscribeWithPrevious()
                    .subscribe((stage) => {
                        if (stage === LifecycleStages.Ready) {
                            this._pluginStore.forEachPlugin((p) => p.onReady());
                            this._initService.initModulesOnStage(LifecycleStages.Ready);
                            return;
                        }

                        if (stage === LifecycleStages.Rendered) {
                            this._pluginStore.forEachPlugin((p) => p.onRendered());
                            this._initService.initModulesOnStage(LifecycleStages.Rendered);
                            return;
                        }

                        if (stage === LifecycleStages.Steady) {
                            this._pluginStore.forEachPlugin((p) => p.onSteady());
                            this._initService.initModulesOnStage(LifecycleStages.Steady);
                        }
                    })
            )
        );
    }

    createSheet(workbookConfig: Partial<IWorkbookData>): Workbook {
        const workbook = this._injector.createInstance(Workbook, workbookConfig);
        return workbook;
    }

    override dispose(): void {
        super.dispose();

        this._pluginStore.removePlugins();
    }

    /**
     * Add a plugin into UniverSheet. UniverSheet should add dependencies exposed from this plugin to its DI system.
     *
     * @param plugin constructor of the plugin class
     * @param options options to this plugin
     *
     * @internal
     */
    addPlugin<T extends Plugin>(plugin: PluginCtor<T>, options: any): void {
        const pluginInstance: Plugin = this._injector.createInstance(plugin as unknown as Ctor<any>, options);
        this._pluginStore.addPlugin(pluginInstance);
    }

    private _initDependencies(injector: Injector): void {
        const dependencies: Dependency[] = [];
        dependencies.forEach((d) => injector.add(d));
    }
}
