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

import type { IDocumentSkeletonPage } from '../../basics/i-document-skeleton-cached';
import type { IViewportInfo } from '../../basics/vector2';
import type { UniverRenderingContext } from '../../context';
import type { IPathProps } from '../../shape';
import type { IDocumentsConfig } from './doc-component';
import type { DocumentSkeleton } from './layout/doc-skeleton';
import { DocumentFlavor } from '@univerjs/core';
import { Path, Rect } from '../../shape';
import { DocComponent } from './doc-component';
import { Liquid } from './liquid';

const PAGE_STROKE_COLOR = 'gray.200';
const PAGE_FILL_COLOR = 'gray.0';
const UNSPECIFIED_PAGE_FILL_COLOR = 'gray.50';
const DOCS_WORKSPACE_FILL_COLOR = 'gray.100';
const MARGIN_STROKE_COLOR = 'gray.300';
const SKELETON_BASE_COLOR = 'rgba(148, 163, 184, 0.18)';
const SKELETON_HIGHLIGHT_COLOR = 'rgba(255, 255, 255, 0.5)';
const SKELETON_LINE_HEIGHT = 12;
const SKELETON_LINE_GAP = 14;

export class DocBackground extends DocComponent {
    private _drawLiquid: Liquid;
    private _backgroundFillColor?: string;
    private _pageFillColor?: string;
    private _pageStrokeColor?: string;
    private _marginStrokeColor?: string;
    private _pageBackgroundSource?: string;
    private _pageBackgroundImage?: HTMLImageElement;

    constructor(oKey: string, documentSkeleton?: DocumentSkeleton, config?: IDocumentsConfig) {
        super(oKey, documentSkeleton, config);

        this._drawLiquid = new Liquid();
        this._backgroundFillColor = config?.backgroundFillColor;
        this._pageFillColor = config?.pageFillColor;
        this._pageStrokeColor = config?.pageStrokeColor;
        this._marginStrokeColor = config?.marginStrokeColor;

        this.makeDirty(true);
    }

    static create(oKey: string, documentSkeleton?: DocumentSkeleton, config?: IDocumentsConfig) {
        return new DocBackground(oKey, documentSkeleton, config);
    }

    setFillColors(backgroundFillColor?: string, pageFillColor?: string, pageStrokeColor?: string, marginStrokeColor?: string) {
        if (
            this._backgroundFillColor === backgroundFillColor &&
            this._pageFillColor === pageFillColor &&
            this._pageStrokeColor === pageStrokeColor &&
            this._marginStrokeColor === marginStrokeColor
        ) {
            return;
        }

        this._backgroundFillColor = backgroundFillColor;
        this._pageFillColor = pageFillColor;
        this._pageStrokeColor = pageStrokeColor;
        this._marginStrokeColor = marginStrokeColor;
        this.makeDirty(true);
    }

