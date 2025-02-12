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

import { getOverflowAncestors } from '@floating-ui/dom';
import { floor, max, min } from '@floating-ui/utils';
import { getDocumentElement } from '@floating-ui/utils/dom';
import { Observable } from 'rxjs';

/**
 * Tracks position and size changes of an element by monitoring:
 * - Ancestor scrolling and resizing
 * - Layout shifts
 * - Element's bounding rectangle changes
 *
 * @param containerElement
 * @returns Observable<void>
 */
export function observeClientRect(containerElement: HTMLElement): Observable<void> {
    return new Observable<void>((observer) => {
        const disposable = autoClientRect(containerElement, () => observer.next());
        return () => disposable();
    });
}

/// The following methods are copied from floating-ui's `autoUpdate` function. Though it does not have the floating
/// element but only reports that client rect of the reference element changes.

// https://samthor.au/2021/observing-dom/
function observeMove(element: Element, onMove: () => void) {
    let io: IntersectionObserver | null = null;
    let timeoutId: NodeJS.Timeout;

    const root = getDocumentElement(element);

    function cleanup() {
        clearTimeout(timeoutId);
        io?.disconnect();
        io = null;
    }

    function refresh(skip = false, threshold = 1) {
        cleanup();

        const { left, top, width, height } = element.getBoundingClientRect();

        if (!skip) {
            onMove();
        }

        if (!width || !height) {
            return;
        }

        const insetTop = floor(top);
        const insetRight = floor(root.clientWidth - (left + width));
        const insetBottom = floor(root.clientHeight - (top + height));
        const insetLeft = floor(left);
        const rootMargin = `${-insetTop}px ${-insetRight}px ${-insetBottom}px ${-insetLeft}px`;

        const options = {
            rootMargin,
            threshold: max(0, min(1, threshold)) || 1,
        };

        let isFirstUpdate = true;

        function handleObserve(entries: IntersectionObserverEntry[]) {
            const ratio = entries[0].intersectionRatio;

            if (ratio !== threshold) {
                if (!isFirstUpdate) {
                    return refresh();
                }

                if (!ratio) {
                    // If the reference is clipped, the ratio is 0. Throttle the refresh
                    // to prevent an infinite loop of updates.
                    timeoutId = setTimeout(() => {
                        refresh(false, 1e-7);
                    }, 1000);
                } else {
                    refresh(false, ratio);
                }
            }

            isFirstUpdate = false;
        }

        // Older browsers don't support a `document` as the root and will throw an
        // error.
        try {
            io = new IntersectionObserver(handleObserve, {
                ...options,
                // Handle <iframe>s
                root: root.ownerDocument,
            });
        } catch (e) {
            io = new IntersectionObserver(handleObserve, options);
        }

        io.observe(element);
    }

    refresh(true);

    return cleanup;
}

// This implementation is very simple compared to the original implementation in floating-ui.
// Maybe some bugs.
function getBoundingClientRect(reference: Element) {
    return reference.getBoundingClientRect();
}

/**
 * Tracks position and size changes of an element by monitoring:
 * - Ancestor scrolling and resizing
 * - Layout shifts
 * - Element's bounding rectangle changes
 *
 * Returns a cleanup function to remove all listeners.
 */
function autoClientRect(
    reference: Element,
    update: () => void
) {
    const ancestorScroll = true;
    const ancestorResize = true;
    const layoutShift = true;
    const animationFrame = false;

    const referenceEl = reference;

    const ancestors =
        ancestorScroll || ancestorResize
            ? [
                ...(referenceEl ? getOverflowAncestors(referenceEl) : []),
            ]
            : [];

    ancestors.forEach((ancestor) => {
        ancestorScroll &&
            ancestor.addEventListener('scroll', update, { passive: true });
        ancestorResize && ancestor.addEventListener('resize', update);
    });

    const cleanupIo =
        referenceEl && layoutShift ? observeMove(referenceEl, update) : null;

    let resizeObserver: ResizeObserver | null = null;

    let frameId: number;
    let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;

    if (animationFrame) {
        frameLoop();
    }

    function frameLoop() {
        const nextRefRect = getBoundingClientRect(reference);

        if (prevRefRect &&
            (nextRefRect.x !== prevRefRect.x ||
                nextRefRect.y !== prevRefRect.y ||
                nextRefRect.width !== prevRefRect.width ||
                nextRefRect.height !== prevRefRect.height)
        ) {
            update();
        }

        prevRefRect = nextRefRect;
        frameId = requestAnimationFrame(frameLoop);
    }

    update();

    return () => {
        ancestors.forEach((ancestor) => {
            ancestorScroll && ancestor.removeEventListener('scroll', update);
            ancestorResize && ancestor.removeEventListener('resize', update);
        });

        cleanupIo?.();
        resizeObserver?.disconnect();
        resizeObserver = null;

        if (animationFrame) {
            cancelAnimationFrame(frameId);
        }
    };
}
