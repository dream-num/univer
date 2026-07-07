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

import type { IDisposable } from '@univerjs/core';
import type { EmbedLayout, IEmbedDescriptor } from '@univerjs/embed';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Observable } from 'rxjs';
import type { EmbedRuntimeFocusRole } from '../services/embed-runtime-focus-coordinator.service';
import type { EmbedFloatingStage, EmbedInteractionFlow, IEmbedChildContainerContext } from '../types/embed-ui';
import { UniverInstanceType } from '@univerjs/core';
import { EmbedModelService, fromResourceRefUnitType, parseResourceRef } from '@univerjs/embed';
import { GripHorizontalIcon } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { resolveEmbedFloatInteractionPolicy } from '../common/embed-float-interaction-policy';
import { resolveEmbedRuntimeMountGate, shouldDeferEmbedRuntimeMount } from '../common/embed-runtime-policy';
import {
    EMBED_CANVAS_ROOT_ATTRIBUTE,
    EMBED_CONTENT_ROOT_ATTRIBUTE,
    EMBED_OVERLAY_ROOT_ATTRIBUTE,
    EMBED_POPUP_ROOT_ATTRIBUTE,
} from '../common/embed-runtime-slots';
import { EmbedActivationService } from '../services/embed-activation.service';
import { shouldPassDocsStickyVerticalWheelToHost } from '../services/embed-docs-sticky-wheel';
import { EmbedFloatPreviewService } from '../services/embed-float-preview.service';
import { EmbedFloatingActiveService } from '../services/embed-floating-active.service';
import { EmbedFloatingGeometryService } from '../services/embed-floating-geometry.service';
import { EmbedFullscreenService } from '../services/embed-fullscreen.service';
import { EmbedHostRestoreService } from '../services/embed-host-restore.service';
import {
    EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE,
    EmbedInteractionBoundaryService,
} from '../services/embed-interaction-boundary.service';
import { EmbedMountService } from '../services/embed-mount.service';
import { EmbedPassiveViewportRegistryService } from '../services/embed-passive-viewport-registry.service';
import { EmbedPassiveWheelHandlerRegistryService } from '../services/embed-passive-wheel-handler-registry.service';
import {
    EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE,
    EmbedRuntimeFocusCoordinator,
} from '../services/embed-runtime-focus-coordinator.service';
import { EmbedFloatFullscreenButton } from './EmbedFloatFullscreenButton';

const CLICK_DISTANCE_THRESHOLD = 4;
const CLICK_DURATION_THRESHOLD = 500;
const EMBED_CHILD_POINTER_INTERACTION_GRACE_MS = 650;
const EMBED_EXTERNAL_HOST_INTERACTION_GRACE_MS = 650;
export const EMBED_FLOAT_DRAG_HANDLE_POINTER_DOWN_EVENT = 'univer:embed-float-drag-handle:pointerdown';
const EMBED_FORWARDED_WHEEL_EVENT = Symbol('univer.embed.forwarded-wheel-event');
const EMBED_HOST_VERTICAL_WHEEL_ATTEMPTED_EVENT = Symbol('univer.embed.host-vertical-wheel-attempted-event');
const EMBED_FLOAT_DOM_RECT_CACHE = new Map<HTMLElement, IEmbedFloatDomRectCache>();
const EMBED_STAGE2_FOCUS_OWNER = 'stage2-runtime';
const EMBED_DOC_BLOCK_STAGE2_FOCUS_OWNER = 'doc-block-stage2-runtime';
const EMBED_STAGE2_RUNTIME_FOCUS_OWNERS = [EMBED_STAGE2_FOCUS_OWNER, EMBED_DOC_BLOCK_STAGE2_FOCUS_OWNER];
const EMBED_FLOAT_CHROME_CONTROL_SELECTOR = '[data-embed-float-drag-handle="true"], [data-embed-floating-menu="true"], [data-embed-floating-menu-popup="true"], [data-embed-ribbon-override="true"]';

interface IEmbedFloatDomRectCache {
    left: number;
    top: number;
    width: number;
    height: number;
}

