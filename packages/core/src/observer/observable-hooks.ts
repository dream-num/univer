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
import type { EventState } from './observable';
import { Observable, Observer } from './observable';

/**
 * Observable Hooks
 */
export class ObservableHooks<T> extends Observable<T> {
    /**
     * Create a new WorkBookObserver with the specified callback
     * @param callback the callback that will be executed for that WorkBookObserver
     * @param insertFirst if true the callback will be inserted at the first position, hence executed before the others ones. If false (default behavior) the callback will be inserted at the last position, executed after all the others already present.
     * @param unregisterOnFirstCall defines if the observer as to be unregistered after the next notification
     * @returns the new observer created for the callback
     */
    override add(callback: (eventData: T, eventState: EventState) => void): Nullable<Observer<T>> {
        if (!callback) {
            return null;
        }

        const observer = new Observer(callback, this);
        this._observers = [observer];

        if (this._onObserverAdded) {
            this._onObserverAdded(observer);
        }

        return observer;
    }

    override makeObserverTopPriority() {
        /** cancel */
    }

    override makeObserverBottomPriority() {
        /** cancel */
    }
}
