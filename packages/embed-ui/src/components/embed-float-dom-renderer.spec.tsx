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

import type { IEmbedDescriptor } from '@univerjs/embed';
import type { Root } from 'react-dom/client';
import { UniverInstanceType } from '@univerjs/core';
import { EmbedModelService } from '@univerjs/embed';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EmbedActivationService } from '../services/embed-activation.service';
import { EmbedFloatPreviewService } from '../services/embed-float-preview.service';
import { EmbedFloatingActiveService } from '../services/embed-floating-active.service';
import { EmbedFloatingGeometryService } from '../services/embed-floating-geometry.service';
import { EmbedFullscreenService } from '../services/embed-fullscreen.service';
import { EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, EmbedInteractionBoundaryService } from '../services/embed-interaction-boundary.service';
import { EmbedMountService } from '../services/embed-mount.service';
import { EmbedPassiveViewportRegistryService } from '../services/embed-passive-viewport-registry.service';
import { EmbedReadonlyPreviewRegistryService } from '../services/embed-readonly-preview-registry.service';
import { EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, EmbedRuntimeFocusCoordinator } from '../services/embed-runtime-focus-coordinator.service';
import { EMBED_FLOAT_DRAG_HANDLE_POINTER_DOWN_EVENT, EmbedFloatDomRenderer } from './EmbedFloatDomRenderer';

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
    let geometryService: {
        geometryInvalidated$: Subject<unknown>;
        getRegistration: ReturnType<typeof vi.fn>;
        invalidate: ReturnType<typeof vi.fn>;
        register: ReturnType<typeof vi.fn>;
    };
    let activationService: {
        activateFloating: ReturnType<typeof vi.fn>;
        focusFloatingRuntime: ReturnType<typeof vi.fn>;
        clearFloating: ReturnType<typeof vi.fn>;
    };
    let interactionBoundaryService: {
        registerRoot: ReturnType<typeof vi.fn>;
        contains: ReturnType<typeof vi.fn>;
        hasRecentInteraction: ReturnType<typeof vi.fn>;
        hasRecentInteractionFor: ReturnType<typeof vi.fn>;
        activatePortalScope: ReturnType<typeof vi.fn>;
    };
    let disposePortalScope: ReturnType<typeof vi.fn>;
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
    let focusCoordinator: EmbedRuntimeFocusCoordinator;
    let descriptor: IEmbedDescriptor;
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

        descriptor = createFloatDescriptor();
        dependencyMap.set(EmbedModelService, {
            getDescriptor: vi.fn(() => descriptor),
        });
        floatingActiveService = {
            active$,
            getStage: vi.fn(() => stage),
            clear: vi.fn(),
            activate: vi.fn(),
            promote: vi.fn(),
        };
        dependencyMap.set(EmbedFloatingActiveService, floatingActiveService);
        geometryService = {
            geometryInvalidated$: new Subject(),
            getRegistration: vi.fn(),
            invalidate: vi.fn(),
            register: vi.fn(() => ({ dispose: vi.fn() })),
        };
        dependencyMap.set(EmbedFloatingGeometryService, geometryService);
        activationService = {
            activateFloating: vi.fn(),
            focusFloatingRuntime: vi.fn(),
            clearFloating: vi.fn(),
        };
        dependencyMap.set(EmbedActivationService, activationService);
        disposePortalScope = vi.fn();
        interactionBoundaryService = {
            registerRoot: vi.fn((embedId: string, element: HTMLElement) => {
                const previousOwner = element.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
                element.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, embedId);

                return {
                    dispose: vi.fn(() => {
                        if (previousOwner == null) {
                            element.removeAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
                            return;
                        }

                        element.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, previousOwner);
                    }),
                };
            }),
            contains: vi.fn(() => false),
            hasRecentInteraction: vi.fn(() => false),
            hasRecentInteractionFor: vi.fn(() => false),
            activatePortalScope: vi.fn(() => ({ dispose: disposePortalScope })),
        };
        dependencyMap.set(EmbedInteractionBoundaryService, interactionBoundaryService);
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
        focusCoordinator = new EmbedRuntimeFocusCoordinator();
        dependencyMap.set(EmbedRuntimeFocusCoordinator, focusCoordinator);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        dependencyMap.clear();
    });

    function flushQueuedAnimationFrames(timestamp = 16) {
        const callbacks = animationFrameCallbacks.splice(0);
        callbacks.forEach((callback) => callback(timestamp));
    }

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

    it('holds an embed portal scope while the live child runtime is in stage2', async () => {
        await renderFloatBlock();

        expect(interactionBoundaryService.activatePortalScope).not.toHaveBeenCalled();

        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });

        expect(interactionBoundaryService.activatePortalScope).toHaveBeenCalledWith('embed-1', document);

        stage = 'inactive';
        await act(async () => {
            active$.next({});
        });

        expect(disposePortalScope).toHaveBeenCalledTimes(1);
    });

    it('marks the runtime popup slot as child popup focus scope while stage2 is active', async () => {
        stage = 'stage2';
        await renderFloatBlock({ initialStage: 'stage2' });

        const popupRoot = document.body.querySelector<HTMLElement>('.univer-embed-float-dom__popup');

        expect(popupRoot?.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-popup');
        expect(focusCoordinator.containsElement('embed-1', popupRoot)).toBe(true);
    });

    it('marks floating chrome controls as owned by their embed', async () => {
        stage = 'stage2';
        await renderFloatBlock({ initialStage: 'stage2' });

        const chrome = document.body.querySelector<HTMLElement>('.univer-embed-float-dom__chrome');
        const overlayRoot = document.body.querySelector<HTMLElement>('.univer-embed-float-dom__overlay');
        const fullscreenButton = document.body.querySelector<HTMLElement>('[data-embed-float-fullscreen-button]');
        const dragHandle = document.body.querySelector<HTMLElement>('[data-embed-float-drag-handle]');
        const menuButton = document.createElement('button');
        overlayRoot?.appendChild(menuButton);

        expect(chrome?.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(chrome?.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('floating-menu');
        expect(overlayRoot?.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(overlayRoot?.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('floating-menu');
        expect(menuButton.closest(`[${EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE}]`)?.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('floating-menu');
        expect(fullscreenButton?.closest(`[${EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`)?.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(fullscreenButton?.closest(`[${EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE}]`)?.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('floating-menu');
        expect(dragHandle?.closest(`[${EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`)?.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(focusCoordinator.containsElement('embed-1', fullscreenButton)).toBe(true);
    });

    it('removes inactive floating chrome and popup slots from child focus ownership', async () => {
        stage = 'stage2';
        await renderFloatBlock({ initialStage: 'stage2' });
        const chrome = document.body.querySelector<HTMLElement>('.univer-embed-float-dom__chrome');
        const overlayRoot = document.body.querySelector<HTMLElement>('.univer-embed-float-dom__overlay');
        const popupRoot = document.body.querySelector<HTMLElement>('.univer-embed-float-dom__popup');
        expect(chrome).not.toBeNull();
        expect(overlayRoot).not.toBeNull();
        expect(popupRoot).not.toBeNull();
        expect(focusCoordinator.containsElement('embed-1', overlayRoot)).toBe(true);
        expect(focusCoordinator.containsElement('embed-1', popupRoot)).toBe(true);

        overlayRoot?.setAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, 'runtime');
        popupRoot?.setAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, 'child-popup');

        stage = 'inactive';
        await act(async () => {
            active$.next({});
        });

        expect(chrome?.style.pointerEvents).toBe('none');
        expect(overlayRoot?.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBeNull();
        expect(popupRoot?.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBeNull();
        expect(focusCoordinator.containsElement('embed-1', overlayRoot)).toBe(false);
        expect(focusCoordinator.containsElement('embed-1', popupRoot)).toBe(false);
    });

    it('clears stale inactive chrome focus roles restored from a previous registration', async () => {
        await renderFloatBlock();
        const overlayRoot = document.body.querySelector<HTMLElement>('.univer-embed-float-dom__overlay');
        expect(overlayRoot).not.toBeNull();
        overlayRoot?.setAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, 'runtime');

        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });
        expect(overlayRoot?.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('floating-menu');

        stage = 'inactive';
        await act(async () => {
            active$.next({});
        });

        expect(overlayRoot?.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBeNull();
    });

    it('invalidates floating geometry when stage changes', async () => {
        await renderFloatBlock();
        geometryService.invalidate.mockClear();

        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });

        expect(geometryService.invalidate).toHaveBeenCalledWith({
            embedId: 'embed-1',
            reason: 'stage-change',
        });
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

    it('registers runtime roots with the focus coordinator so canvas focus remains child-owned', async () => {
        await renderFloatBlock({ initialStage: 'stage2' });

        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const canvas = document.createElement('canvas');
        runtimeRoots.canvas.appendChild(canvas);

        expect(focusCoordinator.containsElement('embed-1', canvas)).toBe(true);
        expect(focusCoordinator.containsElement('embed-other', canvas)).toBe(false);
    });

    it('keeps child editor focus leased without cancelling runtime canvas mousedown', async () => {
        stage = 'stage2';
        await renderFloatBlock({ initialStage: 'stage2', interactionFlow: 'doc-block' });

        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const canvas = document.createElement('canvas');
        runtimeRoots.canvas.appendChild(canvas);

        const activeEditor = document.createElement('div');
        activeEditor.tabIndex = -1;
        activeEditor.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        activeEditor.setAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, 'child-editor');
        document.body.appendChild(activeEditor);
        activeEditor.focus();

        const event = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
        });
        const dispatched = canvas.dispatchEvent(event);

        expect(dispatched).toBe(true);
        expect(event.defaultPrevented).toBe(false);
        expect(focusCoordinator.hasBlockingChildFocusLease('embed-1')).toBe(true);

        activeEditor.remove();
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

    it('keeps non-doc body-level chrome fixed during host viewport vertical wheel updates', async () => {
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

            expect(chrome!.style.top).toBe('200px');
            expect(chrome!.style.left).toBe('100px');
        } finally {
            HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
        }
    });

    it('realigns non-doc body-level chrome after pointer interaction clears the host scroll lock', async () => {
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
            await renderFloatBlock({ initialStage: 'stage1' });

            const chrome = document.querySelector<HTMLElement>('.univer-embed-float-dom__chrome');
            expect(chrome).not.toBeNull();
            expect(chrome!.style.top).toBe('200px');

            rect = {
                ...rect,
                top: 520,
                bottom: 700,
                y: 520,
            } as DOMRect;

            await act(async () => {
                window.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 120 }));
                flushQueuedAnimationFrames(16);
            });

            expect(chrome!.style.top).toBe('200px');

            await act(async () => {
                window.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
                flushQueuedAnimationFrames(16);
            });

            expect(chrome!.style.top).toBe('520px');
        } finally {
            HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
        }
    });

    it('does not resync body-level chrome for wheel events inside the live runtime', async () => {
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

            const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
            geometryService.invalidate.mockClear();
            animationFrameCallbacks.length = 0;
            rect = {
                ...rect,
                top: 520,
                bottom: 700,
                y: 520,
            } as DOMRect;

            await act(async () => {
                runtimeRoots.content.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 120 }));
                const callbacks = animationFrameCallbacks.splice(0);
                callbacks.forEach((callback) => callback(16));
            });

            expect(chrome!.style.top).toBe('200px');
            expect(geometryService.invalidate).not.toHaveBeenCalledWith({
                embedId: 'embed-1',
                reason: 'wheel',
            });
        } finally {
            HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
        }
    });

    it('does not resync body-level chrome when a global wheel target falls outside the block but the pointer is inside it', async () => {
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
            if (this.getAttribute('data-embed-float-dom') === 'true' || this.classList.contains('univer-embed-float-dom__content')) {
                return rect;
            }

            return originalGetBoundingClientRect.call(this);
        };

        try {
            await renderFloatBlock();

            const chrome = document.querySelector<HTMLElement>('.univer-embed-float-dom__chrome');
            expect(chrome).not.toBeNull();
            expect(chrome!.style.top).toBe('200px');

            geometryService.invalidate.mockClear();
            animationFrameCallbacks.length = 0;
            rect = {
                ...rect,
                top: 520,
                bottom: 700,
                y: 520,
            } as DOMRect;

            await act(async () => {
                window.dispatchEvent(new WheelEvent('wheel', {
                    bubbles: true,
                    clientX: 140,
                    clientY: 240,
                    deltaX: 120,
                }));
                const callbacks = animationFrameCallbacks.splice(0);
                callbacks.forEach((callback) => callback(16));
            });

            expect(chrome!.style.top).toBe('200px');
            expect(geometryService.invalidate).not.toHaveBeenCalledWith({
                embedId: 'embed-1',
                reason: 'wheel',
            });
        } finally {
            HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
        }
    });

    it('aligns body-level chrome to the visible docs sheet-like viewport instead of the full content block', async () => {
        const outerRect = {
            left: 80,
            top: -1200,
            width: 900,
            height: 2400,
            right: 980,
            bottom: 1200,
            x: 80,
            y: -1200,
            toJSON: () => ({}),
        } as DOMRect;
        const viewportRect = {
            left: 40,
            top: 160,
            width: 1100,
            height: 640,
            right: 1140,
            bottom: 800,
            x: 40,
            y: 160,
            toJSON: () => ({}),
        } as DOMRect;
        const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
        HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
            if (this.classList.contains('univer-embed-float-dom__content')) {
                return viewportRect;
            }
            if (this.getAttribute('data-embed-float-dom') === 'true') {
                return outerRect;
            }

            return originalGetBoundingClientRect.call(this);
        };

        try {
            await renderFloatBlock({ docsSheetLike: true, initialStage: 'stage2' });

            const chrome = document.querySelector<HTMLElement>('.univer-embed-float-dom__chrome');
            expect(chrome).not.toBeNull();
            expect(chrome!.style.top).toBe('160px');
            expect(chrome!.style.left).toBe('40px');
            expect(chrome!.style.width).toBe('1100px');
            expect(chrome!.style.height).toBe('640px');
        } finally {
            HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
        }
    });

    it('pins docs sheet-like chrome to the visible scrollport when the block top is scrolled out', async () => {
        Object.defineProperty(container, 'clientHeight', { configurable: true, value: 1024 });
        Object.defineProperty(container, 'scrollHeight', { configurable: true, value: 8000 });
        container.style.overflow = 'auto';

        const scrollPortRect = {
            left: 0,
            top: 76,
            width: 1600,
            height: 1024,
            right: 1600,
            bottom: 1100,
            x: 0,
            y: 76,
            toJSON: () => ({}),
        } as DOMRect;
        const outerRect = {
            left: 388,
            top: -4609,
            width: 823,
            height: 5152,
            right: 1211,
            bottom: 543,
            x: 388,
            y: -4609,
            toJSON: () => ({}),
        } as DOMRect;
        const viewportRect = {
            left: 12,
            top: -492,
            width: 1580,
            height: 987,
            right: 1592,
            bottom: 495,
            x: 12,
            y: -492,
            toJSON: () => ({}),
        } as DOMRect;
        const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
        HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
            if (this === container) {
                return scrollPortRect;
            }
            if (this.classList.contains('univer-embed-float-dom__content')) {
                return viewportRect;
            }
            if (this.getAttribute('data-embed-float-dom') === 'true') {
                return outerRect;
            }

            return originalGetBoundingClientRect.call(this);
        };

        try {
            await renderFloatBlock({ docsSheetLike: true, initialStage: 'stage2' });

            const chrome = document.querySelector<HTMLElement>('.univer-embed-float-dom__chrome');
            expect(chrome).not.toBeNull();
            expect(chrome!.style.top).toBe('76px');
            expect(chrome!.style.left).toBe('12px');
            expect(chrome!.style.width).toBe('1580px');
            expect(chrome!.style.height).toBe('419px');
            expect(chrome!.style.getPropertyValue('--univer-embed-floating-menu-top')).toBe('8px');
        } finally {
            HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
            delete (container as { clientHeight?: number }).clientHeight;
            delete (container as { scrollHeight?: number }).scrollHeight;
            container.style.overflow = '';
        }
    });

    it('keeps inactive docs sheet-like chrome synced while host canvas scroll changes its viewport rect', async () => {
        Object.defineProperty(container, 'clientHeight', { configurable: true, value: 1024 });
        Object.defineProperty(container, 'scrollHeight', { configurable: true, value: 8000 });
        container.style.overflow = 'auto';

        const scrollPortRect = {
            left: 0,
            top: 76,
            width: 1600,
            height: 1024,
            right: 1600,
            bottom: 1100,
            x: 0,
            y: 76,
            toJSON: () => ({}),
        } as DOMRect;
        let viewportRect = {
            left: 12,
            top: 201,
            width: 1420,
            height: 823,
            right: 1432,
            bottom: 1024,
            x: 12,
            y: 201,
            toJSON: () => ({}),
        } as DOMRect;
        const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
        HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
            if (this === container) {
                return scrollPortRect;
            }
            if (this.classList.contains('univer-embed-float-dom__content')) {
                return viewportRect;
            }

            return originalGetBoundingClientRect.call(this);
        };

        try {
            await renderFloatBlock({ docsSheetLike: true });

            const chrome = document.querySelector<HTMLElement>('.univer-embed-float-dom__chrome');
            expect(chrome).not.toBeNull();
            expect(chrome!.style.top).toBe('201px');

            viewportRect = {
                ...viewportRect,
                top: -687,
                bottom: 136,
                y: -687,
            } as DOMRect;

            await act(async () => {
                flushQueuedAnimationFrames(16);
            });

            expect(chrome!.style.top).toBe('76px');
            expect(chrome!.style.height).toBe('60px');
        } finally {
            HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
            delete (container as { clientHeight?: number }).clientHeight;
            delete (container as { scrollHeight?: number }).scrollHeight;
            container.style.overflow = '';
        }
    });

    it('keeps inactive docs custom-block chrome synced while host canvas scroll changes its block rect', async () => {
        let rect = {
            left: 309,
            top: 24361,
            width: 716,
            height: 401,
            right: 1025,
            bottom: 24762,
            x: 309,
            y: 24361,
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
            await renderFloatBlock({ docsCustomBlock: true });

            const chrome = document.querySelector<HTMLElement>('.univer-embed-float-dom__chrome');
            expect(chrome).not.toBeNull();
            expect(chrome!.style.top).toBe('24361px');

            rect = {
                ...rect,
                top: 5292,
                bottom: 5693,
                y: 5292,
            } as DOMRect;

            await act(async () => {
                flushQueuedAnimationFrames(16);
            });

            expect(chrome!.style.top).toBe('5292px');
        } finally {
            HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
        }
    });

    it('hides docs sheet-like chrome when only a tiny edge remains visible', async () => {
        Object.defineProperty(container, 'clientHeight', { configurable: true, value: 1024 });
        Object.defineProperty(container, 'scrollHeight', { configurable: true, value: 8000 });
        container.style.overflow = 'auto';

        const scrollPortRect = {
            left: 0,
            top: 76,
            width: 1600,
            height: 1024,
            right: 1600,
            bottom: 1100,
            x: 0,
            y: 76,
            toJSON: () => ({}),
        } as DOMRect;
        const outerRect = {
            left: 388,
            top: -1001,
            width: 823,
            height: 1087,
            right: 1211,
            bottom: 86,
            x: 388,
            y: -1001,
            toJSON: () => ({}),
        } as DOMRect;
        const viewportRect = {
            left: 12,
            top: -901,
            width: 1580,
            height: 987,
            right: 1592,
            bottom: 86,
            x: 12,
            y: -901,
            toJSON: () => ({}),
        } as DOMRect;
        const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
        HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
            if (this === container) {
                return scrollPortRect;
            }
            if (this.classList.contains('univer-embed-float-dom__content')) {
                return viewportRect;
            }
            if (this.getAttribute('data-embed-float-dom') === 'true') {
                return outerRect;
            }

            return originalGetBoundingClientRect.call(this);
        };

        try {
            await renderFloatBlock({ docsSheetLike: true, initialStage: 'stage2' });

            const chrome = document.querySelector<HTMLElement>('.univer-embed-float-dom__chrome');
            expect(chrome).not.toBeNull();
            expect(chrome!.style.top).toBe('76px');
            expect(chrome!.style.left).toBe('12px');
            expect(chrome!.style.width).toBe('1580px');
            expect(chrome!.style.height).toBe('10px');
            expect(chrome!.style.visibility).toBe('hidden');
            expect(chrome!.style.pointerEvents).toBe('none');
        } finally {
            HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
            delete (container as { clientHeight?: number }).clientHeight;
            delete (container as { scrollHeight?: number }).scrollHeight;
            container.style.overflow = '';
        }
    });

    it('disables docs sheet-like live runtime interaction when only a tiny edge remains visible', async () => {
        Object.defineProperty(container, 'clientHeight', { configurable: true, value: 1024 });
        Object.defineProperty(container, 'scrollHeight', { configurable: true, value: 8000 });
        container.style.overflow = 'auto';

        const scrollPortRect = {
            left: 0,
            top: 76,
            width: 1600,
            height: 1024,
            right: 1600,
            bottom: 1100,
            x: 0,
            y: 76,
            toJSON: () => ({}),
        } as DOMRect;
        const outerRect = {
            left: 388,
            top: -1001,
            width: 823,
            height: 1087,
            right: 1211,
            bottom: 86,
            x: 388,
            y: -1001,
            toJSON: () => ({}),
        } as DOMRect;
        const viewportRect = {
            left: 12,
            top: -901,
            width: 1580,
            height: 987,
            right: 1592,
            bottom: 86,
            x: 12,
            y: -901,
            toJSON: () => ({}),
        } as DOMRect;
        const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
        HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
            if (this === container) {
                return scrollPortRect;
            }
            if (this.classList.contains('univer-embed-float-dom__content')) {
                return viewportRect;
            }
            if (this.getAttribute('data-embed-float-dom') === 'true') {
                return outerRect;
            }

            return originalGetBoundingClientRect.call(this);
        };

        try {
            await renderFloatBlock({ docsSheetLike: true, initialStage: 'stage2' });

            const liveRoot = document.querySelector<HTMLElement>('.univer-embed-float-dom__live');
            const gate = document.querySelector<HTMLElement>('[data-embed-float-interaction-gate]');
            expect(liveRoot).not.toBeNull();
            expect(gate).not.toBeNull();
            expect(liveRoot!.style.pointerEvents).toBe('none');
            expect(gate!.style.pointerEvents).toBe('none');
        } finally {
            HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
            delete (container as { clientHeight?: number }).clientHeight;
            delete (container as { scrollHeight?: number }).scrollHeight;
            container.style.overflow = '';
        }
    });

    it('disables docs sheet-like popup interaction when only a tiny edge remains visible', async () => {
        Object.defineProperty(container, 'clientHeight', { configurable: true, value: 1024 });
        Object.defineProperty(container, 'scrollHeight', { configurable: true, value: 8000 });
        container.style.overflow = 'auto';

        const scrollPortRect = {
            left: 0,
            top: 76,
            width: 1600,
            height: 1024,
            right: 1600,
            bottom: 1100,
            x: 0,
            y: 76,
            toJSON: () => ({}),
        } as DOMRect;
        const outerRect = {
            left: 388,
            top: -1001,
            width: 823,
            height: 1087,
            right: 1211,
            bottom: 86,
            x: 388,
            y: -1001,
            toJSON: () => ({}),
        } as DOMRect;
        const viewportRect = {
            left: 12,
            top: -901,
            width: 1580,
            height: 987,
            right: 1592,
            bottom: 86,
            x: 12,
            y: -901,
            toJSON: () => ({}),
        } as DOMRect;
        const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
        HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
            if (this === container) {
                return scrollPortRect;
            }
            if (this.classList.contains('univer-embed-float-dom__content')) {
                return viewportRect;
            }
            if (this.getAttribute('data-embed-float-dom') === 'true') {
                return outerRect;
            }

            return originalGetBoundingClientRect.call(this);
        };

        try {
            await renderFloatBlock({ docsSheetLike: true, initialStage: 'stage2' });

            const popupRoot = document.querySelector<HTMLElement>('[data-embed-popup-root]');
            expect(popupRoot).not.toBeNull();
            expect(popupRoot!.style.pointerEvents).toBe('none');
        } finally {
            HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
            delete (container as { clientHeight?: number }).clientHeight;
            delete (container as { scrollHeight?: number }).scrollHeight;
            container.style.overflow = '';
        }
    });

    it('keeps docs sheet-like popup interaction enabled when the runtime is visible but floating controls are hidden', async () => {
        Object.defineProperty(container, 'clientHeight', { configurable: true, value: 1024 });
        Object.defineProperty(container, 'scrollHeight', { configurable: true, value: 8000 });
        container.style.overflow = 'auto';

        const scrollPortRect = {
            left: 0,
            top: 76,
            width: 1600,
            height: 1024,
            right: 1600,
            bottom: 1100,
            x: 0,
            y: 76,
            toJSON: () => ({}),
        } as DOMRect;
        const outerRect = {
            left: 388,
            top: -1001,
            width: 823,
            height: 1109,
            right: 1211,
            bottom: 108,
            x: 388,
            y: -1001,
            toJSON: () => ({}),
        } as DOMRect;
        const viewportRect = {
            left: 12,
            top: -901,
            width: 1580,
            height: 1009,
            right: 1592,
            bottom: 108,
            x: 12,
            y: -901,
            toJSON: () => ({}),
        } as DOMRect;
        const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
        HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
            if (this === container) {
                return scrollPortRect;
            }
            if (this.classList.contains('univer-embed-float-dom__content')) {
                return viewportRect;
            }
            if (this.getAttribute('data-embed-float-dom') === 'true') {
                return outerRect;
            }

            return originalGetBoundingClientRect.call(this);
        };

        try {
            await renderFloatBlock({ docsSheetLike: true, initialStage: 'stage2' });

            const chrome = document.querySelector<HTMLElement>('.univer-embed-float-dom__chrome');
            const contentRoot = document.querySelector<HTMLElement>('.univer-embed-float-dom__content');
            const liveRoot = document.querySelector<HTMLElement>('.univer-embed-float-dom__live');
            const popupRoot = document.querySelector<HTMLElement>('[data-embed-popup-root]');
            const overlayRoot = document.querySelector<HTMLElement>('[data-embed-overlay-root]');
            expect(chrome).not.toBeNull();
            expect(contentRoot).not.toBeNull();
            expect(liveRoot).not.toBeNull();
            expect(popupRoot).not.toBeNull();
            expect(overlayRoot).not.toBeNull();
            expect(chrome!.style.height).toBe('32px');
            expect(chrome!.style.visibility).toBe('');
            expect(overlayRoot!.style.visibility).toBe('hidden');
            expect(contentRoot!.style.pointerEvents).toBe('none');
            expect(liveRoot!.style.pointerEvents).toBe('none');
            expect(popupRoot!.style.pointerEvents).toBe('none');
            expect(document.querySelector<HTMLElement>('.univer-embed-float-dom__live-canvas')!.style.pointerEvents).toBe('auto');
            expect(document.querySelector<HTMLElement>('.univer-embed-float-dom__live-content')!.style.pointerEvents).toBe('none');
        } finally {
            HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
            delete (container as { clientHeight?: number }).clientHeight;
            delete (container as { scrollHeight?: number }).scrollHeight;
            container.style.overflow = '';
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

        expect(activationService.clearFloating).not.toHaveBeenCalled();
    });

    it('clears the floating activation through the activation service when pointer events leave the block', async () => {
        await renderFloatBlock();

        await act(async () => {
            document.body.dispatchEvent(new PointerEvent('pointerdown', {
                bubbles: true,
                clientX: 120,
                clientY: 120,
            }));
        });

        expect(activationService.clearFloating).toHaveBeenCalledWith('embed-1', 'host-1');
    });

    it('keeps stage active when the host marks an external pointer as its own interaction', async () => {
        const isExternalHostInteraction = vi.fn(() => true);
        await renderFloatBlock({ isExternalHostInteraction });

        await act(async () => {
            document.body.dispatchEvent(new PointerEvent('pointerdown', {
                bubbles: true,
                clientX: 120,
                clientY: 120,
            }));
        });

        expect(isExternalHostInteraction).toHaveBeenCalledWith(expect.any(PointerEvent));
        expect(activationService.clearFloating).not.toHaveBeenCalled();
    });

    it('keeps stage active when host focus follows an external host pointer interaction', async () => {
        const isExternalHostInteraction = vi.fn(() => true);
        await renderFloatBlock({ isExternalHostInteraction });
        const hostEditor = document.createElement('div');
        hostEditor.id = '__editor_slides-embed-host';
        document.body.appendChild(hostEditor);

        await act(async () => {
            document.body.dispatchEvent(new PointerEvent('pointerdown', {
                bubbles: true,
                clientX: 120,
                clientY: 120,
            }));
            hostEditor.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        });

        hostEditor.remove();
        expect(activationService.clearFloating).not.toHaveBeenCalled();
    });

    it('clears stage2 when a child editor lease is active but the pointer moves to the host', async () => {
        stage = 'stage2';
        await renderFloatBlock({ initialStage: 'stage2' });
        const childEditorLease = focusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-editor',
            owner: 'cell-editor',
        });

        await act(async () => {
            document.body.dispatchEvent(new PointerEvent('pointerdown', {
                bubbles: true,
                clientX: 120,
                clientY: 120,
            }));
        });

        expect(activationService.clearFloating).toHaveBeenCalledWith('embed-1', 'host-1');
        childEditorLease.dispose();
    });

    it('keeps stage active when pointer events originate from a registered child editor portal', async () => {
        stage = 'stage2';
        await renderFloatBlock({ initialStage: 'stage2' });
        const externalEditor = document.createElement('div');
        document.body.appendChild(externalEditor);
        focusCoordinator.registerElement({
            embedId: 'embed-1',
            role: 'child-editor',
            element: externalEditor,
        });

        await act(async () => {
            externalEditor.dispatchEvent(new PointerEvent('pointerdown', {
                bubbles: true,
                clientX: 120,
                clientY: 120,
            }));
        });

        externalEditor.remove();
        expect(activationService.clearFloating).not.toHaveBeenCalled();
    });

    it('keeps stage active when focus moves inside an active child popup', async () => {
        stage = 'stage2';
        await renderFloatBlock({ initialStage: 'stage2', interactionFlow: 'doc-block' });
        const childPopupLease = focusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-popup',
            owner: 'date-picker',
        });
        const hostEditor = document.createElement('div');
        hostEditor.id = '__editor_docs-embed-host';
        document.body.appendChild(hostEditor);

        await act(async () => {
            hostEditor.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        });

        expect(activationService.clearFloating).not.toHaveBeenCalled();
        childPopupLease.dispose();
        hostEditor.remove();
    });

    it('keeps stage active when host focus follows a recent child portal interaction', async () => {
        stage = 'stage2';
        interactionBoundaryService.hasRecentInteractionFor.mockReturnValue(true);
        await renderFloatBlock({ initialStage: 'stage2', interactionFlow: 'doc-block' });
        const hostEditor = document.createElement('div');
        hostEditor.id = '__editor_docs-embed-host';
        document.body.appendChild(hostEditor);

        await act(async () => {
            hostEditor.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        });

        expect(interactionBoundaryService.hasRecentInteractionFor).toHaveBeenCalledWith('embed-1', document);
        expect(activationService.clearFloating).not.toHaveBeenCalled();
        hostEditor.remove();
    });

    it('clears the floating activation when focus moves to an unowned host element', async () => {
        await renderFloatBlock();
        const hostEditor = document.createElement('div');
        hostEditor.id = '__editor_docs-embed-host';
        document.body.appendChild(hostEditor);

        await act(async () => {
            hostEditor.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        });

        hostEditor.remove();
        expect(activationService.clearFloating).toHaveBeenCalledWith('embed-1', 'host-1');
    });

    it('keeps stage active when pointer events originate from registered interaction boundaries', async () => {
        await renderFloatBlock();
        const externalPortal = document.createElement('div');
        document.body.appendChild(externalPortal);
        interactionBoundaryService.contains.mockImplementation((_embedId, target) => target === externalPortal);

        await act(async () => {
            externalPortal.dispatchEvent(new PointerEvent('pointerdown', {
                bubbles: true,
                clientX: 10,
                clientY: 10,
            }));
        });

        externalPortal.remove();
        expect(interactionBoundaryService.contains).toHaveBeenCalledWith('embed-1', externalPortal, expect.any(PointerEvent));
        expect(activationService.clearFloating).not.toHaveBeenCalled();
    });

    it('keeps stage active when pointer events hit transformed docs-sticky content', async () => {
        await renderFloatBlock({ docsSheetLike: true });
        const floatDom = document.querySelector<HTMLElement>('[data-embed-float-dom="true"]');
        const content = document.querySelector<HTMLElement>('.univer-embed-float-dom__content');
        const liveCanvas = document.querySelector<HTMLElement>('.univer-embed-float-dom__live-canvas');
        expect(floatDom).not.toBeNull();
        expect(content).not.toBeNull();
        expect(liveCanvas).not.toBeNull();
        floatDom!.getBoundingClientRect = () => ({
            bottom: -1311,
            height: 476,
            left: 388,
            right: 1344,
            top: -1787,
            width: 956,
            x: 388,
            y: -1787,
            toJSON: () => ({}),
        } as DOMRect);
        content!.getBoundingClientRect = () => ({
            bottom: 887,
            height: 887,
            left: 12,
            right: 1592,
            top: 0,
            width: 1580,
            x: 12,
            y: 0,
            toJSON: () => ({}),
        } as DOMRect);
        liveCanvas!.getBoundingClientRect = () => ({
            bottom: 887,
            height: 887,
            left: 388,
            right: 1344,
            top: 0,
            width: 956,
            x: 388,
            y: 0,
            toJSON: () => ({}),
        } as DOMRect);

        await act(async () => {
            document.body.dispatchEvent(new PointerEvent('pointerdown', {
                bubbles: true,
                clientX: 1168,
                clientY: 120,
            }));
        });

        expect(activationService.clearFloating).not.toHaveBeenCalled();
    });

    it('does not keep doc table-like focus from empty bleed space outside the live runtime', async () => {
        stage = 'stage2';
        await renderFloatBlock({ docsSheetLike: true, initialStage: 'stage2', interactionFlow: 'doc-block' });
        const floatDom = document.querySelector<HTMLElement>('[data-embed-float-dom="true"]');
        const content = document.querySelector<HTMLElement>('.univer-embed-float-dom__content');
        const liveCanvas = document.querySelector<HTMLElement>('.univer-embed-float-dom__live-canvas');
        expect(floatDom).not.toBeNull();
        expect(content).not.toBeNull();
        expect(liveCanvas).not.toBeNull();
        floatDom!.getBoundingClientRect = () => ({
            bottom: 19204,
            height: 19004,
            left: 388,
            right: 1211,
            top: -4558,
            width: 823,
            x: 388,
            y: -4558,
            toJSON: () => ({}),
        } as DOMRect);
        content!.getBoundingClientRect = () => ({
            bottom: 999,
            height: 923,
            left: 12,
            right: 1592,
            top: 76,
            width: 1580,
            x: 12,
            y: 76,
            toJSON: () => ({}),
        } as DOMRect);
        liveCanvas!.getBoundingClientRect = () => ({
            bottom: 999,
            height: 923,
            left: 388,
            right: 1592,
            top: 76,
            width: 1204,
            x: 388,
            y: 76,
            toJSON: () => ({}),
        } as DOMRect);

        await act(async () => {
            document.body.dispatchEvent(new PointerEvent('pointerdown', {
                bubbles: true,
                clientX: 300,
                clientY: 175,
            }));
        });

        expect(activationService.clearFloating).toHaveBeenCalledWith('embed-1', 'host-1');
    });

    it('clears doc table-like block focus when the host canvas is clicked above the runtime content', async () => {
        stage = 'stage2';
        await renderFloatBlock({ docsSheetLike: true, initialStage: 'stage2', interactionFlow: 'doc-block' });
        const floatDom = document.querySelector<HTMLElement>('[data-embed-float-dom="true"]');
        const content = document.querySelector<HTMLElement>('.univer-embed-float-dom__content');
        const chrome = document.querySelector<HTMLElement>('.univer-embed-float-dom__chrome[data-embed-id="embed-1"]');
        expect(floatDom).not.toBeNull();
        expect(content).not.toBeNull();
        expect(chrome).not.toBeNull();
        floatDom!.getBoundingClientRect = () => ({
            bottom: 19204,
            height: 19004,
            left: 388,
            right: 1211,
            top: 200,
            width: 823,
            x: 388,
            y: 200,
            toJSON: () => ({}),
        } as DOMRect);
        content!.getBoundingClientRect = () => ({
            bottom: 1223,
            height: 1023,
            left: 12,
            right: 1592,
            top: 200,
            width: 1580,
            x: 12,
            y: 200,
            toJSON: () => ({}),
        } as DOMRect);
        chrome!.getBoundingClientRect = () => ({
            bottom: 1099,
            height: 899,
            left: 12,
            right: 1592,
            top: 200,
            width: 1580,
            x: 12,
            y: 200,
            toJSON: () => ({}),
        } as DOMRect);

        await act(async () => {
            document.body.dispatchEvent(new PointerEvent('pointerdown', {
                bubbles: true,
                clientX: 80,
                clientY: 175,
            }));
        });

        expect(activationService.clearFloating).toHaveBeenCalledWith('embed-1', 'host-1');
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

    it('does not force-focus the runtime canvas for sheet stage2 pointer interactions', async () => {
        await renderFloatBlock();
        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });

        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const canvas = document.createElement('canvas');
        runtimeRoots.canvas.appendChild(canvas);

        await act(async () => {
            canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        });

        expect(document.activeElement).not.toBe(canvas);
    });

    it('focuses the runtime canvas for slide stage2 pointer interactions', async () => {
        await renderFloatBlock({ childType: UniverInstanceType.UNIVER_SLIDE });
        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });

        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const canvas = document.createElement('canvas');
        runtimeRoots.canvas.appendChild(canvas);

        await act(async () => {
            canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        });

        expect(canvas.tabIndex).toBe(-1);
        expect(document.activeElement).toBe(canvas);
    });

    it('focuses the child unit owner when interacting with a stage2 runtime canvas', async () => {
        await renderFloatBlock();
        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });
        activationService.activateFloating.mockClear();
        activationService.focusFloatingRuntime.mockClear();

        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const canvas = document.createElement('canvas');
        runtimeRoots.canvas.appendChild(canvas);

        await act(async () => {
            canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        });

        expect(activationService.focusFloatingRuntime).toHaveBeenCalledWith(createFloatDescriptor());
        expect(activationService.activateFloating).not.toHaveBeenCalled();
    });

    it('does not steal focus back after another element explicitly focuses', async () => {
        await renderFloatBlock();
        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });

        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const canvas = document.createElement('canvas');
        const hostInput = document.createElement('input');
        document.body.appendChild(hostInput);
        runtimeRoots.canvas.appendChild(canvas);
        runtimeRoots.canvas.addEventListener('pointerdown', () => {
            globalThis.setTimeout(() => hostInput.focus(), 0);
        });

        await act(async () => {
            canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
            await new Promise((resolve) => setTimeout(resolve, 20));
        });

        expect(document.activeElement).toBe(hostInput);
        hostInput.remove();
    });

    it('does not steal focus back from a child runtime editor', async () => {
        await renderFloatBlock();
        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });

        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const canvas = document.createElement('canvas');
        const editorInput = document.createElement('input');
        runtimeRoots.canvas.appendChild(canvas);
        runtimeRoots.content.appendChild(editorInput);

        await act(async () => {
            canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
            editorInput.focus();
            animationFrameCallbacks.splice(0).forEach((callback) => callback(16));
            await new Promise((resolve) => setTimeout(resolve, 140));
        });

        expect(document.activeElement).toBe(editorInput);
    });

    it('does not steal focus from a registered child editor mounted outside the runtime root', async () => {
        await renderFloatBlock();
        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });

        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const canvas = document.createElement('canvas');
        const externalEditorInput = document.createElement('input');
        runtimeRoots.canvas.appendChild(canvas);
        document.body.appendChild(externalEditorInput);
        const registration = focusCoordinator.registerElement({
            embedId: 'embed-1',
            role: 'child-editor',
            element: externalEditorInput,
        });
        externalEditorInput.focus();

        await act(async () => {
            canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
            animationFrameCallbacks.splice(0).forEach((callback) => callback(16));
            await new Promise((resolve) => setTimeout(resolve, 140));
        });

        expect(document.activeElement).toBe(externalEditorInput);
        registration.dispose();
        externalEditorInput.remove();
    });

    it('notifies the host when the interaction gate promotes into stage2', async () => {
        const onRuntimeStageEnter = vi.fn();
        activationService.activateFloating.mockImplementation(() => {
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

    it('notifies the host when the floating block mounts into an already active stage', async () => {
        const onRuntimeStageEnter = vi.fn();
        stage = 'stage1';

        await renderFloatBlock({ initialStage: 'stage1', onRuntimeStageEnter });

        expect(onRuntimeStageEnter).toHaveBeenCalledWith('stage1');
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
        expect(activationService.activateFloating).not.toHaveBeenCalled();

        await act(async () => {
            gate!.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, clientX: 12, clientY: 12 }));
        });
        expect(activationService.activateFloating).toHaveBeenCalledWith(createFloatDescriptor(), 'stage2');
    });

    it('enters stage2 directly for doc-block interaction flow', async () => {
        await renderFloatBlock({ interactionFlow: 'doc-block' });

        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        expect(gate).not.toBeNull();

        await act(async () => {
            gate!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 12, clientY: 12 }));
            gate!.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, clientX: 12, clientY: 12 }));
        });

        expect(activationService.activateFloating).toHaveBeenCalledWith(createFloatDescriptor(), 'stage2');
        expect(activationService.activateFloating).not.toHaveBeenCalledWith(createFloatDescriptor(), 'stage1');
    });

    it('lets doc-block clicks pass through the interaction gate before stage2 starts', async () => {
        await renderFloatBlock({ interactionFlow: 'doc-block' });

        const styleText = document.getElementById('univer-embed-float-dom-styles')?.textContent ?? '';

        expect(styleText).toContain('.univer-embed-float-dom[data-embed-interaction-flow="doc-block"] .univer-embed-float-dom__interaction-gate');
    });

    it('activates doc-block stage2 from the live runtime before the child handles the first click', async () => {
        await renderFloatBlock({ interactionFlow: 'doc-block' });

        const live = document.querySelector('[data-embed-float-live]');
        expect(live).not.toBeNull();

        await act(async () => {
            live!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 12, clientY: 12 }));
        });

        expect(activationService.activateFloating).toHaveBeenCalledWith(createFloatDescriptor(), 'stage2');
        expect(document.querySelector('[data-embed-interaction-flow="doc-block"]')).not.toBeNull();
    });

    it('suppresses host doc interaction during the doc-block pointer that enters stage2', async () => {
        const hostEditor = document.createElement('div');
        hostEditor.id = '__editor_docs-host-1';
        document.body.appendChild(hostEditor);
        let suppressedDuringActivation: boolean | undefined;
        activationService.activateFloating.mockImplementation(() => {
            suppressedDuringActivation = focusCoordinator.shouldSuppressHostInteraction('host-1', hostEditor);
            stage = 'stage2';
            active$.next({});
        });
        await renderFloatBlock({ interactionFlow: 'doc-block' });

        const live = document.querySelector('[data-embed-float-live]');
        expect(live).not.toBeNull();

        await act(async () => {
            live!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 12, clientY: 12 }));
            await Promise.resolve();
        });

        expect(suppressedDuringActivation).toBe(true);
        expect(focusCoordinator.shouldSuppressHostInteraction('host-1', hostEditor)).toBe(true);
        hostEditor.remove();
    });

    it('does not force-focus a sheet doc-block runtime canvas after entering stage2', async () => {
        activationService.activateFloating.mockImplementation(() => {
            stage = 'stage2';
            active$.next({});
        });
        await renderFloatBlock({ interactionFlow: 'doc-block' });
        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const canvas = document.createElement('canvas');
        runtimeRoots.canvas.appendChild(canvas);

        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        expect(gate).not.toBeNull();

        await act(async () => {
            gate!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 12, clientY: 12 }));
            gate!.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, clientX: 12, clientY: 12 }));
            await Promise.resolve();
        });

        expect(document.activeElement).not.toBe(canvas);
        expect(activationService.focusFloatingRuntime).not.toHaveBeenCalled();
    });

    it('does not focus the runtime canvas while a child editor lease is active', async () => {
        activationService.activateFloating.mockImplementation(() => {
            stage = 'stage2';
            active$.next({});
        });
        await renderFloatBlock({ interactionFlow: 'doc-block' });
        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const canvas = document.createElement('canvas');
        const focusSpy = vi.spyOn(canvas, 'focus');
        runtimeRoots.canvas.appendChild(canvas);
        const lease = focusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-editor',
            owner: 'cell-editor',
        });

        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        expect(gate).not.toBeNull();

        await act(async () => {
            gate!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 12, clientY: 12 }));
            gate!.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, clientX: 12, clientY: 12 }));
            animationFrameCallbacks.splice(0).forEach((callback) => callback(16));
            await Promise.resolve();
        });

        expect(focusSpy).not.toHaveBeenCalled();
        lease.dispose();
    });

    it('keeps a child interaction lease for the whole stage2 runtime session', async () => {
        stage = 'stage2';
        await renderFloatBlock({ initialStage: 'stage2' });
        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const canvas = document.createElement('canvas');
        runtimeRoots.canvas.appendChild(canvas);

        expect(focusCoordinator.hasChildInteractionLease('embed-1')).toBe(true);

        await act(async () => {
            canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
        });

        expect(focusCoordinator.hasChildInteractionLease('embed-1')).toBe(true);

        await act(async () => {
            document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
        });

        expect(focusCoordinator.hasChildInteractionLease('embed-1')).toBe(true);

        stage = 'inactive';
        await act(async () => {
            active$.next({});
        });

        expect(focusCoordinator.hasChildInteractionLease('embed-1')).toBe(false);
    });

    it('holds a blocking child focus lease for body-level popup pointer interactions', async () => {
        vi.useFakeTimers();
        stage = 'stage2';
        await renderFloatBlock({ initialStage: 'stage2' });
        const popup = document.createElement('div');
        popup.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        popup.setAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, 'child-popup');
        const input = document.createElement('input');
        input.setAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, 'child-popup');
        popup.appendChild(input);
        document.body.appendChild(popup);

        expect(focusCoordinator.hasBlockingChildFocusLease('embed-1')).toBe(true);
        expect(focusCoordinator.hasBlockingChildFocusLease('embed-1', { ignoreOwners: ['stage2-runtime', 'doc-block-stage2-runtime'] })).toBe(false);

        await act(async () => {
            input.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
        });

        expect(focusCoordinator.hasBlockingChildFocusLease('embed-1')).toBe(true);
        expect(focusCoordinator.hasBlockingChildFocusLease('embed-1', { ignoreOwners: ['stage2-runtime', 'doc-block-stage2-runtime'] })).toBe(true);

        await act(async () => {
            document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
        });

        expect(focusCoordinator.hasBlockingChildFocusLease('embed-1')).toBe(true);

        const hostEditor = document.createElement('div');
        hostEditor.id = '__editor_docs-embed-host';
        document.body.appendChild(hostEditor);
        await act(async () => {
            hostEditor.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        });

        expect(activationService.clearFloating).not.toHaveBeenCalled();

        await act(async () => {
            vi.runOnlyPendingTimers();
            await Promise.resolve();
        });

        expect(focusCoordinator.hasBlockingChildFocusLease('embed-1')).toBe(true);
        expect(focusCoordinator.hasBlockingChildFocusLease('embed-1', { ignoreOwners: ['stage2-runtime', 'doc-block-stage2-runtime'] })).toBe(false);

        await act(async () => {
            hostEditor.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        });

        expect(activationService.clearFloating).toHaveBeenCalledWith('embed-1', 'host-1');

        hostEditor.remove();
        popup.remove();
        vi.useRealTimers();
    });

    it('releases body-level child editor focus when leaving stage2', async () => {
        stage = 'stage2';
        await renderFloatBlock({ initialStage: 'stage2' });
        const editorPortal = document.createElement('div');
        editorPortal.tabIndex = -1;
        editorPortal.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        editorPortal.setAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, 'child-editor');
        document.body.appendChild(editorPortal);
        editorPortal.focus();

        expect(document.activeElement).toBe(editorPortal);

        stage = 'inactive';
        await act(async () => {
            active$.next({});
        });

        expect(document.activeElement).not.toBe(editorPortal);
        editorPortal.remove();
    });

    it('keeps ordinary stage2 runtime sessions blocking for host focus recovery', async () => {
        stage = 'stage2';
        await renderFloatBlock({ initialStage: 'stage2' });

        expect(focusCoordinator.hasChildInteractionLease('embed-1')).toBe(true);
        expect(focusCoordinator.hasBlockingChildFocusLease('embed-1')).toBe(true);
    });

    it('treats doc-block stage2 runtime sessions as host-blocking while allowing child runtime focus', async () => {
        stage = 'stage2';
        await renderFloatBlock({ initialStage: 'stage2', interactionFlow: 'doc-block' });

        expect(focusCoordinator.hasChildInteractionLease('embed-1')).toBe(true);
        expect(focusCoordinator.hasHostPreservingChildFocusLease('embed-1')).toBe(true);
        expect(focusCoordinator.hasBlockingChildFocusLease('embed-1')).toBe(true);
        expect(focusCoordinator.hasBlockingChildFocusLease('embed-1', { ignoreOwners: ['doc-block-stage2-runtime'] })).toBe(false);
    });

    it('does not retry runtime canvas focus for sheet doc-block sessions', async () => {
        activationService.activateFloating.mockImplementation(() => {
            stage = 'stage2';
            active$.next({});
        });
        await renderFloatBlock({ interactionFlow: 'doc-block' });
        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const canvas = document.createElement('canvas');
        const focusSpy = vi.spyOn(canvas, 'focus');
        runtimeRoots.canvas.appendChild(canvas);

        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        expect(gate).not.toBeNull();

        await act(async () => {
            gate!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 12, clientY: 12 }));
            gate!.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, clientX: 12, clientY: 12 }));
            const callbacks = animationFrameCallbacks.splice(0);
            callbacks.forEach((callback) => callback(16));
            animationFrameCallbacks.splice(0).forEach((callback) => callback(32));
            await Promise.resolve();
        });

        expect(focusSpy).not.toHaveBeenCalled();
    });

    it('does not force-focus a sheet doc-block runtime canvas mounted in the content slot', async () => {
        activationService.activateFloating.mockImplementation(() => {
            stage = 'stage2';
            active$.next({});
        });
        await renderFloatBlock({ interactionFlow: 'doc-block' });
        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const canvas = document.createElement('canvas');
        runtimeRoots.content.appendChild(canvas);

        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        expect(gate).not.toBeNull();

        await act(async () => {
            gate!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 12, clientY: 12 }));
            gate!.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, clientX: 12, clientY: 12 }));
            await Promise.resolve();
        });

        expect(document.activeElement).not.toBe(canvas);
        expect(activationService.focusFloatingRuntime).not.toHaveBeenCalled();
    });

    it('does not force-focus a sheet runtime canvas mounted after a doc-block enters stage2', async () => {
        activationService.activateFloating.mockImplementation(() => {
            stage = 'stage2';
            active$.next({});
        });
        await renderFloatBlock({ interactionFlow: 'doc-block' });
        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];

        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        expect(gate).not.toBeNull();

        await act(async () => {
            gate!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 12, clientY: 12 }));
            gate!.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, clientX: 12, clientY: 12 }));
            await Promise.resolve();
        });

        const canvas = document.createElement('canvas');
        runtimeRoots.canvas.appendChild(canvas);
        await act(async () => {
            animationFrameCallbacks.splice(0).forEach((callback) => callback(16));
        });

        expect(document.activeElement).not.toBe(canvas);
    });

    it('keeps doc-block stage2 active when the shared app-shell editor receives child focus', async () => {
        stage = 'stage2';
        await renderFloatBlock({ initialStage: 'stage2', interactionFlow: 'doc-block' });
        const appShell = document.createElement('div');
        appShell.id = 'app';
        const selectionContainer = document.createElement('div');
        selectionContainer.id = 'univer-doc-selection-container-__INTERNAL_EDITOR__DOCS_NORMAL';
        const sharedEditor = document.createElement('div');
        sharedEditor.id = '__editor___INTERNAL_EDITOR__DOCS_NORMAL';
        sharedEditor.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        sharedEditor.setAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, 'child-editor');
        selectionContainer.appendChild(sharedEditor);
        appShell.appendChild(selectionContainer);
        document.body.appendChild(appShell);
        const childEditorLease = focusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-editor',
            owner: 'sheet-cell-editor',
            hostUnitId: 'host-1',
            childUnitId: 'child-1',
            associatedChildUnitIds: ['__INTERNAL_EDITOR__DOCS_NORMAL'],
        });

        await act(async () => {
            sharedEditor.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        });

        expect(activationService.clearFloating).not.toHaveBeenCalled();

        childEditorLease.dispose();
        appShell.remove();
    });

    it('keeps the default floating-stage flow entering stage1 first', async () => {
        await renderFloatBlock();

        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        expect(gate).not.toBeNull();

        await act(async () => {
            gate!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 12, clientY: 12 }));
            gate!.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, clientX: 12, clientY: 12 }));
        });

        expect(activationService.activateFloating).toHaveBeenCalledWith(createFloatDescriptor(), 'stage1');
    });

    it('blurs child runtime focus while the default floating-stage flow is only in stage1', async () => {
        await renderFloatBlock({ initialStage: 'stage1', childType: UniverInstanceType.UNIVER_DOC });
        const childEditor = document.createElement('div');
        childEditor.tabIndex = -1;
        childEditor.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        childEditor.setAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, 'child-editor');
        document.body.appendChild(childEditor);

        childEditor.focus();
        expect(document.activeElement).toBe(childEditor);

        await act(async () => {
            active$.next({});
            await Promise.resolve();
        });

        expect(document.activeElement).not.toBe(childEditor);

        childEditor.remove();
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

        expect(activationService.activateFloating).not.toHaveBeenCalled();
    });

    it('notifies the host when an enabled stage1 body drag starts', async () => {
        await renderFloatBlock({ initialStage: 'stage1', enableStage1BodyDrag: true });
        stage = 'stage1';
        await act(async () => {
            active$.next({});
        });

        const listener = vi.fn();
        document.addEventListener(EMBED_FLOAT_DRAG_HANDLE_POINTER_DOWN_EVENT, listener);
        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        expect(gate).not.toBeNull();

        await act(async () => {
            gate!.dispatchEvent(new PointerEvent('pointerdown', {
                bubbles: true,
                pointerId: 7,
                clientX: 120,
                clientY: 80,
                button: 0,
            }));
            gate!.dispatchEvent(new PointerEvent('pointermove', {
                bubbles: true,
                pointerId: 7,
                clientX: 150,
                clientY: 96,
                button: 0,
            }));
            gate!.dispatchEvent(new PointerEvent('pointerup', {
                bubbles: true,
                pointerId: 7,
                clientX: 150,
                clientY: 96,
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
        expect(activationService.activateFloating).not.toHaveBeenCalledWith(createFloatDescriptor(), 'stage2');
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

    it('prefers native point hit-testing when forwarding inactive wheel events', async () => {
        await renderFloatBlock();

        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        expect(gate).not.toBeNull();
        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const runtimeTarget = document.createElement('div');
        const onWheel = vi.fn((event: WheelEvent) => event.preventDefault());
        runtimeTarget.addEventListener('wheel', onWheel);
        runtimeRoots.content.appendChild(runtimeTarget);
        const originalElementsFromPoint = document.elementsFromPoint;
        const elementsFromPoint = vi.fn(() => [
            gate as Element,
            runtimeTarget,
        ]);
        Object.defineProperty(document, 'elementsFromPoint', {
            configurable: true,
            value: elementsFromPoint,
        });
        const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
        HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
            if (this === runtimeTarget) {
                throw new Error('native point hit-testing should avoid recursive runtime measurement');
            }

            return originalGetBoundingClientRect.call(this);
        };

        try {
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

            expect(elementsFromPoint).toHaveBeenCalledWith(0, 0);
            expect(onWheel).toHaveBeenCalledTimes(1);
            expect(wheel.defaultPrevented).toBe(true);
        } finally {
            HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
            Object.defineProperty(document, 'elementsFromPoint', {
                configurable: true,
                value: originalElementsFromPoint,
            });
        }
    });

    it('does not fallback-scroll the runtime DOM after a forwarded wheel is handled', async () => {
        await renderFloatBlock();

        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        expect(gate).not.toBeNull();
        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const runtimeTarget = document.createElement('div');
        Object.defineProperty(runtimeTarget, 'clientHeight', { configurable: true, value: 100 });
        Object.defineProperty(runtimeTarget, 'scrollHeight', { configurable: true, value: 300 });
        runtimeTarget.scrollTop = 0;
        runtimeTarget.addEventListener('wheel', (event) => event.preventDefault());
        runtimeRoots.content.appendChild(runtimeTarget);

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

        expect(runtimeTarget.scrollTop).toBe(0);
        expect(wheel.defaultPrevented).toBe(true);
    });

    it('scrolls docs table-like horizontal wheel on the live root before the child runtime can consume it', async () => {
        await renderFloatBlock({ docsSheetLike: true });

        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        const liveRoot = document.querySelector<HTMLElement>('.univer-embed-float-dom__live');
        expect(gate).not.toBeNull();
        expect(liveRoot).not.toBeNull();
        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const runtimeTarget = document.createElement('canvas');
        const onRuntimeWheel = vi.fn((event: WheelEvent) => event.preventDefault());
        runtimeTarget.addEventListener('wheel', onRuntimeWheel);
        runtimeRoots.canvas.appendChild(runtimeTarget);
        Object.defineProperties(liveRoot!, {
            clientWidth: { configurable: true, value: 100 },
            scrollWidth: { configurable: true, value: 300 },
        });
        liveRoot!.scrollLeft = 0;
        const originalElementsFromPoint = document.elementsFromPoint;
        Object.defineProperty(document, 'elementsFromPoint', {
            configurable: true,
            value: vi.fn(() => [gate as Element, runtimeTarget]),
        });

        try {
            const wheel = new WheelEvent('wheel', {
                bubbles: true,
                cancelable: true,
                clientX: 0,
                clientY: 0,
                deltaX: 80,
            });
            await act(async () => {
                gate!.dispatchEvent(wheel);
            });

            expect(liveRoot!.scrollLeft).toBe(80);
            expect(onRuntimeWheel).not.toHaveBeenCalled();
            expect(wheel.defaultPrevented).toBe(true);
        } finally {
            Object.defineProperty(document, 'elementsFromPoint', {
                configurable: true,
                value: originalElementsFromPoint,
            });
        }
    });

    it('scrolls doc-block table-like horizontal wheel when the event lands on the live child runtime', async () => {
        await renderFloatBlock({ docsSheetLike: true, interactionFlow: 'doc-block' });

        const liveRoot = document.querySelector<HTMLElement>('.univer-embed-float-dom__live');
        expect(liveRoot).not.toBeNull();
        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const runtimeTarget = document.createElement('canvas');
        const onRuntimeWheel = vi.fn((event: WheelEvent) => event.preventDefault());
        runtimeTarget.addEventListener('wheel', onRuntimeWheel);
        runtimeRoots.canvas.appendChild(runtimeTarget);
        Object.defineProperties(liveRoot!, {
            clientWidth: { configurable: true, value: 100 },
            scrollWidth: { configurable: true, value: 300 },
        });
        liveRoot!.scrollLeft = 0;

        const wheel = new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            clientX: 0,
            clientY: 0,
            deltaX: 80,
        });
        await act(async () => {
            runtimeTarget.dispatchEvent(wheel);
        });

        expect(liveRoot!.scrollLeft).toBe(80);
        expect(onRuntimeWheel).not.toHaveBeenCalled();
        expect(wheel.defaultPrevented).toBe(true);
    });

    it('scrolls docs table-like bleed before a passive child provider on rightward wheel', async () => {
        mountIntoHostElement.mockReturnValue({ context: createChildContext({ layout: 'docs-sticky-base' }) });
        passiveViewportRegistry.get.mockReturnValue(passiveViewportProvider);
        await renderFloatBlock({ docsSheetLike: true });

        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        const liveRoot = document.querySelector<HTMLElement>('.univer-embed-float-dom__live');
        expect(gate).not.toBeNull();
        expect(liveRoot).not.toBeNull();
        Object.defineProperties(liveRoot!, {
            clientWidth: { configurable: true, value: 100 },
            scrollWidth: { configurable: true, value: 300 },
        });
        liveRoot!.scrollLeft = 0;

        const wheel = new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            clientX: 0,
            clientY: 0,
            deltaX: 80,
        });
        await act(async () => {
            gate!.dispatchEvent(wheel);
        });

        expect(liveRoot!.scrollLeft).toBe(80);
        expect(passiveViewportProvider.handleWheel).not.toHaveBeenCalled();
        expect(wheel.defaultPrevented).toBe(true);
    });

    it('chains docs table-like horizontal wheel to the child runtime at the scroll edge', async () => {
        await renderFloatBlock({ docsSheetLike: true });

        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        const liveRoot = document.querySelector<HTMLElement>('.univer-embed-float-dom__live');
        expect(gate).not.toBeNull();
        expect(liveRoot).not.toBeNull();
        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const runtimeTarget = document.createElement('canvas');
        const onRuntimeWheel = vi.fn((event: WheelEvent) => event.preventDefault());
        runtimeTarget.addEventListener('wheel', onRuntimeWheel);
        runtimeRoots.canvas.appendChild(runtimeTarget);
        Object.defineProperties(liveRoot!, {
            clientWidth: { configurable: true, value: 100 },
            scrollWidth: { configurable: true, value: 300 },
        });
        let scrollLeft = 200;
        Object.defineProperty(liveRoot!, 'scrollLeft', {
            configurable: true,
            get: () => scrollLeft,
            set: (value: number) => {
                scrollLeft = Math.max(0, Math.min(200, value));
            },
        });
        const originalElementsFromPoint = document.elementsFromPoint;
        Object.defineProperty(document, 'elementsFromPoint', {
            configurable: true,
            value: vi.fn(() => [gate as Element, runtimeTarget]),
        });

        try {
            const wheel = new WheelEvent('wheel', {
                bubbles: true,
                cancelable: true,
                clientX: 0,
                clientY: 0,
                deltaX: 80,
            });
            await act(async () => {
                gate!.dispatchEvent(wheel);
            });

            expect(liveRoot!.scrollLeft).toBe(200);
            expect(onRuntimeWheel).toHaveBeenCalledTimes(1);
            expect(wheel.defaultPrevented).toBe(true);
        } finally {
            Object.defineProperty(document, 'elementsFromPoint', {
                configurable: true,
                value: originalElementsFromPoint,
            });
        }
    });

    it('forwards docs-sticky horizontal wheel to the child runtime at the bleed edge', async () => {
        Object.defineProperty(container, 'clientHeight', { configurable: true, value: 996 });
        Object.defineProperty(container, 'scrollHeight', { configurable: true, value: 2400 });
        container.style.overflow = 'auto';
        container.getBoundingClientRect = () => ({
            bottom: 1072,
            height: 996,
            left: 0,
            right: 1600,
            top: 76,
            width: 1600,
            x: 0,
            y: 76,
            toJSON: () => ({}),
        } as DOMRect);
        mountIntoHostElement.mockReturnValue({ context: createChildContext({ layout: 'docs-sticky-base' }) });
        passiveViewportRegistry.get.mockReturnValue(passiveViewportProvider);

        await renderFloatBlock({ docsSheetLike: true, syncHostVerticalScroll: true });
        const customBlock = document.querySelector<HTMLElement>('[data-embed-docs-custom-block-sheet-like="true"]');
        const content = document.querySelector<HTMLElement>('.univer-embed-float-dom__content');
        const floatDom = document.querySelector<HTMLElement>('[data-embed-float-dom="true"]');
        const gate = document.querySelector('[data-embed-float-interaction-gate]');
        const liveRoot = document.querySelector<HTMLElement>('.univer-embed-float-dom__live');
        expect(customBlock).not.toBeNull();
        expect(content).not.toBeNull();
        expect(floatDom).not.toBeNull();
        expect(gate).not.toBeNull();
        expect(liveRoot).not.toBeNull();

        customBlock!.style.setProperty('--univer-embed-docs-block-content-height', '1400px');
        customBlock!.style.setProperty('--univer-embed-docs-block-viewport-height', '887px');
        content!.getBoundingClientRect = () => ({
            bottom: 963,
            height: 887,
            left: 0,
            right: 1600,
            top: 76,
            width: 1600,
            x: 0,
            y: 76,
            toJSON: () => ({}),
        } as DOMRect);
        floatDom!.getBoundingClientRect = () => ({
            bottom: 800,
            height: 1400,
            left: 388,
            right: 1344,
            top: -600,
            width: 956,
            x: 388,
            y: -600,
            toJSON: () => ({}),
        } as DOMRect);

        await act(async () => {
            flushQueuedAnimationFrames(0);
        });

        expect(passiveViewportProvider.handleWheel).toHaveBeenCalledWith(expect.objectContaining({
            source: 'host-scroll-sync',
            viewportScrollY: 513,
        }));
        passiveViewportProvider.handleWheel.mockClear();
        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const runtimeTarget = document.createElement('canvas');
        const onRuntimeWheel = vi.fn((event: WheelEvent) => event.preventDefault());
        runtimeTarget.addEventListener('wheel', onRuntimeWheel);
        runtimeRoots.canvas.appendChild(runtimeTarget);
        const originalElementsFromPoint = document.elementsFromPoint;
        Object.defineProperty(document, 'elementsFromPoint', {
            configurable: true,
            value: vi.fn(() => [gate as Element, runtimeTarget]),
        });

        Object.defineProperties(liveRoot!, {
            clientWidth: { configurable: true, value: 100 },
            scrollWidth: { configurable: true, value: 300 },
        });
        let scrollLeft = 200;
        Object.defineProperty(liveRoot!, 'scrollLeft', {
            configurable: true,
            get: () => scrollLeft,
            set: (value: number) => {
                scrollLeft = Math.max(0, Math.min(200, value));
            },
        });

        try {
            const wheel = new WheelEvent('wheel', {
                bubbles: true,
                cancelable: true,
                clientX: 0,
                clientY: 0,
                deltaX: 80,
            });
            await act(async () => {
                gate!.dispatchEvent(wheel);
            });

            expect(liveRoot!.scrollLeft).toBe(200);
            expect(passiveViewportProvider.handleWheel).not.toHaveBeenCalled();
            expect(onRuntimeWheel).toHaveBeenCalledTimes(1);
            expect(wheel.defaultPrevented).toBe(true);
        } finally {
            Object.defineProperty(document, 'elementsFromPoint', {
                configurable: true,
                value: originalElementsFromPoint,
            });
        }
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
        expect(activationService.activateFloating).not.toHaveBeenCalled();
    });

    it('routes inactive docs-sticky vertical wheel to the host before the child provider can drop it', async () => {
        mountIntoHostElement.mockReturnValue({ context: createChildContext({ layout: 'docs-sticky-base' }) });
        passiveViewportProvider.handleWheel.mockReturnValue(false);
        passiveViewportRegistry.get.mockReturnValue(passiveViewportProvider);
        const onHostWheel = vi.fn(() => true);
        await renderFloatBlock({ onHostWheel });

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

        expect(onHostWheel).toHaveBeenCalledWith(wheel, expect.objectContaining({
            childUnitId: 'child-1',
            hostUnitId: 'host-1',
            layout: 'docs-sticky-base',
        }));
        expect(passiveViewportProvider.handleWheel).not.toHaveBeenCalled();
        expect(wheel.defaultPrevented).toBe(true);
        expect(activationService.activateFloating).not.toHaveBeenCalled();
    });

    it('routes stage2 docs-sticky vertical wheel to the host scrollport before the child runtime consumes it', async () => {
        Object.defineProperty(container, 'clientHeight', { configurable: true, value: 200 });
        Object.defineProperty(container, 'scrollHeight', { configurable: true, value: 1000 });
        container.style.overflow = 'auto';
        container.scrollTop = 0;
        mountIntoHostElement.mockReturnValue({ context: createChildContext({ layout: 'docs-sticky-sheet' }) });

        await renderFloatBlock();
        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });

        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const runtimeTarget = document.createElement('div');
        const onChildWheel = vi.fn();
        runtimeTarget.addEventListener('wheel', onChildWheel);
        runtimeRoots.content.appendChild(runtimeTarget);

        const wheel = new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            deltaY: 80,
        });
        await act(async () => {
            runtimeTarget.dispatchEvent(wheel);
        });

        expect(container.scrollTop).toBe(80);
        expect(onChildWheel).not.toHaveBeenCalled();
        expect(wheel.defaultPrevented).toBe(true);
    });

    it('lets docs hosts handle stage2 vertical wheel through a product-owned viewport callback', async () => {
        Object.defineProperty(container, 'clientHeight', { configurable: true, value: 200 });
        Object.defineProperty(container, 'scrollHeight', { configurable: true, value: 1000 });
        container.style.overflow = 'auto';
        container.scrollTop = 0;
        mountIntoHostElement.mockReturnValue({ context: createChildContext({ layout: 'docs-sticky-sheet' }) });
        const onHostWheel = vi.fn(() => true);

        await renderFloatBlock({ onHostWheel });
        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });

        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const runtimeTarget = document.createElement('div');
        const onChildWheel = vi.fn();
        runtimeTarget.addEventListener('wheel', onChildWheel);
        runtimeRoots.content.appendChild(runtimeTarget);

        const wheel = new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            deltaY: 80,
        });
        await act(async () => {
            runtimeTarget.dispatchEvent(wheel);
        });

        expect(onHostWheel).toHaveBeenCalledTimes(1);
        expect(onHostWheel).toHaveBeenCalledWith(wheel, expect.objectContaining({ hostUnitId: 'host-1', childUnitId: 'child-1' }));
        expect(container.scrollTop).toBe(0);
        expect(onChildWheel).not.toHaveBeenCalled();
        expect(wheel.defaultPrevented).toBe(true);
    });

    it('uses syncHostVerticalScroll to route table-like doc block stage2 vertical wheel to the host', async () => {
        mountIntoHostElement.mockReturnValue({ context: createChildContext({ layout: 'doc-width-scale' }) });
        const onHostWheel = vi.fn(() => true);

        await renderFloatBlock({ onHostWheel, syncHostVerticalScroll: true });
        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });

        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const runtimeTarget = document.createElement('div');
        const onChildWheel = vi.fn();
        runtimeTarget.addEventListener('wheel', onChildWheel);
        runtimeRoots.content.appendChild(runtimeTarget);

        const wheel = new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            deltaY: 80,
        });
        await act(async () => {
            runtimeTarget.dispatchEvent(wheel);
        });

        expect(onHostWheel).toHaveBeenCalledTimes(1);
        expect(onChildWheel).not.toHaveBeenCalled();
        expect(wheel.defaultPrevented).toBe(true);
    });

    it('lets table-like doc block stage2 vertical wheel continue when host scrolling is unavailable', async () => {
        mountIntoHostElement.mockReturnValue({ context: createChildContext({ layout: 'doc-width-scale' }) });
        const onHostWheel = vi.fn(() => false);

        await renderFloatBlock({ onHostWheel, syncHostVerticalScroll: true });
        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });

        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const runtimeTarget = document.createElement('div');
        const onChildWheel = vi.fn();
        runtimeTarget.addEventListener('wheel', onChildWheel);
        runtimeRoots.content.appendChild(runtimeTarget);

        const wheel = new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            deltaY: 80,
        });
        await act(async () => {
            runtimeTarget.dispatchEvent(wheel);
        });

        expect(onHostWheel).toHaveBeenCalledTimes(1);
        expect(onChildWheel).toHaveBeenCalledTimes(1);
        expect(wheel.defaultPrevented).toBe(false);
    });

    it('routes stage2 docs-sticky vertical wheel to the host canvas when the docs viewport is not a dom scrollport', async () => {
        const hostViewport = document.createElement('section');
        const hostCanvas = document.createElement('canvas');
        const onHostWheel = vi.fn((event: WheelEvent) => event.preventDefault());
        hostCanvas.addEventListener('wheel', onHostWheel);
        document.body.appendChild(hostViewport);
        hostViewport.appendChild(hostCanvas);
        hostViewport.appendChild(container);
        Object.defineProperty(hostViewport, 'clientHeight', { configurable: true, value: 200 });
        Object.defineProperty(hostViewport, 'scrollHeight', { configurable: true, value: 1000 });
        hostViewport.style.overflow = 'hidden';
        hostViewport.scrollTop = 0;
        mountIntoHostElement.mockReturnValue({ context: createChildContext({ layout: 'docs-sticky-sheet' }) });

        await renderFloatBlock();
        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });

        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const runtimeTarget = document.createElement('div');
        const onChildWheel = vi.fn();
        runtimeTarget.addEventListener('wheel', onChildWheel);
        runtimeRoots.content.appendChild(runtimeTarget);

        const wheel = new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            clientX: 80,
            clientY: 96,
            deltaY: 80,
        });
        await act(async () => {
            runtimeTarget.dispatchEvent(wheel);
        });

        expect(hostViewport.scrollTop).toBe(0);
        expect(onHostWheel).toHaveBeenCalledTimes(1);
        expect(onChildWheel).not.toHaveBeenCalled();
        expect(wheel.defaultPrevented).toBe(true);

        hostCanvas.removeEventListener('wheel', onHostWheel);
        hostViewport.remove();
    });

    it('keeps stage2 docs-sticky horizontal wheel available to the child runtime', async () => {
        Object.defineProperty(container, 'clientHeight', { configurable: true, value: 200 });
        Object.defineProperty(container, 'scrollHeight', { configurable: true, value: 1000 });
        container.style.overflow = 'auto';
        container.scrollTop = 0;
        mountIntoHostElement.mockReturnValue({ context: createChildContext({ layout: 'docs-sticky-sheet' }) });

        await renderFloatBlock();
        stage = 'stage2';
        await act(async () => {
            active$.next({});
        });

        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const runtimeTarget = document.createElement('div');
        const onChildWheel = vi.fn();
        runtimeTarget.addEventListener('wheel', onChildWheel);
        runtimeRoots.content.appendChild(runtimeTarget);

        const wheel = new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            deltaX: 80,
            deltaY: 4,
        });
        await act(async () => {
            runtimeTarget.dispatchEvent(wheel);
        });

        expect(container.scrollTop).toBe(0);
        expect(onChildWheel).toHaveBeenCalledTimes(1);
        expect(wheel.defaultPrevented).toBe(false);
    });

    it('syncs docs-sticky host scroll with the table-like content height instead of the float layout box height', async () => {
        Object.defineProperty(container, 'clientHeight', { configurable: true, value: 887 });
        Object.defineProperty(container, 'scrollHeight', { configurable: true, value: 2000 });
        container.style.overflow = 'auto';
        container.getBoundingClientRect = () => ({
            bottom: 963,
            height: 887,
            left: 0,
            right: 1600,
            top: 76,
            width: 1600,
            x: 0,
            y: 76,
            toJSON: () => ({}),
        } as DOMRect);
        mountIntoHostElement.mockReturnValue({ context: createChildContext({ layout: 'docs-sticky-base' }) });
        passiveViewportRegistry.get.mockReturnValue(passiveViewportProvider);

        await renderFloatBlock({ docsSheetLike: true, syncHostVerticalScroll: true });
        const customBlock = document.querySelector<HTMLElement>('[data-embed-docs-custom-block-sheet-like="true"]');
        const floatDom = document.querySelector<HTMLElement>('[data-embed-float-dom="true"]');
        expect(customBlock).not.toBeNull();
        expect(floatDom).not.toBeNull();
        customBlock!.style.setProperty('--univer-embed-docs-block-content-height', '1400px');
        floatDom!.getBoundingClientRect = () => ({
            bottom: 252,
            height: 476,
            left: 388,
            right: 1344,
            top: -224,
            width: 956,
            x: 388,
            y: -224,
            toJSON: () => ({}),
        } as DOMRect);

        await act(async () => {
            flushQueuedAnimationFrames(0);
        });

        expect(passiveViewportProvider.handleWheel).toHaveBeenCalledWith(expect.objectContaining({
            source: 'host-scroll-sync',
            stage: 'inactive',
            event: expect.objectContaining({
                deltaY: 300,
            }),
        }));
    });

    it('clamps docs-sticky host scroll sync against the runtime viewport height', async () => {
        Object.defineProperty(container, 'clientHeight', { configurable: true, value: 996 });
        Object.defineProperty(container, 'scrollHeight', { configurable: true, value: 2400 });
        container.style.overflow = 'auto';
        container.getBoundingClientRect = () => ({
            bottom: 1072,
            height: 996,
            left: 0,
            right: 1600,
            top: 76,
            width: 1600,
            x: 0,
            y: 76,
            toJSON: () => ({}),
        } as DOMRect);
        mountIntoHostElement.mockReturnValue({ context: createChildContext({ layout: 'docs-sticky-base' }) });
        passiveViewportRegistry.get.mockReturnValue(passiveViewportProvider);

        await renderFloatBlock({ docsSheetLike: true, syncHostVerticalScroll: true });
        const customBlock = document.querySelector<HTMLElement>('[data-embed-docs-custom-block-sheet-like="true"]');
        const floatDom = document.querySelector<HTMLElement>('[data-embed-float-dom="true"]');
        const content = document.querySelector<HTMLElement>('.univer-embed-float-dom__content');
        expect(customBlock).not.toBeNull();
        expect(floatDom).not.toBeNull();
        expect(content).not.toBeNull();
        customBlock!.style.setProperty('--univer-embed-docs-block-content-height', '1400px');
        customBlock!.style.setProperty('--univer-embed-docs-block-viewport-height', '887px');
        content!.getBoundingClientRect = () => ({
            bottom: 963,
            height: 887,
            left: 0,
            right: 1600,
            top: 76,
            width: 1600,
            x: 0,
            y: 76,
            toJSON: () => ({}),
        } as DOMRect);
        floatDom!.getBoundingClientRect = () => ({
            bottom: 800,
            height: 1400,
            left: 388,
            right: 1344,
            top: -600,
            width: 956,
            x: 388,
            y: -600,
            toJSON: () => ({}),
        } as DOMRect);

        await act(async () => {
            flushQueuedAnimationFrames(0);
        });

        expect(passiveViewportProvider.handleWheel).toHaveBeenCalledWith(expect.objectContaining({
            source: 'host-scroll-sync',
            stage: 'inactive',
            viewportScrollY: 513,
            event: expect.objectContaining({
                deltaY: 513,
            }),
        }));
    });

    it('invalidates geometry after live runtime scroll settles', async () => {
        mountIntoHostElement.mockReturnValue({ context: createChildContext() });

        await renderFloatBlock();
        const [, , runtimeRoots] = mountIntoHostElement.mock.calls[0];
        const scrollable = document.createElement('div');
        runtimeRoots.content.appendChild(scrollable);
        geometryService.invalidate.mockClear();

        await act(async () => {
            scrollable.dispatchEvent(new Event('scroll'));
        });

        expect(geometryService.invalidate).toHaveBeenCalledWith({ embedId: 'embed-1', reason: 'child-scroll' });
        expect(countChildScrollInvalidations()).toBe(1);

        while (animationFrameCallbacks.length > 0 && countChildScrollInvalidations() < 3) {
            await act(async () => {
                animationFrameCallbacks.shift()?.(16);
            });
        }
        expect(countChildScrollInvalidations()).toBe(3);

        function countChildScrollInvalidations() {
            return geometryService.invalidate.mock.calls.filter(([event]) => event?.reason === 'child-scroll').length;
        }
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
        expect(activationService.activateFloating).not.toHaveBeenCalled();
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
        expect(activationService.activateFloating).not.toHaveBeenCalled();
    });

    async function renderFloatBlock(props?: { childType?: UniverInstanceType; docsCustomBlock?: boolean; docsSheetLike?: boolean; initialStage?: 'inactive' | 'stage1' | 'stage2'; interactionFlow?: 'floating-stage' | 'doc-block'; onHostWheel?: (event: WheelEvent, context: any) => boolean | void; syncHostVerticalScroll?: boolean; enableStage1BodyDrag?: boolean; isExternalHostInteraction?: (event: PointerEvent) => boolean; onRuntimeStageExit?: () => void; onRuntimeStageEnter?: (stage: 'inactive' | 'stage1' | 'stage2') => void }) {
        const childType = props?.childType ?? UniverInstanceType.UNIVER_SHEET;
        descriptor = createFloatDescriptor({ childType });
        const renderer = (
            <EmbedFloatDomRenderer
                initialStage={props?.initialStage}
                interactionFlow={props?.interactionFlow}
                onHostWheel={props?.onHostWheel}
                syncHostVerticalScroll={props?.syncHostVerticalScroll}
                onRuntimeStageExit={props?.onRuntimeStageExit}
                onRuntimeStageEnter={props?.onRuntimeStageEnter}
                enableStage1BodyDrag={props?.enableStage1BodyDrag}
                isExternalHostInteraction={props?.isExternalHostInteraction}
                data={{
                    version: 1,
                    embedId: 'embed-1',
                    hostUnitId: 'host-1',
                    hostAnchorId: 'anchor-1',
                    childUnitId: 'child-1',
                    childType,
                }}
            />
        );

        await act(async () => {
            root.render(props?.docsSheetLike
                ? <div data-embed-docs-custom-block-sheet-like="true">{renderer}</div>
                : props?.docsCustomBlock
                    ? <div className="univer-embed-docs-custom-block">{renderer}</div>
                    : renderer);
        });
    }
});

function createFloatDescriptor(overrides: { childType?: UniverInstanceType } = {}): IEmbedDescriptor {
    const childType = overrides.childType ?? UniverInstanceType.UNIVER_SHEET;
    return {
        embedId: 'embed-1',
        hostUnitId: 'host-1',
        hostType: UniverInstanceType.UNIVER_DOC,
        hostAnchorId: 'anchor-1',
        entry: 'sheets-floating-object',
        childUnitId: 'child-1',
        childType,
        source: {
            kind: 'empty',
            unitType: childType,
        },
        sourceMeta: {
            floating: {
                layout: 'aspect-fit',
            },
        },
    } as IEmbedDescriptor;
}

function createChildContext(overrides: { layout?: string } = {}) {
    return {
        layout: overrides.layout ?? 'aspect-fit',
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