interface IClickIntentState {
    pointerId: number;
    startX: number;
    startY: number;
    button: number;
    startedAt: number;
    moved: boolean;
    dragStarted: boolean;
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
    hostFloatDomLayout$?: Observable<unknown>;
    onHostWheel?: (event: WheelEvent, context: IEmbedChildContainerContext) => boolean | void;
    onRuntimeStageEnter?: (stage: EmbedFloatingStage) => void;
    onRuntimeStageExit?: () => void;
    syncHostVerticalScroll?: boolean;
    enableStage1BodyDrag?: boolean;
    isExternalHostInteraction?: (event: PointerEvent) => boolean;
}) {
    const { initialStage, interactionFlow = 'floating-stage', isExternalHostInteraction, onRuntimeStageEnter, onRuntimeStageExit } = props;
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
    const restoreService = useDependency(EmbedHostRestoreService);
    const passiveWheelHandlerRegistry = useDependency(EmbedPassiveWheelHandlerRegistryService);
    const passiveViewportRegistry = useDependency(EmbedPassiveViewportRegistryService);
    const focusCoordinator = useDependency(EmbedRuntimeFocusCoordinator);
    const data = normalizeFloatDomData(props.data);
    const [mountVersion, setMountVersion] = useState(0);
    const [stage, setStage] = useState<EmbedFloatingStage>(() => initialStage ?? (data?.embedId ? floatingActiveService.getStage(data.embedId) : 'inactive'));
    const previousStageRef = useRef<EmbedFloatingStage>(stage);
    const notifiedInitialStageRef = useRef(false);
    const clickIntentRef = useRef<IClickIntentState | undefined>(undefined);
    const childContextRef = useRef<IEmbedChildContainerContext | undefined>(undefined);
    const stageSessionLeaseRef = useRef<IDisposable | undefined>(undefined);
    const pointerInteractionLeaseRef = useRef<IDisposable | undefined>(undefined);
    const fullscreenRemountFrameRef = useRef<FrameHandle | undefined>(undefined);
    const fullscreenRemountTimerRef = useRef<ReturnType<typeof globalThis.setTimeout> | undefined>(undefined);
    const hostScrollSyncOffsetRef = useRef(0);
    const externalHostInteractionUntilRef = useRef(0);
    const geometryInvalidationFramesRef = useRef<FrameHandle[]>([]);
    const latestStageRef = useRef<EmbedFloatingStage>(stage);
    latestStageRef.current = stage;
    const releaseStage2SessionLease = useCallback(() => {
        stageSessionLeaseRef.current?.dispose();
        stageSessionLeaseRef.current = undefined;
    }, []);
    const acquireStage2SessionLease = useCallback(() => {
        if (!data?.embedId || stageSessionLeaseRef.current) {
            return;
        }
        const descriptor = data.hostUnitId ? embedModelService.getDescriptor(data.hostUnitId, data.embedId) : undefined;
        const refChild = resolveChildFromResourceRef(descriptor);
        const childUnitId = data.childUnitId ?? descriptor?.childUnitId ?? childContextRef.current?.childUnitId ?? refChild?.childUnitId;
        const childType = data.childType ?? descriptor?.childType ?? childContextRef.current?.childType ?? refChild?.childType;

        stageSessionLeaseRef.current = focusCoordinator.acquireLease({
            embedId: data.embedId,
            role: 'child-session',
            owner: interactionFlow === 'doc-block' ? EMBED_DOC_BLOCK_STAGE2_FOCUS_OWNER : EMBED_STAGE2_FOCUS_OWNER,
            sessionMode: 'child-keyboard',
            hostUnitId: data.hostUnitId,
            childUnitId,
            childType,
        });
    }, [data?.childType, data?.childUnitId, data?.embedId, data?.hostUnitId, embedModelService, focusCoordinator, interactionFlow]);
    const releaseStage2SessionLeaseIfActivationDoesNotStick = useCallback(() => {
        if (!data?.embedId) {
            return;
        }

        const embedId = data.embedId;
        requestFrame(() => {
            if (floatingActiveService.getStage(embedId) !== 'stage2') {
                releaseStage2SessionLease();
            }
        });
    }, [data?.embedId, floatingActiveService, releaseStage2SessionLease]);
    const runtimeMountGate = resolveEmbedRuntimeMountGate(
        data?.hostUnitId ? embedModelService.getDescriptor(data.hostUnitId, data.embedId) : undefined,
        stage
    );

    useEffect(() => {
        if (!data?.embedId || stage !== 'stage2') {
            return undefined;
        }

        acquireStage2SessionLease();

        return releaseStage2SessionLease;
    }, [acquireStage2SessionLease, data?.embedId, releaseStage2SessionLease, stage]);

    useEffect(() => {
        const previousStage = previousStageRef.current;
        previousStageRef.current = stage;
        const shouldNotifyStageEnter = previousStage !== stage ||
            (!notifiedInitialStageRef.current && stage !== 'inactive');
        notifiedInitialStageRef.current = true;
        if (shouldNotifyStageEnter) {
            onRuntimeStageEnter?.(stage);
            geometryService.invalidate({ embedId: data?.embedId, reason: 'stage-change' });
        }
        if (previousStage === 'stage2' && stage !== 'stage2') {
            blurRuntimeFocusIfOwnedByBlock(
                data?.embedId,
                getRuntimeRootElements(
                    liveRootRef.current,
                    liveContentRootRef.current,
                    liveCanvasRootRef.current,
                    overlayRootRef.current,
                    popupRootRef.current
                )
            );
            activationService.clearFloating(data?.embedId, data?.hostUnitId);
            onRuntimeStageExit?.();
        }
    }, [activationService, data?.embedId, data?.hostUnitId, geometryService, onRuntimeStageEnter, onRuntimeStageExit, stage]);

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
        if (!descriptor || !layout) {
            return undefined;
        }
        if (runtimeMountGate === 'deferred') {
            return undefined;
        }

        let disposed = false;
        let mountedEmbedId: string | undefined;
        void restoreService.materializeDescriptor({ descriptor }).then((materializedDescriptor) => {
            if (disposed) {
                return;
            }

            const session = mountService.mountIntoHostElement(materializedDescriptor, container, {
                content: contentRoot,
                canvas: canvasRoot,
                overlay: overlayRoot,
                popup: popupRoot,
            });
            mountedEmbedId = materializedDescriptor.embedId;
            const childContext = session?.context;
            childContextRef.current = childContext;
            const cachedViewState = data?.embedId ? previewService.getPreview(data.embedId)?.viewState : undefined;
            if (childContext && cachedViewState != null) {
                void previewService.restoreViewState(childContext, cachedViewState);
            }
        }).catch((error) => {
            throw error;
        });

        return () => {
            disposed = true;
            if (mountedEmbedId && childContextRef.current?.embedId === mountedEmbedId) {
                childContextRef.current = undefined;
            }
            mountService.unmount(descriptor.embedId);
        };
    }, [data?.embedId, data?.hostUnitId, embedModelService, mountService, mountVersion, previewService, restoreService, runtimeMountGate]);

    useEffect(() => {
        if (!data?.embedId) {
            return undefined;
        }

        const embedId = data.embedId;
        const roots: Array<{ element: HTMLElement; role: EmbedRuntimeFocusRole }> = [];
        [
            { element: liveRootRef.current, role: 'runtime' as const },
            { element: liveContentRootRef.current, role: 'runtime' as const },
            { element: liveCanvasRootRef.current, role: 'runtime' as const },
        ].forEach((root) => {
            const element = root.element;
            if (element) {
                roots.push({ element, role: root.role });
            }
        });
        if (stage === 'stage2') {
            [
                { element: chromeRef.current, role: 'floating-menu' },
                { element: overlayRootRef.current, role: 'floating-menu' },
                { element: popupRootRef.current, role: 'child-popup' },
            ].forEach((root) => {
                if (root.element) {
                    roots.push(root as { element: HTMLElement; role: EmbedRuntimeFocusRole });
                }
            });
        }
        const disposables = roots.flatMap(({ element, role }) => [
            interactionBoundaryService.registerRoot(embedId, element),
            focusCoordinator.registerElement({
                embedId,
                role,
                element,
            }),
        ]);

        return () => disposables.forEach((disposable) => disposable.dispose());
    }, [data?.embedId, focusCoordinator, interactionBoundaryService, stage]);

    useEffect(() => {
        if (!data?.embedId || stage !== 'stage2') {
            return undefined;
        }

        const ownerDocument = containerRef.current?.ownerDocument ??
            liveRootRef.current?.ownerDocument ??
            (typeof document === 'undefined' ? undefined : document);
        const disposable = interactionBoundaryService.activatePortalScope(data.embedId, ownerDocument);

        return () => {
            if (latestStageRef.current !== 'stage2') {
                interactionBoundaryService.closeOwnedFloatingSurfaces(data.embedId, ownerDocument);
            }
            disposable.dispose();
        };
    }, [data?.embedId, interactionBoundaryService, stage]);

    useEffect(() => {
        if (!data?.embedId || stage !== 'stage2') {
            return undefined;
        }

        const ownerDocument = containerRef.current?.ownerDocument ??
            liveRootRef.current?.ownerDocument ??
            (typeof document === 'undefined' ? undefined : document);
        const appHeaderbar = ownerDocument?.querySelector<HTMLElement>('[data-u-comp="headerbar"]');
        if (!appHeaderbar) {
            return undefined;
        }

        const disposables = [
            interactionBoundaryService.registerRoot(data.embedId, appHeaderbar),
            focusCoordinator.registerElement({
                embedId: data.embedId,
                role: 'floating-menu',
                element: appHeaderbar,
            }),
        ];

        return () => disposables.forEach((disposable) => disposable.dispose());
    }, [data?.embedId, focusCoordinator, interactionBoundaryService, stage]);

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

            activationService.clearFloating(data.embedId, data.hostUnitId);
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
    }, [activationService, data?.embedId, data?.hostUnitId, fullscreenService, mountService]);

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
        let lastChromeControlsVisible: boolean | undefined;
        let lastDragHandleVisible: boolean | undefined;
        let lockedNonDocsChromeTop: number | undefined;
        const syncChromeRect = () => {
            const docsSheetLikeChrome = isDocsSheetLikeChrome(container);
            const rawRect = resolveChromeAnchorRect(container);
            const rawContainerRect = container.getBoundingClientRect();
            const shouldKeepNonDocsChromeTop =
                !isDocsCustomBlockChrome(container) &&
                lockedNonDocsChromeTop != null &&
                lastLeft === rawRect.left &&
                lastWidth === rawRect.width &&
                lastHeight === rawRect.height;
            if (
                !isDocsCustomBlockChrome(container) &&
                lockedNonDocsChromeTop != null &&
                !shouldKeepNonDocsChromeTop
            ) {
                lockedNonDocsChromeTop = undefined;
            }
            const rect = shouldKeepNonDocsChromeTop
                ? new DOMRect(rawRect.left, lockedNonDocsChromeTop, rawRect.width, rawRect.height)
                : rawRect;
            const chromeVisible = !docsSheetLikeChrome || rect.height >= MIN_DOCS_SHEET_LIKE_RUNTIME_INTERACTION_HEIGHT;
            const chromeControlsVisible = rect.height >= MIN_EMBED_FLOATING_CHROME_CONTROLS_HEIGHT;
            const dragHandleVisible = chromeControlsVisible && rawContainerRect.top >= rect.top;
            syncRuntimeInteractionVisibility(container, chrome, chromeVisible, stage);
            syncChromeControlsVisibility(chrome, chromeControlsVisible, dragHandleVisible, stage);
            if (docsSheetLikeChrome) {
                chrome.style.setProperty('--univer-embed-floating-menu-top', '8px');
                syncDocsSheetLikeChromePageArea(chrome, rect, rawContainerRect);
            } else {
                chrome.style.removeProperty('--univer-embed-floating-menu-top');
                clearDocsSheetLikeChromePageArea(chrome);
            }
            chrome.style.visibility = chromeVisible ? '' : 'hidden';
            chrome.style.pointerEvents = chromeVisible && stage !== 'inactive' ? '' : 'none';
            if (
                rect.left === lastLeft &&
                rect.top === lastTop &&
                rect.width === lastWidth &&
                rect.height === lastHeight &&
                chromeVisible === lastChromeVisible &&
                chromeControlsVisible === lastChromeControlsVisible &&
                dragHandleVisible === lastDragHandleVisible
            ) {
                return;
            }

            lastLeft = rect.left;
            lastTop = rect.top;
            lastWidth = rect.width;
            lastHeight = rect.height;
            lastChromeVisible = chromeVisible;
            lastChromeControlsVisible = chromeControlsVisible;
            lastDragHandleVisible = dragHandleVisible;
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
            if (!isDocsCustomBlockChrome(container) && isVerticalWheelOrScrollEvent(event) && lastTop != null) {
                lockedNonDocsChromeTop = lastTop;
            }
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
        const syncChromeRectForHostLayoutChange = () => {
            lockedNonDocsChromeTop = undefined;
            if (typeof window.requestAnimationFrame !== 'function') {
                syncChromeRect();
                geometryService.invalidate({ embedId: data?.embedId, reason: 'host-scroll' });
                return;
            }

            geometryService.invalidate({ embedId: data?.embedId, reason: 'host-scroll' });
            scheduledFramesRemaining = Math.max(scheduledFramesRemaining, 2);
            if (scheduledFrameId == null) {
                scheduledFrameId = window.requestAnimationFrame(syncScheduledChromeRect);
            }
        };

        syncChromeRect();
        document.body.appendChild(chrome);

        const clearNonDocsChromeTopLock = () => {
            lockedNonDocsChromeTop = undefined;
        };
        const resizeObserver = new ResizeObserver(syncChromeRect);
        resizeObserver.observe(container);
        const hostFloatDomLayoutSubscription = props.hostFloatDomLayout$?.subscribe(syncChromeRectForHostLayoutChange);
        window.addEventListener('pointerdown', clearNonDocsChromeTopLock, true);
        window.addEventListener('scroll', scheduleChromeRectSync, true);
        window.addEventListener('wheel', scheduleChromeRectSync, true);
        window.addEventListener('resize', scheduleChromeRectSync);
        const shouldContinuouslySyncChrome = stage !== 'inactive' || isDocsCustomBlockChrome(container);
        if (shouldContinuouslySyncChrome && typeof window.requestAnimationFrame === 'function') {
            frameId = window.requestAnimationFrame(syncChromeRectOnFrame);
        }

        return () => {
            if (frameId != null) {
                window.cancelAnimationFrame(frameId);
            }
            if (scheduledFrameId != null) {
                window.cancelAnimationFrame(scheduledFrameId);
            }
            hostFloatDomLayoutSubscription?.unsubscribe();
            resizeObserver.disconnect();
            window.removeEventListener('pointerdown', clearNonDocsChromeTopLock, true);
            window.removeEventListener('scroll', scheduleChromeRectSync, true);
            window.removeEventListener('wheel', scheduleChromeRectSync, true);
            window.removeEventListener('resize', scheduleChromeRectSync);
            EMBED_FLOAT_DOM_RECT_CACHE.delete(container);
            chrome.removeAttribute('style');
            syncRuntimeInteractionVisibility(container, chrome, true, 'stage2');
            syncChromeControlsVisibility(chrome, true, true, 'stage2');
            if (originalParent?.isConnected) {
                originalParent.insertBefore(chrome, originalNextSibling);
            } else {
                chrome.remove();
            }
        };
    }, [data?.embedId, geometryService, props.hostFloatDomLayout$, stage]);

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
            const externalHostInteraction = isExternalHostInteraction?.(event) ?? false;
            if (floatingActiveService.getStage(data.embedId) === 'inactive') {
                return;
            }
            if (externalHostInteraction) {
                externalHostInteractionUntilRef.current = Date.now() + EMBED_EXTERNAL_HOST_INTERACTION_GRACE_MS;
            }

            if (
                !container ||
                !target ||
                container.contains(target) ||
                chrome?.contains(target) ||
                target.closest(EMBED_FLOAT_CHROME_CONTROL_SELECTOR) ||
                focusCoordinator.containsElement(data.embedId, target, event) ||
                interactionBoundaryService.contains(data.embedId, target, event) ||
                externalHostInteraction ||
                isPointInsideFloatBlock(container, event)
            ) {
                return;
            }

            activationService.clearFloating(data.embedId, data.hostUnitId);
        };
        const clearWhenFocusLeavesBlock = (event: FocusEvent) => {
            const container = containerRef.current;
            const chrome = chromeRef.current;
            const target = event.target as HTMLElement | null;
            const ownerDocument = container?.ownerDocument ?? target?.ownerDocument;
            const hasActiveChildEditorOrPopup = focusCoordinator.hasBlockingChildFocusLease(data.embedId, {
                ignoreOwners: EMBED_STAGE2_RUNTIME_FOCUS_OWNERS,
            });
            if (floatingActiveService.getStage(data.embedId) === 'inactive') {
                return;
            }
            if (
                !container ||
                !target ||
                hasActiveChildEditorOrPopup ||
                Date.now() < externalHostInteractionUntilRef.current ||
                interactionBoundaryService.hasRecentInteractionFor(data.embedId, ownerDocument) ||
                !isHostFocusSurface(target) ||
                container.contains(target) ||
                chrome?.contains(target) ||
                target.closest(EMBED_FLOAT_CHROME_CONTROL_SELECTOR) ||
                focusCoordinator.containsElement(data.embedId, target, event) ||
                interactionBoundaryService.contains(data.embedId, target, event)
            ) {
                return;
            }

            activationService.clearFloating(data.embedId, data.hostUnitId);
        };

        document.addEventListener('pointerdown', clearWhenPointerLeavesBlock, true);
        document.addEventListener('focusin', clearWhenFocusLeavesBlock, true);
        return () => {
            document.removeEventListener('pointerdown', clearWhenPointerLeavesBlock, true);
            document.removeEventListener('focusin', clearWhenFocusLeavesBlock, true);
        };
    }, [activationService, data?.embedId, data?.hostUnitId, focusCoordinator, interactionBoundaryService, isExternalHostInteraction]);

    useEffect(() => {
        if (stage === 'stage2') {
            return;
        }

        pointerInteractionLeaseRef.current?.dispose();
        pointerInteractionLeaseRef.current = undefined;
        blurRuntimeFocusIfOwnedByBlock(
            data?.embedId,
            getRuntimeRootElements(
                liveRootRef.current,
                liveContentRootRef.current,
                liveCanvasRootRef.current,
                overlayRootRef.current,
                popupRootRef.current
            )
        );
    }, [data?.embedId, stage]);

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
            if (target?.closest(EMBED_FLOAT_CHROME_CONTROL_SELECTOR)) {
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
                button: event.button ?? 0,
                startedAt: Date.now(),
                moved: false,
                dragStarted: false,
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
                const dragPolicy = resolveEmbedFloatInteractionPolicy({
                    stage: floatingActiveService.getStage(data.embedId),
                    interactionFlow,
                });
                if (props.enableStage1BodyDrag && !intent.dragStarted && dragPolicy.allowHostBodyDrag) {
                    intent.dragStarted = true;
                    document.dispatchEvent(new CustomEvent(EMBED_FLOAT_DRAG_HANDLE_POINTER_DOWN_EVENT, {
                        detail: {
                            embedId: data.embedId,
                            hostUnitId: data.hostUnitId,
                            hostAnchorId: data.hostAnchorId,
                            pointerId: intent.pointerId,
                            clientX: intent.startX,
                            clientY: intent.startY,
                            button: intent.button,
                        },
                    }));
                }
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
                activationService.activateFloating(descriptor, 'stage2', { portalContainer: popupRootRef.current });
                return;
            }
            if (interactionFlow === 'doc-block') {
                acquireStage2SessionLease();
                activationService.activateFloating(descriptor, 'stage2', { portalContainer: popupRootRef.current });
                releaseStage2SessionLeaseIfActivationDoesNotStick();
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
    }, [
        acquireStage2SessionLease,
        activationService,
        data?.embedId,
        data?.hostAnchorId,
        data?.hostUnitId,
        embedModelService,
        floatingActiveService,
        interactionFlow,
        props.enableStage1BodyDrag,
        releaseStage2SessionLeaseIfActivationDoesNotStick,
    ]);

    useEffect(() => {
        const container = containerRef.current;
        const gate = gateRef.current;
        const liveRoot = liveRootRef.current;
        if (!container || !gate || !liveRoot) {
            return undefined;
        }

        const onWheel = (event: WheelEvent) => {
            if (isEmbedForwardedWheelEvent(event)) {
                return;
            }
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
            const featureHandled = providerContext
                ? passiveWheelHandlerRegistry.handleWheel(providerContext)
                : false;
            const useRuntimeDomHorizontalScroll = !featureHandled && shouldUseRuntimeDomHorizontalScroll(container, event);
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
            if (featureHandled || providerHandled || scrolledBeforeProvider || scrolledBeforeForward || forwarded || scrolled) {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        gate.addEventListener('wheel', onWheel, { passive: false });
        liveRoot.addEventListener('wheel', onWheel, { capture: true, passive: false });
        return () => {
            gate.removeEventListener('wheel', onWheel);
            liveRoot.removeEventListener('wheel', onWheel, { capture: true });
        };
    }, [data?.embedId, floatingActiveService, geometryService, passiveViewportRegistry, passiveWheelHandlerRegistry, props.onHostWheel, props.syncHostVerticalScroll]);

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

            if (isHostVerticalWheelAttempted(event)) {
                return;
            }
            markHostVerticalWheelAttempted(event);

            const hostHandled = props.onHostWheel?.(event, childContext) === true || scrollHostScrollPortByWheel(container, event);
            if (hostHandled) {
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
    }, [data?.embedId, floatingActiveService, geometryService, props.onHostWheel, props.syncHostVerticalScroll]);

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
            if (!shouldAutoFocusRuntimeCanvas(data?.childType)) {
                return;
            }
            if (focusCoordinator.hasBlockingChildFocusLease(data?.embedId, { ignoreOwners: EMBED_STAGE2_RUNTIME_FOCUS_OWNERS })) {
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
        const focusCanvas = (event: PointerEvent) => {
            const currentStage = data?.embedId ? floatingActiveService.getStage(data.embedId) : 'inactive';
            if (data?.embedId && currentStage !== 'stage2') {
                if (interactionFlow !== 'doc-block' || !data.hostUnitId) {
                    return;
                }

                const descriptor = embedModelService.getDescriptor(data.hostUnitId, data.embedId);
                if (!descriptor?.childUnitId) {
                    return;
                }

                acquireStage2SessionLease();
                activationService.activateFloating(descriptor, 'stage2', { portalContainer: popupRootRef.current });
                releaseStage2SessionLeaseIfActivationDoesNotStick();
            }
            if (isChildEditorOrPopupRuntimeElement(event.target)) {
                return;
            }
            if (focusCoordinator.hasBlockingChildFocusLease(data?.embedId, { ignoreOwners: EMBED_STAGE2_RUNTIME_FOCUS_OWNERS })) {
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

            focusRuntimeCanvas(canvas, true);
        };

        liveRoot.addEventListener('pointerdown', focusCanvas, true);
        return () => liveRoot.removeEventListener('pointerdown', focusCanvas, true);
    }, [acquireStage2SessionLease, activationService, data?.embedId, data?.hostUnitId, embedModelService, floatingActiveService, focusCoordinator, interactionFlow, releaseStage2SessionLeaseIfActivationDoesNotStick]);

    useEffect(() => {
        const liveRoot = liveRootRef.current;
        const ownerDocument = liveRoot?.ownerDocument;
        if (!liveRoot || !ownerDocument || !data?.embedId) {
            return undefined;
        }

        let releasePointerLeaseTimer: ReturnType<typeof globalThis.setTimeout> | undefined;
        const cancelScheduledPointerLeaseRelease = () => {
            if (releasePointerLeaseTimer == null) {
                return;
            }

            globalThis.clearTimeout(releasePointerLeaseTimer);
            releasePointerLeaseTimer = undefined;
        };
        const releasePointerLease = () => {
            cancelScheduledPointerLeaseRelease();
            pointerInteractionLeaseRef.current?.dispose();
            pointerInteractionLeaseRef.current = undefined;
        };
        const releasePointerLeaseAfterClick = () => {
            cancelScheduledPointerLeaseRelease();
            releasePointerLeaseTimer = globalThis.setTimeout(() => {
                releasePointerLeaseTimer = undefined;
                pointerInteractionLeaseRef.current?.dispose();
                pointerInteractionLeaseRef.current = undefined;
            }, EMBED_CHILD_POINTER_INTERACTION_GRACE_MS);
        };
        const acquireRuntimePointerLease = () => {
            if (floatingActiveService.getStage(data.embedId) !== 'stage2') {
                return;
            }

            releasePointerLease();
            pointerInteractionLeaseRef.current = focusCoordinator.acquireLease({
                embedId: data.embedId,
                role: 'child-editor',
                owner: 'runtime-pointer',
                hostUnitId: data.hostUnitId,
                childUnitId: data.childUnitId,
                childType: data.childType,
            });
        };
        const acquireOwnedPortalPointerLease = (event: PointerEvent) => {
            if (floatingActiveService.getStage(data.embedId) !== 'stage2') {
                return;
            }
            const target = event.target;
            if (target instanceof Node && liveRoot.contains(target)) {
                return;
            }
            const isOwnedChildInteraction = focusCoordinator.containsElement(data.embedId, target, event) ||
                interactionBoundaryService.contains(data.embedId, target, event);
            if (!isOwnedChildInteraction) {
                return;
            }

            releasePointerLease();
            const role = getRuntimeFocusRole(target) ?? 'child-editor';
            pointerInteractionLeaseRef.current = focusCoordinator.acquireLease({
                embedId: data.embedId,
                role: role === 'runtime' || role === 'child-session' || role === 'floating-menu' ? 'child-editor' : role,
                owner: 'runtime-pointer',
                hostUnitId: data.hostUnitId,
                childUnitId: data.childUnitId,
                childType: data.childType,
            });
        };

        liveRoot.addEventListener('pointerdown', acquireRuntimePointerLease, true);
        ownerDocument.addEventListener('pointerdown', acquireOwnedPortalPointerLease, true);
        ownerDocument.addEventListener('pointerup', releasePointerLeaseAfterClick, true);
        ownerDocument.addEventListener('pointercancel', releasePointerLeaseAfterClick, true);

        return () => {
            liveRoot.removeEventListener('pointerdown', acquireRuntimePointerLease, true);
            ownerDocument.removeEventListener('pointerdown', acquireOwnedPortalPointerLease, true);
            ownerDocument.removeEventListener('pointerup', releasePointerLeaseAfterClick, true);
            ownerDocument.removeEventListener('pointercancel', releasePointerLeaseAfterClick, true);
            releasePointerLease();
        };
    }, [data?.childUnitId, data?.embedId, data?.hostUnitId, floatingActiveService, focusCoordinator, interactionBoundaryService]);

    useEffect(() => {
        if (stage !== 'stage2' || interactionFlow !== 'doc-block') {
            return undefined;
        }

        const liveRoot = liveRootRef.current;
        if (!liveRoot) {
            return undefined;
        }

        let retryFrame: FrameHandle | undefined;
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
            if (!shouldAutoFocusRuntimeCanvas(data?.childType)) {
                return;
            }
            const canvas = getCanvas();
            if (!canvas) {
                return;
            }
            if (focusCoordinator.hasBlockingChildFocusLease(data?.embedId, { ignoreOwners: EMBED_STAGE2_RUNTIME_FOCUS_OWNERS })) {
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

        focusRuntime();
        retryFrame = requestFrame(() => {
            retryFrame = undefined;
            focusRuntime();
        });

        return () => {
            if (retryFrame != null) {
                cancelFrame(retryFrame);
                retryFrame = undefined;
            }
        };
    }, [activationService, data?.embedId, data?.hostUnitId, embedModelService, focusCoordinator, interactionFlow, stage]);

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
        const dragPolicy = resolveEmbedFloatInteractionPolicy({
            stage: currentStage,
            interactionFlow,
        });
        if (!dragPolicy.allowHostDragHandle) {
            return;
        }
        floatingActiveService.activate({
            hostUnitId: data.hostUnitId,
            embedId: data.embedId,
            childUnitId: descriptor.childUnitId,
        }, 'stage1');
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
    }, [data?.embedId, data?.hostAnchorId, data?.hostUnitId, embedModelService, floatingActiveService, interactionFlow]);

    useEffect(() => {
        const dragHandle = dragHandleRef.current;
        if (!dragHandle) {
            return undefined;
        }

        dragHandle.addEventListener('pointerdown', keepStageForDragHandle);
        return () => dragHandle.removeEventListener('pointerdown', keepStageForDragHandle);
    }, [keepStageForDragHandle]);

    const interactionPolicy = resolveEmbedFloatInteractionPolicy({ stage, interactionFlow });
    const disableLiveHostPointerEvents = interactionPolicy.disableLiveHostPointerEvents;
    const passThroughInteractionGate = interactionPolicy.passThroughInteractionGate;
    const showDragHandle = interactionPolicy.showHostDragHandle;

    return (
        <div
            ref={containerRef}
            className="
              univer-embed-float-dom univer-relative univer-size-full univer-min-h-0 univer-min-w-0
              univer-overflow-visible univer-bg-transparent
            "
            data-embed-float-dom="true"
            data-embed-float-stage={stage}
            data-embed-id={data?.embedId}
            data-embed-host-unit-id={data?.hostUnitId}
            data-embed-host-anchor-id={data?.hostAnchorId}
            data-embed-child-unit-id={data?.childUnitId}
            data-embed-child-type={data?.childType}
            data-embed-interaction-flow={interactionFlow}
        >
            <div
                className="
                  univer-embed-float-dom__content univer-absolute univer-inset-0 univer-box-border univer-min-h-0
                  univer-min-w-0 univer-overflow-hidden univer-rounded-md
                  after:univer-pointer-events-none after:univer-absolute after:univer-inset-0 after:univer-z-20
                  after:univer-box-border after:univer-rounded-[inherit] after:univer-border after:univer-border-solid
                  after:univer-border-gray-200 after:univer-content-['']
                  dark:after:!univer-border-gray-600
                "
            >
                <div
                    ref={liveRootRef}
                    className="
                      univer-embed-float-dom__live univer-absolute univer-inset-0 univer-size-full univer-min-h-0
                      univer-min-w-0 univer-overflow-hidden univer-bg-transparent
                    "
                    data-embed-float-live="true"
                >
                    <div
                        ref={liveCanvasRootRef}
                        className={[
                            'univer-embed-float-dom__live-canvas univer-absolute univer-inset-0 univer-z-0 univer-size-full univer-min-h-0 univer-min-w-0 univer-overflow-hidden',
                            disableLiveHostPointerEvents && 'univer-pointer-events-none',
                        ].filter(Boolean).join(' ')}
                        {...{ [EMBED_CANVAS_ROOT_ATTRIBUTE]: 'true' }}
                    />
                    <div
                        ref={liveContentRootRef}
                        className={[
                            'univer-embed-float-dom__live-content univer-absolute univer-inset-0 univer-z-[1] univer-size-full univer-min-h-0 univer-min-w-0 univer-overflow-hidden univer-pointer-events-none [&>*]:univer-pointer-events-auto',
                            disableLiveHostPointerEvents && 'univer-pointer-events-none',
                        ].filter(Boolean).join(' ')}
                        {...{ [EMBED_CONTENT_ROOT_ATTRIBUTE]: 'true' }}
                    />
                </div>
                <div
                    ref={gateRef}
                    className={[
                        'univer-embed-float-dom__interaction-gate univer-absolute univer-inset-0 univer-z-10 univer-bg-transparent',
                        passThroughInteractionGate && 'univer-pointer-events-none',
                    ].filter(Boolean).join(' ')}
                    data-embed-float-interaction-gate="true"
                />
            </div>
            <div
                ref={chromeRef}
                className="
                  univer-embed-float-dom__chrome univer-pointer-events-none univer-fixed univer-z-[1000]
                  univer-overflow-visible
                  [&>*]:univer-pointer-events-auto
                "
                data-embed-float-stage={stage}
                data-embed-id={data?.embedId}
            >
                <div
                    ref={overlayRootRef}
                    className="
                      univer-embed-float-dom__overlay univer-pointer-events-none univer-absolute univer-inset-0
                      univer-overflow-visible
                      [&>*]:univer-pointer-events-auto
                    "
                    {...{ [EMBED_OVERLAY_ROOT_ATTRIBUTE]: 'true' }}
                />
                <div
                    ref={popupRootRef}
                    className="
                      univer-embed-float-dom__popup univer-pointer-events-none univer-absolute univer-inset-0
                      univer-overflow-visible
                      [&>*]:univer-pointer-events-auto
                    "
                    {...{ [EMBED_POPUP_ROOT_ATTRIBUTE]: 'true' }}
                />
                <EmbedFloatFullscreenButton
                    hostUnitId={data?.hostUnitId}
                    embedId={data?.embedId}
                />
                <button
                    ref={dragHandleRef}
                    type="button"
                    className={[
                        'univer-embed-float-dom__drag-handle univer-absolute -univer-top-6 univer-left-0 univer-z-[2] univer-h-4 univer-w-6 univer-appearance-none univer-items-center univer-justify-center univer-border-0 univer-bg-transparent univer-p-0 univer-text-gray-500 univer-shadow-none dark:!univer-text-gray-300',
                        showDragHandle ? 'univer-inline-flex univer-cursor-move' : 'univer-hidden',
                    ].filter(Boolean).join(' ')}
                    data-embed-float-drag-handle="true"
                    aria-label="Move embed block"
                >
                    <GripHorizontalIcon
                        aria-hidden="true"
                        className="univer-size-[23px] univer-fill-current"
                    />
                </button>
            </div>
        </div>
    );
}

