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

import type React from 'react';
import { useRef, useState } from 'react';
import type { Observable, Subscription } from 'rxjs';

export function useObservable<T>(observable: Observable<T>, defaultValue?: T): T | undefined;
export function useObservable<T>(observable: Observable<T>, defaultValue?: T, shouldHaveSyncValue?: true): T;
export function useObservable<T>(
    observable: Observable<T>,
    defaultValue?: T,
    shouldHaveSyncValue?: true
): T | undefined {
    const observableRef = useRef<Observable<T> | null>(null);
    const subscriptionRef = useRef<Subscription | null>(null);

    let setValue: React.Dispatch<React.SetStateAction<T | undefined>>;
    let initialized = false;
    let innerDefaultValue: T | undefined;
    if (!observableRef.current || observableRef.current !== observable) {
        subscriptionRef.current?.unsubscribe();
        subscriptionRef.current = observable.subscribe((v) => {
            if (setValue) {
                setValue(v);
            } else {
                innerDefaultValue = v;
                initialized = true;
            }
        });
    }

    if (shouldHaveSyncValue && !initialized) {
        throw new Error('[useObservable]: expect shouldHaveSyncValue but not getting a sync value!');
    }

    const s = useState<T | undefined>(innerDefaultValue || defaultValue);
    const value = s[0];
    setValue = s[1];

    return value;
}
