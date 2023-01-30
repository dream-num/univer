import { Observable, ObserverManager, Plugin } from '@univerjs/core';

export type DragObserver = {
    onKeyDownObservable: Observable<DragEvent>;
};

export class DragManager {
    private _observerManager: ObserverManager;

    constructor(private _plugin: Plugin) {
        this._observerManager = this._plugin.getContext().getObserverManager();
        this._installObserver();
    }

    private _installObserver() {
        // Drag
        this._observerManager.addObserver('onDropObservable', 'core', new Observable());
    }

    /**
     * init Drag listener
     *
     * add to docs/slides/
     */
    handleDragAction(element: HTMLElement) {
        const DropEvent = (evt: DragEvent) => {
            evt.preventDefault();
            this._observerManager.requiredObserver<DragEvent>('onDropObservable', 'core')?.notifyObservers(evt);
        };

        const DragOverEvent = (evt: DragEvent) => {
            evt.preventDefault();
        };

        element.addEventListener('drop', DropEvent);
        element.addEventListener('dragover', DragOverEvent);
    }
}
