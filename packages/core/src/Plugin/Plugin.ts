import { Context } from '../Basics';
import { Inject, IOCContainer } from '../IOC';
import { Observable } from '../Observer';
import { Nullable, PropsFrom } from '../Shared';

/**
 * Basic function of plugin
 */
export interface BasePlugin {
    getContext(): Context;
    getPluginName(): string;
    onMounted(context: Context): void;
    /**
     * mapping
     *
     * @param container - IOC container dependency injection
     * @public
     */
    onMapping(container: IOCContainer): void;
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
export abstract class Plugin<Obs = any> implements BasePlugin {
    @Inject('Context')
    private _context: Context;

    private _name: string;

    private _observeNames: Array<keyof Obs & string>;

    protected constructor(name: string) {
        this._name = name;
        this._observeNames = [];
    }

    load<T>(data: T): void {}

    save(): object {
        return Object();
    }

    onMounted(context: Context): void {}

    onDestroy(): void {
        this.deleteObserve(...this._observeNames);
    }

    onMapping(ioc: IOCContainer): void {}

    getPluginName(): string {
        return this._name;
    }

    getContext(): Context {
        return this._context;
    }

    getObserver<K extends keyof Obs & string>(
        name: K
    ): Nullable<Observable<PropsFrom<Obs[K]>>> {
        const manager = this._context.getObserverManager();
        return manager.getObserver(name, this._name);
    }

    getPluginByName<T extends BasePlugin>(name: string): Nullable<T> {
        return this._context.getPluginManager().getPluginByName<T>(name);
    }

    pushToObserve<K extends keyof Obs & string>(...names: K[]): void {
        const manager = this._context.getObserverManager();
        names.forEach((name) => {
            if (!this._observeNames.includes(name)) {
                this._observeNames.push(name);
            }
            manager.addObserver(name, this._name, new Observable());
        });
    }

    deleteObserve<K extends keyof Obs & string>(...names: K[]): void {
        const manager = this._context.getObserverManager();
        names.forEach((name) => {
            manager.removeObserver(name, this._name);
        });
    }
}
