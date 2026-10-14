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

import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { Popup } from '../Popup';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('Popup', () => {
    it('should move the popup on-screen only while visible', () => {
        const mountContainer = document.createElement('div');
        document.body.appendChild(mountContainer);

        const { rerender } = render(
            <ConfigProvider mountContainer={mountContainer}>
                <Popup visible={false}>
                    <div>popup-content</div>
                </Popup>
            </ConfigProvider>
        );

        const popup = mountContainer.querySelector('section') as HTMLElement;
        expect(Number.parseFloat(popup.style.left)).toBeLessThan(0);
        expect(Number.parseFloat(popup.style.top)).toBeLessThan(0);

        rerender(
            <ConfigProvider mountContainer={mountContainer}>
                <Popup visible>
                    <div>popup-content</div>
                </Popup>
            </ConfigProvider>
        );

        expect(Number.parseFloat(popup.style.left)).toBeGreaterThanOrEqual(0);
        expect(Number.parseFloat(popup.style.top)).toBeGreaterThanOrEqual(0);

        mountContainer.remove();
    });

    it('should clamp popup offset and support resize/contextmenu', async () => {
        const mountContainer = document.createElement('div');
        document.body.appendChild(mountContainer);

        vi.stubGlobal('innerWidth', 100);
        vi.stubGlobal('innerHeight', 100);

        render(
            <ConfigProvider mountContainer={mountContainer}>
                <Popup visible offset={[90, 90]} placementY="above" overflowVisible>
                    <div>popup-content</div>
                </Popup>
            </ConfigProvider>
        );

        const popup = mountContainer.querySelector('section.univer-popup') as HTMLElement;
        expect(popup).toBeInTheDocument();

        Object.defineProperty(popup, 'clientWidth', {
            configurable: true,
            value: 60,
        });
        Object.defineProperty(popup, 'clientHeight', {
            configurable: true,
            value: 40,
        });

        fireEvent(window, new Event('resize'));

        await waitFor(() => {
            expect(popup.style.left).toBe('40px');
            expect(popup.style.top).toBe('52px');
        });

        expect(popup.style.overflow).toBe('visible');

        const contextMenuEvent = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
        });
        popup.dispatchEvent(contextMenuEvent);
        expect(contextMenuEvent.defaultPrevented).toBe(true);

        mountContainer.remove();
    });

    it.each(['below', 'above'] as const)('keeps a %s popup inside the viewport when content height changes', (placementY) => {
        vi.stubGlobal('innerHeight', 800);
        vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(208);
        const height = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(444);
        let notifyResize = () => {};
        const disconnect = vi.fn();
        vi.stubGlobal('ResizeObserver', class {
            constructor(callback: () => void) {
                notifyResize = callback;
            }

            observe() {}

            disconnect = disconnect;
        });

        const { unmount } = render(
            <ConfigProvider mountContainer={document.body}>
                <Popup visible offset={[500, 748]} placementY={placementY}>
                    <div>popup-content</div>
                </Popup>
            </ConfigProvider>
        );

        const popup = document.querySelector('section.univer-popup') as HTMLElement;
        const initialTop = Number.parseFloat(popup.style.top);
        height.mockReturnValue(578);
        act(() => notifyResize());

        const expandedTop = Number.parseFloat(popup.style.top);
        expect(expandedTop).toBeLessThan(initialTop);
        expect(expandedTop).toBeGreaterThanOrEqual(0);
        expect(expandedTop + popup.clientHeight).toBeLessThanOrEqual(window.innerHeight);

        height.mockReturnValue(200);
        act(() => notifyResize());
        expect(Number.parseFloat(popup.style.top)).toBeGreaterThan(expandedTop);
        expect(Number.parseFloat(popup.style.top) + popup.clientHeight).toBeLessThanOrEqual(window.innerHeight);

        unmount();
        expect(disconnect).toHaveBeenCalledOnce();
    });
});
