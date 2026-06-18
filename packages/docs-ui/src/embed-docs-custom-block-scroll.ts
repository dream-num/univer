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

export interface IDocsTableLikeCustomBlockScrollOptions {
    maxScrollLeft?: number;
}

export function scrollDocsTableLikeCustomBlockLive(event: WheelEvent, live: HTMLElement, options: IDocsTableLikeCustomBlockScrollOptions = {}): boolean {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey) {
        return false;
    }

    const deltaX = event.deltaX || (event.shiftKey ? event.deltaY : 0);
    const deltaY = event.shiftKey ? 0 : event.deltaY;
    const previousLeft = live.scrollLeft;
    const previousTop = live.scrollTop;
    const maxScrollLeft = resolveMaxScrollLeft(live, options.maxScrollLeft);

    if (deltaX && canScrollX(live, deltaX, maxScrollLeft)) {
        live.scrollLeft = clampScroll(previousLeft + deltaX, 0, maxScrollLeft);
    }

    if (deltaY && canScrollY(live, deltaY)) {
        live.scrollTop = clampScroll(previousTop + deltaY, 0, live.scrollHeight - live.clientHeight);
    }

    return live.scrollLeft !== previousLeft || live.scrollTop !== previousTop;
}

function canScrollX(element: HTMLElement, deltaX: number, maxScrollLeft: number): boolean {
    return element.scrollWidth > element.clientWidth &&
        (deltaX < 0 ? element.scrollLeft > 0 : element.scrollLeft < maxScrollLeft);
}

function canScrollY(element: HTMLElement, deltaY: number): boolean {
    return element.scrollHeight > element.clientHeight &&
        (deltaY < 0 ? element.scrollTop > 0 : element.scrollTop + element.clientHeight < element.scrollHeight);
}

function clampScroll(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function resolveMaxScrollLeft(element: HTMLElement, requestedMaxScrollLeft: number | undefined): number {
    const nativeMaxScrollLeft = Math.max(0, element.scrollWidth - element.clientWidth);
    if (!Number.isFinite(requestedMaxScrollLeft)) {
        return nativeMaxScrollLeft;
    }

    return clampScroll(requestedMaxScrollLeft ?? nativeMaxScrollLeft, 0, nativeMaxScrollLeft);
}
