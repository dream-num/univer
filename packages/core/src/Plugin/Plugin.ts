import { Ctor, Injector } from '@wendellhu/redi';

import { Observable, ObserverManager } from '../Observer';
import { Nullable } from '../Shared';

export type PluginCtor<T extends Plugin> = Ctor<T> & { type: PluginType };

/** Plugin types for different kinds of business. */
export enum PluginType {
    Univer,
    Doc,
    Sheet,
    Slide,
}

/**
 * Basics function of plugin
 */
export interface BasePlugin {
    getPluginName(): string;

    /**
     * Could setup initialization works at this lifecycle stage.
     */
    onMounted(): void;

    /**
     * Could do some initialization works at this lifecycle stage.
     */
    onDestroy(): void;

    getPluginByName<T extends BasePlugin>(name: string): Nullable<T>;
}

/**
 * Plug-in base class, all plug-ins must inherit from this base class. Provide basic methods.
 */
export abstract class Plugin<Obs = any> implements BasePlugin {
    static type: PluginType;

    _injector: Injector;

    private _name: string;

    private _observeNames: Array<keyof Obs & string>;

    protected constructor(name: string) {
        this._name = name;
        this._observeNames = [];
    }

    /** @deprecated this plugin will be removed */
    getPluginByName<T extends BasePlugin>(name: string): Nullable<T> {
        throw new Error('Method not implemented.');
    }

    onMounted(): void {}

    onDestroy(): void {
        this.deleteObserve(...this._observeNames);
    }

    getPluginName(): string {
        return this._name;
    }

    // TODO@huwenzhao: remove this in the future
    /** @deprecated */
    pushToObserve<K extends keyof Obs & string>(...names: K[]): void {
        const manager = (this._injector as Injector).get(ObserverManager);
        names.forEach((name) => {
            if (!this._observeNames.includes(name)) {
                this._observeNames.push(name);
            }
            manager.addObserver(name, this._name, new Observable());
        });
    }

    /** @deprecated */
    deleteObserve<K extends keyof Obs & string>(...names: K[]): void {}
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
