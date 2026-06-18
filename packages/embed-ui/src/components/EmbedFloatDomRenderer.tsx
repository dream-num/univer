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

import type { UniverInstanceType } from '@univerjs/core';
import type { EmbedLayout, IEmbedDescriptor } from '@univerjs/embed';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { EmbedFloatingStage, IEmbedChildContainerContext } from '../types/embed-ui';
import { EmbedModelService } from '@univerjs/embed';
import { useDependency } from '@univerjs/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EMBED_CANVAS_ROOT_ATTRIBUTE, EMBED_CONTENT_ROOT_ATTRIBUTE, EMBED_OVERLAY_ROOT_ATTRIBUTE, EMBED_POPUP_ROOT_ATTRIBUTE } from '../common/embed-runtime-slots';
import { EmbedFloatPreviewService } from '../services/embed-float-preview.service';
import { EmbedFloatingActiveService } from '../services/embed-floating-active.service';
import { EmbedFullscreenService } from '../services/embed-fullscreen.service';
import { EmbedMountService } from '../services/embed-mount.service';
import { EmbedPassiveViewportRegistryService } from '../services/embed-passive-viewport-registry.service';
import { EmbedFloatFullscreenButton } from './EmbedFloatFullscreenButton';

const CLICK_DISTANCE_THRESHOLD = 4;
const CLICK_DURATION_THRESHOLD = 500;
export const EMBED_FLOAT_DRAG_HANDLE_POINTER_DOWN_EVENT = 'univer:embed-float-drag-handle:pointerdown';

interface ClickIntentState {
    pointerId: number;
    startX: number;
    startY: number;
    startedAt: number;
    moved: boolean;
}

type FrameHandle = number | ReturnType<typeof globalThis.setTimeout>;

export interface IEmbedFloatDomData {
    version: 1;
    embedId: string;
    hostUnitId?: string;
    hostAnchorId: string;
    childUnitId?: string;
    childType?: UniverInstanceType;
}

