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

import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useScrollYOverContainer } from '../layout';

describe('useScrollYOverContainer', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should disconnect the ResizeObserver when unmounted', () => {
        const disconnect = vi.fn();

        class MockResizeObserver {
            disconnect = disconnect;
            observe = vi.fn();
            takeRecords = vi.fn(() => []);
            unobserve = vi.fn();
        }

        vi.stubGlobal('ResizeObserver', MockResizeObserver as unknown as typeof ResizeObserver);

        const element = document.createElement('div');
        const container = document.createElement('div');
        const { unmount } = renderHook(() => useScrollYOverContainer(element, container));

        unmount();

        expect(disconnect).toHaveBeenCalledTimes(1);
    });
});
