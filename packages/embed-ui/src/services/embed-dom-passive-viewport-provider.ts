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

import type { UniverInstanceType } from '@univerjs/core';
import type { EmbedLayout } from '@univerjs/embed';
import type { IEmbedPassiveViewportProvider } from '../types/embed-ui';

export interface ICreateEmbedDomPassiveViewportProviderOptions {
    childType: UniverInstanceType;
    supportedLayouts?: EmbedLayout[];
}

export function createEmbedDomPassiveViewportProvider(
    options: ICreateEmbedDomPassiveViewportProviderOptions
): IEmbedPassiveViewportProvider {
    return {
        childType: options.childType,
        supportedLayouts: options.supportedLayouts,
        handleWheel: (context) => {
            const liveRoot = context.runtimeScope.roots.root;
            const forwarded = forwardWheelToRuntime(context.event, liveRoot);
            const scrolled = scrollRuntimeDom(context.event, liveRoot);
            return forwarded || scrolled;
        },
    };
}

function forwardWheelToRuntime(event: WheelEvent, liveRoot: HTMLElement): boolean {
    const target = findRuntimeElementAtPoint(liveRoot, event.clientX, event.clientY) ?? liveRoot;
    if (target === liveRoot && !liveRoot.contains(target)) {
        return false;
    }

    const forwardedEvent = new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        clientX: event.clientX,
        clientY: event.clientY,
        ctrlKey: event.ctrlKey,
        deltaMode: event.deltaMode,
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        deltaZ: event.deltaZ,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
    });

    target.dispatchEvent(forwardedEvent);
    return forwardedEvent.defaultPrevented;
}

function scrollRuntimeDom(event: WheelEvent, liveRoot: HTMLElement): boolean {
    const target = findRuntimeElementAtPoint(liveRoot, event.clientX, event.clientY) ?? liveRoot;
    const scrollable = findScrollableRuntimeElement(target, liveRoot, event);
    if (!scrollable) {
        return false;
    }

    const deltaX = event.deltaX || (event.shiftKey ? event.deltaY : 0);
    const deltaY = event.shiftKey ? 0 : event.deltaY;
    const previousLeft = scrollable.scrollLeft;
    const previousTop = scrollable.scrollTop;

    if (deltaX) {
        scrollable.scrollLeft += deltaX;
    }
    if (deltaY) {
        scrollable.scrollTop += deltaY;
    }

    return scrollable.scrollLeft !== previousLeft || scrollable.scrollTop !== previousTop;
}

function findRuntimeElementAtPoint(root: HTMLElement, clientX: number, clientY: number): HTMLElement | null {
    if (!isPointInsideElement(root, clientX, clientY)) {
        return null;
    }

    let matched: HTMLElement = root;
    const visit = (element: HTMLElement) => {
        const children = Array.from(element.children);
        for (let index = children.length - 1; index >= 0; index--) {
            const child = children[index];
            if (!(child instanceof HTMLElement) || !isPointInsideElement(child, clientX, clientY)) {
                continue;
            }

            matched = child;
            visit(child);
            return;
        }
    };

    visit(root);
    return matched;
}

function isPointInsideElement(element: HTMLElement, clientX: number, clientY: number): boolean {
    const rect = element.getBoundingClientRect();
    return clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;
}

function findScrollableRuntimeElement(target: HTMLElement, liveRoot: HTMLElement, event: WheelEvent): HTMLElement | null {
    const deltaX = event.deltaX || (event.shiftKey ? event.deltaY : 0);
    const deltaY = event.shiftKey ? 0 : event.deltaY;
    let current: HTMLElement | null = target;

    while (current && liveRoot.contains(current)) {
        if (canScrollElement(current, deltaX, deltaY)) {
            return current;
        }
        current = current.parentElement;
    }

    return canScrollElement(liveRoot, deltaX, deltaY) ? liveRoot : null;
}

function canScrollElement(element: HTMLElement, deltaX: number, deltaY: number): boolean {
    const canScrollX = deltaX !== 0 && element.scrollWidth > element.clientWidth && (
        deltaX < 0 ? element.scrollLeft > 0 : element.scrollLeft + element.clientWidth < element.scrollWidth
    );
    const canScrollY = deltaY !== 0 && element.scrollHeight > element.clientHeight && (
        deltaY < 0 ? element.scrollTop > 0 : element.scrollTop + element.clientHeight < element.scrollHeight
    );

    return canScrollX || canScrollY;
}
