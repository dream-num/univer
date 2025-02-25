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

import type { Ctor, IDisposable } from '../../common/di';
import type { UnitType } from '../../common/unit';
import { skip } from 'rxjs';
import { Inject, Injector } from '../../common/di';
import { UniverInstanceType } from '../../common/unit';
import { Disposable } from '../../shared/lifecycle';
import { LifecycleStages } from '../lifecycle/lifecycle';
import { getLifecycleStagesAndBefore, LifecycleService } from '../lifecycle/lifecycle.service';
import { ILogService } from '../log/log.service';

const INIT_LAZY_PLUGINS_TIMEOUT = 4;

export const DependentOnSymbol = Symbol('DependentOn');

export type PluginCtor<T extends Plugin = Plugin> = Ctor<T> & {
    type: UnitType;
    pluginName: string;
    [DependentOnSymbol]?: PluginCtor[];
};

/**
 * Plug-in base class, all plug-ins must inherit from this base class. Provide basic methods.
 */
export abstract class Plugin extends Disposable {
    static pluginName: string;

    static type: UnitType = UniverInstanceType.UNIVER_UNKNOWN;

    protected abstract _injector: Injector;

    onStarting(): void {
        // empty
    }

    onReady(): void {
        // empty
    }

    onRendered(): void {
        // empty
    }

    onSteady(): void {
        // empty
    }

    getUnitType(): UnitType {
        return (this.constructor as typeof Plugin).type;
    }

    getPluginName(): string {
        return (this.constructor as typeof Plugin).pluginName;
    }
}

interface IPluginRegistryItem {
    plugin: PluginCtor<Plugin>;
    // eslint-disable-next-line ts/no-explicit-any
    options: any;
}

/**
 * Store plugin instances.
 */
export class PluginStore {
    private readonly _plugins: Plugin[] = [];

    addPlugin(plugin: Plugin): void {
        this._plugins.push(plugin);
    }

    removePlugins(): Plugin[] {
        const plugins = this._plugins.slice();
        this._plugins.length = 0;
        return plugins;
    }

    forEachPlugin(callback: (plugin: Plugin) => void): void {
        this._plugins.forEach(callback);
    }
}

/**
 * Use this decorator to declare dependencies among plugins. If a dependent plugin is not registered yet,
 * Univer will automatically register it with no configuration.
 *
 * For example:
 *
 * ```ts
 * ⁣@DependentOn(UniverDrawingPlugin, UniverDrawingUIPlugin, UniverSheetsDrawingPlugin)
 * export class UniverSheetsDrawingUIPlugin extends Plugin {
 * }
 * ```
 */
export function DependentOn(...plugins: PluginCtor<Plugin>[]) {
    return function (target: PluginCtor<Plugin>) {
        target[DependentOnSymbol] = plugins;
    };
}

/**
 * This service manages plugin registration.
 */
export class PluginService implements IDisposable {
    private _pluginRegistry = new Map<string, IPluginRegistryItem>();
    private readonly _pluginStore = new PluginStore();

    private readonly _seenPlugins = new Set<string>();
    private readonly _loadedPlugins = new Set<string>();

