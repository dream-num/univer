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

function defineIfMissing(target: object, key: PropertyKey, value: unknown): void {
    if (!(key in target)) {
        Object.defineProperty(target, key, {
            configurable: true,
            writable: true,
            value,
        });
    }
}

function patchCanvasContext(): void {
    const context = globalThis.CanvasRenderingContext2D;
    if (!context) {
        return;
    }

    const proto = context.prototype;
    defineIfMissing(proto, 'getTransform', vi.fn(() => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })));
    defineIfMissing(proto, 'getContextAttributes', vi.fn(() => ({})));
    defineIfMissing(proto, 'reset', vi.fn());
    defineIfMissing(proto, 'roundRect', vi.fn());
    defineIfMissing(proto, 'drawFocusIfNeeded', vi.fn());
    defineIfMissing(proto, 'createConicGradient', vi.fn(() => ({ addColorStop: vi.fn() })));
    defineIfMissing(proto, 'isContextLost', vi.fn(() => false));
}

function restoreProperty(target: object, key: PropertyKey, descriptor: PropertyDescriptor | undefined): void {
    if (descriptor) {
        Object.defineProperty(target, key, descriptor);
    } else {
        Reflect.deleteProperty(target, key);
    }
}

export function setupRenderTestEnv(): { restore: () => void } {
    const resizeObserverDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'ResizeObserver');
    const requestIdleCallbackDescriptor = Object.getOwnPropertyDescriptor(window, 'requestIdleCallback');
    const cancelIdleCallbackDescriptor = Object.getOwnPropertyDescriptor(window, 'cancelIdleCallback');

    patchCanvasContext();

    class ResizeObserverMock {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
    }

    Object.defineProperty(globalThis, 'ResizeObserver', {
        configurable: true,
        writable: true,
        value: ResizeObserverMock,
    });
    Object.defineProperty(window, 'requestIdleCallback', {
        configurable: true,
        writable: true,
        value: (callback: IdleRequestCallback) => setTimeout(() => callback({
            didTimeout: false,
            timeRemaining: () => 16,
        }), 0),
    });
    Object.defineProperty(window, 'cancelIdleCallback', {
        configurable: true,
        writable: true,
        value: (id: number) => clearTimeout(id),
    });

    const canvasProto = HTMLCanvasElement.prototype;
    defineIfMissing(canvasProto, 'setPointerCapture', () => {});
    defineIfMissing(canvasProto, 'releasePointerCapture', () => {});
    defineIfMissing(canvasProto, 'hasPointerCapture', () => false);

    const captureMap = new WeakMap<HTMLCanvasElement, Set<number>>();
    const getCaptureSet = (canvas: HTMLCanvasElement): Set<number> => {
        let set = captureMap.get(canvas);
        if (!set) {
            set = new Set<number>();
            captureMap.set(canvas, set);
        }
        return set;
    };

    const setPointerCaptureSpy = vi.spyOn(canvasProto, 'setPointerCapture').mockImplementation(function (this: HTMLCanvasElement, pointerId) {
        getCaptureSet(this).add(pointerId);
    });
    const releasePointerCaptureSpy = vi.spyOn(canvasProto, 'releasePointerCapture').mockImplementation(function (this: HTMLCanvasElement, pointerId) {
        getCaptureSet(this).delete(pointerId);
    });
    const hasPointerCaptureSpy = vi.spyOn(canvasProto, 'hasPointerCapture').mockImplementation(function (this: HTMLCanvasElement, pointerId) {
        return getCaptureSet(this).has(pointerId);
    });

    return {
        restore: () => {
            setPointerCaptureSpy.mockRestore();
            releasePointerCaptureSpy.mockRestore();
            hasPointerCaptureSpy.mockRestore();
            restoreProperty(globalThis, 'ResizeObserver', resizeObserverDescriptor);
            restoreProperty(window, 'requestIdleCallback', requestIdleCallbackDescriptor);
            restoreProperty(window, 'cancelIdleCallback', cancelIdleCallbackDescriptor);
        },
    };
}
