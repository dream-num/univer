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

const glob = typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : window;

/**
 * Polyfill for requestIdleCallback and cancelIdleCallback
 */
function installRequestIdleCallback() {
    const TIME_WINDOW = 50;

    const idleCallbacks = new Map<number, NodeJS.Timeout>();
    let currentId = 0;

    if (typeof glob.requestIdleCallback !== 'function') {
        glob.requestIdleCallback = function shimRIC(callback: Function) {
            const start = Date.now();
            const id = ++currentId;

            const timeoutId = setTimeout(function rICCallback() {
                idleCallbacks.delete(id);
                const remaining = Math.max(0, TIME_WINDOW - (Date.now() - start));
                callback({
                    didTimeout: remaining === 0,
                    timeRemaining() {
                        return remaining;
                    },
                });
            }, 1);

            idleCallbacks.set(id, timeoutId);
            return id;
        };
    }

    if (typeof glob.cancelIdleCallback !== 'function') {
        glob.cancelIdleCallback = function shimCancelRIC(id: number) {
            const timeoutId = idleCallbacks.get(id);
            if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
                idleCallbacks.delete(id);
            }
        };
    }
}

/**
 * Polyfill for Array.prototype.findLastIndex and Array.prototype.findLast
 */
function installArrayFindLastIndex() {
    if (typeof glob.Array.prototype.findLastIndex !== 'function') {
        glob.Array.prototype.findLastIndex = function findLastIndex(callback: (value: any, index: number, array: any[]) => boolean, thisArg?: any): number {
            if (this == null) {
                throw new TypeError('Array.prototype.findLastIndex called on null or undefined');
            }
            if (typeof callback !== 'function') {
                throw new TypeError('callback must be a function');
            }

            const len = this.length >>> 0;
            for (let i = len - 1; i >= 0; i--) {
                if (i in this && callback.call(thisArg, this[i], i, this)) {
                    return i;
                }
            }
            return -1;
        };
    }
    if (typeof glob.Array.prototype.findLast !== 'function') {
        glob.Array.prototype.findLast = function findLast(callback: (value: any, index: number, array: any[]) => boolean, thisArg?: any): any {
            const index = this.findLastIndex(callback, thisArg);
            return index !== -1 ? this[index] : undefined;
        };
    }
}

/**
 * Polyfill for String.prototype.at
 */
function installStringAt() {
    if (typeof glob.String.prototype.at !== 'function') {
        glob.String.prototype.at = function at(index: number): string | undefined {
            if (this == null) {
                throw new TypeError('String.prototype.at called on null or undefined');
            }
            const len = this.length;
            if (index < 0) {
                index = len + index;
            }
            if (index < 0 || index >= len) {
                return undefined;
            }
            return this.charAt(index);
        };
    }
}

export function installShims() {
    installRequestIdleCallback();
    installArrayFindLastIndex();
    installStringAt();
}