    private readonly _loadedPluginTypes = new Set<UnitType>([UniverInstanceType.UNIVER_UNKNOWN]);

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LifecycleService) private readonly _lifecycleService: LifecycleService,
        @ILogService private readonly _logService: ILogService
    ) { }

    dispose(): void {
        this._pluginStore.removePlugins().forEach((p) => p.dispose());
        this._flushTimerByType.forEach((timer) => clearTimeout(timer));
    }

    /**
     * Register a plugin into univer.
     * @param {PluginCtor} ctor The plugin's constructor.
     * @param {ConstructorParameters} [config] The configuration for the plugin.
     */
    registerPlugin<T extends PluginCtor>(ctor: T, config?: ConstructorParameters<T>[0]): void {
        this._assertPluginValid(ctor);

        const item = { plugin: ctor, options: config };
        this._pluginRegistry.set(ctor.pluginName, item);

        this._logService.debug('[PluginService]', `Plugin "${ctor.pluginName}" registered.`);

        const { type } = ctor;
        if (this._loadedPluginTypes.has(type)) {
            if (type === UniverInstanceType.UNIVER_UNKNOWN) {
                this._loadFromPlugins([item]);
            } else {
                this._flushType(type);
            }
        }
    }

    startPluginsForType(type: UnitType): void {
        if (this._loadedPluginTypes.has(type)) {
            return;
        }

        this._loadPluginsForType(type);
    }

    private _loadPluginsForType(type: UnitType): void {
        const keys = Array.from(this._pluginRegistry.keys());
        const allPluginsOfThisType: IPluginRegistryItem[] = [];
        keys.forEach((key) => {
            const item = this._pluginRegistry.get(key)!;
            if (item.plugin.type === type) {
                allPluginsOfThisType.push(item);
            }
        });

        this._loadFromPlugins(allPluginsOfThisType);
        this._loadedPluginTypes.add(type);
    }

    private _assertPluginValid(ctor: PluginCtor<Plugin>): void {
        const { type, pluginName } = ctor;

        if (type === UniverInstanceType.UNRECOGNIZED) {
            throw new Error(`[PluginService]: invalid plugin type for ${ctor.name}. Please assign a "type" to your plugin.`);
        }

        if (!pluginName) {
            throw new Error(`[PluginService]: no plugin name for ${ctor.name}. Please assign a "pluginName" to your plugin.`);
        }

        if (this._seenPlugins.has(pluginName)) {
            throw new Error(`[PluginService]: duplicated plugin name for "${pluginName}". Maybe a plugin that dependents on "${pluginName} has already registered it. In that case please register "${pluginName}" before the that plugin.`);
        }

        this._seenPlugins.add(ctor.pluginName);
    }

    private _flushTimerByType = new Map<UnitType, number>();
    private _flushType(type: UnitType): void {
        if (this._flushTimerByType.get(type) === undefined) {
            this._flushTimerByType.set(type, setTimeout(() => {
                this._loadPluginsForType(type);
                this._flushTimerByType.delete(type);
            }, INIT_LAZY_PLUGINS_TIMEOUT) as unknown as number);
        }
    }

    private _loadFromPlugins(plugins: IPluginRegistryItem[]): void {
        const finalPlugins: IPluginRegistryItem[] = [];

        // We do a topological sort here to make sure that plugins with dependencies are registered first.
        const visited = new Set<string>();
        const dfs = (item: IPluginRegistryItem) => {
            const { plugin } = item;
            const { pluginName } = plugin;

            // See if the plugin has already been loaded or visited.
            if (this._loadedPlugins.has(pluginName) || visited.has(pluginName)) {
                return;
            }

            // Mark it self as visited.
            visited.add(pluginName);

            // We do not need to load it again because it will be loaded in this `_loadFromPlugins`.
            this._pluginRegistry.delete(pluginName);

            const dependents = plugin[DependentOnSymbol];
            if (dependents) {
                // Loop over its dependencies.
                dependents.forEach((d) => {
                    // If the dependency is among those who are already registered, we should push it to the queue.
                    const dItem = this._pluginRegistry.get(d.pluginName);
                    if (dItem) {
                        dfs(dItem);
                    } else if (!this._seenPlugins.has(d.pluginName) && !visited.has(d.pluginName)) {
                        // Otherwise, it maybe a plugin that is not registered yet.
                        if (plugin.type === UniverInstanceType.UNIVER_UNKNOWN && d.type !== UniverInstanceType.UNIVER_UNKNOWN) {
                            throw new Error('[PluginService]: cannot register a plugin with Univer type that depends on a plugin with other type. '
                                + `The dependent is ${plugin.pluginName} and the dependency is ${d.pluginName}.`
                            );
                        }

                        if (plugin.type !== d.type && d.type !== UniverInstanceType.UNIVER_UNKNOWN) {
                            this._logService.debug(
                                '[PluginService]',
                                `Plugin "${pluginName}" depends on "${d.pluginName}" which has different type.`
                            );
                        }

                        this._logService.debug(
                            '[PluginService]',
                            `Plugin "${pluginName}" depends on "${d.pluginName}" which is not registered. Univer will automatically register it with default configuration.`
                        );

                        this._assertPluginValid(d);
                        dfs({ plugin: d, options: undefined });
                    }
                });
            }

            finalPlugins.push(item);
        };

        plugins.forEach((p) => dfs(p));

        const pluginInstances = finalPlugins.map((p) => this._initPlugin(p.plugin, p.options));
        this._pluginsRunLifecycle(pluginInstances);
    }

    protected _pluginsRunLifecycle(plugins: Plugin[]): void {
        // Let plugins go through already reached lifecycle stages.
        const currentStage = this._lifecycleService.stage;
        getLifecycleStagesAndBefore(currentStage).subscribe((stage) => this._runStage(plugins, stage));

        if (currentStage !== LifecycleStages.Steady) {
            const subscription = this._lifecycleService.lifecycle$.pipe(
                skip(1)
            ).subscribe((stage) => {
                this._runStage(plugins, stage);
                if (stage === LifecycleStages.Steady) {
                    subscription.unsubscribe();
                }
            });
        }
    }

    private _runStage(plugins: Plugin[], stage: LifecycleStages): void {
        plugins.forEach((p) => {
            switch (stage) {
                case LifecycleStages.Starting:
                    p.onStarting();
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
    }

    private _initPlugin<T extends Plugin>(plugin: PluginCtor<T>, options: any): Plugin {
        // eslint-disable-next-line ts/no-explicit-any
        const pluginInstance: Plugin = this._injector.createInstance(plugin as unknown as Ctor<any>, options);
        this._pluginStore.addPlugin(pluginInstance);
        this._loadedPlugins.add(plugin.pluginName);

        this._logService.debug('[PluginService]', `Plugin "${pluginInstance.getPluginName()}" loaded.`);
        return pluginInstance;
    }
}
