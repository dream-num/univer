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

import { act, renderHook } from '@testing-library/react';
import { createElement, StrictMode, Suspense, useState } from 'react';
import { BehaviorSubject, debounceTime, Observable, of, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { useObservable, useObservableRef } from '../di';

describe('useObservableRef', () => {
    it('should keep default value when observable is undefined', () => {
        const { result } = renderHook(() => useObservableRef<number>(undefined, 1));

        expect(result.current.current).toBe(1);
    });

    it('should update ref when observable emits', () => {
        const subject = new Subject<number>();
        const { result } = renderHook(() => useObservableRef(subject, 0));

        expect(result.current.current).toBe(0);

        act(() => subject.next(2));
        expect(result.current.current).toBe(2);
    });

    it('should support observable factory function', () => {
        const subject = new Subject<number>();
        const createObservable = vi.fn(() => subject.asObservable());
        const { result } = renderHook(() => useObservableRef(createObservable, 0));

        expect(createObservable).toHaveBeenCalledTimes(1);

        act(() => subject.next(5));
        expect(result.current.current).toBe(5);
    });

    it('should unsubscribe on unmount', () => {
        const unsubscribe = vi.fn();
        const observable = new Observable<number>(() => unsubscribe);
        const { unmount } = renderHook(() => useObservableRef(observable));

        unmount();
        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
});

describe('useObservable', () => {
    it('retains the latest value when a non-replaying stream returns a new observable wrapper', () => {
        const subject = new Subject<number>();
        const { result, rerender } = renderHook(() => useObservable(subject.asObservable(), 0));

        act(() => subject.next(42));
        expect(result.current).toBe(42);
        rerender();
        expect(result.current).toBe(42);
    });

    it('does not retain a subscription when rendering suspends before commit', () => {
        const subject = new BehaviorSubject(1);
        const pending = new Promise(() => {});
        const { unmount } = renderHook(() => {
            useObservable(subject, undefined, true);
            throw pending;
        }, {
            wrapper: ({ children }) => createElement(Suspense, { fallback: null }, children),
        });

        expect(subject.observed).toBe(false);
        unmount();
    });

    it('provides synchronous values during render and refreshes mutable values', () => {
        const state = { count: 1 };
        const subject = new BehaviorSubject(state);
        const { result } = renderHook(() => useObservable(subject, undefined, true).count);
        expect(result.current).toBe(1);

        act(() => {
            state.count = 2;
            subject.next(state);
        });
        expect(result.current).toBe(2);
    });

    it('releases the previous source and uses the default when the source is removed', () => {
        const subject = new BehaviorSubject(1);
        const { result, rerender } = renderHook(({ source }) => useObservable(source, null), {
            initialProps: { source: subject as Observable<number> | null },
        });
        expect(result.current).toBe(1);

        rerender({ source: null });

        expect(subject.observed).toBe(false);
        expect(result.current).toBeNull();
    });

    it('rejects a source without the required synchronous value without retaining it', () => {
        const subject = new Subject<number>();
        expect(() => renderHook(() => useObservable(subject, undefined, true))).toThrow('Expected a synchronous value');
        expect(subject.observed).toBe(false);
    });

    it('unsubscribes and cancels pending emissions on unmount', () => {
        vi.useFakeTimers();
        const subject = new Subject<number>();
        try {
            const { unmount } = renderHook(() => useObservable(() => subject.pipe(debounceTime(100)), 0, false, []));
            act(() => subject.next(1));
            expect(vi.getTimerCount()).toBe(1);

            unmount();

            expect(subject.observed).toBe(false);
            expect(vi.getTimerCount()).toBe(0);
        } finally {
            vi.clearAllTimers();
            vi.useRealTimers();
        }
    });

    it('keeps the replacement subscription active and releases it on unmount', () => {
        const first = new Subject<number>();
        const second = new Subject<number>();
        const { result, rerender, unmount } = renderHook(
            ({ source }) => useObservable(() => source, 0, false, [source]),
            { initialProps: { source: first } }
        );

        rerender({ source: second });
        expect(first.observed).toBe(false);
        act(() => second.next(42));
        expect(result.current).toBe(42);

        unmount();
        expect(second.observed).toBe(false);
    });

    it('resubscribes after StrictMode effect cleanup and releases the final subscription', () => {
        const subject = new BehaviorSubject(1);
        const { result, unmount } = renderHook(() => useObservable(subject, undefined, true), {
            wrapper: ({ children }) => createElement(StrictMode, null, children),
        });

        expect(result.current).toBe(1);
        act(() => subject.next(2));
        expect(result.current).toBe(2);

        unmount();
        expect(subject.observed).toBe(false);
    });

    it('should return undefined when no initial value is provided', () => {
        const observable: Observable<boolean> | undefined = undefined;

        const { result } = renderHook(() => useObservable<boolean>(observable));
        expect(result.current).toBeUndefined();
    });

    it('should return the initial value when provided', () => {
        const observable: Observable<boolean> | undefined = undefined;

        const { result } = renderHook(() => useObservable<boolean>(observable, true));
        expect(result.current).toBeTruthy();
    });

    it('should return the initial value when provided synchronously', () => {
        const observable: Observable<boolean> = of(true);

        const { result } = renderHook(() => useObservable<boolean>(observable));
        expect(result.current).toBeTruthy();
    });

    it('should emit new values when the observable emits', () => {
        const subject = new Subject<boolean>();
        const { result } = renderHook(() => useObservable(subject));

        expect(result.current).toBeUndefined();
        act(() => subject.next(true));
        expect(result.current).toBeTruthy();
        act(() => subject.next(false));
        expect(result.current).toBeFalsy();
    });

    it('should emit when passing a new observable', () => {
        const { result } = renderHook(() => {
            const [observable, setObservable] = useState<Observable<boolean> | undefined>(undefined);
            const value = useObservable(observable);

            return { value, setObservable };
        });

        expect(result.current.value).toBeUndefined();
        act(() => result.current.setObservable(of(true)));
        expect(result.current.value).toBeTruthy();
        act(() => result.current.setObservable(of(false)));
        expect(result.current.value).toBeFalsy();
    });

    it('should support a callback function returning an observable', () => {
        const { result } = renderHook(() => useObservable(() => new Observable((subscriber) => subscriber.next(true)), undefined, true, []));

        expect(result.current).toBeTruthy();
    });
});
