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

import type { Root } from 'react-dom/client';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ResizeHandle } from '../ResizeHandle';

let container: HTMLDivElement | null = null;
let root: Root | null = null;

describe('ResizeHandle', () => {
    afterEach(() => {
        if (root) {
            act(() => root?.unmount());
        }
        container?.remove();
        document.body.removeAttribute('style');
        container = null;
        root = null;
    });

    it('stops resizing when a captured pointer is released outside the handle', () => {
        const onResize = vi.fn();
        const onResizeEnd = vi.fn();
        const handle = renderResizeHandle(onResize, onResizeEnd);
        let capturedPointerId: number | null = null;
        handle.setPointerCapture = (pointerId) => {
            capturedPointerId = pointerId;
        };
        handle.hasPointerCapture = (pointerId) => capturedPointerId === pointerId;
        handle.releasePointerCapture = (pointerId) => {
            if (capturedPointerId === pointerId) {
                capturedPointerId = null;
            }
        };

        dispatchPointerEvent(handle, 'pointerdown', {
            button: 0,
            buttons: 1,
            clientX: 700,
            isPrimary: true,
            pointerId: 1,
        });
        dispatchPointerEvent(handle, 'pointermove', {
            buttons: 1,
            clientX: 620,
            isPrimary: true,
            pointerId: 1,
        });

        expect(onResize).toHaveBeenLastCalledWith(560);
        expect(document.body.style.cursor).toBe('col-resize');
        expect(document.body.style.userSelect).toBe('none');

        // Pointer capture retargets a pointerup outside the panel back to the handle.
        dispatchPointerEvent(handle, 'pointerup', {
            button: 0,
            buttons: 0,
            clientX: 620,
            isPrimary: true,
            pointerId: 1,
        });
        dispatchPointerEvent(handle, 'pointermove', {
            buttons: 1,
            clientX: 540,
            isPrimary: true,
            pointerId: 1,
        });

        expect(onResizeEnd).toHaveBeenCalledOnce();
        expect(onResizeEnd).toHaveBeenCalledWith(560);
        expect(onResize).toHaveBeenCalledOnce();
        expect(document.body.style.cursor).toBe('');
        expect(document.body.style.userSelect).toBe('');
    });

    it('finishes when pointer movement reports that the primary button is no longer pressed', () => {
        const onResize = vi.fn();
        const onResizeEnd = vi.fn();
        const handle = renderResizeHandle(onResize, onResizeEnd);
        handle.setPointerCapture = () => undefined;
        handle.hasPointerCapture = () => false;
        handle.releasePointerCapture = () => undefined;

        dispatchPointerEvent(handle, 'pointerdown', {
            button: 0,
            buttons: 1,
            clientX: 700,
            isPrimary: true,
            pointerId: 2,
        });
        dispatchPointerEvent(handle, 'pointermove', {
            buttons: 1,
            clientX: 650,
            isPrimary: true,
            pointerId: 2,
        });
        dispatchPointerEvent(handle, 'pointermove', {
            buttons: 0,
            clientX: 630,
            isPrimary: true,
            pointerId: 2,
        });

        expect(onResize).toHaveBeenCalledTimes(2);
        expect(onResizeEnd).toHaveBeenCalledWith(550);
        expect(document.body.style.cursor).toBe('');
        expect(document.body.style.userSelect).toBe('');
    });
    it('restores the starting size and body styles when a drag is cancelled', () => {
        const onResize = vi.fn();
        const onResizeEnd = vi.fn();
        const handle = renderResizeHandle(onResize, onResizeEnd);
        handle.setPointerCapture = () => undefined;
        handle.hasPointerCapture = () => false;
        document.body.style.cursor = 'crosshair';
        dispatchPointerEvent(handle, 'pointerdown', { button: 0, buttons: 1, clientX: 700, isPrimary: true, pointerId: 1 });
        dispatchPointerEvent(handle, 'pointermove', { buttons: 1, clientX: 600, isPrimary: true, pointerId: 1 });
        dispatchPointerEvent(handle, 'pointercancel', { isPrimary: true, pointerId: 1 });
        expect(onResize).toHaveBeenLastCalledWith(480);
        expect(onResizeEnd).toHaveBeenCalledWith(480);
        expect(handle.getAttribute('aria-valuenow')).toBe('480');
        expect(document.body.style.cursor).toBe('crosshair');
    });

    it('supports keyboard limits and restores selection on unmount', () => {
        const onResize = vi.fn();
        const onResizeEnd = vi.fn();
        const handle = renderResizeHandle(onResize, onResizeEnd);
        const press = (key: string, shiftKey = false) => act(() => {
            handle.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }));
        });
        press('ArrowLeft');
        expect(onResizeEnd).toHaveBeenLastCalledWith(496);
        press('ArrowRight', true);
        expect(onResizeEnd).toHaveBeenLastCalledWith(416);
        press('Home');
        expect(onResizeEnd).toHaveBeenLastCalledWith(320);
        press('End');
        expect(onResizeEnd).toHaveBeenLastCalledWith(800);
        handle.setPointerCapture = () => undefined;
        document.body.style.userSelect = 'text';
        dispatchPointerEvent(handle, 'pointerdown', { button: 0, buttons: 1, clientX: 700, isPrimary: true, pointerId: 1 });
        act(() => root?.unmount());
        root = null;
        expect(document.body.style.userSelect).toBe('text');
    });
});

function renderResizeHandle(
    onResize: (width: number) => void,
    onResizeEnd: (width: number) => void
): HTMLDivElement {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
        root?.render(
            <ResizeHandle
                minimumWidth={320}
                side="left"
                currentWidth={480}
                label="Panel size"
                maximumWidth={800}
                onResize={onResize}
                onResizeEnd={onResizeEnd}
            />
        );
    });

    const handle = container.querySelector<HTMLDivElement>('[role="separator"]');
    if (!handle) {
        throw new Error('Resize handle was not rendered');
    }
    return handle;
}

function dispatchPointerEvent(
    target: HTMLElement,
    type: string,
    init: PointerEventInit & { isPrimary: boolean }
): void {
    const event = new PointerEvent(type, { bubbles: true, ...init });
    Object.defineProperty(event, 'isPrimary', { value: init.isPrimary });
    act(() => {
        target.dispatchEvent(event);
    });
}