function resolveChildFromResourceRef(descriptor: IEmbedDescriptor | undefined): { childUnitId: string; childType: UniverInstanceType } | undefined {
    const ref = descriptor?.source.ref;
    if (!ref) {
        return undefined;
    }

    try {
        const parsedRef = typeof ref === 'string' ? parseResourceRef(ref) : ref;
        return {
            childUnitId: parsedRef.unit.selector,
            childType: fromResourceRefUnitType(parsedRef.unit.type),
        };
    } catch {
        return undefined;
    }
}

function isPointInsideFloatBlock(container: HTMLElement, event: PointerEvent): boolean {
    if (isDocsSheetLikeChrome(container)) {
        return isPointInsideDocsSheetLikeFloatBlock(container, event);
    }

    const chromeTopExpansion = isDocsSheetLikeChrome(container) ? 0 : 40;
    const contentRects = [
        container.getBoundingClientRect(),
        container.querySelector<HTMLElement>('.univer-embed-float-dom__content')?.getBoundingClientRect(),
    ].filter((rect): rect is DOMRect => !!rect);
    const chromeRects = [
        document.querySelector<HTMLElement>(`.univer-embed-float-dom__chrome[data-embed-id="${container.dataset.embedId}"]`)?.getBoundingClientRect(),
    ].filter((rect): rect is DOMRect => !!rect);

    return contentRects.some((rect) => event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom) ||
        chromeRects.some((rect) => event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top - chromeTopExpansion &&
            event.clientY <= rect.bottom);
}

