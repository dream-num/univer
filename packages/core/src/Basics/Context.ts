import { CommandManager, UndoManager } from '../Command';
import { WorkBook } from '../Sheets/Domain';
import { Inject, PostConstruct } from '../IOC';
import { Observable, ObservableHooks, ObserverManager } from '../Observer';
import { HooksManager } from '../Observer/HooksManager';
import { PluginManager } from '../Plugin';
import { Locale, Nullable, PropsFrom } from '../Shared';
import { Environment } from './Environment';
import { Observer } from './Observer';

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

        manager.addObserver(
            'onAfterSetSelectionObservable',
            'core',
            new Observable()
        );

        manager.addObserver(
            'onBeforeChangeNameObservable',
            'core',
            new Observable()
        );
        manager.addObserver('onAfterChangeNameObservable', 'core', new Observable());

        manager.addObserver(
            'onBeforeChangeActiveSheetObservable',
            'core',
            new Observable()
        );
        manager.addObserver(
            'onAfterChangeActiveSheetObservable',
            'core',
            new Observable()
        );

        manager.addObserver(
            'onBeforeChangeSheetNameObservable',
            'core',
            new Observable()
        );
        manager.addObserver(
            'onAfterChangeSheetNameObservable',
            'core',
            new Observable()
        );

        manager.addObserver(
            'onBeforeInsertSheetObservable',
            'core',
            new Observable()
        );
        manager.addObserver(
            'onAfterInsertSheetObservable',
            'core',
            new Observable()
        );

        manager.addObserver(
            'onBeforeRemoveSheetObservable',
            'core',
            new Observable()
        );
        manager.addObserver(
            'onAfterRemoveSheetObservable',
            'core',
            new Observable()
        );

        manager.addObserver(
            'onBeforeChangeSheetColorObservable',
            'core',
            new Observable()
        );
        manager.addObserver(
            'onAfterChangeSheetColorObservable',
            'core',
            new Observable()
        );

        manager.addObserver(
            'onBeforeChangeSheetDataObservable',
            'core',
            new Observable()
        );
        manager.addObserver(
            'onAfterChangeSheetDataObservable',
            'core',
            new Observable()
        );

        manager.addObserver(
            'onSheetBarDidMountObservable',
            'core',
            new Observable()
        );
        manager.addObserver('onInfoBarDidMountObservable', 'core', new Observable());
        manager.addObserver(
            'onRightMenuDidMountObservable',
            'core',
            new Observable()
        );

        manager.addObserver(
            'onAfterChangeSheetScrollObservable',
            'core',
            new Observable()
        );
        manager.addObserver(
            'onAfterChangeUILocaleObservable',
            'core',
            new Observable()
        );
        manager.addObserver(
            'onSheetRenderDidMountObservable',
            'core',
            new Observable()
        );
        manager.addObserver(
            'onAfterChangeUISkinObservable',
            'core',
            new Observable()
        );
        manager.addObserver('onHideSheetObservable', 'core', new Observable());
        manager.addObserver('onShowSheetObservable', 'core', new Observable());
        manager.addObserver(
            'onSheetTabColorChangeObservable',
            'core',
            new Observable()
        );
        manager.addObserver('onSheetOrderObservable', 'core', new Observable());
        manager.addObserver('onZoomRatioSheetObservable', 'core', new Observable());
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

    getContextObserver<Key extends keyof Observer>(
        value: Key
    ): Observable<PropsFrom<Observer[Key]>> {
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
