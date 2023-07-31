import { Observable, ObserverManager } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

// export type DragObserver = {
//     onKeyDownObservable: Observable<DragEvent>;
// };

export class DragManager {
    constructor(@Inject(ObserverManager) private readonly _observerManager: ObserverManager) {
        this._installObserver();
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

    private _installObserver() {
        // Drag
        this._observerManager.addObserver('onDropObservable', 'core', new Observable());
    }
}
