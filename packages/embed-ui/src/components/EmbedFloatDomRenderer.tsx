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
import type { EmbedFloatingStage, EmbedInteractionFlow, IEmbedChildContainerContext } from '../types/embed-ui';
import { EmbedModelService } from '@univerjs/embed';
import { useDependency } from '@univerjs/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EMBED_CANVAS_ROOT_ATTRIBUTE, EMBED_CONTENT_ROOT_ATTRIBUTE, EMBED_OVERLAY_ROOT_ATTRIBUTE, EMBED_POPUP_ROOT_ATTRIBUTE } from '../common/embed-runtime-slots';
import { EmbedActivationService } from '../services/embed-activation.service';
import { EmbedFloatPreviewService } from '../services/embed-float-preview.service';
import { EmbedFloatingActiveService } from '../services/embed-floating-active.service';
import { EmbedFloatingGeometryService } from '../services/embed-floating-geometry.service';
import { EmbedFullscreenService } from '../services/embed-fullscreen.service';
import { shouldPassDocsStickyVerticalWheelToHost } from '../services/embed-docs-sticky-wheel';
import { EmbedInteractionBoundaryService } from '../services/embed-interaction-boundary.service';
import { EmbedMountService } from '../services/embed-mount.service';
import { EmbedPassiveViewportRegistryService } from '../services/embed-passive-viewport-registry.service';
import { EmbedFloatFullscreenButton } from './EmbedFloatFullscreenButton';

const CLICK_DISTANCE_THRESHOLD = 4;
const CLICK_DURATION_THRESHOLD = 500;
export const EMBED_FLOAT_DRAG_HANDLE_POINTER_DOWN_EVENT = 'univer:embed-float-drag-handle:pointerdown';
const EMBED_FORWARDED_WHEEL_EVENT = Symbol('univer.embed.forwarded-wheel-event');
const EMBED_FLOAT_DOM_RECT_CACHE = new Map<HTMLElement, IEmbedFloatDomRectCache>();

interface IEmbedFloatDomRectCache {
    left: number;
    top: number;
    width: number;
    height: number;
}

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

