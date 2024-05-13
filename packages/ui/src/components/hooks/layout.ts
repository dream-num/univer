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

import { useEffect, useRef } from 'react';
import canUseDom from 'rc-util/lib/Dom/canUseDom';

import type { Nullable } from '@univerjs/core';
import { useGlobalResizeObserver } from '@univerjs/design';
import { useEvent } from './event';
/**
 * These hooks are used for browser layout
 * Prefer to client-side
 */

/** Allow the element to scroll when its height over the viewport height */
export function useScrollOnOverViewport(element: Nullable<HTMLElement>) {
    const initialRectRef = useRef({
        width: 0,
        height: 0,
    });
    const updater = useEvent(() => {
        if (!element) {
            return;
        }

        const { y: rectY } = element.getBoundingClientRect();
        const { innerHeight } = window;
        const initialHeight = initialRectRef.current?.height || 0;

        const elStyle = element.style;
        if (rectY < 0) {
            /* The element is hidden in viewport */
            return;
        }

        if (innerHeight >= rectY + initialHeight) {
            elStyle.overflowY = '';
            elStyle.maxHeight = '';
        } else {
            elStyle.overflowY = 'scroll';
            elStyle.maxHeight = `${innerHeight - rectY}px`;
        }
    });

    const resizeObserver = useGlobalResizeObserver(updater);

    useEffect(() => {
        if (!canUseDom() || !element) {
            return;
        }
        const rect = element.getBoundingClientRect();
        initialRectRef.current = {
            width: rect.width,
            height: rect.height,
        };
        updater();
        window.addEventListener('resize', updater);
        resizeObserver.observe(element);
        return () => {
            resizeObserver.unobserve(element);
            window.removeEventListener('resize', updater);
        };
    }, [element]);
}
