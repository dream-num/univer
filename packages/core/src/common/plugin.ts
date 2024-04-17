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

export type PluginCtor<T extends Plugin> = Ctor<T> & { type: PluginType };

/** Plugin types for different kinds of business. */
export enum PluginType {
    Univer,
    Doc,
    Sheet,
    Slide,
}

/**
 * Plug-in base class, all plug-ins must inherit from this base class. Provide basic methods.
 */
export abstract class Plugin {
    static type: PluginType = PluginType.Univer;

    protected abstract _injector: Injector;

    private _name: string;

    protected constructor(name: string) {
        this._name = name;
    }

    onStarting(injector: Injector): void {}

    onReady(): void {}

    onRendered(): void {}

    onSteady(): void {}

    onDestroy(): void {}

    getPluginName(): string {
        return this._name;
    }
}

interface IPluginRegistryItem {
    plugin: PluginCtor<Plugin>;
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
 * Store plugin registry items.
 */
export class PluginRegistry {
    private readonly _pluginsRegisteredByBusiness = new Map<PluginType, [IPluginRegistryItem]>();

    registerPlugin(pluginCtor: PluginCtor<any>, options: any) {
        const type = pluginCtor.type;
        if (!this._pluginsRegisteredByBusiness.has(type)) {
            this._pluginsRegisteredByBusiness.set(type, [] as unknown[] as [IPluginRegistryItem]);
        }

        this._pluginsRegisteredByBusiness.get(type)!.push({ plugin: pluginCtor, options });
    }

    getRegisterPlugins(type: PluginType): [IPluginRegistryItem] {
        return this._pluginsRegisteredByBusiness.get(type) || ([] as unknown[] as [IPluginRegistryItem]);
    }

    clearPluginsOfType(type: PluginType): void {
        this._pluginsRegisteredByBusiness.delete(type);
    }
}
