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

import type { DependencyOverride, IUniverConfig, Plugin, PluginCtor } from '@univerjs/core';
import { IAuthzIoService, IMentionIOService, IUndoRedoService, LogLevel, Univer } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';

export * from '@univerjs/core/facade';

/**
 * A collection of plugins and their default configs.
 */
export type IPresetPlugin = PluginCtor<Plugin> | [PluginCtor<Plugin>, ConstructorParameters<PluginCtor<Plugin>>[0]];

export interface IPreset {
    plugins: IPresetPlugin[];
    locales?: IUniverConfig['locales'];
}

export interface IPresetOptions {
    lazy?: boolean;
}

type CreateUniverOptions = Partial<IUniverConfig> & {
    presets: Array<IPreset | [IPreset, IPresetOptions]>;
    plugins?: IPresetPlugin[];
    /**
     * Overrides the dependencies defined in the plugin. Only dependencies that are identified by `IdentifierDecorator` can be overridden.
     * If you override a dependency with `null`, the original dependency will be removed.
     */
    override?: DependencyOverride;
    collaboration?: true;
};

export function createUniver(options: CreateUniverOptions) {
    const { presets, plugins, collaboration, override = [], ...univerOptions } = options;

    if (collaboration) {
        override.push([IUndoRedoService, null]);
        override.push([IAuthzIoService, null]);
        override.push([IMentionIOService, null]);
    }

    const univer = new Univer({
        logLevel: LogLevel.WARN,
        ...univerOptions,
        override,
    });

    const pluginsMap = new Map<string, {
        plugin: PluginCtor<Plugin>;
        options: any;
    }>();

    presets?.forEach((preset) => {
        const realPreset = Array.isArray(preset) ? preset[0] : preset;

        const { plugins } = realPreset;

        plugins.forEach((p) => {
            const [realPlugin, pluginConfig] = Array.isArray(p) ? [p[0], p[1]] : [p];

            if (pluginsMap.has(realPlugin.pluginName)) {
                pluginsMap.delete(realPlugin.pluginName);
            }

            pluginsMap.set(realPlugin.pluginName, { plugin: realPlugin, options: pluginConfig });
        });
    });

    plugins?.forEach((plugin) => {
        const [realPlugin, pluginConfig] = Array.isArray(plugin) ? [plugin[0], plugin[1]] : [plugin];

        if (pluginsMap.has(realPlugin.pluginName)) {
            throw new Error(`Plugin ${realPlugin.pluginName} already registered by presets or other ways! Repeated registration may cause potential problems, please check your code.`);
        }

        pluginsMap.set(realPlugin.pluginName, { plugin: realPlugin, options: pluginConfig });
    });

    pluginsMap.forEach(({ plugin, options }) => {
        univer.registerPlugin(plugin, options);
    });

    // Finally we wrap all plugins into a Facade API to make it for convenient usage.
    const univerAPI = FUniver.newAPI(univer);
    return {
        univer,
        univerAPI,
    };
}
