import { Nullable } from '../Shared/Types';
import { BasePlugin } from './Plugin';

/**
 * Provides APIs to initialize, install, and uninstall plugins
 */
export class PluginManager {
    protected _plugins: BasePlugin[];

    protected _initialized: boolean;

    constructor(plugins: BasePlugin[] = []) {
        this._plugins = [];
        this._initialized = true;
        this._plugins = this._plugins.concat(plugins);
        this._initialize();
    }

    install(plugin: BasePlugin) {
        const { _plugins } = this;
        _plugins.push(plugin);
        plugin.onMounted();
    }

    uninstall(name: string) {
        const { _plugins } = this;
        const index = _plugins.findIndex((item) => item.getPluginName() === name);
        if (index > -1) {
            const plugin = _plugins.splice(index, 1)[0];
            if (plugin) {
                plugin.onDestroy();
            }
        }
    }

    getRequirePluginByName<T extends BasePlugin>(pluginName: string): T {
        for (let i = 0; i < this._plugins.length; i++) {
            if (this._plugins[i].getPluginName() === pluginName) {
                return this._plugins[i] as T;
            }
        }

        throw new Error(`not found plugin ${pluginName}`);
    }

    getPlugins(): BasePlugin[] {
        return this._plugins;
    }

    getPluginByName<T extends BasePlugin>(pluginName: string): Nullable<T> {
        for (let i = 0; i < this._plugins.length; i++) {
            if (this._plugins[i].getPluginName() === pluginName) {
                return this._plugins[i] as T;
            }
        }
        return null;
    }

    protected _initialize() {
        if (this._initialized) {
            this._initialized = false;
            this._plugins.forEach((plugin: BasePlugin) => {});
        }
    }
}
