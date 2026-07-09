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
import { scrollDocsTableLikeCustomBlockLive } from '../embed-docs-custom-block-scroll';

describe('scrollDocsTableLikeCustomBlockLive', () => {
    it('consumes horizontal wheel while the bleed viewport can scroll', () => {
        const live = createScrollableElement({
            clientWidth: 300,
            scrollWidth: 900,
        });

        const handled = scrollDocsTableLikeCustomBlockLive(createWheelEvent({ deltaX: 120 }), live);

        expect(handled).toBe(true);
        expect(live.scrollLeft).toBe(120);
    });

    it('uses shift vertical wheel as horizontal scroll', () => {
        const live = createScrollableElement({
            clientWidth: 300,
            scrollWidth: 900,
        });

        const handled = scrollDocsTableLikeCustomBlockLive(createWheelEvent({ deltaY: 80, shiftKey: true }), live);

        expect(handled).toBe(true);
        expect(live.scrollLeft).toBe(80);
        expect(live.scrollTop).toBe(0);
    });

    it('uses the native horizontal range after the viewport has bled to the left boundary', () => {
        const live = createScrollableElement({
            clientWidth: 300,
            scrollWidth: 900,
            scrollLeft: 250,
        });

        const handled = scrollDocsTableLikeCustomBlockLive(createWheelEvent({ deltaX: 300 }), live, {
            maxScrollLeft: undefined,
        });

        expect(handled).toBe(true);
        expect(live.scrollLeft).toBe(550);

        const chained = scrollDocsTableLikeCustomBlockLive(createWheelEvent({ deltaX: 10 }), live, {
            maxScrollLeft: undefined,
        });

        expect(chained).toBe(true);
        expect(live.scrollLeft).toBe(560);
    });

    it('chains horizontal wheel only after the native horizontal range is exhausted', () => {
        const live = createScrollableElement({
            clientWidth: 300,
            scrollWidth: 900,
            scrollLeft: 600,
        });

        const handled = scrollDocsTableLikeCustomBlockLive(createWheelEvent({ deltaX: 10 }), live);

        expect(handled).toBe(false);
        expect(live.scrollLeft).toBe(600);
    });

    it('chains vertical wheel to docs when the block cannot scroll further', () => {
        const live = createScrollableElement({
            clientHeight: 300,
            scrollHeight: 900,
            scrollTop: 600,
        });

        const handled = scrollDocsTableLikeCustomBlockLive(createWheelEvent({ deltaY: 120 }), live);

        expect(handled).toBe(false);
        expect(live.scrollTop).toBe(600);
    });

    it('consumes vertical wheel while the live container can scroll', () => {
        const live = createScrollableElement({
            clientHeight: 300,
            scrollHeight: 900,
        });

        const handled = scrollDocsTableLikeCustomBlockLive(createWheelEvent({ deltaY: 120 }), live);

        expect(handled).toBe(true);
        expect(live.scrollTop).toBe(120);
    });

    it('does not scroll when the child runtime already consumed the wheel event', () => {
        const live = createScrollableElement({
            clientHeight: 300,
            scrollHeight: 900,
        });
        const event = createWheelEvent({ deltaY: 120 });
        event.preventDefault();

        const handled = scrollDocsTableLikeCustomBlockLive(event, live);

        expect(handled).toBe(false);
        expect(live.scrollTop).toBe(0);
    });
});

function createWheelEvent(params: { deltaX?: number; deltaY?: number; shiftKey?: boolean }): WheelEvent {
    return new WheelEvent('wheel', {
        cancelable: true,
        deltaX: params.deltaX ?? 0,
        deltaY: params.deltaY ?? 0,
        shiftKey: params.shiftKey ?? false,
    });
}

function createScrollableElement(params: {
    clientHeight?: number;
    clientWidth?: number;
    scrollHeight?: number;
    scrollLeft?: number;
    scrollTop?: number;
    scrollWidth?: number;
}): HTMLElement {
    const element = document.createElement('div');
    Object.defineProperties(element, {
        clientHeight: { configurable: true, value: params.clientHeight ?? 300 },
        clientWidth: { configurable: true, value: params.clientWidth ?? 300 },
        scrollHeight: { configurable: true, value: params.scrollHeight ?? params.clientHeight ?? 300 },
        scrollWidth: { configurable: true, value: params.scrollWidth ?? params.clientWidth ?? 300 },
    });
    element.scrollLeft = params.scrollLeft ?? 0;
    element.scrollTop = params.scrollTop ?? 0;

    return element;
}
