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

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    resolveMobileKeyboardViewportLayout,
    revealFocusedElementInMobileViewport,
} from '../use-mobile-keyboard-viewport';

afterEach(() => {
    document.body.replaceChildren();
});

describe('mobile keyboard viewport', () => {
    it('maps the visible viewport into both stable and already-resized containing blocks', () => {
        const viewport = { top: 0, bottom: 520, height: 520, stableHeight: 852 };

        expect(resolveMobileKeyboardViewportLayout(0, 852, viewport, 0.4)).toEqual({
            availableHeight: 520,
            bottom: 332,
            height: 340.8,
        });
        expect(resolveMobileKeyboardViewportLayout(0, 520, viewport, 0.8)).toEqual({
            availableHeight: 520,
            bottom: 0,
            height: 520,
        });
    });

    it('scrolls the nearest panel content so the focused input stays visible', () => {
        const container = document.createElement('section');
        const scroller = document.createElement('div');
        const input = document.createElement('input');
        scroller.style.overflowY = 'auto';
        scroller.appendChild(input);
        container.appendChild(scroller);
        document.body.appendChild(container);
        input.focus();

        Object.defineProperties(scroller, {
            clientHeight: { configurable: true, value: 200 },
            scrollHeight: { configurable: true, value: 800 },
        });
        scroller.getBoundingClientRect = () => ({
            bottom: 300,
            height: 200,
            left: 0,
            right: 320,
            top: 100,
            width: 320,
            x: 0,
            y: 100,
            toJSON: () => undefined,
        });
        input.getBoundingClientRect = () => ({
            bottom: 380,
            height: 40,
            left: 0,
            right: 320,
            top: 340,
            width: 320,
            x: 0,
            y: 340,
            toJSON: () => undefined,
        });

        expect(revealFocusedElementInMobileViewport(container, { top: 0, bottom: 300 })).toBe(true);
        expect(scroller.scrollTop).toBe(92);
    });

    it('asks the browser to reveal a covered input when there is no scrollable panel', () => {
        const container = document.createElement('section');
        const input = document.createElement('input');
        const scrollIntoView = vi.fn();
        input.scrollIntoView = scrollIntoView;
        container.appendChild(input);
        document.body.appendChild(container);
        input.focus();
        input.getBoundingClientRect = () => ({
            bottom: 380,
            height: 40,
            left: 0,
            right: 320,
            top: 340,
            width: 320,
            x: 0,
            y: 340,
            toJSON: () => undefined,
        });

        expect(revealFocusedElementInMobileViewport(container, { top: 0, bottom: 300 })).toBe(true);
        expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
    });
});
