import React, { useRef, useState } from 'react';
import { Observable, Subscription } from 'rxjs';

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
