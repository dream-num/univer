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

import type { RefObject } from 'react';
import type { IMobileKeyboardViewport } from '../components/config-provider/ConfigProvider';
import { useCallback, useContext, useLayoutEffect, useReducer, useRef } from 'react';
import { ConfigContext } from '../components/config-provider/ConfigProvider';

export interface IMobileKeyboardViewportLayout {
    availableHeight: number;
    bottom: number;
    height?: number;
}

export function resolveMobileKeyboardViewportLayout(
    containingBlockTop: number,
    containingBlockBottom: number,
    viewport: IMobileKeyboardViewport,
    heightRatio?: number
): IMobileKeyboardViewportLayout {
    const visibleTop = Math.max(containingBlockTop, viewport.top);
    const visibleBottom = Math.min(containingBlockBottom, viewport.bottom);
    const availableHeight = Math.max(0, visibleBottom - visibleTop);

    return {
        availableHeight,
        bottom: Math.max(0, containingBlockBottom - visibleBottom),
        height: heightRatio == null
            ? undefined
            : Math.min(viewport.stableHeight * heightRatio, availableHeight),
    };
}

export function revealFocusedElementInMobileViewport(
    container: HTMLElement,
    viewport: Pick<IMobileKeyboardViewport, 'top' | 'bottom'>
): boolean {
    const activeElement = document.activeElement;
    if (!(activeElement instanceof HTMLElement) || !container.contains(activeElement)) {
        return false;
    }

    const margin = 12;
    const targetRect = activeElement.getBoundingClientRect();
    let scrollContainer = activeElement.parentElement;
    while (scrollContainer && scrollContainer !== container) {
        const overflowY = getComputedStyle(scrollContainer).overflowY;
        if ((overflowY === 'auto' || overflowY === 'scroll') &&
            scrollContainer.scrollHeight > scrollContainer.clientHeight) {
            const scrollRect = scrollContainer.getBoundingClientRect();
            const safeTop = Math.max(scrollRect.top, viewport.top) + margin;
            const safeBottom = Math.min(scrollRect.bottom, viewport.bottom) - margin;
            if (targetRect.bottom > safeBottom) {
                const previousScrollTop = scrollContainer.scrollTop;
                scrollContainer.scrollTop += targetRect.bottom - safeBottom;
                if (targetRect.bottom - (scrollContainer.scrollTop - previousScrollTop) <= safeBottom) {
                    return true;
                }
                break;
            }
            if (targetRect.top < safeTop) {
                const previousScrollTop = scrollContainer.scrollTop;
                scrollContainer.scrollTop -= safeTop - targetRect.top;
                if (targetRect.top + (previousScrollTop - scrollContainer.scrollTop) >= safeTop) {
                    return true;
                }
                break;
            }
            return false;
        }
        scrollContainer = scrollContainer.parentElement;
    }

    const safeTop = viewport.top + margin;
    const safeBottom = viewport.bottom - margin;
    if (targetRect.bottom > safeBottom || targetRect.top < safeTop) {
        activeElement.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        return true;
    }

    return false;
}

export function useMobileKeyboardViewportLayout(
    elementRef: RefObject<HTMLElement | null>,
    heightRatio?: number
): IMobileKeyboardViewportLayout | null {
    const { mobileKeyboardViewport } = useContext(ConfigContext);
    const [layout, updateLayout] = useReducer(
        (_current: IMobileKeyboardViewportLayout | null, next: IMobileKeyboardViewportLayout | null) => next,
        null
    );
    const layoutRef = useRef<IMobileKeyboardViewportLayout | null>(null);

    const measure = useCallback(() => {
        const element = elementRef.current;
        if (!element || !mobileKeyboardViewport) {
            if (layoutRef.current !== null) {
                layoutRef.current = null;
                updateLayout(null);
            }
            return;
        }

        const containingBlock = element.offsetParent;
        const fixedToViewport = getComputedStyle(element).position === 'fixed' || !containingBlock;
        const containingBlockRect = containingBlock?.getBoundingClientRect();
        const nextLayout = resolveMobileKeyboardViewportLayout(
            fixedToViewport ? 0 : containingBlockRect?.top ?? 0,
            fixedToViewport ? window.innerHeight : containingBlockRect?.bottom ?? window.innerHeight,
            mobileKeyboardViewport,
            heightRatio
        );
        const previous = layoutRef.current;
        if (previous?.availableHeight === nextLayout.availableHeight &&
            previous.bottom === nextLayout.bottom &&
            previous.height === nextLayout.height) {
            return;
        }

        layoutRef.current = nextLayout;
        updateLayout(nextLayout);
    }, [elementRef, heightRatio, mobileKeyboardViewport]);

    useLayoutEffect(() => {
        measure();
        const frame = requestAnimationFrame(measure);
        return () => cancelAnimationFrame(frame);
    });

    return layout;
}
