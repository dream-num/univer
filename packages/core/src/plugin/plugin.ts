import { Ctor, Injector } from '@wendellhu/redi';

import { Observable } from '../Observer/Observable';
import { ObserverManager } from '../Observer/ObserverManager';

export type PluginCtor<T extends Plugin> = Ctor<T> & { type: PluginType };

/** Plugin types for different kinds of business. */
export enum PluginType {
    Univer,
    Doc,
    Sheet,
    Slide,
}

<<<<<<< HEAD:packages/core/src/plugin/plugin.ts
=======
export interface IPlugin {
    getPluginName(): string;

    /**
     * Could setup initialization works at this lifecycle stage.
     */
    onMounted?(): void;

    /**
     * Could do some initialization works at this lifecycle stage.
     */
    onDestroy?(): void;
}

>>>>>>> 8e0395c1 (chore(sheet-ui): cleanup legacy UI system):packages/core/src/Plugin/Plugin.ts
/**
 * Plug-in base class, all plug-ins must inherit from this base class. Provide basic methods.
 */
export abstract class Plugin<Obs = any> {
    static type: PluginType;

    _injector: Injector;

    private _name: string;

    private _observeNames: Array<keyof Obs & string>;

    protected constructor(name: string) {
        this._name = name;
        this._observeNames = [];
    }

    onStarting(injector: Injector): void {}

    onReady(): void {}

    onRendered(): void {}

    onSteady(): void {}

    onDestroy(): void {}

    getPluginName(): string {
        return this._name;
    }

    /** @deprecated this method will be removed */
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
