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

import type { MutableRefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import canUseDom from 'rc-util/lib/Dom/canUseDom';


/**
 * All elements are observed by a single ResizeObserver is got greater performance than each element observed by separate ResizeObserver
 * See issue https://github.com/WICG/resize-observer/issues/59#issuecomment-408098151
 */
let _resizeObserver: ResizeObserver;
const _resizeObserverCallbacks: Set<MutableRefObject<ResizeObserverCallback>> = new Set();

export function useGlobalResizeObserver(callback: ResizeObserverCallback) {
    const callbackRef = useRef<ResizeObserverCallback>(callback);
    callbackRef.current = callback;

    const observer = useRef<ResizeObserver>();
    if (!observer.current) {
        if (!_resizeObserver) {
            /** assign global a ResizeObserver */
            _resizeObserver = new ResizeObserver((...args) => {
                _resizeObserverCallbacks.forEach((callback) => callback.current(...args));
            });
        }
        observer.current = _resizeObserver;
    }

    useEffect(() => {
        if (!_resizeObserverCallbacks.has(callbackRef)) {
            _resizeObserverCallbacks.add(callbackRef);
        }
        return () => {
            observer.current?.disconnect();
            _resizeObserverCallbacks.delete(callbackRef);
        };
    }, []);

    return observer.current;
}


export function useIsEllipsis(element: HTMLElement | null | undefined) {
    const [isEllipsis, setIsEllipsis] = useState(false);
    const resizeObserver = useGlobalResizeObserver(() => {
        element && setIsEllipsis(element.scrollWidth > element.offsetWidth);
    });

    useEffect(() => {
        if (!canUseDom() || !element) {
            return;
        }
        setIsEllipsis(element.scrollWidth > element.offsetWidth);
        resizeObserver.observe(element);
        return () => {
            resizeObserver.unobserve(element);
        };
    }, [element]);

    return isEllipsis;
}