function isPointInsideDocsSheetLikeFloatBlock(container: HTMLElement, event: PointerEvent): boolean {
    const embedId = container.dataset.embedId;
    const runtimeRects = [
        container.querySelector<HTMLElement>('.univer-embed-float-dom__live-canvas')?.getBoundingClientRect(),
        container.querySelector<HTMLElement>('.univer-embed-float-dom__live-content')?.getBoundingClientRect(),
    ].filter((rect): rect is DOMRect => !!rect && rect.width > 0 && rect.height > 0);
    const chrome = document.querySelector<HTMLElement>(`.univer-embed-float-dom__chrome[data-embed-id="${embedId}"]`);
    const chromeControlRects = [
        chrome?.querySelector<HTMLElement>('[data-embed-floating-menu="true"]')?.getBoundingClientRect(),
        chrome?.querySelector<HTMLElement>('[data-embed-float-fullscreen-button]')?.getBoundingClientRect(),
        chrome?.querySelector<HTMLElement>('[data-embed-float-drag-handle="true"]')?.getBoundingClientRect(),
    ].filter((rect): rect is DOMRect => !!rect && rect.width > 0 && rect.height > 0);
    const floatingMenuPopupRects = Array.from(document.querySelectorAll<HTMLElement>('[data-embed-floating-menu-popup="true"]'))
        .filter((element) => element.dataset.embedId === embedId)
        .map((element) => element.getBoundingClientRect())
        .filter((rect): rect is DOMRect => rect.width > 0 && rect.height > 0);

    return [...runtimeRects, ...chromeControlRects, ...floatingMenuPopupRects].some((rect) =>
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
    );
}

