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

import { describe, expect, it, vi } from 'vitest';
import { createEmbedDomPassiveViewportProvider } from '../embed-dom-passive-viewport-provider';

describe('createEmbedDomPassiveViewportProvider', () => {
    it('scrolls a runtime DOM container under the wheel point', () => {
        const provider = createEmbedDomPassiveViewportProvider({ childType: 2 as never });
        const root = document.createElement('div');
        const scrollable = document.createElement('div');
        root.appendChild(scrollable);
        Object.defineProperty(root, 'getBoundingClientRect', {
            value: () => ({ left: 0, top: 0, right: 200, bottom: 200, width: 200, height: 200 }),
        });
        Object.defineProperty(scrollable, 'getBoundingClientRect', {
            value: () => ({ left: 0, top: 0, right: 200, bottom: 200, width: 200, height: 200 }),
        });
        Object.defineProperty(scrollable, 'clientHeight', { configurable: true, value: 100 });
        Object.defineProperty(scrollable, 'scrollHeight', { configurable: true, value: 300 });
        scrollable.scrollTop = 0;

        const handled = provider.handleWheel(createContext(root, new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            clientX: 10,
            clientY: 10,
            deltaY: 80,
        })));

        expect(handled).toBe(true);
        expect(scrollable.scrollTop).toBe(80);
    });

    it('forwards wheel events to runtime listeners before DOM fallback', () => {
        const provider = createEmbedDomPassiveViewportProvider({ childType: 2 as never });
        const root = document.createElement('div');
        const target = document.createElement('div');
        root.appendChild(target);
        Object.defineProperty(root, 'getBoundingClientRect', {
            value: () => ({ left: 0, top: 0, right: 200, bottom: 200, width: 200, height: 200 }),
        });
        Object.defineProperty(target, 'getBoundingClientRect', {
            value: () => ({ left: 0, top: 0, right: 200, bottom: 200, width: 200, height: 200 }),
        });
        const listener = vi.fn((event: WheelEvent) => event.preventDefault());
        target.addEventListener('wheel', listener);

        const handled = provider.handleWheel(createContext(root, new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            clientX: 10,
            clientY: 10,
            deltaY: 80,
        })));

        expect(handled).toBe(true);
        expect(listener).toHaveBeenCalledTimes(1);
    });
});

function createContext(root: HTMLElement, event: WheelEvent) {
    return {
        event,
        stage: 'inactive',
        runtimeScope: {
            roots: {
                root,
                content: root,
                overlay: root,
                popup: root,
            },
        },
    } as any;
}
