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

import type { Observable } from 'rxjs';
import { renderHook } from '@testing-library/react';
import { act, useState } from 'react';
import { of, Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { useObservable } from '../../../utils/di';

// New to testing React Hooks? You can refer to https://mayashavin.com/articles/test-react-hooks-with-vitest .

describe('test "useObservable"', () => {
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

    function useTestUseObservableBed() {
        const observable = new Subject<boolean>();
        const result = useObservable(observable, undefined, false);

        return {
            observable,
            result,
        };
    }

    it('should emit new value when observable emits', () => {
        const { result } = renderHook(() => useTestUseObservableBed());

        expect(result.current.result).toBeUndefined();

        act(() => result.current.observable.next(true));
        expect(result.current.result).toBeTruthy();

        act(() => result.current.observable.next(false));
        expect(result.current.result).toBeFalsy();
    });

    function useTestSwitchObservableBed() {
        const [observable, setObservable] = useState<Observable<boolean> | undefined>(undefined);
        const result = useObservable(observable);

        return {
            result,
            observable,
            setObservable,
        };
    }

    it('should emit when passing new observable to the hook', () => {
        const { result } = renderHook(() => useTestSwitchObservableBed());

        expect(result.current.result).toBeUndefined();

        act(() => result.current.setObservable(of(true)));
        expect(result.current.result).toBeTruthy();

        act(() => result.current.setObservable(of(false)));
        expect(result.current.result).toBeFalsy();
    });

    it('should support a callback function returns an observable', () => {
        // const { result } = renderHook(() => useObservable(() => of(true)));
        // This line above would cause infinite look. Pass `deps` to fix the problem.
        const { result } = renderHook(() => useObservable(() => of(true), undefined, true, []));

        expect(result.current).toBeTruthy();
    });
});
