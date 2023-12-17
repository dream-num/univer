/**
 * Copyright 2023-present DreamNum Inc.
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

export function installShims() {
    installRequestIdleCallback();
}

const TIME_WINDOW = 50;

function installRequestIdleCallback() {
    if (typeof window.requestIdleCallback !== 'function') {
        window.requestIdleCallback = function shimRIC(callback: Function) {
            const start = Date.now();
            return setTimeout(function rICCallback() {
                const remaining = Math.max(0, TIME_WINDOW - (Date.now() - start));
                callback({
                    didTimeout: remaining === 0,
                    timeRemaining() {
                        return remaining;
                    },
                });
            }, 1) as unknown as number;
        };
    }

    if (typeof window.cancelIdleCallback !== 'function') {
        window.cancelIdleCallback = function shimCancelRIC(id: number) {
            clearTimeout(id);
        };
    }
}
