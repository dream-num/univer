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
export function useObservable<T>(observable: Nullable<ObservableOrFn<T>>, defaultValue: undefined, shouldHaveSyncValue: true, deps?: any[]): T;
export function useObservable<T>(observable: Nullable<ObservableOrFn<T>>, defaultValue?: T, shouldHaveSyncValue?: boolean, deps?: any[]): T | undefined;
/**
 * A hook to subscribe to an observable and get the latest value.
 *
 * @param observable The observable to subscribe to.
 * @param defaultValue When the observable would not emit any value, the default value would be returned.
 * @param shouldHaveSyncValue If true, the observable should emit a value synchronously.
 * @param deps The dependencies to trigger a re-subscription.
 */
export function useObservable<T>(observable: Nullable<ObservableOrFn<T>>, defaultValue?: T, shouldHaveSyncValue?: boolean, deps: any[] = []): T | undefined {
    if (typeof observable === 'function' && !deps) {
        throw new Error('[useObservable]: expect deps when observable is a function! Otherwise it would cause an infinite loop.');
    }

    const observableRef = useRef<Observable<T> | null>(null);
    const subscriptionRef = useRef<Subscription | null>(null);
    const depsRef = useRef<any[] | undefined>(deps ?? undefined);
    const initializedRef = useRef<boolean>(false);

    // This state is only for trigger React to re-render. We do not use `setValue` directly because it may cause
    // memory leaking.
    const [_, setRenderCounter] = useState<number>(0);

    const valueRef = useRef((() => {
        let innerDefaultValue: T | undefined;
        if (observable) {
            const sub = unwrap(observable).subscribe((value) => {
                initializedRef.current = true;
                innerDefaultValue = value;
            });

            sub.unsubscribe();
        }

        return innerDefaultValue ?? defaultValue;
    })());

    useEffect(() => {
        const shouldResubscribe = (() => {
            if (typeof depsRef.current !== 'undefined') {
                const _deps = deps ?? [];
                if (showArrayNotEqual(depsRef.current, _deps)) {
                    depsRef.current = _deps;
                    return true;
                }

                return false;
            }

            return true;
        })();

        let subscription: Subscription | null = null;
        if (shouldResubscribe && observable) {
            subscriptionRef.current?.unsubscribe();
            subscriptionRef.current = null;

            observableRef.current = unwrap(observable);
            subscription = subscriptionRef.current = observableRef.current.subscribe((value) => {
                valueRef.current = value;
                setRenderCounter((prev) => prev + 1);
            });
        }

        return () => {
            subscription?.unsubscribe();
            subscriptionRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [observable, ...deps]);

    if (shouldHaveSyncValue && !initializedRef.current) {
        throw new Error('[useObservable]: expect shouldHaveSyncValue but not getting a sync value!');
    }

    return valueRef.current;
}
