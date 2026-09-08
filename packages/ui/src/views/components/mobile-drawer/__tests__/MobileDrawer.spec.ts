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

import type { MobileDrawerOpenMode } from '../MobileDrawer';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement, useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MobileDrawer, resolveMobileDrawerRelease } from '../MobileDrawer';
import { MobileDrawerCoordinatorProvider } from '../MobileDrawerCoordinator';

function DrawerLayer(props: {
    label: string;
    mode?: MobileDrawerOpenMode;
    onClose: () => void;
}) {
    const layerRef = useRef<HTMLDivElement>(null);

    return createElement('div', {
        ref: layerRef,
        'data-testid': `${props.label}-layer`,
    }, createElement(MobileDrawer, {
        layerRef,
        snap: 'compact',
        expandLabel: props.label,
        collapseLabel: props.label,
        onSnapChange: vi.fn(),
        onClose: props.onClose,
        openMode: props.mode,
    }, props.label));
}

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe('mobile drawer snap behavior', () => {
    it('falls back to viewport height units when dynamic viewport units are unavailable', () => {
        vi.stubGlobal('CSS', { supports: () => false });
        const { container } = render(createElement(MobileDrawer, {
            snap: 'compact',
            expandLabel: 'Expand drawer',
            collapseLabel: 'Collapse drawer',
            onSnapChange: vi.fn(),
            onClose: vi.fn(),
        }, 'Drawer content'));

        expect(container.querySelector('section')?.style.height).toBe('40vh');
    });

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

    it('reserves the drag handle for pointer gestures and cancels without changing the drawer', () => {
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

        expect(handle.style.touchAction).toBe('none');
        fireEvent.pointerDown(handle, { pointerId: 1, clientY: 500 });
        fireEvent.pointerMove(handle, { pointerId: 1, clientY: 450 });
        fireEvent.pointerCancel(handle, { pointerId: 1, clientY: 0 });

        expect(onSnapChange).not.toHaveBeenCalled();
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

    it('closes the active drawer and suspended parents when another root drawer opens', () => {
        const closeParent = vi.fn();
        const closeChild = vi.fn();

        render(createElement(MobileDrawerCoordinatorProvider, null, createElement(DrawerLayer, { label: 'Parent drawer', onClose: closeParent }), createElement(DrawerLayer, {
            label: 'Child drawer',
            mode: 'push',
            onClose: closeChild,
        }), createElement(DrawerLayer, { label: 'Replacement drawer', onClose: vi.fn() })));

        expect(closeParent).toHaveBeenCalledOnce();
        expect(closeChild).toHaveBeenCalledOnce();
        expect(screen.getByTestId('Parent drawer-layer')).toHaveProperty('hidden', true);
        expect(screen.getByTestId('Child drawer-layer')).toHaveProperty('hidden', true);
        expect(screen.getByTestId('Replacement drawer-layer')).toHaveProperty('hidden', false);
    });

    it('restores a parent drawer after a pushed drawer closes', () => {
        const closeParent = vi.fn();
        const closeChild = vi.fn();

        render(createElement(MobileDrawerCoordinatorProvider, null, createElement(DrawerLayer, { label: 'Parent drawer', onClose: closeParent }), createElement(DrawerLayer, {
            label: 'Child drawer',
            mode: 'push',
            onClose: closeChild,
        })));

        expect(closeParent).not.toHaveBeenCalled();
        expect(screen.getByTestId('Parent drawer-layer')).toHaveProperty('hidden', true);
        expect(screen.getByTestId('Child drawer-layer')).toHaveProperty('hidden', false);

        const childHandle = screen.getByRole('button', { name: 'Child drawer' });
        fireEvent.pointerDown(childHandle, { pointerId: 1, clientY: 500 });
        fireEvent.pointerMove(childHandle, { pointerId: 1, clientY: 650 });
        fireEvent.pointerUp(childHandle, { pointerId: 1, clientY: 650 });

        expect(closeChild).toHaveBeenCalledOnce();
        expect(screen.getByTestId('Parent drawer-layer')).toHaveProperty('hidden', false);
        expect(screen.getByTestId('Child drawer-layer')).toHaveProperty('hidden', true);
    });
});
