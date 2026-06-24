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

import type { DocumentDataModel } from '@univerjs/core';
import type { IEmbedChildContainerContext, IEmbedFloatDomData, IEmbedPassiveViewportWheelContext } from '@univerjs/embed-ui';
import type { CSSProperties } from 'react';
import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { EmbedFloatDomRenderer, scrollSceneViewportPassive } from '@univerjs/embed-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useDependency } from '@univerjs/ui';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { VIEWPORT_KEY } from './basics/docs-view-key';
import { SetDocZoomRatioOperation } from './commands/operations/set-doc-zoom-ratio.operation';
import { createDefaultDocsTableLikeCustomBlockBleedViewport, resolveDocsTableLikeCustomBlockBleedViewport, resolveDocsTableLikeCustomBlockContentHeight, resolveDocsTableLikeCustomBlockContentWidth } from './embed-docs-custom-block-bleed';
import { scrollDocsTableLikeCustomBlockLive } from './embed-docs-custom-block-scroll';
import { DocSelectionRenderService } from './services/selection/doc-selection-render.service';

const SHEET_LIKE_CUSTOM_BLOCK_DEFAULT_CONTENT_HEIGHT = 480;

export interface IEmbedDocsCustomBlockRuntimeProps {
    customBlockRenderViewport?: {
        bleedLeft?: number;
        bleedWidth?: number;
        contentHeight?: number;
        contentWidth?: number;
        height?: number;
        viewportHeight?: number;
    };
}

export interface IDocsTableLikeCustomBlockWheelHandlerOptions {
    getLive: () => HTMLElement | null;
    getMaxScrollLeft?: () => number | undefined;
}