export function EmbedFloatDomRenderer(props: { data?: IEmbedFloatDomData; initialStage?: EmbedFloatingStage; onRuntimeStageEnter?: (stage: EmbedFloatingStage) => void; onRuntimeStageExit?: () => void }) {
    ensureEmbedFloatDomStyles();

    const { initialStage, onRuntimeStageEnter, onRuntimeStageExit } = props;
    const containerRef = useRef<HTMLDivElement>(null);
    const gateRef = useRef<HTMLDivElement>(null);
    const liveRootRef = useRef<HTMLDivElement>(null);
    const liveContentRootRef = useRef<HTMLDivElement>(null);
    const liveCanvasRootRef = useRef<HTMLDivElement>(null);
    const chromeRef = useRef<HTMLDivElement>(null);
    const dragHandleRef = useRef<HTMLButtonElement>(null);
    const overlayRootRef = useRef<HTMLDivElement>(null);
    const popupRootRef = useRef<HTMLDivElement>(null);
    const embedModelService = useDependency(EmbedModelService);
    const floatingActiveService = useDependency(EmbedFloatingActiveService);
    const previewService = useDependency(EmbedFloatPreviewService);
    const fullscreenService = useDependency(EmbedFullscreenService);
    const mountService = useDependency(EmbedMountService);
    const passiveViewportRegistry = useDependency(EmbedPassiveViewportRegistryService);
    const data = normalizeFloatDomData(props.data);
    const [mountVersion, setMountVersion] = useState(0);
    const [stage, setStage] = useState<EmbedFloatingStage>(() => initialStage ?? (data?.embedId ? floatingActiveService.getStage(data.embedId) : 'inactive'));
    const previousStageRef = useRef<EmbedFloatingStage>(stage);
    const clickIntentRef = useRef<ClickIntentState | undefined>(undefined);
    const childContextRef = useRef<IEmbedChildContainerContext | undefined>(undefined);
    const fullscreenRemountFrameRef = useRef<FrameHandle | undefined>(undefined);
    const fullscreenRemountTimerRef = useRef<ReturnType<typeof globalThis.setTimeout> | undefined>(undefined);

    useEffect(() => {
        const previousStage = previousStageRef.current;
        previousStageRef.current = stage;
        if (previousStage !== stage) {
            onRuntimeStageEnter?.(stage);
        }
        if (previousStage === 'stage2' && stage !== 'stage2') {
            onRuntimeStageExit?.();
        }
    }, [onRuntimeStageEnter, onRuntimeStageExit, stage]);

    useEffect(() => {
        if (initialStage !== 'stage2' || !data?.embedId || !data.hostUnitId) {
            return;
        }

        const descriptor = embedModelService.getDescriptor(data.hostUnitId, data.embedId);
        if (!descriptor?.childUnitId) {
            return;
        }

        floatingActiveService.activate({
            hostUnitId: data.hostUnitId,
            embedId: data.embedId,
            childUnitId: descriptor.childUnitId,
        }, 'stage2');
    }, [data?.embedId, data?.hostUnitId, embedModelService, floatingActiveService, initialStage]);

    useEffect(() => {
        const container = liveRootRef.current;
        const contentRoot = liveContentRootRef.current;
        const canvasRoot = liveCanvasRootRef.current;
        const overlayRoot = overlayRootRef.current;
        const popupRoot = popupRootRef.current;
        if (!container || !contentRoot || !canvasRoot || !overlayRoot || !popupRoot) {
            return undefined;
        }

        const descriptor = data?.hostUnitId ? embedModelService.getDescriptor(data.hostUnitId, data.embedId) : undefined;
        const layout = descriptor ? resolveDescriptorLayout(descriptor) : undefined;
        if (!descriptor || !layout || !descriptor.childUnitId || descriptor.childType == null) {
            return undefined;
        }

        const session = mountService.mountIntoHostElement(descriptor, container, {
            content: contentRoot,
            canvas: canvasRoot,
            overlay: overlayRoot,
            popup: popupRoot,
        });
        const childContext = session?.context;
        childContextRef.current = childContext;
        const cachedViewState = data?.embedId ? previewService.getPreview(data.embedId)?.viewState : undefined;
        if (childContext && cachedViewState != null) {
            void previewService.restoreViewState(childContext, cachedViewState);
        }

        return () => {
            if (childContextRef.current === childContext) {
                childContextRef.current = undefined;
            }
            mountService.unmount(descriptor.embedId);
        };
    }, [data?.embedId, data?.hostUnitId, embedModelService, mountService, mountVersion, previewService]);

    useEffect(() => {
        if (!data?.embedId) {
            return undefined;
        }

        const subscription = fullscreenService.exited$.subscribe((session) => {
            if (session.embedId !== data.embedId) {
                return;
            }

            mountService.unmount(data.embedId);
            if (fullscreenRemountFrameRef.current != null) {
                cancelFrame(fullscreenRemountFrameRef.current);
                fullscreenRemountFrameRef.current = undefined;
            }
            if (fullscreenRemountTimerRef.current != null) {
                globalThis.clearTimeout(fullscreenRemountTimerRef.current);
            }
            fullscreenRemountTimerRef.current = globalThis.setTimeout(() => {
                fullscreenRemountTimerRef.current = undefined;
                fullscreenRemountFrameRef.current = requestFrame(() => {
                    fullscreenRemountFrameRef.current = undefined;
                    setMountVersion((version) => version + 1);
                });
            }, 0);
        });

        return () => {
            subscription.unsubscribe();
            if (fullscreenRemountTimerRef.current != null) {
                globalThis.clearTimeout(fullscreenRemountTimerRef.current);
                fullscreenRemountTimerRef.current = undefined;
            }
            if (fullscreenRemountFrameRef.current != null) {
                cancelFrame(fullscreenRemountFrameRef.current);
                fullscreenRemountFrameRef.current = undefined;
            }
        };
    }, [data?.embedId, fullscreenService, mountService]);

    useEffect(() => {
        const container = containerRef.current;
        const chrome = chromeRef.current;
        if (!container || !chrome || typeof document === 'undefined') {
            return undefined;
        }

        const originalParent = chrome.parentElement;
        const originalNextSibling = chrome.nextSibling;
        let frameId: number | undefined;
        let scheduledFrameId: number | undefined;
        let scheduledFramesRemaining = 0;
        let lastLeft: number | undefined;
        let lastTop: number | undefined;
        let lastWidth: number | undefined;
        let lastHeight: number | undefined;
        const syncChromeRect = () => {
            const rect = container.getBoundingClientRect();
            if (
                rect.left === lastLeft &&
                rect.top === lastTop &&
                rect.width === lastWidth &&
                rect.height === lastHeight
            ) {
                return;
            }

            lastLeft = rect.left;
            lastTop = rect.top;
            lastWidth = rect.width;
            lastHeight = rect.height;
            chrome.style.left = `${rect.left}px`;
            chrome.style.top = `${rect.top}px`;
            chrome.style.width = `${rect.width}px`;
            chrome.style.height = `${rect.height}px`;
        };
        const syncChromeRectOnFrame = () => {
            syncChromeRect();
            frameId = window.requestAnimationFrame(syncChromeRectOnFrame);
        };
        const syncScheduledChromeRect = () => {
            scheduledFrameId = undefined;
            syncChromeRect();
            if (scheduledFramesRemaining <= 0) {
                return;
            }

            scheduledFramesRemaining -= 1;
            scheduledFrameId = window.requestAnimationFrame(syncScheduledChromeRect);
        };
        const scheduleChromeRectSync = () => {
            if (typeof window.requestAnimationFrame !== 'function') {
                syncChromeRect();
                return;
            }

            scheduledFramesRemaining = Math.max(scheduledFramesRemaining, 3);
            if (scheduledFrameId != null) {
                return;
            }

            scheduledFrameId = window.requestAnimationFrame(syncScheduledChromeRect);
        };

        syncChromeRect();
        document.body.appendChild(chrome);

        const resizeObserver = new ResizeObserver(syncChromeRect);
        resizeObserver.observe(container);
        window.addEventListener('scroll', scheduleChromeRectSync, true);
        window.addEventListener('wheel', scheduleChromeRectSync, true);
        window.addEventListener('resize', scheduleChromeRectSync);
        if (stage !== 'inactive' && typeof window.requestAnimationFrame === 'function') {
            frameId = window.requestAnimationFrame(syncChromeRectOnFrame);
        }

        return () => {
            if (frameId != null) {
                window.cancelAnimationFrame(frameId);
            }
            if (scheduledFrameId != null) {
                window.cancelAnimationFrame(scheduledFrameId);
            }
            resizeObserver.disconnect();
            window.removeEventListener('scroll', scheduleChromeRectSync, true);
            window.removeEventListener('wheel', scheduleChromeRectSync, true);
            window.removeEventListener('resize', scheduleChromeRectSync);
            chrome.removeAttribute('style');
            if (originalParent?.isConnected) {
                originalParent.insertBefore(chrome, originalNextSibling);
            } else {
                chrome.remove();
            }
        };
    }, [data?.embedId, stage]);

    useEffect(() => {
        const subscription = floatingActiveService.active$.subscribe(() => {
            setStage(data?.embedId ? floatingActiveService.getStage(data.embedId) : 'inactive');
        });

        return () => subscription.unsubscribe();
    }, [data?.embedId, floatingActiveService]);

    useEffect(() => {
        if (!data?.embedId || typeof document === 'undefined') {
            return undefined;
        }

        const clearWhenPointerLeavesBlock = (event: PointerEvent) => {
            const container = containerRef.current;
            const chrome = chromeRef.current;
            const target = event.target as HTMLElement | null;
            if (
                !container ||
                !target ||
                container.contains(target) ||
                chrome?.contains(target) ||
                target.closest('[data-embed-float-drag-handle="true"], [data-embed-floating-menu="true"]') ||
                isPointInsideFloatBlock(container, event)
            ) {
                return;
            }

            floatingActiveService.clear(data.embedId);
        };

        document.addEventListener('pointerdown', clearWhenPointerLeavesBlock, true);
        return () => document.removeEventListener('pointerdown', clearWhenPointerLeavesBlock, true);
    }, [data?.embedId, floatingActiveService]);

    useEffect(() => {
        const gate = gateRef.current;
        if (!gate || !data?.embedId || !data.hostUnitId) {
            return undefined;
        }

        const clearIntent = () => {
            clickIntentRef.current = undefined;
        };

        const beginIntent = (event: PointerEvent) => {
            const descriptor = embedModelService.getDescriptor(data.hostUnitId!, data.embedId);
            if (!descriptor?.childUnitId) {
                return;
            }
            const target = event.target as HTMLElement | null;
            if (target?.closest('[data-embed-float-drag-handle="true"], [data-embed-floating-menu="true"]')) {
                return;
            }

            const currentStage = floatingActiveService.getStage(data.embedId);
            if (currentStage === 'stage2') {
                return;
            }

            clickIntentRef.current = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                startedAt: Date.now(),
                moved: false,
            };
        };

        const updateIntent = (event: PointerEvent) => {
            const intent = clickIntentRef.current;
            if (!intent || intent.pointerId !== event.pointerId) {
                return;
            }

            const distance = Math.hypot(event.clientX - intent.startX, event.clientY - intent.startY);
            if (distance > CLICK_DISTANCE_THRESHOLD) {
                intent.moved = true;
            }
        };

        const finishIntent = (event: PointerEvent) => {
            const intent = clickIntentRef.current;
            clickIntentRef.current = undefined;
            if (!intent || intent.pointerId !== event.pointerId || intent.moved || Date.now() - intent.startedAt > CLICK_DURATION_THRESHOLD) {
                return;
            }

            const descriptor = embedModelService.getDescriptor(data.hostUnitId!, data.embedId);
            if (!descriptor?.childUnitId) {
                return;
            }

            const currentStage = floatingActiveService.getStage(data.embedId);
            if (currentStage === 'stage2') {
                return;
            }
            if (currentStage === 'stage1') {
                floatingActiveService.promote(data.embedId);
                return;
            }
            floatingActiveService.activate({
                hostUnitId: data.hostUnitId!,
                embedId: data.embedId,
                childUnitId: descriptor.childUnitId,
            }, 'stage1');
        };

        gate.addEventListener('pointerdown', beginIntent, true);
        gate.addEventListener('pointermove', updateIntent, true);
        gate.addEventListener('pointerup', finishIntent, true);
        gate.addEventListener('pointercancel', clearIntent, true);
        return () => {
            gate.removeEventListener('pointerdown', beginIntent, true);
            gate.removeEventListener('pointermove', updateIntent, true);
            gate.removeEventListener('pointerup', finishIntent, true);
            gate.removeEventListener('pointercancel', clearIntent, true);
        };
    }, [data?.embedId, data?.hostUnitId, embedModelService, floatingActiveService]);

    useEffect(() => {
        const gate = gateRef.current;
        const liveRoot = liveRootRef.current;
        if (!gate || !liveRoot) {
            return undefined;
        }

        const onWheel = (event: WheelEvent) => {
            if (event.ctrlKey || event.metaKey) {
                return;
            }

            const currentStage = data?.embedId ? floatingActiveService.getStage(data.embedId) : 'inactive';
            if (currentStage === 'stage2') {
                return;
            }

            const childContext = childContextRef.current;
            const provider = childContext
                ? passiveViewportRegistry.get(childContext.childType, childContext.layout)
                : undefined;
            const providerHandled = provider?.handleWheel({ ...childContext!, event, stage: currentStage }) === true;
            const forwarded = providerHandled ? false : forwardWheelToRuntime(event, liveRoot);
            const scrolled = providerHandled ? false : scrollRuntimeDom(event, liveRoot);
            if (providerHandled || forwarded || scrolled) {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        gate.addEventListener('wheel', onWheel, { passive: false });
        return () => gate.removeEventListener('wheel', onWheel);
    }, [data?.embedId, floatingActiveService, passiveViewportRegistry]);

    const keepStageForDragHandle = useCallback((event: PointerEvent | ReactPointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!data?.embedId || !data.hostUnitId) {
            return;
        }
        const descriptor = embedModelService.getDescriptor(data.hostUnitId, data.embedId);
        if (!descriptor?.childUnitId) {
            return;
        }

        const currentStage = floatingActiveService.getStage(data.embedId);
        floatingActiveService.activate({
            hostUnitId: data.hostUnitId,
            embedId: data.embedId,
            childUnitId: descriptor.childUnitId,
        }, currentStage === 'stage2' ? 'stage2' : 'stage1');
        const pointerEvent = 'nativeEvent' in event ? event.nativeEvent : event;
        document.dispatchEvent(new CustomEvent(EMBED_FLOAT_DRAG_HANDLE_POINTER_DOWN_EVENT, {
            detail: {
                embedId: data.embedId,
                hostUnitId: data.hostUnitId,
                hostAnchorId: data.hostAnchorId,
                pointerId: pointerEvent.pointerId,
                clientX: pointerEvent.clientX,
                clientY: pointerEvent.clientY,
                button: pointerEvent.button,
            },
        }));
    }, [data?.embedId, data?.hostAnchorId, data?.hostUnitId, embedModelService, floatingActiveService]);

    useEffect(() => {
        const dragHandle = dragHandleRef.current;
        if (!dragHandle) {
            return undefined;
        }

        dragHandle.addEventListener('pointerdown', keepStageForDragHandle);
        return () => dragHandle.removeEventListener('pointerdown', keepStageForDragHandle);
    }, [keepStageForDragHandle]);

    return (
        <div
            ref={containerRef}
            className="univer-embed-float-dom"
            data-embed-float-dom="true"
            data-embed-float-stage={stage}
            data-embed-id={data?.embedId}
            data-embed-host-anchor-id={data?.hostAnchorId}
        >
            <div
                className="univer-embed-float-dom__content"
            >
                <div
                    ref={liveRootRef}
                    className="univer-embed-float-dom__live"
                    data-embed-float-live="true"
                >
                    <div
                        ref={liveCanvasRootRef}
                        className="univer-embed-float-dom__live-canvas"
                        {...{ [EMBED_CANVAS_ROOT_ATTRIBUTE]: 'true' }}
                    />
                    <div
                        ref={liveContentRootRef}
                        className="univer-embed-float-dom__live-content"
                        {...{ [EMBED_CONTENT_ROOT_ATTRIBUTE]: 'true' }}
                    />
                </div>
                <div
                    ref={gateRef}
                    className="univer-embed-float-dom__interaction-gate"
                    data-embed-float-interaction-gate="true"
                />
            </div>
            <div
                ref={chromeRef}
                className="univer-embed-float-dom__chrome"
                data-embed-float-stage={stage}
                data-embed-id={data?.embedId}
            >
                <div
                    ref={overlayRootRef}
                    className="univer-embed-float-dom__overlay"
                    {...{ [EMBED_OVERLAY_ROOT_ATTRIBUTE]: 'true' }}
                />
                <div
                    ref={popupRootRef}
                    className="univer-embed-float-dom__popup"
                    {...{ [EMBED_POPUP_ROOT_ATTRIBUTE]: 'true' }}
                />
                <EmbedFloatFullscreenButton
                    hostUnitId={data?.hostUnitId}
                    embedId={data?.embedId}
                    className="univer-embed-float-dom__fullscreen-button"
                />
                <button
                    ref={dragHandleRef}
                    type="button"
                    className="univer-embed-float-dom__drag-handle"
                    data-embed-float-drag-handle="true"
                    aria-label="Move embed block"
                >
                    <span aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}

function isPointInsideFloatBlock(container: HTMLElement, event: PointerEvent): boolean {
    const rect = container.getBoundingClientRect();
    return event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top - 40 &&
        event.clientY <= rect.bottom;
}

function requestFrame(callback: () => void): FrameHandle {
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
        return window.requestAnimationFrame(callback);
    }

    return globalThis.setTimeout(callback, 0);
}

