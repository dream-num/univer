import { CommandManager, UndoManager } from '../Command';
import { ObservableHooks, ObserverManager } from '../Observer';
import { HooksManager } from '../Observer/HooksManager';
import { PluginManager } from '../Plugin';
import { Locale, Nullable } from '../Shared';
import { Environment } from './Environment';
import { Univer } from './Univer';

/**
 * Core context, mount important instances, managers
 */
export abstract class ContextBase {
    protected _commandManager: CommandManager;

    protected _environment: Environment;

    protected _hooksManager: HooksManager;

    protected _undoManager: UndoManager;

    protected _locale: Locale;

    protected _pluginManager: PluginManager;

    protected _observerManager: ObserverManager;

    protected _univer: Univer;

    protected abstract _setObserver(): void;

    constructor() {
        this._undoManager = new UndoManager();
        this._commandManager = new CommandManager(this);
        this._environment = new Environment();
        this._hooksManager = new HooksManager();
        this._locale = new Locale();
        this._pluginManager = new PluginManager(this);
        this._observerManager = new ObserverManager();
    }

    onUniver(univer: Univer): void {
        this._univer = univer;
    }

    getHook<T>(path: string): Nullable<ObservableHooks<T>> {
        return this._hooksManager.getHooks<T>(path);
    }

    getLocale(): Locale {
        return this._locale;
    }

    getHooksManager(): HooksManager {
        return this._hooksManager;
    }

    getObserverManager(): ObserverManager {
        return this._observerManager;
    }

    getPluginManager(): PluginManager {
        return this._pluginManager;
    }

    getUndoManager(): UndoManager {
        return this._undoManager;
    }

    getCommandManager(): CommandManager {
        return this._commandManager;
    }

    getUniver(): Univer {
        return this._univer;
    }
}
