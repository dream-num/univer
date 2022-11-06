import { BasePlugin } from './Plugin';
import { Nullable } from '../Shared';
import { ContextBase } from '../Basics/ContextBase';

/**
 * Provides APIs to initialize, install, and uninstall plugins
 */
export class PluginManager {
    protected _context: ContextBase;

    protected _plugins: BasePlugin[];

    protected _initialized: boolean;

    protected _initialize() {
        if (this._initialized) {
            this._initialized = false;
            this._plugins.forEach((plugin: BasePlugin) => {
                plugin.onCreate(this._context);
                plugin.onMounted(this._context);
            });
        }
    }

    constructor(context: ContextBase, plugins: BasePlugin[] = []) {
        this._context = context;
        this._plugins = [];
        this._initialized = true;
        this._plugins = this._plugins.concat(plugins);
        this._initialize();
    }

    install(plugin: BasePlugin) {
        const { _plugins } = this;
        _plugins.push(plugin);
        plugin.onCreate(this._context);
        plugin.onMounted(this._context);
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

    setContext(context: ContextBase) {
        this._context = context;
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
}
