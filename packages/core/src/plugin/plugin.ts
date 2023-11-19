import { Ctor, Injector } from '@wendellhu/redi';

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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    plugin: typeof Plugin;
    options: any;
}

/**
 * Store plugin instances.
 */
export class PluginStore {
    private readonly plugins: Plugin[] = [];

    addPlugin(plugin: Plugin): void {
        this.plugins.push(plugin);
    }

    removePlugins(): Plugin[] {
        const plugins = this.plugins.slice();
        this.plugins.length = 0;
        return plugins;
    }

    forEachPlugin(callback: (plugin: Plugin) => void): void {
        this.plugins.forEach(callback);
    }
}

/**
 * Store plugin registry items.
 */
export class PluginRegistry {
    private readonly pluginsRegisteredByBusiness = new Map<PluginType, [IPluginRegistryItem]>();

    registerPlugin(pluginCtor: PluginCtor<any>, options: any) {
        const type = pluginCtor.type;
        if (!this.pluginsRegisteredByBusiness.has(type)) {
            this.pluginsRegisteredByBusiness.set(type, [] as unknown[] as [IPluginRegistryItem]);
        }

        this.pluginsRegisteredByBusiness.get(type)!.push({ plugin: pluginCtor, options });
    }

    getRegisterPlugins(type: PluginType): [IPluginRegistryItem] {
        return this.pluginsRegisteredByBusiness.get(type) || ([] as unknown[] as [IPluginRegistryItem]);
    }
}
