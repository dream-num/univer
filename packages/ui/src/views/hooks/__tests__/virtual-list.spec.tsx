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
import { expect, it, onTestFinished, vi } from 'vitest';
import { useVirtualList } from '../virtual-list';

it('ignores a queued resize notification after the virtual list unmounts', () => {
    let notifyResize: ResizeObserverCallback | undefined;
    const disconnect = vi.fn();
    class PlatformResizeObserver {
        constructor(callback: ResizeObserverCallback) {
            notifyResize = callback;
        }

        observe() {}
        disconnect() {
            disconnect();
        }
    }
    vi.stubGlobal('ResizeObserver', PlatformResizeObserver);
    onTestFinished(() => {
        vi.unstubAllGlobals();
    });

    const containerTarget = { current: document.createElement('div') as HTMLElement | null };
    const { unmount } = renderHook(() => useVirtualList(['one'], { containerTarget, itemHeight: 20 }));
    unmount();
    containerTarget.current = null;

    expect(() => notifyResize?.([], {} as ResizeObserver)).not.toThrow();
    expect(disconnect).toHaveBeenCalledOnce();
});
