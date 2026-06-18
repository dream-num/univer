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

import type { UniverInstanceType } from '@univerjs/core';
import type { EmbedDescriptor } from '@univerjs/embed';
import type { Root } from 'react-dom/client';
import { EmbedModelService } from '@univerjs/embed';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EmbedFloatPreviewService } from '../services/embed-float-preview.service';
import { EmbedFloatingActiveService } from '../services/embed-floating-active.service';
import { EmbedFullscreenService } from '../services/embed-fullscreen.service';
import { EmbedMountService } from '../services/embed-mount.service';
import { EmbedPassiveViewportRegistryService } from '../services/embed-passive-viewport-registry.service';
import { EmbedReadonlyPreviewRegistryService } from '../services/embed-readonly-preview-registry.service';
import { EMBED_FLOAT_DRAG_HANDLE_POINTER_DOWN_EVENT, EmbedFloatDomRenderer } from './embed-float-dom-renderer';

const dependencyMap = vi.hoisted(() => new Map<unknown, unknown>());

vi.mock('@univerjs/ui', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/ui')>('@univerjs/ui');
    return {
        ...actual,
        useDependency: (token: unknown) => dependencyMap.get(token),
    };
});

describe('EmbedFloatDomRenderer', () => {
    let container: HTMLElement;
    let root: Root;
    let active$: Subject<unknown>;
    let fullscreen$: Subject<unknown>;
    let fullscreenExited$: Subject<{ embedId: string }>;
    let enterFullscreen: ReturnType<typeof vi.fn>;
    let resizeCallbacks: Array<() => void>;
    let animationFrameCallbacks: Array<FrameRequestCallback>;
    let mountIntoHostElement: ReturnType<typeof vi.fn>;
    let unmount: ReturnType<typeof vi.fn>;
    let previewService: {
        getPreview: ReturnType<typeof vi.fn>;
        requestPreview: ReturnType<typeof vi.fn>;
        collectViewState: ReturnType<typeof vi.fn>;
        restoreViewState: ReturnType<typeof vi.fn>;
        previewUpdated$: Subject<unknown>;
    };
    let floatingActiveService: {
        active$: Subject<unknown>;
        getStage: ReturnType<typeof vi.fn>;
        clear: ReturnType<typeof vi.fn>;
        activate: ReturnType<typeof vi.fn>;
        promote: ReturnType<typeof vi.fn>;
    };
    let readonlyPreviewProvider: {
        childType: UniverInstanceType;
        supportedLayouts: string[];
        mount: ReturnType<typeof vi.fn>;
        handleWheel: ReturnType<typeof vi.fn>;
    };
    let passiveViewportRegistry: {
        get: ReturnType<typeof vi.fn>;
    };
    let passiveViewportProvider: {
        childType: UniverInstanceType;
        handleWheel: ReturnType<typeof vi.fn>;
    };
    let stage: 'inactive' | 'stage1' | 'stage2';

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        active$ = new Subject();
        fullscreen$ = new Subject();
        fullscreenExited$ = new Subject();
        enterFullscreen = vi.fn();
        resizeCallbacks = [];
        animationFrameCallbacks = [];
        mountIntoHostElement = vi.fn();
        unmount = vi.fn();
        previewService = {
            getPreview: vi.fn(),
            requestPreview: vi.fn(() => undefined),
            collectViewState: vi.fn().mockResolvedValue({ pageId: 'page-after-edit' }),
            restoreViewState: vi.fn(),
            previewUpdated$: new Subject(),
        };
        stage = 'inactive';

        class ResizeObserverMock {
            constructor(callback: () => void) {
                resizeCallbacks.push(callback);
            }

            observe = vi.fn();
            disconnect = vi.fn();
        }

        Object.defineProperty(window, 'ResizeObserver', {
            configurable: true,
            value: ResizeObserverMock,
        });
        Object.defineProperty(globalThis, 'ResizeObserver', {
            configurable: true,
            value: ResizeObserverMock,
        });
        Object.defineProperty(window, 'requestAnimationFrame', {
            configurable: true,
            writable: true,
            value: vi.fn((callback: FrameRequestCallback) => {
                animationFrameCallbacks.push(callback);
                return animationFrameCallbacks.length;
            }),
        });
        Object.defineProperty(window, 'cancelAnimationFrame', {
            configurable: true,
            writable: true,
            value: vi.fn(),
        });

        dependencyMap.set(EmbedModelService, {
            getDescriptor: vi.fn(() => createFloatDescriptor()),
        });
        floatingActiveService = {
            active$,
            getStage: vi.fn(() => stage),
            clear: vi.fn(),
            activate: vi.fn(),
            promote: vi.fn(),
        };
        dependencyMap.set(EmbedFloatingActiveService, floatingActiveService);
        dependencyMap.set(EmbedMountService, {
            mountIntoHostElement,
            unmount,
        });
        dependencyMap.set(EmbedFullscreenService, {
            session$: fullscreen$,
            exited$: fullscreenExited$,
            enter: enterFullscreen,
        });
        dependencyMap.set(EmbedFloatPreviewService, previewService);
        readonlyPreviewProvider = {
            childType: 2 as UniverInstanceType,
            supportedLayouts: ['aspect-fit'],
            mount: vi.fn(),
            handleWheel: vi.fn(() => true),
        };
        dependencyMap.set(EmbedReadonlyPreviewRegistryService, {
            get: vi.fn(() => readonlyPreviewProvider),
        });
        passiveViewportProvider = {
            childType: 2 as UniverInstanceType,
            handleWheel: vi.fn(() => true),
        };
        passiveViewportRegistry = {
            get: vi.fn(() => undefined),
        };
        dependencyMap.set(EmbedPassiveViewportRegistryService, passiveViewportRegistry);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        dependencyMap.clear();
    });

    it('mounts the live child runtime while inactive as the single visual source', async () => {
        await renderFloatBlock();

        expect(mountIntoHostElement).toHaveBeenCalledTimes(1);
        expect(readonlyPreviewProvider.mount).not.toHaveBeenCalled();
        const [, hostElement, runtimeRoots] = mountIntoHostElement.mock.calls[0];
        expect(hostElement.getAttribute('data-embed-float-live')).toBe('true');
        expect(runtimeRoots.content.getAttribute('data-embed-content-root')).toBe('true');
        expect(runtimeRoots.canvas.getAttribute('data-embed-canvas-root')).toBe('true');
    });

    it('does not mount a readonly preview runtime as the inactive visual source', async () => {
        await renderFloatBlock();

        expect(readonlyPreviewProvider.mount).not.toHaveBeenCalled();
        expect(document.querySelector('[data-embed-float-preview]')).toBeNull();
    });

    it('keeps the live child runtime mounted when entering stage2', async () => {
        await renderFloatBlock();
        expect(mountIntoHostElement).toHaveBeenCalledTimes(1);

        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });

        expect(mountIntoHostElement).toHaveBeenCalledTimes(1);
        expect(unmount).not.toHaveBeenCalled();
    });

    it('does not remount the live child runtime when the block enters stage2', async () => {
        await renderFloatBlock();
        expect(mountIntoHostElement).toHaveBeenCalledTimes(1);

        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });

        expect(mountIntoHostElement).toHaveBeenCalledTimes(1);
    });

    it('remounts the live child runtime after its fullscreen session exits', async () => {
        await renderFloatBlock();
        expect(mountIntoHostElement).toHaveBeenCalledTimes(1);

        await act(async () => {
            fullscreen$.next({ embedId: 'embed-1' });
            await Promise.resolve();
        });
        expect(mountIntoHostElement).toHaveBeenCalledTimes(1);

        await act(async () => {
            fullscreen$.next(null);
            await Promise.resolve();
        });
        expect(mountIntoHostElement).toHaveBeenCalledTimes(1);

        await act(async () => {
            fullscreenExited$.next({ embedId: 'embed-1' });
            await Promise.resolve();
        });
        expect(unmount).toHaveBeenCalledWith('embed-1');
        expect(mountIntoHostElement).toHaveBeenCalledTimes(1);

        await act(async () => {
            await new Promise((resolve) => globalThis.setTimeout(resolve, 0));
        });

        await act(async () => {
            const callbacks = animationFrameCallbacks.splice(0);
            callbacks.forEach((callback) => callback(16));
            await Promise.resolve();
        });

        expect(mountIntoHostElement).toHaveBeenCalledTimes(2);
    });

    it('does not remount the live child runtime after another fullscreen session exits', async () => {
        await renderFloatBlock();

        await act(async () => {
            fullscreen$.next({ embedId: 'embed-other' });
            fullscreen$.next(null);
            fullscreenExited$.next({ embedId: 'embed-other' });
            await Promise.resolve();
        });

        expect(unmount).not.toHaveBeenCalled();
        expect(mountIntoHostElement).toHaveBeenCalledTimes(1);
    });

    it('mounts the live child runtime immediately when opened as a stage2 runtime portal', async () => {
        await renderFloatBlock({ initialStage: 'stage2' });

        expect(mountIntoHostElement).toHaveBeenCalledTimes(1);
    });

    it('synchronizes host-opened stage2 runtime portals into the floating active service', async () => {
        await renderFloatBlock({ initialStage: 'stage2' });

        expect(floatingActiveService.activate).toHaveBeenCalledWith({
            hostUnitId: 'host-1',
            embedId: 'embed-1',
            childUnitId: 'child-1',
        }, 'stage2');
    });

    it('passes separate live and chrome runtime roots when mounting stage2', async () => {
        await renderFloatBlock();

        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });

        const [, hostElement, runtimeRoots] = mountIntoHostElement.mock.calls[0];

        expect(hostElement.getAttribute('data-embed-float-live')).toBe('true');
        expect(runtimeRoots.content.getAttribute('data-embed-content-root')).toBe('true');
        expect(runtimeRoots.canvas.getAttribute('data-embed-canvas-root')).toBe('true');
        expect(runtimeRoots.overlay.getAttribute('data-embed-overlay-root')).toBe('true');
        expect(runtimeRoots.popup.getAttribute('data-embed-popup-root')).toBe('true');
        expect(runtimeRoots.content).not.toBe(runtimeRoots.canvas);
        expect(runtimeRoots.overlay).not.toBe(hostElement);
    });

    it('restores cached view state after mounting the stage2 runtime', async () => {
        const context = createChildContext();
        previewService.getPreview.mockReturnValue({ viewState: { pageId: 'page-1' } });
        mountIntoHostElement.mockReturnValue({ context });

        await renderFloatBlock();

        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });

        expect(previewService.restoreViewState).toHaveBeenCalledWith(context, { pageId: 'page-1' });
    });

    it('keeps the live child runtime mounted when leaving stage2', async () => {
        const context = createChildContext();
        mountIntoHostElement.mockReturnValue({ context });

        await renderFloatBlock();

        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });

        stage = 'inactive';
        await act(async () => {
            active$.next({});
            await Promise.resolve();
        });

        expect(previewService.collectViewState).not.toHaveBeenCalled();
        expect(previewService.requestPreview).not.toHaveBeenCalledWith(expect.objectContaining({
            reason: 'stage-exit',
        }));
        expect(unmount).not.toHaveBeenCalled();
    });

    it('notifies the host runtime portal when leaving stage2', async () => {
        const onRuntimeStageExit = vi.fn();
        mountIntoHostElement.mockReturnValue({ context: createChildContext() });

        await renderFloatBlock({ initialStage: 'stage2', onRuntimeStageExit });

        stage = 'inactive';
        await act(async () => {
            active$.next({});
            await Promise.resolve();
        });

        expect(onRuntimeStageExit).toHaveBeenCalledTimes(1);
    });

    it('does not notify the host runtime portal for a stage2 component unmount', async () => {
        const onRuntimeStageExit = vi.fn();
        mountIntoHostElement.mockReturnValue({ context: createChildContext() });

        await renderFloatBlock({ initialStage: 'stage2', onRuntimeStageExit });

        await act(async () => {
            root.unmount();
            await Promise.resolve();
        });

        expect(onRuntimeStageExit).not.toHaveBeenCalled();
        root = createRoot(container);
    });

    it('keeps the stage2 runtime mounted across connected rerenders', async () => {
        mountIntoHostElement.mockReturnValue({ context: createChildContext() });

        await renderFloatBlock({ initialStage: 'stage2', onRuntimeStageExit: vi.fn() });
        const nextRuntimeStageExit = vi.fn();

        await act(async () => {
            root.render(
                <EmbedFloatDomRenderer
                    initialStage="stage2"
                    onRuntimeStageExit={nextRuntimeStageExit}
                    data={{
                        version: 1,
                        embedId: 'embed-1',
                        hostUnitId: 'host-1',
                        hostAnchorId: 'anchor-1',
                        childUnitId: 'child-1',
                        childType: 2 as UniverInstanceType,
                    }}
                />
            );
            await Promise.resolve();
        });

        expect(unmount).not.toHaveBeenCalled();
        expect(nextRuntimeStageExit).not.toHaveBeenCalled();
    });

    it('keeps body-level chrome aligned when the host float dom moves without window scroll', async () => {
        let rect = {
            left: 100,
            top: 200,
            width: 320,
            height: 180,
            right: 420,
            bottom: 380,
            x: 100,
            y: 200,
            toJSON: () => ({}),
        } as DOMRect;
        const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
        HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
            if (this.getAttribute('data-embed-float-dom') === 'true') {
                return rect;
            }

            return originalGetBoundingClientRect.call(this);
        };

        try {
            await renderFloatBlock({ initialStage: 'stage2' });

            const chrome = document.querySelector<HTMLElement>('.univer-embed-float-dom__chrome');
            expect(chrome).not.toBeNull();
            expect(chrome!.style.top).toBe('200px');
            expect(chrome!.style.left).toBe('100px');

            rect = {
                ...rect,
                top: 520,
                bottom: 700,
                y: 520,
            } as DOMRect;

            await act(async () => {
                const callbacks = animationFrameCallbacks.splice(0);
                callbacks.forEach((callback) => callback(16));
            });

            expect(chrome!.style.top).toBe('520px');
            expect(chrome!.style.left).toBe('100px');
        } finally {
            HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
        }
    });

    it('keeps inactive body-level chrome aligned after host viewport wheel updates', async () => {
        let rect = {
            left: 100,
            top: 200,
            width: 320,
            height: 180,
            right: 420,
            bottom: 380,
            x: 100,
            y: 200,
            toJSON: () => ({}),
        } as DOMRect;
        const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
        HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
            if (this.getAttribute('data-embed-float-dom') === 'true') {
                return rect;
            }

            return originalGetBoundingClientRect.call(this);
        };

        try {
            await renderFloatBlock();

            const chrome = document.querySelector<HTMLElement>('.univer-embed-float-dom__chrome');
            expect(chrome).not.toBeNull();
            expect(chrome!.style.top).toBe('200px');
            expect(chrome!.style.left).toBe('100px');

            rect = {
                ...rect,
                top: 520,
                bottom: 700,
                y: 520,
            } as DOMRect;

            await act(async () => {
                window.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 120 }));
                const callbacks = animationFrameCallbacks.splice(0);
                callbacks.forEach((callback) => callback(16));
            });

            expect(chrome!.style.top).toBe('520px');
            expect(chrome!.style.left).toBe('100px');
        } finally {
            HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
        }
    });

    it('does not request resize preview images for the real-unit visual path', async () => {
        vi.useFakeTimers();
        previewService.getPreview.mockReturnValue({
            status: 'ready',
            image: 'data:image/png;base64,preview',
            viewState: { pageId: 'page-1' },
        });

        await renderFloatBlock();
        previewService.requestPreview.mockClear();

        await act(async () => {
            resizeCallbacks.forEach((callback) => callback());
            resizeCallbacks.forEach((callback) => callback());
            vi.advanceTimersByTime(199);
        });
        expect(previewService.requestPreview).not.toHaveBeenCalled();

        await act(async () => {
            vi.advanceTimersByTime(1);
        });

        expect(previewService.requestPreview).not.toHaveBeenCalled();

        vi.useRealTimers();
    });

    it('does not request initial preview images for the real-unit visual path', async () => {
        vi.useFakeTimers();
        previewService.getPreview
            .mockReturnValueOnce(undefined)
            .mockReturnValue({ status: 'error' });

        await renderFloatBlock();

        expect(previewService.requestPreview).not.toHaveBeenCalled();

        await act(async () => {
            vi.advanceTimersByTime(500);
        });

        expect(previewService.requestPreview).not.toHaveBeenCalled();

        vi.useRealTimers();
    });

    it('keeps stage active when pointer events originate from body-level chrome roots', async () => {
        await renderFloatBlock();

        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });

        const popupRoot = document.querySelector('[data-embed-popup-root]');
        expect(popupRoot).not.toBeNull();

        await act(async () => {
            popupRoot!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        });

        expect(floatingActiveService.clear).not.toHaveBeenCalled();
    });

    it('does not demote stage2 runtime interactions back to stage1', async () => {
        await renderFloatBlock();

        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });
        floatingActiveService.activate.mockClear();

        const contentRoot = document.querySelector('[data-embed-content-root]');
        expect(contentRoot).not.toBeNull();

        await act(async () => {
            contentRoot!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        });

        expect(floatingActiveService.activate).not.toHaveBeenCalledWith(expect.anything(), 'stage1');
    });

    it('notifies the host when the interaction gate promotes into stage2', async () => {
        const onRuntimeStageEnter = vi.fn();
        floatingActiveService.promote.mockImplementation(() => {
            stage = 'stage2';
            active$.next({});
        });

        await renderFloatBlock({ onRuntimeStageEnter });
        stage = 'stage1';
        await act(async () => {
            active$.next({});
        });

        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        expect(gate).not.toBeNull();

        await act(async () => {
            gate!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 10, clientY: 10 }));
            gate!.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, clientX: 10, clientY: 10 }));
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(onRuntimeStageEnter).toHaveBeenCalledWith('stage2');
    });

    it('promotes stage1 to stage2 only after a click-intent pointerup', async () => {
        await renderFloatBlock();
        stage = 'stage1';
        await act(async () => {
            active$.next({});
        });

        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        expect(gate).not.toBeNull();

        await act(async () => {
            gate!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 12, clientY: 12 }));
        });
        expect(floatingActiveService.promote).not.toHaveBeenCalled();

        await act(async () => {
            gate!.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, clientX: 12, clientY: 12 }));
        });
        expect(floatingActiveService.promote).toHaveBeenCalledWith('embed-1');
    });

    it('does not promote stage1 to stage2 after a drag intent', async () => {
        await renderFloatBlock();
        stage = 'stage1';
        await act(async () => {
            active$.next({});
        });

        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        expect(gate).not.toBeNull();

        await act(async () => {
            gate!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 10, clientY: 10 }));
            gate!.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1, clientX: 30, clientY: 10 }));
            gate!.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, clientX: 30, clientY: 10 }));
        });

        expect(floatingActiveService.promote).not.toHaveBeenCalled();
    });

    it('does not route wheel events to readonly preview providers in the real-unit path', async () => {
        await renderFloatBlock();

        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        expect(gate).not.toBeNull();

        await act(async () => {
            gate!.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 120 }));
        });

        expect(readonlyPreviewProvider.handleWheel).not.toHaveBeenCalled();

        readonlyPreviewProvider.handleWheel.mockClear();
        stage = 'stage1';
        await act(async () => {
            active$.next({});
        });

        await act(async () => {
            gate!.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 120 }));
        });

        expect(readonlyPreviewProvider.handleWheel).not.toHaveBeenCalled();
    });

    it('forwards inactive wheel events through the gate to the live runtime', async () => {
        await renderFloatBlock();

        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        expect(gate).not.toBeNull();
        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const runtimeTarget = document.createElement('div');
        const onWheel = vi.fn((event: WheelEvent) => event.preventDefault());
        runtimeTarget.addEventListener('wheel', onWheel);
        runtimeRoots.content.appendChild(runtimeTarget);

        const wheel = new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            clientX: 0,
            clientY: 0,
            deltaY: 120,
        });
        await act(async () => {
            gate!.dispatchEvent(wheel);
        });

        expect(onWheel).toHaveBeenCalledTimes(1);
        expect(wheel.defaultPrevented).toBe(true);
        expect(readonlyPreviewProvider.handleWheel).not.toHaveBeenCalled();
    });

    it('routes inactive wheel events to the passive viewport provider before the fallback runtime path', async () => {
        mountIntoHostElement.mockReturnValue({ context: createChildContext() });
        passiveViewportRegistry.get.mockReturnValue(passiveViewportProvider);
        await renderFloatBlock();

        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        expect(gate).not.toBeNull();
        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const runtimeTarget = document.createElement('div');
        const onWheel = vi.fn((event: WheelEvent) => event.preventDefault());
        runtimeTarget.addEventListener('wheel', onWheel);
        runtimeRoots.content.appendChild(runtimeTarget);

        const wheel = new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            clientX: 0,
            clientY: 0,
            deltaY: 120,
        });
        await act(async () => {
            gate!.dispatchEvent(wheel);
        });

        expect(passiveViewportRegistry.get).toHaveBeenCalledWith(2, 'aspect-fit');
        expect(passiveViewportProvider.handleWheel).toHaveBeenCalledWith(expect.objectContaining({
            embedId: 'embed-1',
            childUnitId: 'child-1',
            stage: 'inactive',
            event: wheel,
        }));
        expect(onWheel).not.toHaveBeenCalled();
        expect(wheel.defaultPrevented).toBe(true);
        expect(floatingActiveService.activate).not.toHaveBeenCalledWith(expect.anything(), 'stage2');
    });

    it('lets ctrl/meta wheel gestures pass through for host zoom', async () => {
        mountIntoHostElement.mockReturnValue({ context: createChildContext() });
        passiveViewportRegistry.get.mockReturnValue(passiveViewportProvider);
        await renderFloatBlock();

        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        expect(gate).not.toBeNull();
        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const runtimeTarget = document.createElement('div');
        const onWheel = vi.fn((event: WheelEvent) => event.preventDefault());
        runtimeTarget.addEventListener('wheel', onWheel);
        runtimeRoots.content.appendChild(runtimeTarget);

        const wheel = new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            ctrlKey: true,
            deltaY: 120,
        });
        await act(async () => {
            gate!.dispatchEvent(wheel);
        });

        expect(passiveViewportProvider.handleWheel).not.toHaveBeenCalled();
        expect(onWheel).not.toHaveBeenCalled();
        expect(wheel.defaultPrevented).toBe(false);
        expect(floatingActiveService.activate).not.toHaveBeenCalledWith(expect.anything(), 'stage2');
    });

    it('lets host scrolling continue when the passive viewport provider cannot consume stage1 wheel events', async () => {
        mountIntoHostElement.mockReturnValue({ context: createChildContext() });
        passiveViewportProvider.handleWheel.mockReturnValue(false);
        passiveViewportRegistry.get.mockReturnValue(passiveViewportProvider);
        await renderFloatBlock();
        stage = 'stage1';
        await act(async () => {
            active$.next({});
        });

        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        expect(gate).not.toBeNull();
        const wheel = new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            clientX: 0,
            clientY: 0,
            deltaY: 120,
        });

        await act(async () => {
            gate!.dispatchEvent(wheel);
        });

        expect(passiveViewportProvider.handleWheel).toHaveBeenCalledWith(expect.objectContaining({
            stage: 'stage1',
            event: wheel,
        }));
        expect(wheel.defaultPrevented).toBe(false);
        expect(floatingActiveService.promote).not.toHaveBeenCalled();
    });

    it('scrolls an inactive live runtime dom container without entering stage2', async () => {
        await renderFloatBlock();

        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        expect(gate).not.toBeNull();
        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const scrollable = document.createElement('div');
        Object.defineProperty(scrollable, 'clientHeight', { configurable: true, value: 100 });
        Object.defineProperty(scrollable, 'scrollHeight', { configurable: true, value: 300 });
        scrollable.scrollTop = 0;
        runtimeRoots.content.appendChild(scrollable);

        const wheel = new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            clientX: 0,
            clientY: 0,
            deltaY: 80,
        });
        await act(async () => {
            gate!.dispatchEvent(wheel);
        });

        expect(scrollable.scrollTop).toBe(80);
        expect(wheel.defaultPrevented).toBe(true);
        expect(floatingActiveService.promote).not.toHaveBeenCalled();
        expect(floatingActiveService.activate).not.toHaveBeenCalledWith(expect.anything(), 'stage2');
    });

    it('notifies the host when the drag handle starts moving the block', async () => {
        await renderFloatBlock();
        stage = 'stage1';
        await act(async () => {
            active$.next({});
        });

        const listener = vi.fn();
        document.addEventListener(EMBED_FLOAT_DRAG_HANDLE_POINTER_DOWN_EVENT, listener);
        const handle = document.querySelector('[data-embed-float-drag-handle]');
        expect(handle).not.toBeNull();

        await act(async () => {
            handle!.dispatchEvent(new PointerEvent('pointerdown', {
                bubbles: true,
                pointerId: 7,
                clientX: 120,
                clientY: 80,
                button: 0,
            }));
        });

        document.removeEventListener(EMBED_FLOAT_DRAG_HANDLE_POINTER_DOWN_EVENT, listener);
        expect(listener).toHaveBeenCalledTimes(1);
        expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual(expect.objectContaining({
            embedId: 'embed-1',
            hostUnitId: 'host-1',
            hostAnchorId: 'anchor-1',
            pointerId: 7,
            clientX: 120,
            clientY: 80,
            button: 0,
        }));
    });

    it('enters fullscreen from the universal chrome button without changing the floating stage', async () => {
        await renderFloatBlock();

        const button = document.querySelector('[data-embed-float-fullscreen-button]');
        expect(button).not.toBeNull();

        await act(async () => {
            button!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
            (button as HTMLButtonElement).click();
        });

        expect(enterFullscreen).toHaveBeenCalledTimes(1);
        expect(enterFullscreen).toHaveBeenCalledWith(createFloatDescriptor());
        expect(floatingActiveService.activate).not.toHaveBeenCalled();
        expect(floatingActiveService.promote).not.toHaveBeenCalled();
    });

    async function renderFloatBlock(props?: { initialStage?: 'inactive' | 'stage1' | 'stage2'; onRuntimeStageExit?: () => void; onRuntimeStageEnter?: (stage: 'inactive' | 'stage1' | 'stage2') => void }) {
        await act(async () => {
            root.render(
                <EmbedFloatDomRenderer
                    initialStage={props?.initialStage}
                    onRuntimeStageExit={props?.onRuntimeStageExit}
                    onRuntimeStageEnter={props?.onRuntimeStageEnter}
                    data={{
                        version: 1,
                        embedId: 'embed-1',
                        hostUnitId: 'host-1',
                        hostAnchorId: 'anchor-1',
                        childUnitId: 'child-1',
                        childType: 2 as UniverInstanceType,
                    }}
                />
            );
        });
    }
});

function createFloatDescriptor(): EmbedDescriptor {
    return {
        embedId: 'embed-1',
        hostUnitId: 'host-1',
        hostType: 1 as UniverInstanceType,
        hostAnchorId: 'anchor-1',
        entry: 'sheets-floating-object',
        childUnitId: 'child-1',
        childType: 2 as UniverInstanceType,
        source: {
            kind: 'empty',
            unitType: 2 as UniverInstanceType,
        },
        sourceMeta: {
            floating: {
                layout: 'aspect-fit',
            },
        },
    } as EmbedDescriptor;
}

function createChildContext() {
    return {
        layout: 'aspect-fit',
        embedId: 'embed-1',
        hostUnitId: 'host-1',
        hostAnchorId: 'anchor-1',
        childUnitId: 'child-1',
        childType: 2 as UniverInstanceType,
        descriptor: createFloatDescriptor(),
        runtimeScope: {
            roots: {
                root: document.createElement('div'),
                content: document.createElement('div'),
                overlay: document.createElement('div'),
                popup: document.createElement('div'),
            },
        },
    } as any;
}
