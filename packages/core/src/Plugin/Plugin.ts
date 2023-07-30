import { Ctor } from '@wendellhu/redi';
import { ContextBase } from '../Basics/ContextBase';

import { Context } from '../Basics/Context';
import { Observable } from '../Observer';
import { Locale, Nullable, PropsFrom } from '../Shared';
import { Univer } from '../Basics';

export type PluginCtor<T> = Ctor<T> & { type: PluginType };

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
    context: ContextBase;
    getContext(): ContextBase;
    getGlobalContext(): Context;
    getLocale(): Locale;
    getPluginName(): string;

    /**
     * Could register dependencies at this lifecycle stage.
     */
    onCreate(context: ContextBase): void;

    /**
     * Could setup initialization works at this lifecycle stage.
     */
    onMounted(context: ContextBase): void;

    /**
     * Could do some initialization works at this lifecycle stage.
     */
    onDestroy(): void;

    deleteObserve(...names: string[]): void;
    getPluginByName<T extends BasePlugin>(name: string): Nullable<T>;
    /**
     * save data
     */
    save(): object;
    /**
     * load data
     */
    load<T>(data: T): void;
}

/**
 * Plug-in base class, all plug-ins must inherit from this base class. Provide basic methods.
 */
export abstract class Plugin<Obs = any, O extends ContextBase = ContextBase> implements BasePlugin {
    static type: PluginType;

    context: O;

    private _name: string;

    private _observeNames: Array<keyof Obs & string>;

    protected constructor(name: string) {
        this._name = name;
        this._observeNames = [];
    }

    onCreate(context: O): void {
        this.context = context;
    }

    load<T>(data: T): void {}

    save(): object {
        return Object();
    }

    onMounted(context: O): void {}

    onDestroy(): void {
        this.deleteObserve(...this._observeNames);
    }

    getPluginName(): string {
        return this._name;
    }

    getContext(): O {
        return this.context;
    }

    getGlobalContext(): Context {
        return this.context.getUniver().getGlobalContext();
    }

    getLocale(): Locale {
        return this.getGlobalContext().getLocale();
    }

    getUniver(): Univer {
        return this.context.getUniver();
    }

    getObserver<K extends keyof Obs & string>(name: K): Nullable<Observable<PropsFrom<Obs[K]>>> {
        const manager = this.context.getObserverManager();
        return manager.getObserver(name, this._name);
    }

    getPluginByName<T extends BasePlugin>(name: string): Nullable<T> {
        return this.context.getPluginManager().getPluginByName<T>(name);
    }

    pushToObserve<K extends keyof Obs & string>(...names: K[]): void {
        const manager = this.context.getObserverManager();
        names.forEach((name) => {
            if (!this._observeNames.includes(name)) {
                this._observeNames.push(name);
            }
            manager.addObserver(name, this._name, new Observable());
        });
    }

    deleteObserve<K extends keyof Obs & string>(...names: K[]): void {
        const manager = this.context.getObserverManager();
        names.forEach((name) => {
            manager.removeObserver(name, this._name);
        });
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