export function EmbedDocsCustomBlockRenderer(props: { data?: IEmbedFloatDomData } & IEmbedDocsCustomBlockRuntimeProps) {
    ensureEmbedDocsCustomBlockStyles();

    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const renderManagerService = useDependency(IRenderManagerService);
    const data = normalizeFloatDomData(props.data);
    const hostUnitId = data?.hostUnitId;
    const resolvedHostUnitId = hostUnitId ?? univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)?.getUnitId();
    const rootRef = useRef<HTMLDivElement>(null);
    const [viewport, setViewport] = useState(() => createDefaultDocsTableLikeCustomBlockBleedViewport());
    const viewportRef = useRef(viewport);
    const sheetLike = isSheetLikeDocsCustomBlock(data);
    const customBlockRenderViewport = props.customBlockRenderViewport;
    const renderViewportBleedLeft = customBlockRenderViewport?.bleedLeft;
    const renderViewportBleedWidth = customBlockRenderViewport?.bleedWidth;
    const renderViewportContentWidth = customBlockRenderViewport?.contentWidth;
    viewportRef.current = viewport;

    useEffect(() => {
        if (!hostUnitId) {
            return undefined;
        }

        const disposables: Array<() => void> = [];
        const refresh = () => {
            const documentModel = univerInstanceService.getUnit<DocumentDataModel>(hostUnitId, UniverInstanceType.UNIVER_DOC);
            const zoomRatio = documentModel?.zoomRatio;
            if (typeof zoomRatio !== 'number') {
                return;
            }

            commandService.syncExecuteCommand(SetDocZoomRatioOperation.id, { unitId: hostUnitId, zoomRatio });
        };
        const schedule = (callback: () => void) => {
            if (typeof requestAnimationFrame === 'function') {
                const frame = requestAnimationFrame(callback);
                disposables.push(() => cancelAnimationFrame(frame));
                return;
            }

            const timer = setTimeout(callback, 16);
            disposables.push(() => clearTimeout(timer));
        };
        const scheduleDelay = (delay: number) => {
            const timer = setTimeout(refresh, delay);
            disposables.push(() => clearTimeout(timer));
        };

        refresh();
        schedule(refresh);
        schedule(() => schedule(refresh));
        scheduleDelay(120);
        scheduleDelay(500);

        return () => {
            disposables.forEach((dispose) => dispose());
        };
    }, [commandService, hostUnitId, univerInstanceService]);

    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root || !sheetLike || typeof window === 'undefined') {
            return undefined;
        }

        let frame: number | undefined;
        const sync = () => {
            frame = undefined;
            const rect = root.getBoundingClientRect();
            const contentWidth = resolveDocsTableLikeCustomBlockRuntimeContentWidth(
                renderViewportContentWidth,
                () => measureRuntimeContentWidth(root, rect.width)
            );
            const next = resolveDocsTableLikeCustomBlockBleedViewport(root, contentWidth, {
                bleedLeft: renderViewportBleedLeft,
                bleedWidth: renderViewportBleedWidth,
            });

            setViewport((previous) => (
                Math.abs(previous.bleedLeft - next.bleedLeft) < 0.5 &&
                Math.abs(previous.bleedRight - next.bleedRight) < 0.5 &&
                Math.abs(previous.bleedWidth - next.bleedWidth) < 0.5 &&
                Math.abs(previous.contentWidth - next.contentWidth) < 0.5 &&
                Math.abs(previous.virtualWidth - next.virtualWidth) < 0.5
                    ? previous
                    : next
            ));
        };
        const schedule = () => {
            if (frame != null) {
                return;
            }
            frame = window.requestAnimationFrame(sync);
        };
        const scheduleFromScroll = (event: Event) => {
            if (!shouldSyncDocsTableLikeCustomBlockBleedOnScroll(root, event.target)) {
                return;
            }

            schedule();
        };

        sync();
        const resizeObserver = new ResizeObserver(schedule);
        resizeObserver.observe(root);
        window.addEventListener('resize', schedule);
        window.addEventListener('scroll', scheduleFromScroll, true);

        return () => {
            if (frame != null) {
                window.cancelAnimationFrame(frame);
            }
            resizeObserver.disconnect();
            window.removeEventListener('resize', schedule);
            window.removeEventListener('scroll', scheduleFromScroll, true);
        };
    }, [
        renderViewportBleedLeft,
        renderViewportBleedWidth,
        renderViewportContentWidth,
        sheetLike,
    ]);

    const contentHeight = sheetLike
        ? resolveDocsTableLikeCustomBlockRuntimeContentHeight(props.customBlockRenderViewport?.contentHeight)
        : resolveDocsTableLikeCustomBlockContentHeight(props.customBlockRenderViewport?.contentHeight, 1);
    const viewportHeight = resolveDocsCustomBlockRuntimeViewportHeight({
        contentHeight,
        sheetLike,
        viewportHeight: props.customBlockRenderViewport?.viewportHeight,
    });
    const style = sheetLike
        ? ({
            '--univer-embed-docs-block-bleed-left': `${viewport.bleedLeft}px`,
            '--univer-embed-docs-block-bleed-width': `${viewport.bleedWidth}px`,
            '--univer-embed-docs-block-content-height': `${contentHeight}px`,
            '--univer-embed-docs-block-content-width': `${viewport.contentWidth}px`,
            '--univer-embed-docs-block-viewport-height': `${viewportHeight}px`,
            '--univer-embed-docs-block-virtual-width': `${viewport.virtualWidth}px`,
        } as CSSProperties & Record<string, string>)
        : undefined;
    const handleHostWheel = useCallback((event: WheelEvent, context: IEmbedChildContainerContext) => {
        const scene = renderManagerService.getRenderById(context.hostUnitId)?.scene;
        return scrollSceneViewportPassive(
            { ...context, event, source: 'wheel', stage: 'stage2' },
            scene?.getViewport(VIEWPORT_KEY.VIEW_MAIN),
            scene
        );
    }, [renderManagerService]);

    const scrollHostViewportByWheel = useCallback((event: WheelEvent) => {
        if (!resolvedHostUnitId) {
            return false;
        }

        const scene = renderManagerService.getRenderById(resolvedHostUnitId)?.scene;
        return scrollSceneViewportPassive(
            { event, source: 'wheel', stage: 'stage2' } as IEmbedPassiveViewportWheelContext,
            scene?.getViewport(VIEWPORT_KEY.VIEW_MAIN),
            scene
        );
    }, [renderManagerService, resolvedHostUnitId]);
    const handleRuntimeStageEnter = useCallback((stage: 'inactive' | 'stage1' | 'stage2') => {
        blurHostDocSelectionWhenEmbedRuntimeEntersStage(renderManagerService, resolvedHostUnitId, stage);
    }, [renderManagerService, resolvedHostUnitId]);

    useEffect(() => {
        const root = rootRef.current;
        if (!root || !sheetLike) {
            return undefined;
        }

        const onWheel = (event: WheelEvent) => {
            if (!isDominantVerticalWheel(event)) {
                return;
            }

            const stage = root.querySelector<HTMLElement>('[data-embed-float-dom]')?.dataset.embedFloatStage;
            if (stage !== 'stage2') {
                return;
            }

            if (!scrollHostViewportByWheel(event)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        };

        root.addEventListener('wheel', onWheel, { capture: true, passive: false });
        return () => root.removeEventListener('wheel', onWheel, { capture: true });
    }, [scrollHostViewportByWheel, sheetLike]);

    return (
        <div
            ref={rootRef}
            className="univer-embed-docs-custom-block"
            data-embed-docs-custom-block="true"
            data-embed-docs-custom-block-child-type={data?.childType == null ? undefined : String(data.childType)}
            data-embed-docs-custom-block-sheet-like={sheetLike ? 'true' : undefined}
            style={style}
        >
            <EmbedFloatDomRenderer
                {...props}
                interactionFlow="doc-block"
                onHostWheel={sheetLike ? handleHostWheel : undefined}
                onRuntimeStageEnter={handleRuntimeStageEnter}
                syncHostVerticalScroll={sheetLike}
            />
        </div>
    );
}