export function syncRuntimeInteractionVisibility(container: HTMLElement, chrome: HTMLElement | undefined, visible: boolean, stage: 'inactive' | 'stage1' | 'stage2'): void {
    const pointerEvents = visible ? '' : 'none';
    const contentRoot = container.querySelector<HTMLElement>('.univer-embed-float-dom__content');
    const liveRoot = container.querySelector<HTMLElement>('.univer-embed-float-dom__live');
    const liveCanvasRoot = container.querySelector<HTMLElement>('.univer-embed-float-dom__live-canvas');
    const liveContentRoot = container.querySelector<HTMLElement>('.univer-embed-float-dom__live-content');
    const gate = container.querySelector<HTMLElement>('.univer-embed-float-dom__interaction-gate');
    const overlayRoot = chrome?.querySelector<HTMLElement>('[data-embed-overlay-root]');
    const popupRoot = chrome?.querySelector<HTMLElement>('[data-embed-popup-root]');
    overlayRoot?.style.setProperty('pointer-events', 'none');
    popupRoot?.style.setProperty('pointer-events', 'none');

    if (isDocsSheetLikeChrome(container)) {
        contentRoot?.style.setProperty('pointer-events', 'none');
        liveRoot?.style.setProperty('pointer-events', 'none');
        liveCanvasRoot?.style.setProperty('pointer-events', visible ? 'auto' : 'none');
        liveContentRoot?.style.setProperty('pointer-events', 'none');
        gate?.style.setProperty('pointer-events', 'none');
        return;
    }

    contentRoot?.style.removeProperty('pointer-events');
    liveRoot?.style.setProperty('pointer-events', pointerEvents);
    liveCanvasRoot?.style.removeProperty('pointer-events');
    liveContentRoot?.style.removeProperty('pointer-events');
    gate?.style.setProperty('pointer-events', pointerEvents);
}

