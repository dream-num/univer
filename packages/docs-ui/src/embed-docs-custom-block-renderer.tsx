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
import type { EmbedFloatDomData } from '@univerjs/embed-ui';
import type { CSSProperties } from 'react';
import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { EmbedFloatDomRenderer } from '@univerjs/embed-ui';
import { useDependency } from '@univerjs/ui';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SetDocZoomRatioOperation } from './commands/operations/set-doc-zoom-ratio.operation';
import { createDefaultDocsTableLikeCustomBlockBleedViewport, resolveDocsTableLikeCustomBlockBleedViewport } from './embed-docs-custom-block-bleed';
import { scrollDocsTableLikeCustomBlockLive } from './embed-docs-custom-block-scroll';

export function EmbedDocsCustomBlockRenderer(props: { data?: EmbedFloatDomData }) {
    ensureEmbedDocsCustomBlockStyles();

    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const data = normalizeFloatDomData(props.data);
    const hostUnitId = data?.hostUnitId;
    const rootRef = useRef<HTMLDivElement>(null);
    const liveRef = useRef<HTMLElement | null>(null);
    const [viewport, setViewport] = useState(() => createDefaultDocsTableLikeCustomBlockBleedViewport());
    const sheetLike = isSheetLikeDocsCustomBlock(data);

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
            const contentWidth = measureRuntimeContentWidth(root, rect.width);
            const next = resolveDocsTableLikeCustomBlockBleedViewport(root, contentWidth);

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

        sync();
        const resizeObserver = new ResizeObserver(schedule);
        resizeObserver.observe(root);
        window.addEventListener('resize', schedule);
        window.addEventListener('scroll', schedule, true);

        return () => {
            if (frame != null) {
                window.cancelAnimationFrame(frame);
            }
            resizeObserver.disconnect();
            window.removeEventListener('resize', schedule);
            window.removeEventListener('scroll', schedule, true);
        };
    }, [sheetLike]);

    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root || !sheetLike) {
            liveRef.current = null;
            return undefined;
        }

        const findLiveRoot = () => {
            liveRef.current = root.querySelector<HTMLElement>('.univer-embed-float-dom__live');
        };
        findLiveRoot();

        const observer = new MutationObserver(findLiveRoot);
        observer.observe(root, { childList: true, subtree: true });

        return () => {
            liveRef.current = null;
            observer.disconnect();
        };
    }, [sheetLike]);

    useEffect(() => {
        const root = rootRef.current;
        if (!root || !sheetLike) {
            return undefined;
        }

        const onWheel = (event: WheelEvent) => {
            const live = liveRef.current;
            if (!live || (event.ctrlKey || event.metaKey)) {
                return;
            }

            if (scrollDocsTableLikeCustomBlockLive(event, live)) {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        root.addEventListener('wheel', onWheel, { passive: false });
        return () => root.removeEventListener('wheel', onWheel);
    }, [sheetLike]);

    const style = sheetLike
        ? ({
            '--univer-embed-docs-block-bleed-left': `${viewport.bleedLeft}px`,
            '--univer-embed-docs-block-bleed-width': `${viewport.bleedWidth}px`,
            '--univer-embed-docs-block-content-width': `${viewport.contentWidth}px`,
            '--univer-embed-docs-block-virtual-width': `${viewport.virtualWidth}px`,
        } as CSSProperties & Record<string, string>)
        : undefined;

    return (
        <div
            ref={rootRef}
            className="univer-embed-docs-custom-block"
            data-embed-docs-custom-block="true"
            data-embed-docs-custom-block-child-type={data?.childType == null ? undefined : String(data.childType)}
            data-embed-docs-custom-block-sheet-like={sheetLike ? 'true' : undefined}
            style={style}
        >
            <EmbedFloatDomRenderer {...props} />
        </div>
    );
}

function normalizeFloatDomData(data: unknown): EmbedFloatDomData | undefined {
    if (!data || typeof data !== 'object') {
        return undefined;
    }

    const candidate = data as Partial<EmbedFloatDomData>;
    if (candidate.version !== 1 || !candidate.embedId || !candidate.hostAnchorId) {
        return undefined;
    }

    return candidate as EmbedFloatDomData;
}

function isSheetLikeDocsCustomBlock(data: EmbedFloatDomData | undefined): boolean {
    return data?.childType === UniverInstanceType.UNIVER_SHEET || data?.childType === UniverInstanceType.UNIVER_BASE;
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
}
.univer-embed-docs-custom-block[data-embed-docs-custom-block-sheet-like="true"] .univer-embed-float-dom__content {
    overflow: visible;
}
.univer-embed-docs-custom-block[data-embed-docs-custom-block-sheet-like="true"] .univer-embed-float-dom__live {
    left: calc(var(--univer-embed-docs-block-bleed-left, 0px) * -1);
    width: var(--univer-embed-docs-block-bleed-width, 100%);
    overflow-x: auto;
    overflow-y: auto;
    scrollbar-width: thin;
}
.univer-embed-docs-custom-block[data-embed-docs-custom-block-sheet-like="true"] .univer-embed-float-dom__live::before {
    display: block;
    width: var(--univer-embed-docs-block-virtual-width, 100%);
    height: 1px;
    pointer-events: none;
    content: '';
}
.univer-embed-docs-custom-block[data-embed-docs-custom-block-sheet-like="true"] .univer-embed-float-dom__live-canvas,
.univer-embed-docs-custom-block[data-embed-docs-custom-block-sheet-like="true"] .univer-embed-float-dom__live-content {
    left: var(--univer-embed-docs-block-bleed-left, 0px);
    width: var(--univer-embed-docs-block-content-width, 100%);
}
`;
    document.head.appendChild(style);
}
