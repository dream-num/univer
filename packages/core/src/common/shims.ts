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

export function installShims() {
    installRequestIdleCallback();
}
