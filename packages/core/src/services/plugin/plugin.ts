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

import type { Ctor, Injector } from '../../common/di';
import { UniverInstanceType } from '../../common/unit';
import { Disposable } from '../../shared';

export const DependentOnSymbol = Symbol('DependentOn');

export type PluginCtor<T extends Plugin = Plugin> = Ctor<T> & {
    type: UniverInstanceType;
    pluginName: string;
    [DependentOnSymbol]?: PluginCtor[];
};

/**
 * Plug-in base class, all plug-ins must inherit from this base class. Provide basic methods.
 */
export abstract class Plugin extends Disposable {
    static pluginName: string;

    static type: UniverInstanceType = UniverInstanceType.UNIVER_UNKNOWN;

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

    getUniverInstanceType(): UniverInstanceType {
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
 * Store plugin registry items.
 */
export class PluginRegistry {
    private _pluginsRegistered: IPluginRegistryItem[] = [];

    // eslint-disable-next-line ts/no-explicit-any
    registerPlugin(pluginCtor: PluginCtor<any>, options: any) {
        this._pluginsRegistered.push({ plugin: pluginCtor, options });
    }

    getRegisterPlugins(): IPluginRegistryItem[] {
        return this._pluginsRegistered.slice();
    }

    removePlugins(): void {
        this._pluginsRegistered = [];
    }
}
