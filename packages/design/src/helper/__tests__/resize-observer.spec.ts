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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type ResizeObserverTestCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => void;

describe('helper/resize-observer', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should use a shared ResizeObserver and dispatch callbacks', async () => {
        const observe = vi.fn();
        const unobserve = vi.fn();
        let ctorCalls = 0;
        const observerCallbackRef: { current?: ResizeObserverTestCallback } = {};

        class MockResizeObserver {
            constructor(callback: ResizeObserverCallback) {
                ctorCalls += 1;
                observerCallbackRef.current = callback;
            }

            observe = observe;
            unobserve = unobserve;
        }

        vi.stubGlobal('ResizeObserver', MockResizeObserver as unknown as typeof ResizeObserver);

        const { resizeObserverCtor } = await import('../resize-observer');

        const cb1 = vi.fn();
        const cb2 = vi.fn();
        const targetA = document.createElement('div');
        const targetB = document.createElement('div');

        const observerA = resizeObserverCtor(cb1);
        const observerB = resizeObserverCtor(cb2);

        observerA.observe(targetA);
        observerB.observe(targetB);

        expect(ctorCalls).toBe(1);
        expect(observe).toHaveBeenCalledWith(targetA, undefined);
        expect(observe).toHaveBeenCalledWith(targetB, undefined);

        const entries = [{ target: targetA }] as unknown as ResizeObserverEntry[];
        const observerCallback = observerCallbackRef.current;
        if (!observerCallback) {
            throw new Error('ResizeObserver callback should be initialized');
        }
        observerCallback(entries, {} as ResizeObserver);

        expect(cb1).toHaveBeenCalledTimes(1);
        expect(cb2).toHaveBeenCalledTimes(1);

        observerA.unobserve(targetA);
        observerCallback(entries, {} as ResizeObserver);

        expect(cb1).toHaveBeenCalledTimes(1);
        expect(cb2).toHaveBeenCalledTimes(2);
        expect(unobserve).toHaveBeenCalledWith(targetA);
    });
});
