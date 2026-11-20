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
import { render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useVirtualList } from '../virtual-list';

function VirtualList({ visible }: { visible: boolean }) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    useVirtualList(['page'], { containerTarget: containerRef, itemHeight: 20 });
    return visible ? <div ref={containerRef} /> : null;
}

describe('useVirtualList', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('ignores a resize notification after the container has detached', () => {
        let notifyResize: ResizeObserverCallback | undefined;
        vi.stubGlobal('ResizeObserver', class {
            constructor(callback: ResizeObserverCallback) {
                notifyResize = callback;
            }

            observe() {}
            disconnect() {}
        });

        const { rerender, unmount } = render(<VirtualList visible />);
        expect(notifyResize).toBeDefined();
        rerender(<VirtualList visible={false} />);
        expect(() => notifyResize!([], {} as ResizeObserver)).not.toThrow();
        unmount();
    });
});