export function blurHostDocSelectionWhenEmbedRuntimeEntersStage(
    renderManagerService: IRenderManagerService,
    hostUnitId: string | undefined,
    stage: 'inactive' | 'stage1' | 'stage2'
): void {
    if (stage !== 'stage2' || !hostUnitId) {
        return;
    }

    renderManagerService.getRenderById(hostUnitId)
        ?.with(DocSelectionRenderService)
        ?.blur();
}

export function createDocsTableLikeCustomBlockWheelHandler(options: IDocsTableLikeCustomBlockWheelHandlerOptions): (event: WheelEvent) => void {
    return (event: WheelEvent) => {
        const live = options.getLive();
        if (!live || event.ctrlKey || event.metaKey) {
            return;
        }

        if (scrollDocsTableLikeCustomBlockLive(event, live, { maxScrollLeft: options.getMaxScrollLeft?.() })) {
            event.preventDefault();
            event.stopPropagation();
        }
    };
}

export function resolveDocsTableLikeCustomBlockRuntimeContentHeight(authoritativeContentHeight: number | undefined): number {
    return resolveDocsTableLikeCustomBlockContentHeight(authoritativeContentHeight, SHEET_LIKE_CUSTOM_BLOCK_DEFAULT_CONTENT_HEIGHT);
}

export function resolveDocsCustomBlockRuntimeViewportHeight(params: {
    contentHeight: number;
    sheetLike: boolean;
    viewportHeight?: number;
}): number {
    return resolveDocsTableLikeCustomBlockContentHeight(params.viewportHeight, params.contentHeight);
}

export function resolveDocsTableLikeCustomBlockRuntimeContentWidth(
    authoritativeContentWidth: number | undefined,
    measureFallback: () => number
): number {
    if (Number.isFinite(authoritativeContentWidth) && (authoritativeContentWidth ?? 0) > 0) {
        return authoritativeContentWidth!;
    }

    return resolveDocsTableLikeCustomBlockContentWidth(undefined, measureFallback());
}

