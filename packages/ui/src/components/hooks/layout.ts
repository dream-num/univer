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

import { useEffect } from 'react';
import { BehaviorSubject } from 'rxjs';
import canUseDom from 'rc-util/lib/Dom/canUseDom';

import type { Nullable } from '@univerjs/core';
/**
 * These hooks are used for browser layout
 * Prefer to client-side
 */

/**
 * To detect whether the element is displayed over the viewport
 * @param element
 * @returns $value To notice you detected result
 */
function detectElementOverViewport(element: HTMLElement) {
    const state$ = new BehaviorSubject<{
        x: boolean;
        y: boolean;
        xe: boolean;
        ye: boolean;
    }>({
        /** Element displayed on x-axis is not fully show */
        x: false,
        /** Element displayed on y-axis is not fully show  */
        y: false,
        /** Element border is equal to viewport x edge */
        xe: false,
        /** Element border is equal to viewport y edge */
        ye: false,
    });

    function update() {
        const rect = element.getBoundingClientRect();
        const { innerHeight, innerWidth } = window;

        const overX = rect.x >= 0;
        const overY = rect.y >= 0;

        state$.next({
            x: overX && rect.x + rect.width > innerWidth,
            xe: overX && rect.x + rect.width === innerWidth,
            y: overY && rect.y + rect.height > innerHeight,
            ye: overY && rect.y + rect.height === innerHeight,
        });
    }

    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener('resize', update);

    update();

    return {
        value$: state$.asObservable(),
        dispose() {
            observer.disconnect();
            window.removeEventListener('resize', update);
            state$.complete();
        },
    };
}

/** Allow the element to scroll when its height over the viewport height */
export function useScrollOnOverViewport(element: Nullable<HTMLElement>, disabled: boolean = false) {
    useEffect(() => {
        if (canUseDom() || !element || disabled) {
            return;
        }

        const detector = detectElementOverViewport(element);
        detector.value$.subscribe(({ y, ye }) => {
            const elStyle = element.style;
            const rect = element.getBoundingClientRect();
            // When element height over viewport sets height to fit in viewport
            if (y) {
                elStyle.overflowY = 'scroll';
                elStyle.maxHeight = `${window.innerHeight - rect.y}px`;
            } else if (!ye) {
                /**
                 * If element height is equal to viewport, it may be because of my previous adjustment
                 * On height is less than viewport then set to auto
                 */
                elStyle.overflowY = '';
                elStyle.maxHeight = '';
            }
        });

        return detector.dispose;
    }, [element, disabled]);
}
