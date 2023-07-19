import { ContextBase } from '../Basics/ContextBase';
import { Context } from '../Basics/Context';
import { Observable } from '../Observer';
import { Locale, Nullable, PropsFrom } from '../Shared';
import { Univer } from '../Basics';

/**
 * Basics function of plugin
 */
export interface BasePlugin {
    context: ContextBase;
    getContext(): ContextBase;
    getGlobalContext(): Context;
    getLocale(): Locale;
    getPluginName(): string;
    onCreate(context: ContextBase): void;
    onMounted(context: ContextBase): void;
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
 * Plug-in base class, all plug-ins must inherit from this base class. provides the basic method
 */
export abstract class Plugin<Obs = any, O extends ContextBase = ContextBase> implements BasePlugin {
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
