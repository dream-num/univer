import { ObservableHooks, ObserverManager } from '../Observer';
import { HooksManager } from '../Observer/HooksManager';
import { PluginManager } from '../Plugin/PluginManager';
import { Nullable } from '../Shared/Types';
import { Environment } from './Environment';

/**
 * Core context, mount important instances, managers
 */
export abstract class ContextBase {
    protected _pluginManager: PluginManager;

    protected _environment: Environment;

    protected _hooksManager: HooksManager;

    protected _observerManager: ObserverManager;

    constructor() {
        this._hooksManager = new HooksManager();
        this._pluginManager = new PluginManager();
        this._environment = new Environment();
        this._observerManager = new ObserverManager();
    }

    getHook<T>(path: string): Nullable<ObservableHooks<T>> {
        return this._hooksManager.getHooks<T>(path);
    }

    getHooksManager(): HooksManager {
        return this._hooksManager;
    }

    getObserverManager(): ObserverManager {
        return this._observerManager;
    }

    /** @deprecated DI */
    getPluginManager(): PluginManager {
        return this._pluginManager;
    }

    protected abstract _setObserver(): void;
}