function cancelFrame(handle: FrameHandle): void {
    if (typeof handle === 'number' && typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(handle);
        return;
    }

    globalThis.clearTimeout(handle);
}

function normalizeFloatDomData(data: unknown): IEmbedFloatDomData | undefined {
    if (!data || typeof data !== 'object') {
        return undefined;
    }

    const candidate = data as Partial<IEmbedFloatDomData>;
    if (candidate.version !== 1 || !candidate.embedId || !candidate.hostAnchorId) {
        return undefined;
    }

    return candidate as IEmbedFloatDomData;
}

function resolveDescriptorLayout(descriptor: IEmbedDescriptor): EmbedLayout | undefined {
    const floating = descriptor.sourceMeta?.floating || undefined;
    if (floating && typeof floating === 'object' && floating.layout) {
        return floating.layout;
    }

    const tab = descriptor.sourceMeta?.tab || undefined;
    return tab && typeof tab === 'object' && tab.enabled ? 'tab-peer' : undefined;
}

function forwardWheelToRuntime(event: WheelEvent, liveRoot: HTMLElement): boolean {
    const target = findRuntimeElementAtPoint(liveRoot, event.clientX, event.clientY) ?? liveRoot;
    if (target === liveRoot && !liveRoot.contains(target)) {
        return false;
    }

    const forwardedEvent = new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        clientX: event.clientX,
        clientY: event.clientY,
        ctrlKey: event.ctrlKey,
        deltaMode: event.deltaMode,
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        deltaZ: event.deltaZ,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
    });

    target.dispatchEvent(forwardedEvent);
    return forwardedEvent.defaultPrevented;
}

