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

/* eslint-disable @typescript-eslint/no-explicit-any */

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Observable, Subscription } from 'rxjs';

type ObservableOrFn<T> = Observable<T> | (() => Observable<T>);

function unwrap<T>(o: ObservableOrFn<T>): Observable<T> {
    if (typeof o === 'function') {
        return o();
    }

    return o;
}

function showArrayNotEqual(arr1: unknown[], arr2: unknown[]): boolean {
    if (arr1.length !== arr2.length) {
        return true;
    }

    return arr1.some((value, index) => value !== arr2[index]);
}

export function useObservable<T>(
    observable: ObservableOrFn<T>,
    defaultValue?: T,
    shouldHaveSyncValue?: true,
    deps?: any[]
): T | undefined {
    const observableRef = useRef<Observable<T> | null>(null);
    const subscriptionRef = useRef<Subscription | null>(null);
    const _deps = deps ?? [];
    const depsRef = useRef<any[] | undefined>(deps ?? undefined);

    let setValue: React.Dispatch<React.SetStateAction<T | undefined>>;
    let initialized = false;
    let innerDefaultValue: T | undefined;

    const shouldResubscribe = (() => {
        if (typeof depsRef.current !== 'undefined') {
            if (showArrayNotEqual(depsRef.current, _deps)) {
                depsRef.current = _deps;
                return true;
            }

            return false;
        }

        return observableRef.current !== observable;
    })();

    if (!subscriptionRef.current || shouldResubscribe) {
        observableRef.current = unwrap(observable);
        subscriptionRef.current?.unsubscribe();
        subscriptionRef.current = observableRef.current.subscribe((value) => {
            if (setValue) {
                setValue(value);
            } else {
                innerDefaultValue = value;
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

    useEffect(() => {
        return () => subscriptionRef.current?.unsubscribe();
    }, []);

    return value;
}
