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

import type { OperatorFunction } from 'rxjs';
import type { IDisposable } from '../common/di';
import { BehaviorSubject, debounceTime, map, Observable, ReplaySubject, take, tap } from 'rxjs';

type CallbackFn<T extends readonly unknown[]> = (cb: (...args: T) => void) => IDisposable;

/**
 * Creates an observable from a callback function.
 *
 * @param callback The callback function that will be called when the observable is subscribed to. **Please not that the
 * if the callback function has `this` context, it will be lost when the callback is called. So you probably
 * should bind the callback to the correct context.**
 *
 * @returns The observable that will emit when the callback function gets called.
 */
export function fromCallback<T extends readonly unknown[]>(callback: CallbackFn<T>): Observable<T> {
    return new Observable((subscriber) => {
        const disposable: IDisposable | undefined = callback((...args: T) => subscriber.next(args));
        return () => disposable?.dispose();
    });
};

/**
 * An operator that would complete the stream once a condition is met. Consider it as a shortcut of `takeUntil`.
 */
export function takeAfter<T>(callback: (value: T) => boolean) {
    return function complateAfter(source: Observable<T>) {
        return new Observable<T>((subscriber) => {
            source.subscribe({
                next: (v) => {
                    subscriber.next(v);
                    if (callback(v)) {
                        subscriber.complete();
                    }
                },
                complete: () => subscriber.complete(),
                error: (error) => subscriber.error(error),
            });

            return () => subscriber.unsubscribe();
        });
    };
}

export function bufferDebounceTime<T>(time: number = 0): OperatorFunction<T, T[]> {
    return (source: Observable<T>) => {
        let bufferedValues: T[] = [];

        return source.pipe(
            tap((value) => bufferedValues.push(value)),
            debounceTime(time),
            map(() => bufferedValues),
            tap(() => bufferedValues = [])
        );
    };
}

export function afterTime(ms: number): Observable<void> {
    const subject = new ReplaySubject<void>(1);
    setTimeout(() => subject.next(), ms);
    return subject.pipe(take(1));
}

export function convertObservableToBehaviorSubject<T>(observable: Observable<T>, initValue: T): BehaviorSubject<T> {
    const subject = new BehaviorSubject(initValue);

    observable.subscribe(subject);

    return subject;
}
