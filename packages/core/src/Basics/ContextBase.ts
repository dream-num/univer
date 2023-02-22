import { CommandManager, UndoManager } from '../Command';
import { ObservableHooks, ObserverManager } from '../Observer';
import { HooksManager } from '../Observer/HooksManager';
import { Univer } from './Univer';
import { PluginManager } from '../Plugin';
import { Nullable } from '../Shared';
import { Environment } from './Environment';

/**
 * Core context, mount important instances, managers
 */
export abstract class ContextBase {
    protected _commandManager: CommandManager;

    protected _pluginManager: PluginManager;

    protected _environment: Environment;

    protected _hooksManager: HooksManager;

    protected _undoManager: UndoManager;

    protected _observerManager: ObserverManager;

    protected _univer: Univer;

    constructor() {
        this._hooksManager = new HooksManager();
        this._pluginManager = new PluginManager(this);
        this._environment = new Environment();
        this._observerManager = new ObserverManager();
        this._initialize();
    }

    onUniver(univer: Univer): void {
        const glboalContext = univer.getGlobalContext();
        this._univer = univer;
        this._undoManager = glboalContext.getUndoManager();
        this._commandManager = glboalContext.getCommandManager();
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

    protected _initialize(): void {
        this._undoManager = new UndoManager();
        this._commandManager = new CommandManager(this);
    }

    protected abstract _setObserver(): void;
}
