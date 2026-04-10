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
import { observeClientRect } from '../util';

vi.mock('@floating-ui/dom', () => ({
    getOverflowAncestors: vi.fn(() => [window]),
}));

describe('floating util', () => {
    const originalIntersectionObserver = globalThis.IntersectionObserver;

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        globalThis.IntersectionObserver = originalIntersectionObserver;
        vi.restoreAllMocks();
        document.body.innerHTML = '';
    });

    it('observes client rect changes from ancestor events and cleans up', () => {
        let throwWithRoot = true;
        class IntersectionObserverMock {
            constructor(private _callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
                if (options?.root && throwWithRoot) {
                    throwWithRoot = false;
                    throw new Error('root not supported');
                }
            }

            observe(_target: Element) {
                this._callback([{ intersectionRatio: 1 } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
            }

            disconnect() {}
            takeRecords() { return []; }
            root: Element | Document | null = null;
            rootMargin = '';
            thresholds = [1];
            unobserve() {}
        }
        globalThis.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;

        const element = document.createElement('div');
        document.body.appendChild(element);
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
            x: 10,
            y: 20,
            left: 10,
            top: 20,
            right: 130,
            bottom: 100,
            width: 120,
            height: 80,
            toJSON: () => ({}),
        } as DOMRect);

        const calls: number[] = [];
        const sub = observeClientRect(element).subscribe(() => {
            calls.push(Date.now());
        });

        expect(calls.length).toBeGreaterThan(0);

        window.dispatchEvent(new Event('scroll'));
        window.dispatchEvent(new Event('resize'));
        expect(calls.length).toBeGreaterThan(2);

        sub.unsubscribe();
        const before = calls.length;
        window.dispatchEvent(new Event('scroll'));
        window.dispatchEvent(new Event('resize'));
        vi.runOnlyPendingTimers();
        expect(calls.length).toBe(before);
    });

    it('handles zero-sized element without creating move observer loop', () => {
        class IntersectionObserverMock {
            constructor(private _callback: IntersectionObserverCallback) {}

            observe(_target: Element) {
                this._callback([{ intersectionRatio: 1 } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
            }

            disconnect() {}

            takeRecords() { return []; }

            root: Element | Document | null = null;
            rootMargin = '';
            thresholds = [1];

            unobserve() {}
        }
        globalThis.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;

        const element = document.createElement('div');
        document.body.appendChild(element);
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
            x: 0,
            y: 0,
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            width: 0,
            height: 0,
            toJSON: () => ({}),
        } as DOMRect);

        let count = 0;
        const sub = observeClientRect(element).subscribe(() => {
            count += 1;
        });

        expect(count).toBe(1);
        sub.unsubscribe();
    });
});
