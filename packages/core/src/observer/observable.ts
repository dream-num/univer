/**
 * Copyright 2023-present DreamNum Co., Ltd.
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
import { Observable, Subject } from 'rxjs';

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
    /** If the event has been handled by any event handler. */
    handled: boolean;
    lastReturnValue: unknown;
    stopPropagation: boolean;
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

    /** @deprecated Use `subscribeEvent` instead. */
    override subscribe(): Subscription {
        throw new Error('[EventSubject]: please use `subscribeEvent` instead of `subscribe` method for `EventSubject`.');
    }

    /** @deprecated Use `emitEvent` instead. */
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

    emitEvent(event: T): INotifyObserversReturn {
        if (!this.closed) {
            const state = new EventState();
            state.lastReturnValue = event;

            for (const observer of this._sortedObservers) {
                const value = observer.next?.([event, state]);
                state.lastReturnValue = value;

                if (state.skipNextObservers) {
                    return {
                        handled: true,
                        lastReturnValue: state.lastReturnValue,
                        stopPropagation: state.isStopPropagation,
                    };
                }
            }

            return {
                handled: this._sortedObservers.length > 0,
                lastReturnValue: state.lastReturnValue,
                stopPropagation: state.isStopPropagation,
            };
        }

        throw new Error('[EventSubject]: cannot emit event on a closed subject.');
    }
}

export function fromEventSubject<T>(subject$: EventSubject<T>) {
    return new Observable<T>((subscriber) => {
        const ob = subject$.subscribeEvent((evt) => {
            subscriber.next(evt);
        });
        return () => ob.unsubscribe();
    });
}