export function shouldSyncDocsTableLikeCustomBlockBleedOnScroll(root: HTMLElement, target: EventTarget | null): boolean {
    if (target instanceof Node && root.contains(target)) {
        return false;
    }

    return true;
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

function isSheetLikeDocsCustomBlock(data: IEmbedFloatDomData | undefined): boolean {
    return data?.childType === UniverInstanceType.UNIVER_SHEET || data?.childType === UniverInstanceType.UNIVER_BASE;
}

function isDominantVerticalWheel(event: WheelEvent): boolean {
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
        return false;
    }

    return Math.abs(event.deltaY) > Math.abs(event.deltaX);
}

function measureRuntimeContentWidth(root: HTMLElement, fallbackWidth: number): number {
    const liveContent = root.querySelector<HTMLElement>('.univer-embed-float-dom__live-content');
    const liveCanvas = root.querySelector<HTMLElement>('.univer-embed-float-dom__live-canvas');
    const fallback = Math.max(1, fallbackWidth);
    const candidates = [fallback];

    collectElementContentWidth(liveContent, candidates);
    collectElementContentWidth(liveCanvas, candidates);

    return Math.max(...candidates.filter((value) => Number.isFinite(value) && value > 0));
}

function collectElementContentWidth(element: HTMLElement | null, candidates: number[]): void {
    if (!element) {
        return;
    }

    candidates.push(element.scrollWidth, element.offsetWidth, element.getBoundingClientRect().width);

    for (const child of Array.from(element.children)) {
        if (!(child instanceof HTMLElement)) {
            continue;
        }

        const childRect = child.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        candidates.push(
            child.scrollWidth,
            child.offsetWidth,
            childRect.right - elementRect.left
        );
    }
}

function ensureEmbedDocsCustomBlockStyles(): void {
    if (typeof document === 'undefined' || document.getElementById('univer-embed-docs-custom-block-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'univer-embed-docs-custom-block-styles';
    style.textContent = `
.univer-embed-docs-custom-block {
    position: relative;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: visible;
}
.univer-embed-docs-custom-block[data-embed-docs-custom-block-sheet-like="true"] {
    contain: layout style;
    height: var(--univer-embed-docs-block-content-height, 100%);
    min-height: var(--univer-embed-docs-block-content-height, 100%);
}
.univer-embed-docs-custom-block[data-embed-docs-custom-block-sheet-like="true"] .univer-embed-float-dom__content {
    left: calc(var(--univer-embed-docs-block-bleed-left, 0px) * -1);
    width: var(--univer-embed-docs-block-bleed-width, 100%);
    height: var(--univer-embed-docs-block-viewport-height, 100%);
    overflow: hidden;
    transform: translateY(var(--univer-embed-docs-scroll-offset, 0px));
}
.univer-embed-docs-custom-block[data-embed-docs-custom-block-sheet-like="true"] .univer-embed-float-dom__live {
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}
.univer-embed-docs-custom-block[data-embed-docs-custom-block-sheet-like="true"] .univer-embed-float-dom__live::before {
    display: none;
    width: var(--univer-embed-docs-block-virtual-width, 100%);
    height: var(--univer-embed-docs-block-content-height, 1px);
    pointer-events: none;
    content: '';
}
.univer-embed-docs-custom-block[data-embed-docs-custom-block-sheet-like="true"] .univer-embed-float-dom__live-canvas,
.univer-embed-docs-custom-block[data-embed-docs-custom-block-sheet-like="true"] .univer-embed-float-dom__live-content {
    left: var(--univer-embed-docs-block-bleed-left, 0px);
    width: var(--univer-embed-docs-block-bleed-width, 100%);
    height: var(--univer-embed-docs-block-viewport-height, 100%);
    min-height: var(--univer-embed-docs-block-viewport-height, 100%);
}
`;
    document.head.appendChild(style);
}
