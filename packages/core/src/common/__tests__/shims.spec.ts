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
import { installShims } from '../shims';

type RestorableDescriptor = PropertyDescriptor | undefined;

function restoreProperty(target: object, key: PropertyKey, descriptor: RestorableDescriptor) {
    if (descriptor) {
        Object.defineProperty(target, key, descriptor);
    } else {
        Reflect.deleteProperty(target, key);
    }
}

describe('installShims', () => {
    let requestIdleDescriptor: RestorableDescriptor;
    let cancelIdleDescriptor: RestorableDescriptor;
    let findLastDescriptor: RestorableDescriptor;
    let findLastIndexDescriptor: RestorableDescriptor;
    let stringAtDescriptor: RestorableDescriptor;

    beforeEach(() => {
        vi.useFakeTimers();
        requestIdleDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'requestIdleCallback');
        cancelIdleDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'cancelIdleCallback');
        findLastDescriptor = Object.getOwnPropertyDescriptor(Array.prototype, 'findLast');
        findLastIndexDescriptor = Object.getOwnPropertyDescriptor(Array.prototype, 'findLastIndex');
        stringAtDescriptor = Object.getOwnPropertyDescriptor(String.prototype, 'at');

        Object.defineProperty(globalThis, 'requestIdleCallback', {
            configurable: true,
            writable: true,
            value: undefined,
        });
        Object.defineProperty(globalThis, 'cancelIdleCallback', {
            configurable: true,
            writable: true,
            value: undefined,
        });
        // eslint-disable-next-line no-extend-native
        Object.defineProperty(Array.prototype, 'findLast', {
            configurable: true,
            writable: true,
            value: undefined,
        });
        // eslint-disable-next-line no-extend-native
        Object.defineProperty(Array.prototype, 'findLastIndex', {
            configurable: true,
            writable: true,
            value: undefined,
        });
        // eslint-disable-next-line no-extend-native
        Object.defineProperty(String.prototype, 'at', {
            configurable: true,
            writable: true,
            value: undefined,
        });
    });

    afterEach(() => {
        restoreProperty(globalThis, 'requestIdleCallback', requestIdleDescriptor);
        restoreProperty(globalThis, 'cancelIdleCallback', cancelIdleDescriptor);
        restoreProperty(Array.prototype, 'findLast', findLastDescriptor);
        restoreProperty(Array.prototype, 'findLastIndex', findLastIndexDescriptor);
        restoreProperty(String.prototype, 'at', stringAtDescriptor);
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('should install requestIdleCallback and allow cancellation', () => {
        const callback = vi.fn();

        installShims();

        const canceledId = globalThis.requestIdleCallback?.(callback as never);
        globalThis.cancelIdleCallback?.(canceledId as number);
        vi.advanceTimersByTime(5);
        expect(callback).not.toHaveBeenCalled();

        globalThis.requestIdleCallback?.(callback as never);
        vi.advanceTimersByTime(5);

        expect(callback).toHaveBeenCalledTimes(1);
        const idleDeadline = callback.mock.calls[0][0] as { didTimeout: boolean; timeRemaining: () => number };
        expect(idleDeadline.didTimeout).toBe(false);
        expect(idleDeadline.timeRemaining()).toBeGreaterThanOrEqual(0);
    });

    it('should install array findLastIndex and findLast polyfills', () => {
        installShims();

        expect([1, 2, 3, 2].findLastIndex((value) => value === 2)).toBe(3);
        expect([1, 2, 3, 2].findLast((value) => value === 2)).toBe(2);
        expect(() => Array.prototype.findLastIndex.call([1], null)).toThrowError(/callback must be a function/);
    });

    it('should install string at polyfill', () => {
        installShims();

        expect('abcd'.at(1)).toBe('b');
        expect('abcd'.at(-1)).toBe('d');
        expect('abcd'.at(10)).toBeUndefined();
    });
});
