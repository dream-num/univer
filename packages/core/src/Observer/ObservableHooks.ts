import { Nullable } from '../Shared';
import { EventState, Observable, Observer } from '.';

/**
 * Observable Hooks
 */
export class ObservableHooks<T> extends Observable<T> {
    /**
     * Create a new Observer with the specified callback
     * @param callback the callback that will be executed for that Observer
     * @param insertFirst if true the callback will be inserted at the first position, hence executed before the others ones. If false (default behavior) the callback will be inserted at the last position, executed after all the others already present.
     * @param unregisterOnFirstCall defines if the observer as to be unregistered after the next notification
     * @returns the new observer created for the callback
     */
    add(
        callback: (eventData: T, eventState: EventState) => void
    ): Nullable<Observer<T>> {
        if (!callback) {
            return null;
        }

        const observer = new Observer(callback);
        this._observers = [observer];

        if (this._onObserverAdded) {
            this._onObserverAdded(observer);
        }

        return observer;
    }

    makeObserverTopPriority() {
        /** cancel * */
    }

    makeObserverBottomPriority() {
        /** cancel * */
    }
}
