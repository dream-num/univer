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

import type { IBoundRectNoAngle } from '@univerjs/engine-render';
import type { IPopup } from '@univerjs/ui';
import type { Observable } from 'rxjs';
import { DocumentBlockType } from '@univerjs/core';
import { RectPopup } from '@univerjs/ui';
import { Subscription } from 'rxjs';

export function observeParagraphMenuPosition(
    element: HTMLElement,
    popup: IPopup,
    targets$: Observable<{ kind: DocumentBlockType } | null>
): () => void {
    let anchor: IBoundRectNoAngle | undefined;
    let table = false;
    let previousPosition: { top: number; left: number; styleTop: string; styleLeft: string } | undefined;
    let disposed = false;
    const previousTransition = element.style.transition;
    const updatePosition = () => {
        if (disposed || !anchor || element.style.visibility === 'hidden') {
            return;
        }
        const gap = table ? 0 : 8;
        const boundary = popup.canvasElement.getBoundingClientRect();
        const containerLeft = Math.max(boundary.left, 0);
        const containerTop = Math.max(boundary.top, 0);
        const position = RectPopup.calcPopupPosition({
            position: { ...anchor, left: anchor.left - gap, right: anchor.right + gap },
            width: element.clientWidth,
            height: element.clientHeight,
            direction: table ? 'top-right' : 'left-center',
            containerLeft,
            containerTop,
            containerWidth: Math.max(0, Math.min(boundary.right, window.innerWidth) - containerLeft),
            containerHeight: Math.max(0, Math.min(boundary.bottom, window.innerHeight) - containerTop),
            boundaryInsets: popup.boundaryInsets,
            noPushMinimumGap: popup.noPushMinimumGap,
        });
        if (previousPosition?.top === position.top && previousPosition.left === position.left &&
            element.style.top === previousPosition.styleTop && element.style.left === previousPosition.styleLeft) {
            return;
        }
        element.style.transition = previousPosition && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
            ? 'top 100ms ease-out, left 100ms ease-out'
            : '';
        element.style.top = `${position.top}px`;
        element.style.left = `${position.left}px`;
        // Compare the browser's serialized CSS values on the next mutation, including fractional coordinates.
        previousPosition = { ...position, styleTop: element.style.top, styleLeft: element.style.left };
    };
    // Reapply Docs placement after RectPopup updates its own positioning styles, before the next paint.
    const mutationObserver = new MutationObserver(updatePosition);
    mutationObserver.observe(element, { attributes: true, attributeFilter: ['style'] });
    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(element);
    resizeObserver.observe(popup.canvasElement);
    const subscription = new Subscription();
    subscription.add(targets$.subscribe((target) => {
        table = target?.kind === DocumentBlockType.TABLE;
        updatePosition();
    }));
    subscription.add(popup.anchorRect$.subscribe((rect) => {
        anchor = rect;
        updatePosition();
    }));

    return () => {
        if (disposed) {
            return;
        }
        disposed = true;
        subscription.unsubscribe();
        mutationObserver.disconnect();
        resizeObserver.disconnect();
        element.style.transition = previousTransition;
    };
}
