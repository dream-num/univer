import { Observable, ObserverManager, Plugin } from '@univerjs/core';

// 在sheets plugin ui import 使用初始化
export class EventManager {
    private _observerManager: ObserverManager;

    constructor(private _plugin: Plugin) {
        this._observerManager = this._plugin.getContext().getObserverManager();
        this._installObserver();
    }

    private _installObserver() {
        // Event
        this._observerManager.addObserver('onUIChangeObservable', 'core', new Observable());
        this._observerManager.addObserver('onRichTextDidMountObservable', 'core', new Observable());
        this._observerManager.addObserver('onAfterChangeUILocaleObservable', 'core', new Observable());
    }
}
