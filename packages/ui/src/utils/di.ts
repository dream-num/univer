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
import type { DependencyList, RefObject } from 'react';
import type { Observable } from 'rxjs';
import { useEffect, useLayoutEffect, useReducer, useRef } from 'react';

export {
    connectDependencies,
    connectInjector,
    RediConsumer,
    RediContext,
    RediProvider,
    useDependency,
    useInjector,
    useUpdateBinder,
    WithDependency,
} from '@wendellhu/redi/react-bindings';

type ObservableOrFn<T> = Observable<T> | (() => Observable<T>);

interface IObservableState<T> {
    dependencies: DependencyList;
    source: Observable<T> | null;
    value: T | undefined;
    hasSyncValue: boolean;
}

function unwrap<T>(o: ObservableOrFn<T>): Observable<T> {
    if (typeof o === 'function') {
        return o();
    }

    return o;
}

export function useObservable<T>(observable: ObservableOrFn<T>, defaultValue: T | undefined, shouldHaveSyncValue?: true): T;
export function useObservable<T>(observable: Nullable<ObservableOrFn<T>>, defaultValue: T, shouldHaveSyncValue?: boolean, deps?: DependencyList): T;
export function useObservable<T>(observable: Nullable<ObservableOrFn<T>>, defaultValue: undefined, shouldHaveSyncValue: true, deps?: DependencyList): T;
export function useObservable<T>(observable: Nullable<ObservableOrFn<T>>, defaultValue?: T, shouldHaveSyncValue?: boolean, deps?: DependencyList): T | undefined;
export function useObservable<T>(observable: Nullable<ObservableOrFn<T>>, defaultValue?: T, shouldHaveSyncValue?: boolean, deps?: DependencyList): T | undefined {
    if (typeof observable === 'function' && !deps) {
        throw new Error('Expected deps to be provided when observable is a function!');
    }

    const dependencies = deps ?? [observable];
    const stateRef = useRef<IObservableState<T> | undefined>(undefined);
    const previous = stateRef.current;
    if (!previous || dependencies.length !== previous.dependencies.length || dependencies.some((value, index) => !Object.is(value, previous.dependencies[index]))) {
        const state: IObservableState<T> = {
            dependencies: [...dependencies],
            source: observable ? unwrap(observable) : null,
            value: observable && previous ? previous.value : defaultValue,
            hasSyncValue: false,
        };
        // Read synchronous state without retaining a subscription from an abandoned render.
        const subscription = state.source?.subscribe((value) => {
            state.value = value;
            state.hasSyncValue = true;
        });
        subscription?.unsubscribe();
        stateRef.current = state;
    }
    const state = stateRef.current!;
    const [, refresh] = useReducer((revision: number) => revision + 1, 0);

    useLayoutEffect(() => {
        const subscription = state.source?.subscribe((value) => {
            state.value = value;
            refresh();
        });
        return () => subscription?.unsubscribe();
    }, [state]);

    if (shouldHaveSyncValue && !state.hasSyncValue) {
        throw new Error('Expected a synchronous value from the observable.');
    }

    return state.value;
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
