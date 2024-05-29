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

import type { Nullable } from '../shared/types';

/**
 * A class serves as a medium between the observable and its observers
 */
export class EventState {
    /**
     * An WorkBookObserver can set this property to true to prevent subsequent observers of being notified
     */
    skipNextObservers: boolean | undefined;

    /**
     * This will be populated with the return value of the last function that was executed.
     * If it is the first function in the callback chain it will be the event data.
     */
    lastReturnValue?: unknown;

    isStopPropagation: boolean = false;

    /**
     * Create a new EventState
     * @param skipNextObservers defines a flag which will instruct the observable to skip following observers when set to true
     * @param target defines the original target of the state
     * @param currentTarget defines the current target of the state
     */
    constructor(skipNextObservers = false) {
        this.initialize(skipNextObservers);
    }

    /**
     * Initialize the current event state
     * @param skipNextObservers defines a flag which will instruct the observable to skip following observers when set to true
     * @param target defines the original target of the state
     * @param currentTarget defines the current target of the state
     * @returns the current event state
     */
    initialize(skipNextObservers = false): EventState {
        this.skipNextObservers = skipNextObservers;
        return this;
    }

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

/**
 * The Observable class is a simple implementation of the Observable pattern.
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
    constructor(onObserverAdded?: (observer: Observer<T>) => void) {
        this._eventState = new EventState();

        if (onObserverAdded) {
            this._onObserverAdded = onObserverAdded;
        }
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
    ): Nullable<Observer<T>> {
        if (!callback) {
            return null;
        }

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
     * Moves the observable to the top of the observer list making it get called first when notified
     * @param observer the observer to move
     */
    makeObserverTopPriority(observer: Observer<T>) {
        this._remove(observer);
        this._observers.unshift(observer);
    }

    /**
     * Moves the observable to the bottom of the observer list making it get called last when notified
     * @param observer the observer to move
     */
    makeObserverBottomPriority(observer: Observer<T>) {
        this._remove(observer);
        this._observers.push(observer);
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
     * Calling this will execute each callback, expecting it to be a promise or return a value.
     * If at any point in the chain one function fails, the promise will fail and the execution will not continue.
     * This is useful when a chain of Events (sometimes async Events) is needed to initialize a certain object
     * and it is crucial that all callbacks will be executed.
     * The order of the callbacks is kept, callbacks are not executed parallel.
     *
     * @param eventData The data to be sent to each callback
     * @returns {Promise<T>} will return a Promise than resolves when all callbacks executed successfully.
     */
    notifyObserversWithPromise(eventData: T): Promise<T> {
        // create an empty promise
        let p: Promise<any> = Promise.resolve(eventData);

        // no observers? return this promise.
        if (!this._observers.length) {
            return p;
        }

        const state = this._eventState;
        state.skipNextObservers = false;

        // execute one callback after another (not using Promise.all, the order is important)
        for (let index = 0; index < this._observers.length; index++) {
            const obs = this._observers[index];
            if (state.skipNextObservers) {
                continue;
            }

            p = p.then(() => obs.callback(eventData, state));
        }

        // return the eventData
        return p.then(() => eventData);
    }

    /**
     * Notify a specific observer
     * @param observer defines the observer to notify
     * @param eventData defines the data to be sent to each callback
     */
    notifyObserver(observer: Observer<T>, eventData: T): Nullable<INotifyObserversReturn> {
        const state = this._eventState;
        state.skipNextObservers = false;

        observer.callback(eventData, state);

        return {
            lastReturnValue: state.lastReturnValue,
            stopPropagation: state.isStopPropagation,
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

    /**
     * Clone the current observable
     * @returns a new observable
     */
    clone(): Observable<T> {
        const result = new Observable<T>();

        result._observers = this._observers.slice(0);

        return result;
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
