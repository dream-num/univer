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
import { resizeObserverCtor } from '@univerjs/design';
import { useEvent } from './event';
/**
 * These hooks are used for browser layout
 * Prefer to client-side
 */

/**
 * Allow the element to scroll when its height over the container height
 * @param element
 * Container means the window view that the element displays in.
 * Recommend pass the sheet mountContainer as container
 * @param container
 */
export function useScrollYOverContainer(element: Nullable<HTMLElement>, container: Nullable<HTMLElement>) {
    const initialRectRef = useRef({
        width: 0,
        height: 0,
    });
    const updater = useEvent(() => {
        if (!element || !container) {
            return;
        }

        const elStyle = element.style;
        const elRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        if (elRect.y < 0 && elRect.y + elRect.height <= 0) {
            /* The element is hidden in viewport */
            return;
        }
        if (Math.abs(elRect.y) < Math.abs(containerRect.y)) {
            /* The position of element is higher than container  */
            elStyle.overflowY = '';
            elStyle.maxHeight = '';
            return;
        }

        const relativeY = elRect.y - containerRect.y;

        const initialHeight = initialRectRef.current?.height || 0;

        if (containerRect.height >= relativeY + initialHeight) {
            elStyle.overflowY = '';
            elStyle.maxHeight = '';
        } else {
            elStyle.overflowY = 'scroll';
            elStyle.maxHeight = `${containerRect.height - relativeY}px`;
        }
    });

    useEffect(() => {
        if (!canUseDom() || !element || !container) {
            return;
        }
        const rect = element.getBoundingClientRect();
        initialRectRef.current = {
            width: rect.width,
            height: rect.height,
        };

        updater();

        const resizeObserver = resizeObserverCtor(updater);
        resizeObserver.observe(element);
        window.addEventListener('resize', updater);
        return () => {
            resizeObserver.unobserve(element);
            window.removeEventListener('resize', updater);
        };
    }, [element, container]);
}
