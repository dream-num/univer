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

import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { Popup } from '../Popup';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
    cleanup();
});

describe('Popup', () => {
    it('should clamp popup offset and support resize/contextmenu', async () => {
        const mountContainer = document.createElement('div');
        document.body.appendChild(mountContainer);

        Object.defineProperty(window, 'innerWidth', {
            configurable: true,
            value: 100,
        });
        Object.defineProperty(window, 'innerHeight', {
            configurable: true,
            value: 100,
        });

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

    it('should move popup off-screen when hidden', async () => {
        const mountContainer = document.createElement('div');
        document.body.appendChild(mountContainer);

        render(
            <ConfigProvider mountContainer={mountContainer}>
                <Popup visible={false} offset={[10, 20]}>
                    <div>popup-content</div>
                </Popup>
            </ConfigProvider>
        );

        const popup = mountContainer.querySelector('section.univer-popup') as HTMLElement;
        expect(popup).toBeInTheDocument();

        await waitFor(() => {
            expect(popup.style.left).toBe('-9997px');
            expect(popup.style.top).toBe('-9997px');
        });

        mountContainer.remove();
    });
});