function scrollRuntimeDom(event: WheelEvent, liveRoot: HTMLElement): boolean {
    const target = findRuntimeElementAtPoint(liveRoot, event.clientX, event.clientY) ?? liveRoot;
    const scrollable = findScrollableRuntimeElement(target, liveRoot, event);
    if (!scrollable) {
        return false;
    }

    const deltaX = event.deltaX || (event.shiftKey ? event.deltaY : 0);
    const deltaY = event.shiftKey ? 0 : event.deltaY;
    const previousLeft = scrollable.scrollLeft;
    const previousTop = scrollable.scrollTop;

    if (deltaX) {
        scrollable.scrollLeft += deltaX;
    }
    if (deltaY) {
        scrollable.scrollTop += deltaY;
    }

    return scrollable.scrollLeft !== previousLeft || scrollable.scrollTop !== previousTop;
}

function findRuntimeElementAtPoint(root: HTMLElement, clientX: number, clientY: number): HTMLElement | null {
    if (!isPointInsideElement(root, clientX, clientY)) {
        return null;
    }

    let matched: HTMLElement = root;
    const visit = (element: HTMLElement) => {
        const children = Array.from(element.children);
        for (let index = children.length - 1; index >= 0; index--) {
            const child = children[index];
            if (!(child instanceof HTMLElement) || !isPointInsideElement(child, clientX, clientY)) {
                continue;
            }

            matched = child;
            visit(child);
            return;
        }
    };

    visit(root);
    return matched;
}

