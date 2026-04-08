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
import { describe, expect, it, vi } from 'vitest';
import { useDependency } from '../../../../utils/di';
import { useSidebarClick } from '../use-sidebar-click';

vi.mock('../../../../utils/di', () => ({
    useDependency: vi.fn(),
}));

describe('useSidebarClick', () => {
    it('should attach and detach mousedown listener when container exists', () => {
        const container = document.createElement('div');
        const addEventListener = vi.spyOn(container, 'addEventListener');
        const removeEventListener = vi.spyOn(container, 'removeEventListener');

        vi.mocked(useDependency).mockReturnValue({
            getContainer: () => container,
        } as any);

        const callback = vi.fn();
        const { unmount } = renderHook(() => useSidebarClick(callback));

        expect(addEventListener).toHaveBeenCalledWith('mousedown', callback);
        unmount();
        expect(removeEventListener).toHaveBeenCalledWith('mousedown', callback);
    });

    it('should skip listener binding when container is missing', () => {
        vi.mocked(useDependency).mockReturnValue({
            getContainer: () => undefined,
        } as any);

        const callback = vi.fn();
        const { unmount } = renderHook(() => useSidebarClick(callback));

        unmount();
        expect(callback).not.toHaveBeenCalled();
    });
});
