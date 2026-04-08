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
import { Observable, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { useObservableRef } from '../di';

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