    override draw(ctx: UniverRenderingContext, bounds?: IViewportInfo) {
        const skeletonData = this.getSkeleton()?.getSkeletonData();
        const docDataModel = this.getSkeleton()?.getViewModel().getDataModel();

        if (skeletonData == null || docDataModel == null) {
            return;
        }

        const { documentFlavor, background } = docDataModel.getSnapshot().documentStyle;

        const workspaceFill = this._backgroundFillColor ?? (documentFlavor === DocumentFlavor.MODERN ? PAGE_FILL_COLOR : DOCS_WORKSPACE_FILL_COLOR);
        this._drawWorkspaceBackground(ctx, workspaceFill, bounds);

        if (documentFlavor === DocumentFlavor.MODERN) {
            this._drawContinuousLayoutSkeleton(ctx, bounds);
            return;
        }

        this._drawLiquid.reset();

        const { pages } = skeletonData;

        // broadcasting the pageTop and pageLeft for each page in the document with multiple pages.
        let pageTop = 0;
        let pageLeft = 0;

        for (let i = 0, len = pages.length; i < len; i++) {
            const page = pages[i];

            if (this.isSkipByDiffBounds(page, pageTop, pageLeft, bounds)) {
                const { x, y } = this._drawLiquid.translatePage(
                    page,
                    this.pageLayoutType,
                    this.pageMarginLeft,
                    this.pageMarginTop
                );
                pageLeft += x;
                pageTop += y;

                continue;
            }

            // Draw background and margin identifier.
            const { width, pageWidth, height, pageHeight, originMarginTop, originMarginBottom, marginLeft, marginRight } = page;

            ctx.save();
            ctx.translate(pageLeft - 0.5, pageTop - 0.5);
            const backgroundOptions = {
                width: pageWidth ?? width,
                height: pageHeight ?? height,
                strokeWidth: 1,
                stroke: this._pageStrokeColor ?? PAGE_STROKE_COLOR,
                fill: this._pageFillColor ?? (documentFlavor === DocumentFlavor.TRADITIONAL ? PAGE_FILL_COLOR : UNSPECIFIED_PAGE_FILL_COLOR),
                zIndex: 3,
            };

            Rect.drawWith(ctx, backgroundOptions);
            this._drawPageBackgroundImage(ctx, background?.source, pageWidth ?? width, pageHeight ?? height);

            const IDENTIFIER_WIDTH = 15;
            const marginIdentification: IPathProps = {
                dataArray: [{
                    command: 'M',
                    points: [marginLeft - IDENTIFIER_WIDTH, originMarginTop],
                }, {
                    command: 'L',
                    points: [marginLeft, originMarginTop],
                }, {
                    command: 'L',
                    points: [marginLeft, originMarginTop - IDENTIFIER_WIDTH],
                }, {
                    command: 'M',
                    points: [pageWidth - marginRight + IDENTIFIER_WIDTH, originMarginTop],
                }, {
                    command: 'L',
                    points: [pageWidth - marginRight, originMarginTop],
                }, {
                    command: 'L',
                    points: [pageWidth - marginRight, originMarginTop - IDENTIFIER_WIDTH],
                }, {
                    command: 'M',
                    points: [marginLeft - IDENTIFIER_WIDTH, pageHeight - originMarginBottom],
                }, {
                    command: 'L',
                    points: [marginLeft, pageHeight - originMarginBottom],
                }, {
                    command: 'L',
                    points: [marginLeft, pageHeight - originMarginBottom + IDENTIFIER_WIDTH],
                }, {
                    command: 'M',
                    points: [pageWidth - marginRight + IDENTIFIER_WIDTH, pageHeight - originMarginBottom],
                }, {
                    command: 'L',
                    points: [pageWidth - marginRight, pageHeight - originMarginBottom],
                }, {
                    command: 'L',
                    points: [pageWidth - marginRight, pageHeight - originMarginBottom + IDENTIFIER_WIDTH],
                }] as unknown as IPathProps['dataArray'],
                strokeWidth: 1.5,
                stroke: this._marginStrokeColor ?? MARGIN_STROKE_COLOR,
            };
            Path.drawWith(ctx, marginIdentification);
            ctx.restore();

            if (page.isLayoutPlaceholder || page.isMaterializationPlaceholder) {
                const contentWidth = Math.max(80, pageWidth - marginLeft - marginRight);
                const contentHeight = Math.max(160, pageHeight - originMarginTop - originMarginBottom - 48);
                this._drawSkeletonLines(
                    ctx,
                    pageLeft + marginLeft,
                    pageTop + originMarginTop + 24,
                    contentWidth,
                    contentHeight,
                    bounds
                );
            }

            const { x, y } = this._drawLiquid.translatePage(
                page,
                this.pageLayoutType,
                this.pageMarginLeft,
                this.pageMarginTop
            );

            pageLeft += x;
            pageTop += y;
        }

        this._drawPaginatedPlaceholderPages(ctx, pages[pages.length - 1], pageLeft, pageTop, bounds);
    }

    private _drawWorkspaceBackground(ctx: UniverRenderingContext, fill: string, bounds?: IViewportInfo) {
        const visibleBound = bounds?.cacheBound ?? bounds?.viewBound;
        const left = visibleBound?.left ?? 0;
        const top = visibleBound?.top ?? 0;
        const width = visibleBound == null ? this.width : visibleBound.right - visibleBound.left;
        const height = visibleBound == null ? this.height : visibleBound.bottom - visibleBound.top;

        if (width <= 0 || height <= 0) {
            return;
        }

        ctx.save();
        ctx.translate(left, top);
        Rect.drawWith(ctx, {
            width,
            height,
            fill,
            zIndex: 0,
        });
        ctx.restore();
    }

    private _drawPaginatedPlaceholderPages(
        ctx: UniverRenderingContext,
        templatePage: IDocumentSkeletonPage,
        initialPageLeft: number,
        initialPageTop: number,
        bounds?: IViewportInfo
    ): void {
        const progress = this.getSkeleton()?.getLayoutProgress?.();
        const publishedPageCount = this.getSkeleton()?.getSkeletonData()?.pages.length ?? progress?.pageCount ?? 0;
        if (progress == null || progress.complete || progress.estimatedPageCount <= publishedPageCount) {
            return;
        }

        const visibleBound = bounds?.cacheBound ?? bounds?.viewBound;
        let pageLeft = initialPageLeft;
        let pageTop = initialPageTop;

        for (let pageIndex = publishedPageCount; pageIndex < progress.estimatedPageCount; pageIndex++) {
            const isVisible = visibleBound == null || !(
                pageLeft + templatePage.pageWidth < visibleBound.left ||
                pageLeft > visibleBound.right ||
                pageTop + templatePage.pageHeight < visibleBound.top ||
                pageTop > visibleBound.bottom
            );

            if (isVisible) {
                ctx.save();
                ctx.translate(pageLeft - 0.5, pageTop - 0.5);
                Rect.drawWith(ctx, {
                    width: templatePage.pageWidth,
                    height: templatePage.pageHeight,
                    strokeWidth: 1,
                    stroke: this._pageStrokeColor ?? PAGE_STROKE_COLOR,
                    fill: this._pageFillColor ?? PAGE_FILL_COLOR,
                    zIndex: 3,
                });
                ctx.restore();

                const contentLeft = pageLeft + templatePage.marginLeft;
                const contentTop = pageTop + templatePage.marginTop + 24;
                const contentWidth = Math.max(
                    80,
                    templatePage.pageWidth - templatePage.marginLeft - templatePage.marginRight
                );
                const contentHeight = Math.max(
                    160,
                    templatePage.pageHeight - templatePage.marginTop - templatePage.marginBottom - 48
                );
                this._drawSkeletonLines(ctx, contentLeft, contentTop, contentWidth, contentHeight, bounds);
            }

            const offset = this._drawLiquid.translatePage(
                templatePage,
                this.pageLayoutType,
                this.pageMarginLeft,
                this.pageMarginTop
            );
            pageLeft += offset.x;
            pageTop += offset.y;
        }
    }

