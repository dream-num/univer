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

import { describe, expect, it, vi } from 'vitest';
import { preventBrowserZoomInContainers } from '../prevent-browser-zoom';

describe('preventBrowserZoomInContainers', () => {
    it('prevents modified wheel defaults before a child stops propagation', () => {
        const container = document.createElement('div');
        const child = document.createElement('div');
        const childListener = vi.fn((event: WheelEvent) => event.stopPropagation());
        container.appendChild(child);
        child.addEventListener('wheel', childListener);
        const dispose = preventBrowserZoomInContainers([container]);

        const event = new WheelEvent('wheel', { bubbles: true, cancelable: true });
        Object.defineProperty(event, 'ctrlKey', { value: true });
        child.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
        expect(childListener).toHaveBeenCalledTimes(1);
        dispose();
    });

    it('leaves ordinary wheel scrolling unchanged', () => {
        const container = document.createElement('div');
        const dispose = preventBrowserZoomInContainers([container]);
        const event = new WheelEvent('wheel', { bubbles: true, cancelable: true });

        container.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(false);
        dispose();
    });

    it('prevents Safari gesture zoom and removes every listener on cleanup', () => {
        const container = document.createElement('div');
        const dispose = preventBrowserZoomInContainers([container]);
        const gestureStart = new Event('gesturestart', { bubbles: true, cancelable: true });
        const gestureChange = new Event('gesturechange', { bubbles: true, cancelable: true });

        container.dispatchEvent(gestureStart);
        container.dispatchEvent(gestureChange);

        expect(gestureStart.defaultPrevented).toBe(true);
        expect(gestureChange.defaultPrevented).toBe(true);

        dispose();
        const wheelAfterDispose = new WheelEvent('wheel', { bubbles: true, cancelable: true, metaKey: true });
        const gestureAfterDispose = new Event('gesturestart', { bubbles: true, cancelable: true });
        container.dispatchEvent(wheelAfterDispose);
        container.dispatchEvent(gestureAfterDispose);

        expect(wheelAfterDispose.defaultPrevented).toBe(false);
        expect(gestureAfterDispose.defaultPrevented).toBe(false);
    });
});
