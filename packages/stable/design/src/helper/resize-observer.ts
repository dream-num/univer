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

/**
 * All elements are observed by a single ResizeObserver is got greater performance than each element observed by separate ResizeObserver
 * See issue https://github.com/WICG/resize-observer/issues/59#issuecomment-408098151
 */
const _resizeObserverCallbacks: Set<ResizeObserverCallback> = new Set();
let _resizeObserver: ResizeObserver;

export function resizeObserverCtor(callback: ResizeObserverCallback) {
    if (!_resizeObserver) {
        _resizeObserver = new ResizeObserver((...args) => {
            _resizeObserverCallbacks.forEach((callback) => callback(...args));
        });
    }
    return {
        observe(target: Element, options?: ResizeObserverOptions | undefined) {
            _resizeObserverCallbacks.add(callback);
            _resizeObserver.observe(target, options);
        },
        unobserve(target: Element) {
            _resizeObserverCallbacks.delete(callback);
            _resizeObserver.unobserve(target);
        },
    };
}
