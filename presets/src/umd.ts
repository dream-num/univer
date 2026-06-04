import type { DependencyOverride, IUniverConfig, Plugin, PluginCtor } from '@univerjs/core';
import { IAuthzIoService, IMentionIOService, IUndoRedoService, LogLevel, Univer } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';

export * from '@univerjs/core/facade';

/**
 * A collection of plugins and their default configs.
 */
interface IPreset {
    plugins: Array<PluginCtor<Plugin> | [PluginCtor<Plugin>, ConstructorParameters<PluginCtor<Plugin>>[0]]>;
}

interface IPresetOptions {
    lazy?: boolean;
}

type CreateUniverOptions = Partial<IUniverConfig> & {
    presets: Array<IPreset | [IPreset, IPresetOptions]>;
    plugins?: Array<PluginCtor<Plugin> | [PluginCtor<Plugin>, ConstructorParameters<PluginCtor<Plugin>>[0]]>;
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
