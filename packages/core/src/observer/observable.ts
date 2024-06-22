/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Observer as RxObserver, Subscription } from 'rxjs';
import { Subject } from 'rxjs';
import type { Nullable } from '../shared/types';

/**
 * A class serves as a medium between the observable and its observers
 */
export class EventState {
    /**
     * An WorkBookObserver can set this property to true to prevent subsequent observers of being notified
     */
    skipNextObservers = false;

    /**
     * This will be populated with the return value of the last function that was executed.
     * If it is the first function in the callback chain it will be the event data.
     */
    lastReturnValue?: unknown;

    isStopPropagation: boolean = false;

    stopPropagation() {
        this.isStopPropagation = true;
    }
}

interface INotifyObserversReturn {
    lastReturnValue: unknown;
    stopPropagation: boolean;
}

export function isObserver(value: any) {
    return value instanceof Observer;
}

/**
 * Represent an WorkBookObserver registered to a given Observable object.
 * The current implementation of the rendering layer is still in use.
 *
 * @deprecated use rxjs instead
 */
export class Observer<T = void> {
    dispose() {
        this.observable.remove(this);
    }

    /**
     * Creates a new observer
     * @param callback defines the callback to call when the observer is notified
     */
    constructor(
        /**
         * Defines the callback to call when the observer is notified
         */
        public callback: (eventData: T, eventState: EventState) => void,
        public observable: Observable<T>
    ) {
        // empty
    }
}

export interface IEventObserver<T> extends Partial<RxObserver<[T, EventState]>> {
    next?: (value: [T, EventState]) => unknown;

    priority?: number;
}

/**
 * This is a custom implementation of RxJS subject. It handles events on canvas elements.
 * In addition to the event, it also emits a state object that can be used to controls the
 * propagation of the event.
 *
 */
export class EventSubject<T> extends Subject<[T, EventState]> {
    private _sortedObservers: IEventObserver<T>[] = [];

    override subscribe(): Subscription {
        throw new Error('[EventSubject]: please use `subscribeEvent` instead of `subscribe` method for `EventSubject`.');
    }

    override next() {
        throw new Error('[EventSubject]: please use `emitEvent` instead of `next` method for `EventSubject`.');
    }

    override unsubscribe(): void {
        super.unsubscribe();
        this._sortedObservers.length = 0;
    }

    override complete(): void {
        super.complete();

        this._sortedObservers.length = 0;
    }

    subscribeEvent(observer: IEventObserver<T> | ((evt: T, state: EventState) => unknown)): Subscription {
        let ob: IEventObserver<T>;
        if (typeof observer === 'function') {
            ob = { next: ([evt, state]: [T, EventState]) => observer(evt, state) };
        } else {
            ob = observer;
        }

        const subscription = super.subscribe(ob);
        this._sortedObservers.push(ob);
        this._sortedObservers.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

        subscription.add(() => this._sortedObservers = this._sortedObservers.filter((o) => o !== ob));
        return subscription;
    }

    clearObservers(): void {
        this._sortedObservers.forEach((observer) => observer.complete?.());
        this._sortedObservers.length = 0;
    }

    emitEvent(event: T) {
        if (!this.closed) {
            const state = new EventState();
            state.lastReturnValue = event;

            for (const observer of this._sortedObservers) {
                const value = observer.next?.([event, state]);
                state.lastReturnValue = value;

                if (state.skipNextObservers) {
                    return {
                        lastReturnValue: state.lastReturnValue,
                        stopPropagation: state.isStopPropagation,
                    };
                }
            }

            return {
                lastReturnValue: state.lastReturnValue,
                stopPropagation: state.isStopPropagation,
            };
        }
    }
}

/**
 * The Observable class is a simple implementation of the Observable pattern.
 *
 * The current implementation of the rendering layer is still in use.
 *
 * @deprecated use rxjs instead
 *
 * @remarks
 * There's one slight particularity though: a given Observable can notify its observer using a particular mask value, only the Observers registered with this mask value will be notified.
 * This enable a more fine grained execution without having to rely on multiple different Observable objects.
 * For instance you may have a given Observable that have four different types of notifications: Move (mask = 0x01), Stop (mask = 0x02), Turn Right (mask = 0X04), Turn Left (mask = 0X08).
 * A given observer can register itself with only Move and Stop (mask = 0x03), then it will only be notified when one of these two occurs and will never be for Turn Left/Right.
 */