    private _drawContinuousLayoutSkeleton(ctx: UniverRenderingContext, bounds?: IViewportInfo): void {
        const skeleton = this.getSkeleton();
        const progress = skeleton?.getLayoutProgress?.();
        const page = skeleton?.getSkeletonData()?.pages[0];
        if (progress == null || progress.complete || page == null) {
            return;
        }

        const visibleBound = bounds?.cacheBound ?? bounds?.viewBound;
        const startX = page.marginLeft;
        const startY = Math.max(page.marginTop, page.height + 20);
        const width = Math.max(80, page.pageWidth - page.marginLeft - page.marginRight);
        const visibleBottom = visibleBound?.bottom ?? startY + 320;
        this._drawSkeletonLines(ctx, startX, startY, width, Math.max(160, visibleBottom - startY), bounds);
    }

    private _drawSkeletonLines(
        ctx: UniverRenderingContext,
        left: number,
        top: number,
        width: number,
        height: number,
        bounds?: IViewportInfo
    ): void {
        if (height <= SKELETON_LINE_HEIGHT) {
            return;
        }

        const visibleBound = bounds?.cacheBound ?? bounds?.viewBound;
        const animationPhase = (Date.now() % 1200) / 1200;
        const highlightWidth = Math.max(80, width * 0.35);
        const highlightLeft = left - highlightWidth + (width + highlightWidth * 2) * animationPhase;
        const gradient = ctx.createLinearGradient(highlightLeft, 0, highlightLeft + highlightWidth, 0);
        gradient.addColorStop(0, SKELETON_BASE_COLOR);
        gradient.addColorStop(0.5, SKELETON_HIGHLIGHT_COLOR);
        gradient.addColorStop(1, SKELETON_BASE_COLOR);

        ctx.save();
        ctx.fillStyle = gradient;
        const lineStep = SKELETON_LINE_HEIGHT + SKELETON_LINE_GAP;
        const lineCount = Math.ceil(height / lineStep);
        // Keep the page-local row grid, but paint only rows intersecting the
        // cache/viewport. A fixed first-twelve-row cap leaves scrolled pages blank.
        const firstLine = visibleBound == null
            ? 0
            : Math.max(0, Math.ceil((visibleBound.top - top - SKELETON_LINE_HEIGHT) / lineStep));
        const endLine = visibleBound == null
            ? Math.min(12, lineCount)
            : Math.min(lineCount, Math.floor((visibleBound.bottom - top) / lineStep) + 1);
        for (let index = firstLine; index < endLine; index++) {
            const y = top + index * lineStep;
            const lineWidth = index % 4 === 3 ? width * 0.62 : width * (0.82 + (index % 3) * 0.07);
            ctx.beginPath();
            ctx.roundRect(left, y, lineWidth, SKELETON_LINE_HEIGHT, SKELETON_LINE_HEIGHT / 2);
            ctx.fill();
        }
        ctx.restore();

        // Keep only the lightweight background layer animating while layout is incomplete.
        this.makeDirty(true);
    }

    private _drawPageBackgroundImage(ctx: UniverRenderingContext, source: string | undefined, width: number, height: number) {
        if (!source || width <= 0 || height <= 0) {
            return;
        }

        const image = this._getPageBackgroundImage(source);
        if (!image.complete) {
            return;
        }

        ctx.drawImage(image, 0, 0, width, height);
    }

    private _getPageBackgroundImage(source: string) {
        if (this._pageBackgroundSource === source && this._pageBackgroundImage != null) {
            return this._pageBackgroundImage;
        }

        const image = document.createElement('img');
        image.crossOrigin = 'anonymous';
        image.onload = () => this.makeDirty(true);
        image.src = source;
        this._pageBackgroundSource = source;
        this._pageBackgroundImage = image;

        return image;
    }

    changeSkeleton(newSkeleton: DocumentSkeleton) {
        this.setSkeleton(newSkeleton);

        return this;
    }

    protected override _draw(ctx: UniverRenderingContext, bounds?: IViewportInfo) {
        this.draw(ctx, bounds);
    }
}
