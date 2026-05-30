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

import { BehaviorSubject, of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { afterTime, bufferDebounceTime, convertObservableToBehaviorSubject, fromCallback, takeAfter } from '../rxjs';

describe('test custom rxjs utils', () => {
    it('should terminate when a condition is met with "takeAfter"', () => {
        const acculated: number[] = [];
        const nums$ = of(1, 2, 3, 4, 5);
        nums$.pipe(takeAfter((val) => val === 3)).subscribe((v) => acculated.push(v));
        expect(acculated).toEqual([1, 2, 3]);
    });

    describe('test "createTimerObservable$"', () => {
        beforeEach(() => vi.useFakeTimers());

        afterEach(() => vi.useRealTimers());

        it('should emit after a period of time', async () => {
            let fired = false;

            const ob1 = afterTime(2000);
            ob1.subscribe(() => fired = true);
            vi.advanceTimersByTime(1000);
            expect(fired).toBeFalsy();
            vi.advanceTimersByTime(2000);
            expect(fired).toBeTruthy();

            fired = false;
            ob1.subscribe(() => fired = true);
            expect(fired).toBeTruthy();

            fired = false;
            const ob2 = afterTime(2000);
            ob2.subscribe(() => fired = true);
            vi.advanceTimersByTime(3000);
            expect(fired).toBeTruthy();

            fired = false;
            const ob3 = afterTime(2000);
            vi.advanceTimersByTime(3000);
            ob3.subscribe(() => fired = true);
            expect(fired).toBeTruthy();
        });

        it('should create observables from callbacks and unsubscribe correctly', () => {
            const listeners = new Set<(value: number) => void>();
            const observable = fromCallback<[number]>((cb) => {
                listeners.add(cb);
                return {
                    dispose: () => listeners.delete(cb),
                };
            });

            const received: number[] = [];
            const subscription = observable.subscribe(([value]) => received.push(value));

            listeners.forEach((listener) => listener(1));
            listeners.forEach((listener) => listener(2));
            subscription.unsubscribe();
            listeners.forEach((listener) => listener(3));

            expect(received).toEqual([1, 2]);
            expect(listeners.size).toBe(0);
        });

        it('should buffer debounced values and convert observables into behavior subjects', async () => {
            const source = new BehaviorSubject(1);
            const bufferedValues: number[][] = [];
            const buffered$ = source.pipe(bufferDebounceTime(10));
            buffered$.subscribe((value) => bufferedValues.push(value));

            source.next(2);
            source.next(3);
            await vi.advanceTimersByTimeAsync(10);

            expect(bufferedValues).toEqual([[1, 2, 3]]);

            const state$ = convertObservableToBehaviorSubject(source.asObservable(), 0);
            expect(state$.getValue()).toBe(3);

            source.next(4);
            expect(state$.getValue()).toBe(4);

            state$.complete();
            source.next(5);
            expect(state$.getValue()).toBe(4);
        });
    });
});