export function syncChromeControlsVisibility(chrome: HTMLElement | undefined, visible: boolean, dragHandleVisible: boolean, stage: 'inactive' | 'stage1' | 'stage2'): void {
    const allowFullscreenButton = visible && stage !== 'stage2';
    const fullscreenButtonVisibility = allowFullscreenButton ? '' : 'hidden';
    const fullscreenButtonPointerEvents = allowFullscreenButton ? '' : 'none';
    const allowDragHandle = dragHandleVisible && stage === 'stage1';
    const dragHandleVisibility = allowDragHandle ? '' : 'hidden';
    const dragHandlePointerEvents = allowDragHandle ? '' : 'none';
    const menuVisibility = visible && stage === 'stage2' ? '' : 'hidden';
    const fullscreenButton = chrome?.querySelector<HTMLElement>('[data-embed-float-fullscreen-button]');
    const dragHandle = chrome?.querySelector<HTMLElement>('[data-embed-float-drag-handle="true"]');
    const menuLayers = [
        chrome?.querySelector<HTMLElement>('[data-embed-overlay-root]'),
        chrome?.querySelector<HTMLElement>('[data-embed-popup-root]'),
    ];

    fullscreenButton?.style.setProperty('visibility', fullscreenButtonVisibility);
    fullscreenButton?.style.setProperty('pointer-events', fullscreenButtonPointerEvents);
    dragHandle?.style.setProperty('visibility', dragHandleVisibility);
    dragHandle?.style.setProperty('pointer-events', dragHandlePointerEvents);
    menuLayers.forEach((control) => {
        control?.style.setProperty('visibility', menuVisibility);
        control?.style.setProperty('pointer-events', 'none');
        if (stage !== 'stage2') {
            control?.removeAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE);
            control?.querySelectorAll<HTMLElement>(`[${EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE}]`).forEach((element) => {
                element.removeAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE);
            });
        }
    });
}

