import { Observable, ObserverManager, Plugin } from '@univerjs/core';

// 在sheets plugin ui import 使用初始化
export class EventManager {
    private _observerManager: ObserverManager;

    constructor(private _plugin: Plugin) {
        this._observerManager = this._plugin.getContext().getObserverManager();
        this._installObserver();
    }

    private _installObserver() {
        // Event = > UIcHnage
        this._observerManager.addObserver('onUIChangeObservable', 'core', new Observable());
        this._observerManager.addObserver('onAfterChangeUISkinObservable', 'core', new Observable());
        this._observerManager.addObserver('onAfterChangeUILocaleObservable', 'core', new Observable());
        this._observerManager.addObserver('onViewComponentFocusChange', 'core', new Observable());

        // SheetBar
        this._observerManager.addObserver('onAddSheet', 'core', new Observable());
        this._observerManager.addObserver('onDeleteSheet', 'core', new Observable());
        this._observerManager.addObserver('onHideSheet', 'core', new Observable());
        this._observerManager.addObserver('onUnHideSheet', 'core', new Observable());
        this._observerManager.addObserver('onToLeftSheet', 'core', new Observable());
        this._observerManager.addObserver('onToRightSheet', 'core', new Observable());
        this._observerManager.addObserver('onCopySheet', 'core', new Observable());
        this._observerManager.addObserver('onRemoveSheet', 'core', new Observable());
        this._observerManager.addObserver('onSheetColor', 'core', new Observable());
    }
}
