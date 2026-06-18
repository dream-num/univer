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

/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from 'vitest';
import { createDocsTableLikeCustomBlockWheelHandler } from './EmbedDocsCustomBlockRenderer';

describe('createDocsTableLikeCustomBlockWheelHandler', () => {
    it('uses the latest bleed boundary when scrolling horizontally', () => {
        const live = createScrollableElement({
            clientWidth: 300,
            scrollWidth: 900,
        });
        let maxScrollLeft = 0;
        const onWheel = createDocsTableLikeCustomBlockWheelHandler({
            getLive: () => live,
            getMaxScrollLeft: () => maxScrollLeft,
        });

        maxScrollLeft = 210;
        const event = new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            deltaX: 120,
        });

        onWheel(event);

        expect(live.scrollLeft).toBe(120);
        expect(event.defaultPrevented).toBe(true);
    });

    it('uses the live element native scroll range when no explicit max is provided', () => {
        const live = createScrollableElement({
            clientWidth: 300,
            scrollWidth: 900,
        });
        const onWheel = createDocsTableLikeCustomBlockWheelHandler({
            getLive: () => live,
        });

        const event = new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            deltaX: 600,
        });

        onWheel(event);

        expect(live.scrollLeft).toBe(600);
        expect(event.defaultPrevented).toBe(true);
    });
});

function createScrollableElement(params: {
    clientHeight?: number;
    clientWidth?: number;
    scrollHeight?: number;
    scrollWidth?: number;
}): HTMLElement {
    const element = document.createElement('div');
    Object.defineProperties(element, {
        clientHeight: { configurable: true, value: params.clientHeight ?? 300 },
        clientWidth: { configurable: true, value: params.clientWidth ?? 300 },
        scrollHeight: { configurable: true, value: params.scrollHeight ?? params.clientHeight ?? 300 },
        scrollWidth: { configurable: true, value: params.scrollWidth ?? params.clientWidth ?? 300 },
    });

    return element;
}
