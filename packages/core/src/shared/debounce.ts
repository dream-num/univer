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

type debounceFn<T extends (...args: any[]) => any> = (this: ThisParameterType<T>, ...args: Parameters<T>) => void;

/**
 * Creates a debounced function that delays invoking the provided function until after `wait` milliseconds have elapsed since the last time the debounced function was invoked.
 * @template T - The type of the function to be debounced.
 * @param {T} func - The function to be debounced.
 * @param {number} wait - The number of milliseconds to wait before invoking the function.
 * @returns {debounceFn<T> & { cancel: () => void }} - The debounced function, which also has a `cancel` method to cancel the scheduled function call.
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
    let timeout: NodeJS.Timeout | null;
    function run(this: ThisParameterType<T>, ...args: Parameters<T>) {
        const context = this;

        const later = function () {
            timeout = null;
            func.apply(context, args);
        };

        clearTimeout(timeout as NodeJS.Timeout);
        timeout = setTimeout(later, wait);
    }
    Object.defineProperty(run, 'cancel', {
        value: () => {
            clearTimeout(timeout as NodeJS.Timeout);
        },
        enumerable: false,
        writable: false,
    });
    return run as debounceFn<T> & { cancel: () => void };
}
