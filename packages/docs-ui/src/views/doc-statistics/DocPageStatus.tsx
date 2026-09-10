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
import type { IDocumentLayoutProgress, IDocumentSkeletonPage, IScrollObserverParam } from '@univerjs/engine-render';
import type { LocaleKey } from '../../locale/types';
import { DocumentFlavor, fromEventSubject, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { Popup } from '@univerjs/design';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { Documents, IRenderManagerService, PageLayoutType } from '@univerjs/engine-render';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { VIEWPORT_KEY } from '../../basics/docs-view-key';

const SCROLL_SETTLE_DELAY = 120;
const DRAG_TOOLTIP_HIDE_DELAY = 500;

type PageGeometry = Pick<
    IDocumentSkeletonPage,
    'isLayoutPlaceholder' | 'isMaterializationPlaceholder' | 'pageHeight' | 'pageWidth'
>;

type LayoutProgress = Pick<IDocumentLayoutProgress, 'complete' | 'publishedPageCount'>;

interface IDocPageStatus {
    currentPage: number | null;
    totalPages: number | null;
    dragTooltip: {
        left: number;
        page: number;
        top: number;
    } | null;
}

const EMPTY_DOC_PAGE_STATUS: IDocPageStatus = {
    currentPage: null,
    totalPages: null,
    dragTooltip: null,
};

export function resolveDocPageStatus(
    pages: Readonly<PageGeometry[]>,
    viewportCenter: number,
    pageGap: number,
    vertical: boolean,
    progress?: LayoutProgress | null
): Pick<IDocPageStatus, 'currentPage' | 'totalPages'> {
    const totalPages = progress == null || progress.complete ? pages.length : null;
    const accuratePageCount = progress == null || progress.complete
        ? pages.length
        : Math.min(progress.publishedPageCount, pages.length);

    let pageStart = 0;
    for (let pageIndex = 0; pageIndex < accuratePageCount; pageIndex++) {
        const page = pages[pageIndex];
        const pageExtent = vertical ? page.pageHeight : page.pageWidth;
        if (viewportCenter <= pageStart + pageExtent) {
            const accurate = !page.isLayoutPlaceholder && !page.isMaterializationPlaceholder;
            return {
                currentPage: accurate ? pageIndex + 1 : null,
                totalPages,
            };
        }
        pageStart += pageExtent + pageGap;
    }

    return { currentPage: null, totalPages };
}

export function DocPageStatus() {
    const instanceService = useDependency(IUniverInstanceService);
    const localeService = useDependency(LocaleService);
    const renderManagerService = useDependency(IRenderManagerService);
    const currentDoc = useObservable(useMemo(
        () => instanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC),
        [instanceService]
    ));
    const renderer = currentDoc ? renderManagerService.getRenderUnitById(currentDoc.getUnitId()) : null;
    const skeletonManager = renderer?.with(DocSkeletonManagerService);
    const skeleton = useObservable(
        skeletonManager?.currentSkeleton$ ?? null,
        skeletonManager?.getSkeleton() ?? null,
        false,
        [skeletonManager]
    );
    const isTraditional = currentDoc?.getDocumentStyle().documentFlavor === DocumentFlavor.TRADITIONAL;
    const canShowPageStatus = isTraditional && renderer != null && skeleton != null && renderer.mainComponent instanceof Documents;
    const [state, setState] = useState<IDocPageStatus>(EMPTY_DOC_PAGE_STATUS);
    const scrollSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const tooltipHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const viewport = renderer?.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        const docsComponent = renderer?.mainComponent;
        if (
            !canShowPageStatus ||
            renderer == null ||
            skeleton == null ||
            viewport == null ||
            !(docsComponent instanceof Documents)
        ) {
            return;
        }

        const readPageStatus = () => {
            const pages = skeleton.getSkeletonData()?.pages ?? [];
            const viewBound = viewport.calcViewportInfo().viewBound;
            const {
                docsLeft,
                docsTop,
                pageLayoutType = PageLayoutType.VERTICAL,
                pageMarginLeft,
                pageMarginTop,
            } = docsComponent.getOffsetConfig();
            const vertical = pageLayoutType !== PageLayoutType.HORIZONTAL;
            const viewportCenter = vertical
                ? (viewBound.top + viewBound.bottom) / 2 - docsTop
                : (viewBound.left + viewBound.right) / 2 - docsLeft;

            return resolveDocPageStatus(
                pages,
                viewportCenter,
                vertical ? pageMarginTop : pageMarginLeft,
                vertical,
                skeleton.getLayoutProgress() ?? null
            );
        };

        const updateFooter = () => {
            const pageStatus = readPageStatus();
            setState((current) => {
                if (
                    current.currentPage === pageStatus.currentPage &&
                    current.totalPages === pageStatus.totalPages
                ) {
                    return current;
                }
                return { ...current, ...pageStatus };
            });
        };
        const scheduleFooterUpdate = () => {
            if (scrollSettleTimerRef.current != null) {
                clearTimeout(scrollSettleTimerRef.current);
            }
            scrollSettleTimerRef.current = setTimeout(updateFooter, SCROLL_SETTLE_DELAY);
        };
        const readTooltipPosition = (page: number, scrollY: number) => {
            const scrollBar = viewport.getScrollBar();
            const thumb = scrollBar?.verticalThumbRect;
            const canvas = renderer.engine.getCanvasElement();
            if (!scrollBar?.hasVerticalThumb() || thumb == null || canvas == null) {
                return null;
            }
            const canvasRect = canvas.getBoundingClientRect();
            const scaleX = renderer.engine.width > 0 ? canvasRect.width / renderer.engine.width : 1;
            const scaleY = renderer.engine.height > 0 ? canvasRect.height / renderer.engine.height : 1;
            return {
                page,
                left: canvasRect.left + (viewport.left + thumb.left) * scaleX - 8,
                top: canvasRect.top + (viewport.top + scrollY + scrollBar.verticalThumbSize / 2) * scaleY,
            };
        };
        const updateDragTooltip = (param: IScrollObserverParam) => {
            const page = readPageStatus().currentPage;
            const dragTooltip = page == null ? null : readTooltipPosition(page, param.scrollY);
            setState((current) => ({ ...current, dragTooltip }));
        };
        const hideDragTooltipLater = () => {
            if (tooltipHideTimerRef.current != null) {
                clearTimeout(tooltipHideTimerRef.current);
            }
            tooltipHideTimerRef.current = setTimeout(() => {
                setState((current) => current.dragTooltip == null ? current : { ...current, dragTooltip: null });
            }, DRAG_TOOLTIP_HIDE_DELAY);
        };

        scheduleFooterUpdate();
        const scrollSubscription = fromEventSubject(viewport.onScrollAfter$).subscribe((param) => {
            if (param.isBarDragging || param.isBarDragEnd) {
                if (tooltipHideTimerRef.current != null) {
                    clearTimeout(tooltipHideTimerRef.current);
                    tooltipHideTimerRef.current = null;
                }
                updateDragTooltip(param);
                if (param.isBarDragEnd) {
                    hideDragTooltipLater();
                    scheduleFooterUpdate();
                }
                return;
            }
            scheduleFooterUpdate();
        });
        const progressSubscription = skeleton.layoutProgress$.subscribe(updateFooter);
        const materializedSubscription = skeleton.layoutPageMaterialized$.subscribe(updateFooter);

        return () => {
            scrollSubscription.unsubscribe();
            progressSubscription.unsubscribe();
            materializedSubscription.unsubscribe();
            if (scrollSettleTimerRef.current != null) {
                clearTimeout(scrollSettleTimerRef.current);
                scrollSettleTimerRef.current = null;
            }
            if (tooltipHideTimerRef.current != null) {
                clearTimeout(tooltipHideTimerRef.current);
                tooltipHideTimerRef.current = null;
            }
        };
    }, [canShowPageStatus, renderer, skeleton]);

    if (!canShowPageStatus) {
        return null;
    }

    let pageLabel: string | null = null;
    if (state.currentPage != null) {
        if (state.totalPages == null) {
            pageLabel = localeService.t<LocaleKey>('docs-ui.statistics.currentPage', String(state.currentPage));
        } else {
            pageLabel = localeService.t<LocaleKey>(
                'docs-ui.statistics.currentPageOfTotal',
                String(state.currentPage),
                String(state.totalPages)
            );
        }
    }

    return (
        <>
            {pageLabel && <span className="univer-tabular-nums">{pageLabel}</span>}
            {state.dragTooltip && (
                <Popup visible overflowVisible offset={[state.dragTooltip.left, state.dragTooltip.top]}>
                    <div
                        data-testid="doc-scroll-page-tooltip"
                        className={`
                          univer-pointer-events-none univer-absolute univer-whitespace-nowrap univer-rounded
                          univer-border univer-border-gray-300 univer-bg-white univer-px-2 univer-py-1 univer-text-xs
                          univer-font-medium univer-tabular-nums univer-text-gray-700 univer-shadow-md
                          dark:!univer-border-gray-600 dark:!univer-bg-gray-800 dark:!univer-text-gray-200
                        `}
                        style={{ transform: 'translate(-100%, -50%)' }}
                    >
                        {localeService.t<LocaleKey>(
                            'docs-ui.statistics.currentPage',
                            String(state.dragTooltip.page)
                        )}
                    </div>
                </Popup>
            )}
        </>
    );
}
