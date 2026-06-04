import type { IUniverConfig, Plugin, PluginCtor } from '@univerjs/core';

/**
 * A collection of plugins and their default configs.
 */
export interface IPreset {
    plugins: Array<PluginCtor<Plugin> | [PluginCtor<Plugin>, ConstructorParameters<PluginCtor<Plugin>>[0]]>;
    locales?: IUniverConfig['locales'];
}

export interface IPresetOptions {
    lazy?: boolean;
}