export function EmbedFloatDomRenderer(props: {
    data?: IEmbedFloatDomData;
    initialStage?: EmbedFloatingStage;
    interactionFlow?: EmbedInteractionFlow;
    onHostWheel?: (event: WheelEvent, context: IEmbedChildContainerContext) => boolean | void;
    onRuntimeStageEnter?: (stage: EmbedFloatingStage) => void;
    onRuntimeStageExit?: () => void;
    syncHostVerticalScroll?: boolean;
}) {
    ensureEmbedFloatDomStyles();

    const { initialStage, interactionFlow = 'floating-stage', onRuntimeStageEnter, onRuntimeStageExit } = props;
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
    const activationService = useDependency(EmbedActivationService);
    const previewService = useDependency(EmbedFloatPreviewService);
    const geometryService = useDependency(EmbedFloatingGeometryService);
    const fullscreenService = useDependency(EmbedFullscreenService);
    const interactionBoundaryService = useDependency(EmbedInteractionBoundaryService);
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
    const hostScrollSyncOffsetRef = useRef(0);
    const geometryInvalidationFramesRef = useRef<FrameHandle[]>([]);

    useEffect(() => {
        const previousStage = previousStageRef.current;
        previousStageRef.current = stage;
        if (previousStage !== stage) {
            onRuntimeStageEnter?.(stage);
            geometryService.invalidate({ embedId: data?.embedId, reason: 'stage-change' });
        }
        if (previousStage === 'stage2' && stage !== 'stage2') {
            onRuntimeStageExit?.();
        }
    }, [data?.embedId, geometryService, onRuntimeStageEnter, onRuntimeStageExit, stage]);

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

        const embedId = data.embedId;
        const roots = [
            liveRootRef.current,
            liveContentRootRef.current,
            liveCanvasRootRef.current,
            overlayRootRef.current,
            popupRootRef.current,
        ].filter((root): root is HTMLDivElement => !!root);
        const disposables = roots.map((root) => interactionBoundaryService.registerRoot(embedId, root));

        return () => disposables.forEach((disposable) => disposable.dispose());
    }, [data?.embedId, interactionBoundaryService]);

    useEffect(() => {
        const root = containerRef.current;
        const viewport = root?.querySelector<HTMLElement>('.univer-embed-float-dom__content');
        if (!data?.embedId || !root) {
            return undefined;
        }

        const descriptor = data.hostUnitId ? embedModelService.getDescriptor(data.hostUnitId, data.embedId) : undefined;
        const disposable = geometryService.register({
            embedId: data.embedId,
            childUnitId: descriptor?.childUnitId,
            root,
            viewport,
            contentRoot: liveContentRootRef.current,
        });
        return () => disposable.dispose();
    }, [data?.embedId, data?.hostUnitId, embedModelService, geometryService]);

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
        let lastChromeVisible: boolean | undefined;
        const syncChromeRect = () => {
            const docsSheetLikeChrome = isDocsSheetLikeChrome(container);
            const rect = resolveChromeAnchorRect(container);
            const chromeVisible = !docsSheetLikeChrome || rect.height >= MIN_DOCS_SHEET_LIKE_CHROME_HEIGHT;
            if (docsSheetLikeChrome) {
                chrome.style.setProperty('--univer-embed-floating-menu-top', '8px');
            } else {
                chrome.style.removeProperty('--univer-embed-floating-menu-top');
            }
            chrome.style.visibility = chromeVisible ? '' : 'hidden';
            chrome.style.pointerEvents = chromeVisible ? '' : 'none';
            if (
                rect.left === lastLeft &&
                rect.top === lastTop &&
                rect.width === lastWidth &&
                rect.height === lastHeight &&
                chromeVisible === lastChromeVisible
            ) {
                return;
            }

            lastLeft = rect.left;
            lastTop = rect.top;
            lastWidth = rect.width;
            lastHeight = rect.height;
            lastChromeVisible = chromeVisible;
            EMBED_FLOAT_DOM_RECT_CACHE.set(container, {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
            });
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
        const scheduleChromeRectSync = (event?: Event) => {
            if (!shouldSyncChromeRectForGlobalEvent(container, event, {
                left: lastLeft,
                top: lastTop,
                width: lastWidth,
                height: lastHeight,
            })) {
                return;
            }

            if (typeof window.requestAnimationFrame !== 'function') {
                syncChromeRect();
                geometryService.invalidate({ embedId: data?.embedId, reason: 'manual' });
                return;
            }

            geometryService.invalidate({ embedId: data?.embedId, reason: 'wheel' });
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
            EMBED_FLOAT_DOM_RECT_CACHE.delete(container);
            chrome.removeAttribute('style');
            if (originalParent?.isConnected) {
                originalParent.insertBefore(chrome, originalNextSibling);
            } else {
                chrome.remove();
            }
        };
    }, [data?.embedId, geometryService, stage]);

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
                interactionBoundaryService.contains(data.embedId, target, event) ||
                isPointInsideFloatBlock(container, event)
            ) {
                return;
            }

            activationService.clearFloating(data.embedId, data.hostUnitId);
        };

        document.addEventListener('pointerdown', clearWhenPointerLeavesBlock, true);
        return () => document.removeEventListener('pointerdown', clearWhenPointerLeavesBlock, true);
    }, [activationService, data?.embedId, data?.hostUnitId, interactionBoundaryService]);

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
                activationService.activateFloating(descriptor, 'stage2');
                return;
            }
            if (interactionFlow === 'doc-block') {
                activationService.activateFloating(descriptor, 'stage2');
                return;
            }
            activationService.activateFloating(descriptor, 'stage1');
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
    }, [activationService, data?.embedId, data?.hostUnitId, embedModelService, floatingActiveService, interactionFlow]);

    useEffect(() => {
        const container = containerRef.current;
        const gate = gateRef.current;
        const liveRoot = liveRootRef.current;
        if (!container || !gate || !liveRoot) {
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
            const providerContext = childContext
                ? {
                    ...childContext,
                    event,
                    stage: currentStage,
                    viewportScrollY: props.syncHostVerticalScroll ? hostScrollSyncOffsetRef.current : undefined,
                }
                : undefined;
            if (childContext && shouldPassVerticalWheelToHost(childContext, event, props.syncHostVerticalScroll)) {
                const hostHandled = props.onHostWheel?.(event, childContext) === true || scrollHostScrollPortByWheel(container, event);
                if (hostHandled) {
                    invalidateGeometryAfterRuntimeScroll(geometryService, data?.embedId, 'host-scroll', geometryInvalidationFramesRef);
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return;
                }
            }
            const useRuntimeDomHorizontalScroll = shouldUseRuntimeDomHorizontalScroll(container, event);
            const scrollBleedBeforeChild = useRuntimeDomHorizontalScroll && getHorizontalWheelDelta(event) > 0;
            const scrolledBeforeProvider = scrollBleedBeforeChild ? scrollRuntimeDomElement(event, liveRoot) : false;
            const providerHandled = scrolledBeforeProvider || useRuntimeDomHorizontalScroll
                ? false
                : provider?.handleWheel(providerContext!) === true;
            const scrolledBeforeForward = providerHandled || scrolledBeforeProvider || !useRuntimeDomHorizontalScroll ? false : scrollRuntimeDomElement(event, liveRoot);
            const forwarded = providerHandled || scrolledBeforeProvider || (useRuntimeDomHorizontalScroll && scrolledBeforeForward)
                ? false
                : forwardWheelToRuntime(event, liveRoot);
            const scrolled = scrolledBeforeProvider || scrolledBeforeForward ||
                (providerHandled || useRuntimeDomHorizontalScroll || forwarded
                    ? false
                    : scrollRuntimeDom(event, liveRoot));
            if (providerHandled || scrolledBeforeProvider || scrolledBeforeForward || forwarded || scrolled) {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        gate.addEventListener('wheel', onWheel, { passive: false });
        return () => gate.removeEventListener('wheel', onWheel);
    }, [data?.embedId, floatingActiveService, geometryService, passiveViewportRegistry, props.onHostWheel, props.syncHostVerticalScroll]);

    useEffect(() => {
        const container = containerRef.current;
        const liveRoot = liveRootRef.current;
        if (!container || !liveRoot) {
            return undefined;
        }

        const scheduleGeometryInvalidation = (reason: 'child-scroll' | 'host-scroll' | 'wheel') => {
            invalidateGeometryAfterRuntimeScroll(geometryService, data?.embedId, reason, geometryInvalidationFramesRef);
        };
        const onStage2Wheel = (event: WheelEvent) => {
            const currentStage = data?.embedId ? floatingActiveService.getStage(data.embedId) : 'inactive';
            if (currentStage !== 'stage2') {
                return;
            }

            const childContext = childContextRef.current;
            if (!childContext || !shouldPassVerticalWheelToHost(childContext, event, props.syncHostVerticalScroll)) {
                return;
            }

            if (props.onHostWheel?.(event, childContext) === true) {
                scheduleGeometryInvalidation('host-scroll');
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                return;
            }

            if (scrollHostScrollPortByWheel(container, event)) {
                scheduleGeometryInvalidation('host-scroll');
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
            }
        };
        const onRuntimeScroll = () => {
            scheduleGeometryInvalidation('child-scroll');
        };

        container.addEventListener('wheel', onStage2Wheel, { capture: true, passive: false });
        liveRoot.addEventListener('wheel', onStage2Wheel, { capture: true, passive: false });
        liveRoot.addEventListener('scroll', onRuntimeScroll, true);
        return () => {
            container.removeEventListener('wheel', onStage2Wheel, { capture: true });
            liveRoot.removeEventListener('wheel', onStage2Wheel, { capture: true });
            liveRoot.removeEventListener('scroll', onRuntimeScroll, true);
        };
    }, [data?.embedId, floatingActiveService, geometryService, props.onHostWheel]);

    useEffect(() => {
        return () => {
            geometryInvalidationFramesRef.current.forEach(cancelFrame);
            geometryInvalidationFramesRef.current = [];
        };
    }, []);

    useEffect(() => {
        const liveRoot = liveRootRef.current;
        if (!liveRoot) {
            return undefined;
        }

        let refocusTimer: ReturnType<typeof globalThis.setTimeout> | undefined;
        let refocusSecondTimer: ReturnType<typeof globalThis.setTimeout> | undefined;
        let refocusFinalTimer: ReturnType<typeof globalThis.setTimeout> | undefined;
        let refocusFrames: FrameHandle[] = [];
        const clearScheduledRefocus = () => {
            if (refocusTimer != null) {
                globalThis.clearTimeout(refocusTimer);
                refocusTimer = undefined;
            }
            if (refocusSecondTimer != null) {
                globalThis.clearTimeout(refocusSecondTimer);
                refocusSecondTimer = undefined;
            }
            if (refocusFinalTimer != null) {
                globalThis.clearTimeout(refocusFinalTimer);
                refocusFinalTimer = undefined;
            }
            if (refocusFrames.length) {
                refocusFrames.forEach(cancelFrame);
                refocusFrames = [];
            }
        };
        const isRuntimeFocused = () => {
            const activeElement = liveRoot.ownerDocument.activeElement;
            if (!activeElement) {
                return false;
            }

            return getRuntimeRootElements(
                liveRootRef.current,
                liveContentRootRef.current,
                liveCanvasRootRef.current,
                overlayRootRef.current,
                popupRootRef.current
            ).some((root) => root.contains(activeElement));
        };
        const focusRuntimeCanvas = (canvas: HTMLCanvasElement, force = false) => {
            if (data?.embedId && floatingActiveService.getStage(data.embedId) !== 'stage2') {
                return;
            }
            if (!force && isRuntimeFocused()) {
                return;
            }
            if (!canvas.hasAttribute('tabindex')) {
                canvas.tabIndex = -1;
            }
            canvas.focus({ preventScroll: true });
        };
        const scheduleFrameRefocus = (canvas: HTMLCanvasElement, remainingFrames: number) => {
            if (remainingFrames <= 0) {
                return;
            }

            const frame = requestFrame(() => {
                refocusFrames = refocusFrames.filter((handle) => handle !== frame);
                focusRuntimeCanvas(canvas);
                scheduleFrameRefocus(canvas, remainingFrames - 1);
            });
            refocusFrames.push(frame);
        };
        const focusCanvas = (event: PointerEvent) => {
            if (data?.embedId && floatingActiveService.getStage(data.embedId) !== 'stage2') {
                return;
            }

            if (data?.hostUnitId && data.embedId) {
                const descriptor = embedModelService.getDescriptor(data.hostUnitId, data.embedId);
                if (descriptor?.childUnitId != null && descriptor.childType != null) {
                    activationService.focusFloatingRuntime(descriptor);
                }
            }

            const canvas = findRuntimeCanvas(
                getRuntimeRootElements(
                    liveCanvasRootRef.current,
                    liveContentRootRef.current,
                    overlayRootRef.current,
                    popupRootRef.current,
                    liveRootRef.current
                ),
                event.target
            );
            if (!canvas) {
                return;
            }

            clearScheduledRefocus();
            focusRuntimeCanvas(canvas, true);
            refocusTimer = globalThis.setTimeout(() => {
                refocusTimer = undefined;
                focusRuntimeCanvas(canvas);
            }, 0);
            refocusSecondTimer = globalThis.setTimeout(() => {
                refocusSecondTimer = undefined;
                focusRuntimeCanvas(canvas);
            }, 16);
            scheduleFrameRefocus(canvas, 30);
            refocusFinalTimer = globalThis.setTimeout(() => {
                refocusFinalTimer = undefined;
                focusRuntimeCanvas(canvas);
            }, 500);
        };

        liveRoot.addEventListener('pointerdown', focusCanvas, true);
        return () => {
            clearScheduledRefocus();
            liveRoot.removeEventListener('pointerdown', focusCanvas, true);
        };
    }, [activationService, data?.embedId, data?.hostUnitId, embedModelService, floatingActiveService]);

    useEffect(() => {
        if (stage !== 'stage2' || interactionFlow !== 'doc-block') {
            return undefined;
        }

        const liveRoot = liveRootRef.current;
        if (!liveRoot) {
            return undefined;
        }

        let retryFrames: FrameHandle[] = [];
        let retryTimers: Array<ReturnType<typeof globalThis.setTimeout>> = [];
        const getCanvas = () => findRuntimeCanvas(getRuntimeRootElements(
            liveCanvasRootRef.current,
            liveContentRootRef.current,
            overlayRootRef.current,
            popupRootRef.current,
            liveRootRef.current
        ));
        const isRuntimeFocused = () => {
            const activeElement = liveRoot.ownerDocument.activeElement;
            if (!activeElement || activeElement === getCanvas()) {
                return false;
            }

            return getRuntimeRootElements(
                liveRootRef.current,
                liveContentRootRef.current,
                liveCanvasRootRef.current,
                overlayRootRef.current,
                popupRootRef.current
            ).some((root) => root.contains(activeElement));
        };
        const focusRuntime = () => {
            const canvas = getCanvas();
            if (!canvas) {
                return;
            }
            if (isRuntimeFocused()) {
                return;
            }

            if (data?.hostUnitId && data.embedId) {
                const descriptor = embedModelService.getDescriptor(data.hostUnitId, data.embedId);
                if (descriptor?.childUnitId != null && descriptor.childType != null) {
                    activationService.focusFloatingRuntime(descriptor);
                }
            }

            if (!canvas.hasAttribute('tabindex')) {
                canvas.tabIndex = -1;
            }
            canvas.focus({ preventScroll: true });
        };
        const scheduleFrameRefocus = (remainingFrames: number) => {
            if (remainingFrames <= 0) {
                return;
            }

            const frame = requestFrame(() => {
                retryFrames = retryFrames.filter((handle) => handle !== frame);
                focusRuntime();
                scheduleFrameRefocus(remainingFrames - 1);
            });
            retryFrames.push(frame);
        };

        focusRuntime();
        scheduleFrameRefocus(30);
        retryTimers = [0, 80, 200, 500, 1000].map((delay) => globalThis.setTimeout(focusRuntime, delay));

        return () => {
            retryFrames.forEach(cancelFrame);
            retryFrames = [];
            retryTimers.forEach((timer) => globalThis.clearTimeout(timer));
            retryTimers = [];
        };
    }, [activationService, data?.embedId, data?.hostUnitId, embedModelService, interactionFlow, stage]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || typeof window === 'undefined') {
            return undefined;
        }

        let frame: number | undefined;
        const sync = () => {
            const childContext = childContextRef.current;
            if (!childContext || !props.syncHostVerticalScroll) {
                hostScrollSyncOffsetRef.current = 0;
                container.style.setProperty('--univer-embed-docs-scroll-offset', '0px');
                return;
            }

            const provider = passiveViewportRegistry.get(childContext.childType, childContext.layout);
            if (!provider) {
                return;
            }

            const scrollPort = findNearestScrollPort(container);
            const scrollPortRect = scrollPort?.getBoundingClientRect() ?? {
                bottom: window.innerHeight,
                height: window.innerHeight,
                left: 0,
                right: window.innerWidth,
                top: 0,
                width: window.innerWidth,
            };
            const rect = container.getBoundingClientRect();
            const contentHeight = resolveHostScrollSyncContentHeight(container, rect.height);
            const viewportHeight = Math.min(
                contentHeight,
                resolveHostScrollSyncViewportHeight(container, scrollPortRect.height)
            );
            const maxOffset = Math.max(0, contentHeight - viewportHeight);
            const nextOffset = clampNumber(scrollPortRect.top - rect.top, 0, maxOffset);
            container.style.setProperty('--univer-embed-docs-scroll-offset', `${nextOffset}px`);
            const previousOffset = hostScrollSyncOffsetRef.current;
            const deltaY = nextOffset - previousOffset;
            if (Math.abs(deltaY) < 0.5) {
                return;
            }

            hostScrollSyncOffsetRef.current = nextOffset;
            geometryService.invalidate({ embedId: data?.embedId, reason: 'host-scroll' });
            const event = new WheelEvent('wheel', {
                cancelable: false,
                clientX: rect.left + Math.min(rect.width, scrollPortRect.width) / 2,
                clientY: scrollPortRect.top + viewportHeight / 2,
                deltaY,
            });
            provider.handleWheel({
                ...childContext,
                event,
                source: 'host-scroll-sync',
                stage: data?.embedId ? floatingActiveService.getStage(data.embedId) : 'inactive',
                viewportScrollY: nextOffset,
            });
        };
        const syncLoop = () => {
            sync();
            frame = window.requestAnimationFrame(syncLoop);
        };

        frame = window.requestAnimationFrame(syncLoop);
        window.addEventListener('scroll', sync, true);
        window.addEventListener('resize', sync);
        const resizeObserver = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(sync);
        resizeObserver?.observe(container);

        return () => {
            if (frame != null) {
                window.cancelAnimationFrame(frame);
            }
            resizeObserver?.disconnect();
            window.removeEventListener('scroll', sync, true);
            window.removeEventListener('resize', sync);
        };
    }, [data?.embedId, floatingActiveService, geometryService, mountVersion, passiveViewportRegistry, props.syncHostVerticalScroll]);

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
    const hitRects = [
        container.getBoundingClientRect(),
        container.querySelector<HTMLElement>('.univer-embed-float-dom__content')?.getBoundingClientRect(),
        document.querySelector<HTMLElement>(`.univer-embed-float-dom__chrome[data-embed-id="${container.dataset.embedId}"]`)?.getBoundingClientRect(),
    ].filter((rect): rect is DOMRect => !!rect);

    return hitRects.some((rect) => event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top - 40 &&
        event.clientY <= rect.bottom);
}

