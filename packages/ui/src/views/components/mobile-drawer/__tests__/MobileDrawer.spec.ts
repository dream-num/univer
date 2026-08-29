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

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MobileDrawer, resolveMobileDrawerRelease } from '../MobileDrawer';

afterEach(cleanup);

describe('mobile drawer snap behavior', () => {
    it('supports expand, collapse, restore, and fast close gestures', () => {
        expect(resolveMobileDrawerRelease({ snap: 'compact', deltaY: -40, durationMs: 300, percent: 45 })).toBe('expanded');
        expect(resolveMobileDrawerRelease({ snap: 'expanded', deltaY: 40, durationMs: 300, percent: 75 })).toBe('compact');
        expect(resolveMobileDrawerRelease({ snap: 'compact', deltaY: 8, durationMs: 300, percent: 39 })).toBe('compact');
        expect(resolveMobileDrawerRelease({ snap: 'compact', deltaY: 120, durationMs: 150, percent: 25 })).toBe('closed');
    });

    it('expands when the handle is dragged upward', () => {
        const onSnapChange = vi.fn();
        const onClose = vi.fn();
        const { container } = render(createElement(MobileDrawer, {
            snap: 'compact',
            expandLabel: 'Expand drawer',
            collapseLabel: 'Collapse drawer',
            onSnapChange,
            onClose,
        }, 'Drawer content'));
        const handle = screen.getByRole('button', { name: 'Expand drawer' });

        fireEvent.pointerDown(handle, { pointerId: 1, clientY: 600 });
        fireEvent.pointerMove(handle, { pointerId: 1, clientY: 500 });
        expect(container.querySelector('section')?.style.height).not.toBe('40dvh');
        fireEvent.pointerUp(handle, { pointerId: 1, clientY: 500 });

        expect(onSnapChange).toHaveBeenCalledWith('expanded');
        expect(onClose).not.toHaveBeenCalled();
    });

    it('closes when the compact handle is flicked downward', () => {
        const onSnapChange = vi.fn();
        const onClose = vi.fn();
        render(createElement(MobileDrawer, {
            snap: 'compact',
            expandLabel: 'Expand drawer',
            collapseLabel: 'Collapse drawer',
            onSnapChange,
            onClose,
        }, 'Drawer content'));
        const handle = screen.getByRole('button', { name: 'Expand drawer' });

        fireEvent.pointerDown(handle, { pointerId: 1, clientY: 500 });
        fireEvent.pointerMove(handle, { pointerId: 1, clientY: 650 });
        fireEvent.pointerUp(handle, { pointerId: 1, clientY: 650 });

        expect(onClose).toHaveBeenCalledOnce();
        expect(onSnapChange).not.toHaveBeenCalled();
    });
});
