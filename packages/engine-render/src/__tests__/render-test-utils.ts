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

import { vi } from 'vitest';

function patchCanvasContextProto() {
    const proto = (globalThis as any).CanvasRenderingContext2D?.prototype as Record<string, unknown> | undefined;
    if (!proto) {
        return;
    }

    if (!proto.getTransform) {
        proto.getTransform = vi.fn(() => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }));
    }
    if (!proto.getContextAttributes) {
        proto.getContextAttributes = vi.fn(() => ({}));
    }
    if (!proto.reset) {
        proto.reset = vi.fn();
    }
    if (!proto.roundRect) {
        proto.roundRect = vi.fn();
    }
    if (!proto.drawFocusIfNeeded) {
        proto.drawFocusIfNeeded = vi.fn();
    }
    if (!proto.createConicGradient) {
        proto.createConicGradient = vi.fn(() => ({ addColorStop: vi.fn() }));
    }
    if (!proto.isContextLost) {
        proto.isContextLost = vi.fn(() => false);
    }

    if (proto.webkitBackingStorePixelRatio == null) {
        proto.webkitBackingStorePixelRatio = 1;
    }
    if (proto.mozBackingStorePixelRatio == null) {
        proto.mozBackingStorePixelRatio = 1;
    }
    if (proto.msBackingStorePixelRatio == null) {
        proto.msBackingStorePixelRatio = 1;
    }
    if (proto.oBackingStorePixelRatio == null) {
        proto.oBackingStorePixelRatio = 1;
    }
    if (proto.backingStorePixelRatio == null) {
        proto.backingStorePixelRatio = 1;
    }
}

function patchPointerCapture() {
    const proto = HTMLCanvasElement.prototype as any;
    if (!proto.setPointerCapture) {
        proto.setPointerCapture = () => {};
    }
    if (!proto.releasePointerCapture) {
        proto.releasePointerCapture = () => {};
    }
    if (!proto.hasPointerCapture) {
        proto.hasPointerCapture = () => false;
    }

    const captureMap = new WeakMap<HTMLCanvasElement, Set<number>>();
    const getCaptureSet = (canvas: HTMLCanvasElement) => {
        let set = captureMap.get(canvas);
        if (!set) {
            set = new Set<number>();
            captureMap.set(canvas, set);
        }
        return set;
    };

    const setPointerCaptureSpy = vi.spyOn(proto, 'setPointerCapture').mockImplementation(function (
        this: HTMLCanvasElement,
        ...args: unknown[]
    ) {
        getCaptureSet(this).add(Number(args[0]));
    });
    const releasePointerCaptureSpy = vi.spyOn(proto, 'releasePointerCapture').mockImplementation(function (
        this: HTMLCanvasElement,
        ...args: unknown[]
    ) {
        getCaptureSet(this).delete(Number(args[0]));
    });
    const hasPointerCaptureSpy = vi.spyOn(proto, 'hasPointerCapture').mockImplementation(function (
        this: HTMLCanvasElement,
        ...args: unknown[]
    ) {
        return getCaptureSet(this).has(Number(args[0]));
    });

    return {
        setPointerCaptureSpy,
        releasePointerCaptureSpy,
        hasPointerCaptureSpy,
    };
}

export function setupRenderTestEnv() {
    const originalJest = (globalThis as any).jest;
    const originalResizeObserver = (globalThis as any).ResizeObserver;
    const originalRequestIdleCallback = (window as any).requestIdleCallback;
    const originalCancelIdleCallback = (window as any).cancelIdleCallback;

    (globalThis as any).jest = vi;
    patchCanvasContextProto();

    class ResizeObserverMock {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
    }
    (globalThis as any).ResizeObserver = ResizeObserverMock;
    (window as any).requestIdleCallback = (cb: IdleRequestCallback) => setTimeout(() => cb({
        didTimeout: false,
        timeRemaining: () => 16,
    } as IdleDeadline), 0);
    (window as any).cancelIdleCallback = (id: number) => clearTimeout(id);

    const pointerPatches = patchPointerCapture();

    return {
        restore() {
            pointerPatches.setPointerCaptureSpy.mockRestore();
            pointerPatches.releasePointerCaptureSpy.mockRestore();
            pointerPatches.hasPointerCaptureSpy.mockRestore();
            (globalThis as any).jest = originalJest;
            (globalThis as any).ResizeObserver = originalResizeObserver;
            (window as any).requestIdleCallback = originalRequestIdleCallback;
            (window as any).cancelIdleCallback = originalCancelIdleCallback;
        },
    };
}
