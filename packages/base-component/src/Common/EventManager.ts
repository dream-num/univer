import { Observable, ObserverManager, Plugin } from '@univerjs/core';

export class EventManager {
    private _observerManager: ObserverManager;

    constructor(private _plugin: Plugin) {
        this._observerManager = this._plugin.getContext().getObserverManager();
        this._installObserver();
    }

    private _installObserver() {
        // Event
        this._observerManager.addObserver('onToolBarChangeObservable', 'core', new Observable());
    }
}
