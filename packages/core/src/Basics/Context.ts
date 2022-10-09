import { CommandManager, UndoManager } from '../Command';
import { WorkBook } from '../Sheets/Domain';
import { Inject, PostConstruct } from '../IOC';
import { Observable, ObservableHooks, ObserverManager } from '../Observer';
import { HooksManager } from '../Observer/HooksManager';
import { PluginManager } from '../Plugin';
import { Locale, Nullable, PropsFrom } from '../Shared';
import { Environment } from './Environment';
import { WorkBookObserver } from './WorkBookObserver';
import { WorkBookObserverImpl } from './WorkBookObserverImpl';

/**
 * Core context, mount important instances, managers
 */
export class Context {
    @Inject('CommandManager')
    protected _commandManager: CommandManager;

    @Inject('Environment')
    protected _environment: Environment;

    @Inject('HooksManager')
    protected _hooksManager: HooksManager;

    @Inject('WorkBook')
    protected _workBook: WorkBook;

    @Inject('UndoManager')
    protected _undoManager: UndoManager;

    @Inject('Locale')
    protected _locale: Locale;

    @Inject('PluginManager')
    protected _pluginManager: PluginManager;

    @Inject('ObserverManager')
    protected _observerManager: ObserverManager;

    protected _setWorkbookObserver(): void {
        const manager = this.getObserverManager();

        new WorkBookObserverImpl().install(manager);
    }

    constructor() {
        this._hooksManager = new HooksManager();
    }

    @PostConstruct()
    initialize(): void {
        this._setWorkbookObserver();
    }

    getHook<T>(path: string): Nullable<ObservableHooks<T>> {
        return this._hooksManager.getHooks<T>(path);
    }

    getWorkBook(): WorkBook {
        return this._workBook;
    }

    getLocale(): Locale {
        return this._locale;
    }

    getContextObserver<Key extends keyof WorkBookObserver>(
        value: Key
    ): Observable<PropsFrom<WorkBookObserver[Key]>> {
        return this.getObserverManager().requiredObserver(value, 'core');
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
}

export module Context {
    export interface WithContext<T> {
        withContext(context: Context): T;
        getContext(): Context;
    }
}