function resolveChromeAnchorRect(container: HTMLElement): DOMRect {
    const content = isDocsSheetLikeChrome(container)
        ? container.querySelector<HTMLElement>('.univer-embed-float-dom__content')
        : null;
    const contentRect = content?.getBoundingClientRect();
    if (contentRect && contentRect.width > 0 && contentRect.height > 0) {
        return intersectWithScrollPort(contentRect, container);
    }

    return container.getBoundingClientRect();
}

function isDocsSheetLikeChrome(container: HTMLElement): boolean {
    return !!container.closest('[data-embed-docs-custom-block-sheet-like="true"]');
}

const MIN_DOCS_SHEET_LIKE_CHROME_HEIGHT = 40;

function intersectWithScrollPort(rect: DOMRect, container: HTMLElement): DOMRect {
    const clippingViewport = findNearestClippingViewport(container);
    if (!clippingViewport && rect.top >= 0 && rect.left >= 0) {
        return rect;
    }

    const scrollPortRect = clippingViewport?.getBoundingClientRect() ?? new DOMRect(0, 0, window.innerWidth, window.innerHeight);
    const left = Math.max(rect.left, scrollPortRect.left);
    const top = Math.max(rect.top, scrollPortRect.top);
    const right = Math.min(rect.right, scrollPortRect.right);
    const bottom = Math.min(rect.bottom, scrollPortRect.bottom);
    if (right <= left || bottom <= top) {
        return new DOMRect(left, top, 0, 0);
    }

    return new DOMRect(left, top, right - left, bottom - top);
}

