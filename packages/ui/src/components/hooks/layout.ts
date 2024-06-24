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

import canUseDom from 'rc-util/lib/Dom/canUseDom';
import { useEffect } from 'react';

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
    const updater = useEvent(() => {
        if (!element || !container) {
            return;
        }

        const elStyle = element.style;
        const elRect = element.getBoundingClientRect();
        const { y } = elRect;
        const containerRect = container.getBoundingClientRect();

        const scrolled = element.scrollHeight > elRect.height;

        const isOverViewport = y < 0 || (y + elRect.height > containerRect.height);

        if (!isOverViewport && !scrolled) {
            elStyle.overflowY = '';
            elStyle.maxHeight = '';
            return;
        }

        if (isOverViewport) {
            elStyle.overflowY = 'scroll';
            elStyle.maxHeight = y < 0 ? `${element.scrollHeight + y}px` : `${containerRect.height - y}px`;
        }
    });

    useEffect(() => {
        if (!canUseDom() || !element || !container) {
            return;
        }
        updater();

        const resizeObserver = resizeObserverCtor(updater);
        resizeObserver.observe(element);
        return () => {
            resizeObserver.unobserve(element);
        };
    }, [element, container]);
}
