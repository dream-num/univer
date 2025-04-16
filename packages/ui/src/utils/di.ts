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

import type { Nullable } from '@univerjs/core';
import type { RefObject } from 'react';
import type { Observable } from 'rxjs';
import { useEffect, useRef } from 'react';

export * from '@wendellhu/redi/react-bindings';

type ObservableOrFn<T> = Observable<T> | (() => Observable<T>);

function unwrap<T>(o: ObservableOrFn<T>): Observable<T> {
    if (typeof o === 'function') {
        return o();
    }

    return o;
}

declare module '@univerjs/ui' {
    export function useObservable<T>(observable: ObservableOrFn<T>, defaultValue: T | undefined, shouldHaveSyncValue?: true): T;
    export function useObservable<T>(observable: Nullable<ObservableOrFn<T>>, defaultValue: T): T;
    export function useObservable<T>(observable: Nullable<ObservableOrFn<T>>, defaultValue?: undefined): T | undefined;
    export function useObservable<T>(observable: Nullable<ObservableOrFn<T>>, defaultValue: T, shouldHaveSyncValue?: boolean, deps?: any[]): T;
    export function useObservable<T>(observable: Nullable<ObservableOrFn<T>>, defaultValue: undefined, shouldHaveSyncValue: true, deps?: any[]): T;
    export function useObservable<T>(observable: Nullable<ObservableOrFn<T>>, defaultValue?: T, shouldHaveSyncValue?: boolean, deps?: any[]): T | undefined;
}

export function useObservableRef<T>(observable: Nullable<ObservableOrFn<T>>, defaultValue?: T): RefObject<Nullable<T>> {
    const ref = useRef<Nullable<T>>(defaultValue);

    useEffect(() => {
        if (observable) {
            const sub = unwrap(observable).subscribe((value) => {
                ref.current = value;
            });

            return () => sub.unsubscribe();
        }
    }, [observable]);

    return ref;
}