function isPointInsideElement(element: HTMLElement, clientX: number, clientY: number): boolean {
    const rect = element.getBoundingClientRect();
    return clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;
}

function findScrollableRuntimeElement(target: HTMLElement, liveRoot: HTMLElement, event: WheelEvent): HTMLElement | null {
    const deltaX = event.deltaX || (event.shiftKey ? event.deltaY : 0);
    const deltaY = event.shiftKey ? 0 : event.deltaY;
    let current: HTMLElement | null = target;

    while (current && liveRoot.contains(current)) {
        if (canScrollElement(current, deltaX, deltaY)) {
            return current;
        }
        current = current.parentElement;
    }

    return canScrollElement(liveRoot, deltaX, deltaY) ? liveRoot : null;
}

function canScrollElement(element: HTMLElement, deltaX: number, deltaY: number): boolean {
    const canScrollX = deltaX !== 0 && element.scrollWidth > element.clientWidth && (
        deltaX < 0 ? element.scrollLeft > 0 : element.scrollLeft + element.clientWidth < element.scrollWidth
    );
    const canScrollY = deltaY !== 0 && element.scrollHeight > element.clientHeight && (
        deltaY < 0 ? element.scrollTop > 0 : element.scrollTop + element.clientHeight < element.scrollHeight
    );

    return canScrollX || canScrollY;
}