export class Observable<T> {
    protected _observers = new Array<Observer<T>>();

    protected _eventState: EventState;

    protected _onObserverAdded: Nullable<(observer: Observer<T>) => void> | undefined;

    /**
     * Creates a new observable
     * @param onObserverAdded defines a callback to call when a new observer is added
     */
    constructor() {
        this._eventState = new EventState();
    }

    /**
     * Gets the list of observers
     */
    get observers(): Array<Observer<T>> {
        return this._observers;
    }

    /**
     * Create a new WorkBookObserver with the specified callback
     * @param callback the callback that will be executed for that WorkBookObserver
     * @param insertFirst if true the callback will be inserted at the first position, hence executed before the others ones. If false (default behavior) the callback will be inserted at the last position, executed after all the others already present.
     * @param unregisterOnFirstCall defines if the observer as to be unregistered after the next notification
     * @returns the new observer created for the callback
     */
    add(
        callback: (eventData: T, eventState: EventState) => void,
        insertFirst = false
    ): Observer<T> {
        const observer = new Observer(callback, this);

        if (insertFirst) {
            this._observers.unshift(observer);
        } else {
            this._observers.push(observer);
        }

        if (this._onObserverAdded) {
            this._onObserverAdded(observer);
        }

        return observer;
    }

    /**
     * Remove an WorkBookObserver from the Observable object
     * @param observer the instance of the WorkBookObserver to remove
     * @returns false if it doesn't belong to this Observable
     */
    remove(observer: Nullable<Observer<T>>): boolean {
        if (!observer) {
            return false;
        }

        const index = this._observers.indexOf(observer);

        if (index !== -1) {
            this._remove(observer);
            return true;
        }

        return false;
    }

    /**
     * Notify all Observers by calling their respective callback with the given data
     * Will return true if all observers were executed, false if an observer set skipNextObservers to true, then prevent the subsequent ones to execute
     * @param eventData defines the data to send to all observers
     * @returns false if the complete observer chain was not processed (because one observer set the skipNextObservers to true)
     */
    notifyObservers(eventData: T): Nullable<INotifyObserversReturn> {
        if (!this._observers.length) {
            return null;
        }

        const state = this._eventState;
        state.skipNextObservers = false;
        state.lastReturnValue = eventData;
        state.isStopPropagation = false;
        let _isStopPropagation = false;

        for (let index = 0; index < this._observers.length; index++) {
            const obs = this._observers[index];

            state.lastReturnValue = obs.callback(eventData, state);

            if (state.isStopPropagation) {
                _isStopPropagation = true;
            }

            if (state.skipNextObservers) {
                return {
                    lastReturnValue: state.lastReturnValue,
                    stopPropagation: _isStopPropagation,
                };
            }
        }
        return {
            lastReturnValue: state.lastReturnValue,
            stopPropagation: _isStopPropagation,
        };
    }

    /**
     * Gets a boolean indicating if the observable has at least one observer
     * @returns true is the Observable has at least one WorkBookObserver registered
     */
    hasObservers(): boolean {
        return this._observers.length > 0;
    }

    /**
     * Clear the list of observers
     */
    clear(): void {
        this._observers.forEach((observer) => {
            observer.dispose();
        });
        this._observers = new Array<Observer<T>>();
        this._onObserverAdded = null;
    }

    // This should only be called when not iterating over _observers to avoid callback skipping.
    // Removes an observer from the _observer Array.
    private _remove(observer: Nullable<Observer<T>>): boolean {
        if (!observer) {
            return false;
        }

        const index = this._observers.indexOf(observer);

        if (index !== -1) {
            this._observers.splice(index, 1);
            return true;
        }

        return false;
    }
}