export function syncDocsSheetLikeChromePageArea(chrome: HTMLElement, chromeRect: DOMRect, pageRect: DOMRect): void {
    const visibleLeft = Math.max(chromeRect.left, pageRect.left);
    const visibleRight = Math.min(chromeRect.right, pageRect.right);
    const left = Math.max(0, visibleLeft - chromeRect.left);
    const width = Math.max(1, visibleRight - visibleLeft || Math.min(pageRect.width, chromeRect.width));

    chrome.style.setProperty('--univer-embed-docs-block-page-left', `${left}px`);
    chrome.style.setProperty('--univer-embed-docs-block-page-width', `${width}px`);
}

function clearDocsSheetLikeChromePageArea(chrome: HTMLElement): void {
    chrome.style.removeProperty('--univer-embed-docs-block-page-left');
    chrome.style.removeProperty('--univer-embed-docs-block-page-width');
}

export function resolveChromeAnchorRect(container: HTMLElement): DOMRect {
    const content = isDocsCustomBlockChrome(container)
        ? container.querySelector<HTMLElement>('.univer-embed-float-dom__content')
        : null;
    const contentRect = content?.getBoundingClientRect();
    if (contentRect && contentRect.width > 0 && contentRect.height > 0) {
        return intersectWithScrollPort(contentRect, container);
    }

    return intersectWithScrollPort(container.getBoundingClientRect(), container);
}