function ensureEmbedFloatDomStyles(): void {
    if (typeof document === 'undefined' || document.getElementById('univer-embed-float-dom-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'univer-embed-float-dom-styles';
    style.textContent = `
.univer-embed-float-dom {
    position: relative;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: visible;
    background: transparent;
}
.univer-embed-float-dom__content {
    position: absolute;
    inset: 0;
    box-sizing: border-box;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    border-radius: 6px;
}
.univer-embed-float-dom__content::after {
    position: absolute;
    inset: 0;
    z-index: 20;
    box-sizing: border-box;
    pointer-events: none;
    border: 1px solid #e5e7eb;
    border-radius: inherit;
    content: '';
}
.dark .univer-embed-float-dom__content::after {
    border-color: #4b5563;
}
.univer-embed-float-dom__live {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    background: transparent;
}
.univer-embed-float-dom__live-content,
.univer-embed-float-dom__live-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
}
.univer-embed-float-dom__live-canvas {
    z-index: 0;
}
.univer-embed-float-dom__live-content {
    z-index: 1;
}
.univer-embed-float-dom__interaction-gate {
    position: absolute;
    inset: 0;
    z-index: 10;
    background: transparent;
}
.univer-embed-float-dom[data-embed-float-stage="stage2"] .univer-embed-float-dom__interaction-gate {
    pointer-events: none;
}
.univer-embed-float-dom__chrome {
    position: fixed;
    z-index: 1000;
    overflow: visible;
    pointer-events: none;
}
.univer-embed-float-dom__chrome > * {
    pointer-events: auto;
}
.univer-embed-float-dom__overlay,
.univer-embed-float-dom__popup {
    position: absolute;
    inset: 0;
    overflow: visible;
    pointer-events: none;
}
.univer-embed-float-dom__overlay > *,
.univer-embed-float-dom__popup > * {
    pointer-events: auto;
}
.univer-embed-float-dom__fullscreen-button {
    position: absolute;
    top: 6px;
    right: 16px;
    z-index: 4;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: 0;
    border-radius: 6px;
    background: rgba(15, 23, 42, 0.32);
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.12);
    color: #ffffff;
    cursor: pointer;
    opacity: 0.72;
    padding: 0;
    appearance: none;
}
.univer-embed-float-dom__fullscreen-button:hover {
    background: rgba(15, 23, 42, 0.64);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.18);
    opacity: 0.96;
}
.univer-embed-float-dom__fullscreen-button svg {
    width: 14px;
    height: 14px;
}
.univer-embed-float-dom[data-embed-float-stage="inactive"] [data-embed-content-root],
.univer-embed-float-dom[data-embed-float-stage="inactive"] [data-embed-canvas-root],
.univer-embed-float-dom[data-embed-float-stage="stage1"] [data-embed-content-root],
.univer-embed-float-dom[data-embed-float-stage="stage1"] [data-embed-canvas-root] {
    pointer-events: none;
}
.univer-embed-float-dom__drag-handle {
    position: absolute;
    top: -24px;
    left: 0;
    z-index: 2;
    display: none;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 12px;
    border: 0;
    background: transparent;
    box-shadow: none;
    color: #64748b;
    cursor: move;
    padding: 0;
    appearance: none;
}
.univer-embed-float-dom__chrome[data-embed-float-stage="stage1"] .univer-embed-float-dom__drag-handle,
.univer-embed-float-dom__chrome[data-embed-float-stage="stage2"] .univer-embed-float-dom__drag-handle {
    display: inline-flex;
}
.univer-embed-float-dom__drag-handle span {
    display: block;
    width: 12px;
    height: 18px;
    transform: rotate(90deg);
    background:
        radial-gradient(circle 2px at 2px 2px, currentColor 99%, transparent 100%),
        radial-gradient(circle 2px at 10px 2px, currentColor 99%, transparent 100%),
        radial-gradient(circle 2px at 2px 9px, currentColor 99%, transparent 100%),
        radial-gradient(circle 2px at 10px 9px, currentColor 99%, transparent 100%),
        radial-gradient(circle 2px at 2px 16px, currentColor 99%, transparent 100%),
        radial-gradient(circle 2px at 10px 16px, currentColor 99%, transparent 100%);
}
`;
    document.head.appendChild(style);
}