function findNearestClippingViewport(element: HTMLElement): HTMLElement | null {
    let current = element.parentElement;
    while (current && current !== document.body && current !== document.documentElement) {
        if (clipsOverflow(current)) {
            return current;
        }
        current = current.parentElement;
    }

    return null;
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

function invalidateGeometryAfterRuntimeScroll(
    geometryService: EmbedFloatingGeometryService,
    embedId: string | undefined,
    reason: 'child-scroll' | 'host-scroll' | 'wheel',
    framesRef: { current: FrameHandle[] }
): void {
    framesRef.current.forEach(cancelFrame);
    framesRef.current = [];
    geometryService.invalidate({ embedId, reason });

    const schedule = (depth: number) => {
        const handle = requestFrame(() => {
            framesRef.current = framesRef.current.filter((frame) => frame !== handle);
            geometryService.invalidate({ embedId, reason });
            if (depth > 1) {
                schedule(depth - 1);
            }
        });
        framesRef.current.push(handle);
    };

    schedule(2);
}

function shouldSyncChromeRectForGlobalEvent(
    container: HTMLElement,
    event: Event | undefined,
    cachedRect: { left?: number; top?: number; width?: number; height?: number }
): boolean {
    if (isEmbedForwardedWheelEvent(event)) {
        return false;
    }

    const target = event?.target;
    if (target instanceof Node && container.contains(target)) {
        return false;
    }
    if (target instanceof HTMLElement && target.closest('[data-embed-float-dom="true"]')) {
        return false;
    }
    if (event instanceof WheelEvent && (
        isWheelPointInsideAnyCachedFloatDom(event) ||
        isWheelPointInsideCachedRect(cachedRect, event)
    )) {
        return false;
    }

    return true;
}

function isEmbedForwardedWheelEvent(event: Event | undefined): boolean {
    return !!event && (event as { [EMBED_FORWARDED_WHEEL_EVENT]?: WheelEvent })[EMBED_FORWARDED_WHEEL_EVENT] instanceof WheelEvent;
}

function isWheelPointInsideAnyCachedFloatDom(event: WheelEvent): boolean {
    for (const rect of EMBED_FLOAT_DOM_RECT_CACHE.values()) {
        if (isWheelPointInsideCachedRect(rect, event)) {
            return true;
        }
    }

    return false;
}

function isWheelPointInsideCachedRect(
    rect: { left?: number; top?: number; width?: number; height?: number },
    event: WheelEvent
): boolean {
    const { left, top, width, height } = rect;
    if (
        !Number.isFinite(left) ||
        !Number.isFinite(top) ||
        !Number.isFinite(width) ||
        !Number.isFinite(height) ||
        (width ?? 0) <= 0 ||
        (height ?? 0) <= 0
    ) {
        return false;
    }

    return event.clientX >= left! &&
        event.clientX <= left! + width! &&
        event.clientY >= top! &&
        event.clientY <= top! + height!;
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

    const forwardedEvent = createForwardedWheelEvent(event, {
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

    return scrollRuntimeDomElement(event, scrollable);
}

function scrollHostScrollPortByWheel(container: HTMLElement, event: WheelEvent): boolean {
    const scrollPort = findNearestScrollPort(container);
    if (!scrollPort) {
        return dispatchWheelToHostCanvas(container.ownerDocument.body, container, event);
    }

    if (!isDomWheelScrollPort(scrollPort)) {
        return dispatchWheelToHostCanvas(scrollPort, container, event);
    }

    const previousTop = scrollPort.scrollTop;
    scrollPort.scrollTop += event.deltaY;
    return scrollPort.scrollTop !== previousTop;
}

function shouldPassVerticalWheelToHost(context: IEmbedChildContainerContext, event: WheelEvent, syncHostVerticalScroll?: boolean): boolean {
    if (syncHostVerticalScroll || context.descriptor.sourceMeta?.verticalWheelMode === 'host') {
        return isDominantVerticalWheel(event);
    }

    return shouldPassDocsStickyVerticalWheelToHost(context.layout, event);
}

function shouldUseRuntimeDomHorizontalScroll(container: HTMLElement, event: WheelEvent): boolean {
    return isDocsSheetLikeChrome(container) && isDominantHorizontalWheel(event);
}

function getHorizontalWheelDelta(event: WheelEvent): number {
    return event.deltaX || (event.shiftKey ? event.deltaY : 0);
}

function isDominantHorizontalWheel(event: WheelEvent): boolean {
    if (event.ctrlKey || event.metaKey) {
        return false;
    }

    const deltaX = getHorizontalWheelDelta(event);
    const deltaY = event.shiftKey ? 0 : event.deltaY;
    return Math.abs(deltaX) > Math.abs(deltaY);
}

function isDominantVerticalWheel(event: WheelEvent): boolean {
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
        return false;
    }

    return Math.abs(event.deltaY) > Math.abs(event.deltaX);
}

function findNearestScrollPort(element: HTMLElement): HTMLElement | null {
    let current = element.parentElement;
    while (current && current !== document.body && current !== document.documentElement) {
        if (current.scrollHeight > current.clientHeight && clipsOverflow(current)) {
            return current;
        }
        current = current.parentElement;
    }

    return null;
}

function resolveHostScrollSyncContentHeight(container: HTMLElement, fallbackHeight: number): number {
    const customBlock = container.closest<HTMLElement>('[data-embed-docs-custom-block-sheet-like="true"]');
    const style = customBlock ? window.getComputedStyle(customBlock) : undefined;
    const contentHeight = parseCssPixelValue(style?.getPropertyValue('--univer-embed-docs-block-content-height'));

    return Math.max(1, contentHeight ?? fallbackHeight);
}

function resolveHostScrollSyncViewportHeight(container: HTMLElement, fallbackHeight: number): number {
    const customBlock = container.closest<HTMLElement>('[data-embed-docs-custom-block-sheet-like="true"]');
    const style = customBlock ? window.getComputedStyle(customBlock) : undefined;
    const cssViewportHeight = parseCssPixelValue(style?.getPropertyValue('--univer-embed-docs-block-viewport-height'));
    const viewportRectHeight = container
        .querySelector<HTMLElement>('.univer-embed-float-dom__content')
        ?.getBoundingClientRect()
        .height;

    return Math.max(1, cssViewportHeight ?? normalizePositiveNumber(viewportRectHeight) ?? fallbackHeight);
}

function normalizePositiveNumber(value: unknown): number | undefined {
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined;
}

function parseCssPixelValue(value: string | undefined): number | undefined {
    if (!value) {
        return undefined;
    }

    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function clipsOverflow(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return style.overflow === 'auto' ||
        style.overflow === 'scroll' ||
        style.overflow === 'hidden' ||
        style.overflowY === 'auto' ||
        style.overflowY === 'scroll' ||
        style.overflowY === 'hidden';
}

function isDomWheelScrollPort(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return style.overflow === 'auto' ||
        style.overflow === 'scroll' ||
        style.overflowY === 'auto' ||
        style.overflowY === 'scroll';
}

function dispatchWheelToHostCanvas(root: ParentNode, excludeRoot: HTMLElement, event: WheelEvent): boolean {
    const target = Array.from(root.querySelectorAll('canvas'))
        .find((canvas) => !excludeRoot.contains(canvas));
    if (!target) {
        return false;
    }
    const point = resolveHostCanvasWheelPoint(target, excludeRoot, event);

    target.dispatchEvent(createForwardedWheelEvent(event, {
        bubbles: true,
        cancelable: true,
        clientX: point.clientX,
        clientY: point.clientY,
        ctrlKey: event.ctrlKey,
        deltaMode: event.deltaMode,
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        deltaZ: event.deltaZ,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
    }));
    return true;
}

function createForwardedWheelEvent(source: WheelEvent, init: WheelEventInit): WheelEvent {
    const forwardedEvent = new WheelEvent('wheel', init);
    Object.defineProperty(forwardedEvent, EMBED_FORWARDED_WHEEL_EVENT, {
        configurable: true,
        value: source,
    });

    return forwardedEvent;
}

function resolveHostCanvasWheelPoint(target: HTMLCanvasElement, excludeRoot: HTMLElement, event: WheelEvent): { clientX: number; clientY: number } {
    if (!isPointInsideElement(excludeRoot, event.clientX, event.clientY)) {
        return { clientX: event.clientX, clientY: event.clientY };
    }

    const rect = target.getBoundingClientRect();
    const inset = Math.min(24, Math.max(4, Math.min(rect.width, rect.height) / 8));
    const candidates = [
        { clientX: rect.left + inset, clientY: rect.top + inset },
        { clientX: rect.right - inset, clientY: rect.top + inset },
        { clientX: rect.left + inset, clientY: rect.bottom - inset },
        { clientX: rect.right - inset, clientY: rect.bottom - inset },
        { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 },
    ];

    return candidates.find((point) => !isPointInsideElement(excludeRoot, point.clientX, point.clientY)) ?? candidates[0];
}

function clampNumber(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function findRuntimeElementAtPoint(root: HTMLElement, clientX: number, clientY: number): HTMLElement | null {
    if (!isPointInsideElement(root, clientX, clientY)) {
        return null;
    }

    const nativeMatch = findRuntimeElementFromNativePoint(root, clientX, clientY);
    if (nativeMatch) {
        return nativeMatch;
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

function findRuntimeElementFromNativePoint(root: HTMLElement, clientX: number, clientY: number): HTMLElement | null {
    const elementsFromPoint = root.ownerDocument.elementsFromPoint;
    if (typeof elementsFromPoint !== 'function') {
        return null;
    }

    const elements = elementsFromPoint.call(root.ownerDocument, clientX, clientY);
    const match = elements.find((element): element is HTMLElement => element instanceof HTMLElement && root.contains(element));
    return match ?? null;
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

function scrollRuntimeDomElement(event: WheelEvent, element: HTMLElement): boolean {
    const deltaX = event.deltaX || (event.shiftKey ? event.deltaY : 0);
    const deltaY = event.shiftKey ? 0 : event.deltaY;
    const previousLeft = element.scrollLeft;
    const previousTop = element.scrollTop;

    if (deltaX) {
        element.scrollLeft += deltaX;
    }
    if (deltaY) {
        element.scrollTop += deltaY;
    }

    return element.scrollLeft !== previousLeft || element.scrollTop !== previousTop;
}

function getRuntimeRootElements(...roots: Array<HTMLElement | null | undefined>): HTMLElement[] {
    return roots.filter((root): root is HTMLElement => !!root && root.isConnected);
}

function findRuntimeCanvas(roots: HTMLElement[], target?: EventTarget | null): HTMLCanvasElement | null {
    if (target instanceof HTMLCanvasElement && roots.some((root) => root.contains(target))) {
        return target;
    }

    for (const root of roots) {
        const canvas = root.querySelector('canvas');
        if (canvas) {
            return canvas;
        }
    }

    return null;
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
    pointer-events: none;
}
.univer-embed-float-dom__live-content > * {
    pointer-events: auto;
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