function isDocsSheetLikeChrome(container: HTMLElement): boolean {
    return !!container.closest('[data-embed-docs-custom-block-sheet-like="true"]');
}

function isDocsCustomBlockChrome(container: HTMLElement): boolean {
    return isDocsSheetLikeChrome(container) || !!container.closest('.univer-embed-docs-custom-block');
}

const MIN_DOCS_SHEET_LIKE_CHROME_HEIGHT = 40;
const MIN_DOCS_SHEET_LIKE_RUNTIME_INTERACTION_HEIGHT = 24;
const MIN_EMBED_FLOATING_CHROME_CONTROLS_HEIGHT = MIN_DOCS_SHEET_LIKE_CHROME_HEIGHT;

function intersectWithScrollPort(rect: DOMRect, container: HTMLElement): DOMRect {
    const clippingViewport = findNearestClippingViewport(container, rect);
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

function findNearestClippingViewport(element: HTMLElement, targetRect: DOMRect): HTMLElement | null {
    let current = element.parentElement;
    while (current && current !== document.body && current !== document.documentElement) {
        if (clipsOverflow(current) && !isOwnFloatDomClippingWrapper(current, targetRect)) {
            return current;
        }
        current = current.parentElement;
    }

    return null;
}

function isOwnFloatDomClippingWrapper(element: HTMLElement, targetRect: DOMRect): boolean {
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
        return true;
    }

    return Math.abs(rect.left - targetRect.left) < 1 &&
        Math.abs(rect.top - targetRect.top) < 1 &&
        Math.abs(rect.width - targetRect.width) < 1 &&
        Math.abs(rect.height - targetRect.height) < 1;
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

function isVerticalWheelOrScrollEvent(event: Event | undefined): boolean {
    if (event instanceof WheelEvent) {
        return Math.abs(event.deltaY) >= Math.abs(event.deltaX);
    }

    return event?.type === 'scroll';
}

function isEmbedForwardedWheelEvent(event: Event | undefined): boolean {
    return !!event && (event as { [EMBED_FORWARDED_WHEEL_EVENT]?: WheelEvent })[EMBED_FORWARDED_WHEEL_EVENT] instanceof WheelEvent;
}

function markHostVerticalWheelAttempted(event: WheelEvent): void {
    Object.defineProperty(event, EMBED_HOST_VERTICAL_WHEEL_ATTEMPTED_EVENT, {
        configurable: true,
        value: true,
    });
}

function isHostVerticalWheelAttempted(event: WheelEvent): boolean {
    return Boolean((event as unknown as Record<symbol, boolean>)[EMBED_HOST_VERTICAL_WHEEL_ATTEMPTED_EVENT]);
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

function shouldAutoFocusRuntimeCanvas(childType: UniverInstanceType | undefined): boolean {
    return childType !== UniverInstanceType.UNIVER_SHEET &&
        childType !== UniverInstanceType.UNIVER_DOC &&
        childType !== UniverInstanceType.UNIVER_BASE;
}

export function shouldDeferSheetFloatRuntimeMount(
    descriptor: Pick<IEmbedDescriptor, 'hostType' | 'childType' | 'sourceMeta'> | undefined,
    stage: EmbedFloatingStage
): boolean {
    return shouldDeferEmbedRuntimeMount(descriptor, stage);
}

export function resolveFloatRuntimeMountGate(
    descriptor: Pick<IEmbedDescriptor, 'hostType' | 'childType' | 'sourceMeta'> | undefined,
    stage: EmbedFloatingStage
): 'deferred' | 'ready' {
    return resolveEmbedRuntimeMountGate(descriptor, stage);
}

function isChildEditorOrPopupRuntimeElement(target: EventTarget | null): boolean {
    const role = getRuntimeFocusRole(target);

    return role === 'child-editor' || role === 'child-popup' || role === 'floating-menu';
}

function getRuntimeFocusRole(target: EventTarget | null): EmbedRuntimeFocusRole | undefined {
    if (!(target instanceof HTMLElement)) {
        return undefined;
    }

    const role = target
        .closest<HTMLElement>(`[${EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE}]`)
        ?.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE) as EmbedRuntimeFocusRole | null;

    return isRuntimeFocusRole(role) ? role : undefined;
}

function isRuntimeFocusRole(role: string | null | undefined): role is EmbedRuntimeFocusRole {
    return role === 'runtime' ||
        role === 'child-session' ||
        role === 'child-editor' ||
        role === 'child-popup' ||
        role === 'floating-menu';
}

function isHostFocusSurface(target: HTMLElement): boolean {
    return target.id === 'univer-doc-main-canvas' ||
        target.id.startsWith('__editor_docs-') ||
        target.id.startsWith('univer-doc-selection-container-docs-') ||
        target.closest('#univer-doc-main-canvas, [id^="__editor_docs-"], [id^="univer-doc-selection-container-docs-"]') != null;
}

function blurRuntimeFocusIfOwnedByBlock(embedId: string | undefined, roots: HTMLElement[]): void {
    if (!embedId || roots.length === 0) {
        return;
    }

    const ownerDocument = roots[0].ownerDocument;
    const activeElement = ownerDocument.activeElement;
    if (!(activeElement instanceof HTMLElement)) {
        return;
    }

    const isOwnedRuntimeFocus = roots.some((root) => root.contains(activeElement)) ||
        activeElement.closest(`[${EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}="${embedId}"]`) != null;
    if (isOwnedRuntimeFocus) {
        activeElement.blur();
    }
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
