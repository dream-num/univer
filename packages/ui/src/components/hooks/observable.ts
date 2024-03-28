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

/* eslint-disable ts/no-explicit-any */

import type { Nullable } from '@univerjs/core';
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

export function useObservable<T>(observable: ObservableOrFn<T>, defaultValue: T | undefined, shouldHaveSyncValue?: true): T;
export function useObservable<T>(observable: Nullable<ObservableOrFn<T>>, defaultValue: T): T;
export function useObservable<T>(observable: Nullable<ObservableOrFn<T>>, defaultValue?: undefined): T | undefined;
export function useObservable<T>(observable: Nullable<ObservableOrFn<T>>, defaultValue?: T, shouldHaveSyncValue?: true, deps?: any[]): T | undefined;
export function useObservable<T>(observable: Nullable<ObservableOrFn<T>>, defaultValue?: T, shouldHaveSyncValue?: boolean, deps?: any[]): T | undefined;
/**
 * A hook to subscribe to an observable and get the latest value.
 *
 * @param observable The observable to subscribe to.
 * @param defaultValue When the observable would not emit any value, the default value would be returned.
 * @param shouldHaveSyncValue If true, the observable should emit a value synchronously.
 * @param deps The dependencies to trigger a re-subscription.
 */
export function useObservable<T>(observable: Nullable<ObservableOrFn<T>>, defaultValue?: T, shouldHaveSyncValue?: boolean, deps?: any[]): T | undefined {
    const observableRef = useRef<Observable<T> | null>(null);
    const subscriptionRef = useRef<Subscription | null>(null);
    const depsRef = useRef<any[] | undefined>(deps ?? undefined);
    const initializedRef = useRef<boolean>(false);

    const [value, setValue] = useState<T | undefined>(() => {
        let innerDefaultValue: T | undefined = defaultValue;

        if (observable) {
            const sub = unwrap(observable).subscribe((value) => {
                initializedRef.current = true;
                innerDefaultValue = value;
            });

            sub.unsubscribe();
        }

        return innerDefaultValue;
    });

    const shouldResubscribe = (() => {
        if (typeof depsRef.current !== 'undefined') {
            const _deps = deps ?? [];
            if (showArrayNotEqual(depsRef.current, _deps)) {
                depsRef.current = _deps;
                return true;
            }

            return false;
        }

        return observableRef.current !== observable;
    })();

    if ((!subscriptionRef.current || shouldResubscribe) && observable) {
        observableRef.current = unwrap(observable);
        subscriptionRef.current?.unsubscribe();
        subscriptionRef.current = observableRef.current.subscribe((value) => {
            setValue(value);
        });
    }

    if (shouldHaveSyncValue && !initializedRef.current) {
        throw new Error('[useObservable]: expect shouldHaveSyncValue but not getting a sync value!');
    }

    useEffect(() => () => subscriptionRef.current?.unsubscribe(), []);

    return value;
}
